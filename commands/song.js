const axios = require('axios');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
    timeout: 45000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9'
    }
};

async function tryRequest(getter, attempts = 2) {
    let lastError;
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter();
        } catch (err) {
            lastError = err;
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt));
            }
        }
    }
    throw lastError;
}

function extractVideoId(url) {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?\n]+)/);
    return match ? match[1].split('?')[0] : null;
}

// Primary API - Working endpoints
async function getApiDownloadByUrl(youtubeUrl) {
    const apis = [
        // API 1: Working API
        async () => {
            const apiUrl = `https://api.be-team.me/ytmp3?url=${encodeURIComponent(youtubeUrl)}`;
            const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
            if (res?.data?.result?.url) return {
                download: res.data.result.url,
                title: res.data.result.title,
                thumbnail: res.data.result.thumbnail
            };
            throw new Error('API 1 failed');
        },
        
        // API 2: Alternative
        async () => {
            const apiUrl = `https://api.lolhuman.xyz/api/ytaudio2?apikey=dannlaina&url=${encodeURIComponent(youtubeUrl)}`;
            const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
            if (res?.data?.result?.link) return {
                download: res.data.result.link,
                title: res.data.result.title,
                thumbnail: res.data.result.thumbnail
            };
            throw new Error('API 2 failed');
        },
        
        // API 3: Backup
        async () => {
            const apiUrl = `https://api.dhamzxploit.my.id/api/youtube-mp3?url=${encodeURIComponent(youtubeUrl)}`;
            const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
            if (res?.data?.result?.url) return {
                download: res.data.result.url,
                title: res.data.result.title,
                thumbnail: res.data.result.thumbnail
            };
            throw new Error('API 3 failed');
        }
    ];
    
    for (const api of apis) {
        try {
            return await tryRequest(api);
        } catch (err) {
            console.log(`API failed: ${err.message}`);
            continue;
        }
    }
    throw new Error('All primary APIs failed');
}

// Fallback API
async function getFallbackDownload(videoUrl, title) {
    try {
        // Simple approach using a public service
        const apiUrl = `https://aemt.me/youtube?url=${encodeURIComponent(videoUrl)}`;
        const res = await axios.get(apiUrl, AXIOS_DEFAULTS);
        
        if (res?.data?.result?.mp3) {
            return {
                download: res.data.result.mp3,
                title: title,
                thumbnail: `https://i.ytimg.com/vi/${extractVideoId(videoUrl)}/hqdefault.jpg`
            };
        }
        
        // Last resort
        const ytdlApi = `https://ytdl.moshh.vercel.app/download?url=${encodeURIComponent(videoUrl)}&format=mp3`;
        const ytdlRes = await axios.get(ytdlApi, AXIOS_DEFAULTS);
        
        if (ytdlRes?.data?.download) {
            return {
                download: ytdlRes.data.download,
                title: title,
                thumbnail: `https://i.ytimg.com/vi/${extractVideoId(videoUrl)}/hqdefault.jpg`
            };
        }
        
        throw new Error('Fallback APIs failed');
    } catch (error) {
        throw new Error(`Fallback error: ${error.message}`);
    }
}

async function songCommand(sock, chatId, message) {
    let reactionRemoved = false;
    
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            await sock.sendMessage(chatId, { 
                text: '🎵 *Usage:* .song <song name or YouTube link>\n\nExample:\n.song shape of you\n.song https://youtu.be/JGwWNGJdvx8'
            }, { quoted: message });
            return;
        }

        // Add loading reaction ⏳
        try {
            await sock.sendMessage(chatId, {
                react: {
                    text: "⏳",
                    key: message.key
                }
            });
        } catch (reactError) {
            console.log('Reaction not supported');
        }

        let video;
        let youtubeUrl = '';
        
        if (searchQuery.includes('youtube.com') || searchQuery.includes('youtu.be')) {
            youtubeUrl = searchQuery;
            const videoId = extractVideoId(searchQuery);
            video = {
                url: searchQuery,
                title: 'YouTube Audio',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                timestamp: 'Loading...'
            };
        } else {
            const search = await yts(searchQuery);
            if (!search || !search.videos.length) {
                await sock.sendMessage(chatId, {
                    react: { text: "", key: message.key }
                });
                reactionRemoved = true;
                await sock.sendMessage(chatId, { 
                    text: '❌ No results found. Try different keywords.'
                }, { quoted: message });
                return;
            }
            video = search.videos[0];
            youtubeUrl = video.url;
        }

        // Send searching status
        try {
            await sock.sendMessage(chatId, {
                react: { text: "✅", key: message.key }
            });
        } catch (reactError) {
            console.log('Reaction update failed');
        }

        let audioData;
        let usedService = 'Unknown';
        
        try {
            // Try Primary APIs
            usedService = 'Primary API';
            audioData = await getApiDownloadByUrl(youtubeUrl);
        } catch (e1) {
            console.log('Primary APIs failed:', e1.message);
            try {
                // Try Fallback
                usedService = 'Fallback';
                audioData = await getFallbackDownload(youtubeUrl, video.title);
            } catch (e2) {
                console.log('All download methods failed:', e2.message);
                throw new Error('DOWNLOAD_FAILED');
            }
        }

        console.log(`✓ Download successful via: ${usedService}`);

        // Prepare audio message
        const audioUrl = audioData.download;
        const title = audioData.title || video.title || 'Audio Download';
        const thumbnail = audioData.thumbnail || video.thumbnail || `https://i.ytimg.com/vi/${extractVideoId(youtubeUrl)}/hqdefault.jpg`;
        const videoId = extractVideoId(youtubeUrl);

        const messageOptions = {
            audio: { 
                url: audioUrl 
            },
            mimetype: 'audio/mpeg',
            fileName: `${title.substring(0, 80)}.mp3`.replace(/[^\w\s.-]/gi, ''),
            contextInfo: {
                externalAdReply: {
                    title: title.substring(0, 50),
                    body: "🎶 Music Download • High Quality",
                    mediaType: 1,
                    thumbnailUrl: thumbnail,
                    sourceUrl: youtubeUrl,
                    mediaUrl: youtubeUrl,
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        };

        // Send audio
        await sock.sendMessage(chatId, messageOptions, { quoted: message });

        // Remove reaction
        setTimeout(async () => {
            try {
                await sock.sendMessage(chatId, {
                    react: { text: "", key: message.key }
                });
                reactionRemoved = true;
            } catch (error) {
                console.log('Failed to remove reaction');
            }
        }, 1000);

    } catch (err) {
        console.error('Song command error:', err.message || err);
        
        // Remove reaction
        if (!reactionRemoved) {
            try {
                await sock.sendMessage(chatId, {
                    react: { text: "", key: message.key }
                });
            } catch (reactError) {
                // Ignore
            }
        }
        
        // Error message
        let errorMessage = '❌ Failed to download audio.';
        
        if (err.message === 'DOWNLOAD_FAILED') {
            errorMessage = '🔧 All download services are currently unavailable.\nPlease try again later or use a different song.';
        } else if (err.code === 'ECONNABORTED') {
            errorMessage = '⏰ Request timeout. Please try again.';
        } else if (err.response?.status === 402) {
            errorMessage = '💳 API service requires payment/limit reached.\nTrying alternative methods...';
            // Try one more time with fallback
            try {
                // Send retry message
                await sock.sendMessage(chatId, {
                    text: '🔄 Trying alternative download method...'
                }, { quoted: message });
                
                // Get text again for retry
                const text = message.message?.conversation || message.message?.extendedTextMessage?.text || '';
                const searchQuery = text.split(' ').slice(1).join(' ').trim();
                
                if (searchQuery) {
                    const search = await yts(searchQuery);
                    if (search?.videos?.[0]) {
                        const video = search.videos[0];
                        const fallback = await getFallbackDownload(video.url, video.title);
                        
                        if (fallback?.download) {
                            await sock.sendMessage(chatId, {
                                audio: { url: fallback.download },
                                mimetype: 'audio/mpeg',
                                fileName: `${video.title.substring(0, 80)}.mp3`
                            }, { quoted: message });
                            return;
                        }
                    }
                }
            } catch (retryError) {
                console.log('Retry failed:', retryError.message);
                errorMessage = '❌ All download methods failed. Please try again later.';
            }
        } else if (err.message?.includes('No results')) {
            errorMessage = '🔍 No results found. Try different keywords.';
        }
        
        await sock.sendMessage(chatId, { 
            text: errorMessage 
        }, { quoted: message });
    }
}

module.exports = songCommand;