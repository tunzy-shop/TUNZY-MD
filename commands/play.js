const axios = require('axios');
const yts = require('yt-search');

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*'
    }
};

// Multiple download APIs for fallback
const DOWNLOAD_APIS = [
    {
        name: 'Apis-Keith',
        url: (videoUrl) => `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`,
        extractor: (data) => {
            if (data?.result?.downloadUrl) {
                return {
                    download: data.result.downloadUrl,
                    title: data.result.title,
                    thumbnail: data.result.thumbnail
                };
            }
            return null;
        }
    },
    {
        name: 'Y2Mate',
        url: (videoUrl) => `https://api.y2mate.guru/convert?url=${encodeURIComponent(videoUrl)}`,
        extractor: (data) => {
            if (data?.urls?.mp3?.url) {
                return {
                    download: data.urls.mp3.url,
                    title: data.title || 'Unknown Title',
                    thumbnail: data.thumbnail
                };
            }
            return null;
        }
    },
    {
        name: 'Izumi-URL',
        url: (videoUrl) => `https://izumiiiiiiii.dpdns.org/downloader/youtube?url=${encodeURIComponent(videoUrl)}&format=mp3`,
        extractor: (data) => {
            if (data?.result?.download) return data.result;
            if (data?.download) return data;
            return null;
        }
    },
    {
        name: 'Okatsu',
        url: (videoUrl) => `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`,
        extractor: (data) => {
            if (data?.dl) {
                return {
                    download: data.dl,
                    title: data.title,
                    thumbnail: data.thumb
                };
            }
            return null;
        }
    },
    {
        name: 'Izumi-Query',
        url: (query) => `https://izumiiiiiiii.dpdns.org/downloader/youtube-play?query=${encodeURIComponent(query)}`,
        extractor: (data) => {
            if (data?.result?.download) return data.result;
            if (data?.download) return data;
            return null;
        },
        needsVideoId: false
    }
];

async function tryRequest(url, isQuery = false) {
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await axios.get(url, AXIOS_DEFAULTS);
            return response.data;
        } catch (error) {
            if (attempt === 3) throw error;
            await new Promise(r => setTimeout(r, 1000 * attempt));
        }
    }
}

async function searchAndDownload(sock, chatId, message, query) {
    try {
        // Show searching message
        await sock.sendMessage(chatId, {
            react: { text: "⏳", key: message.key }
        });

        let video;
        let isYoutubeUrl = false;
        
        // Check if input is a YouTube URL
        if (query.includes('youtube.com/watch?v=') || query.includes('youtu.be/')) {
            isYoutubeUrl = true;
            const videoId = extractVideoId(query);
            if (!videoId) {
                throw new Error('Invalid YouTube URL');
            }
            
            // Get video info
            const search = await yts({ videoId });
            if (!search) {
                throw new Error('Could not fetch video information');
            }
            
            video = {
                url: `https://www.youtube.com/watch?v=${videoId}`,
                title: search.title,
                thumbnail: search.thumbnail,
                timestamp: search.timestamp || 'N/A',
                duration: search.duration?.seconds || 0
            };
        } else {
            // Search by query
            const searchResults = await yts(query);
            if (!searchResults.videos || searchResults.videos.length === 0) {
                throw new Error('No results found');
            }
            
            video = searchResults.videos[0];
        }

        // Show video info
        await sock.sendMessage(chatId, {
            image: { url: video.thumbnail },
            caption: `🎵 *${video.title}*\n⏱ Duration: ${video.timestamp}\n🔍 Searching for download...`,
            contextInfo: {
                externalAdReply: {
                    title: video.title.substring(0, 60),
                    body: "🎵 Audio Download",
                    mediaType: 2,
                    thumbnailUrl: video.thumbnail,
                    sourceUrl: video.url,
                    mediaUrl: video.url,
                    showAdAttribution: true
                }
            }
        });

        // Try different download APIs
        let audioData = null;
        let workingApi = null;
        
        for (const api of DOWNLOAD_APIS) {
            try {
                console.log(`Trying ${api.name}...`);
                
                const url = api.needsVideoId === false && !isYoutubeUrl 
                    ? api.url(query)
                    : api.url(video.url);
                
                const data = await tryRequest(url);
                audioData = api.extractor(data);
                
                if (audioData && audioData.download) {
                    workingApi = api.name;
                    console.log(`✅ Success with ${api.name}`);
                    break;
                }
            } catch (apiError) {
                console.log(`❌ ${api.name} failed:`, apiError.message);
                continue;
            }
        }

        if (!audioData || !audioData.download) {
            throw new Error('All download sources failed');
        }

        // Update reaction
        await sock.sendMessage(chatId, {
            react: { text: "✅", key: message.key }
        });

        // Send audio
        const fileName = `${(audioData.title || video.title).replace(/[<>:"/\\|?*]/g, '_').substring(0, 100)}.mp3`;
        
        await sock.sendMessage(chatId, {
            audio: { url: audioData.download },
            mimetype: 'audio/mpeg',
            fileName: fileName,
            contextInfo: {
                externalAdReply: {
                    title: (audioData.title || video.title).substring(0, 60),
                    body: `via ${workingApi}`,
                    mediaType: 1,
                    thumbnailUrl: audioData.thumbnail || video.thumbnail,
                    sourceUrl: video.url,
                    mediaUrl: video.url,
                    showAdAttribution: true
                }
            }
        }, { quoted: message });

        // Clear reaction after delay
        setTimeout(async () => {
            try {
                await sock.sendMessage(chatId, {
                    react: { text: "", key: message.key }
                });
            } catch (e) {
                // Ignore
            }
        }, 3000);

    } catch (error) {
        console.error('Download error:', error);
        
        // Clear reaction
        try {
            await sock.sendMessage(chatId, {
                react: { text: "", key: message.key }
            });
        } catch (e) {
            // Ignore
        }
        
        // Send error message
        let errorMsg = `❌ Download failed: ${error.message}`;
        
        if (error.message.includes('No results found')) {
            errorMsg = '❌ No songs found. Please try a different search.';
        } else if (error.message.includes('All download sources failed')) {
            errorMsg = '❌ All download services are currently unavailable. Please try again later.';
        } else if (error.message.includes('Invalid YouTube URL')) {
            errorMsg = '❌ Invalid YouTube URL. Please provide a valid link.';
        }
        
        await sock.sendMessage(chatId, { text: errorMsg }, { quoted: message });
    }
}

// Extract YouTube video ID
function extractVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    return null;
}

// Unified command handler
async function mediaDownloadCommand(sock, chatId, message, args, command) {
    const text = message.message?.conversation || 
                 message.message?.extendedTextMessage?.text || '';
    
    // Extract query (remove command prefix)
    const query = text.replace(/^\.(song|play|music)\s*/i, '').trim();
    
    if (!query) {
        return await sock.sendMessage(chatId, {
            text: `Usage: .${command} <song name or YouTube link>\nExample: .${command} shape of you\nExample: .${command} https://youtu.be/dQw4w9WgXcQ`
        }, { quoted: message });
    }
    
    await searchAndDownload(sock, chatId, message, query);
}

// For backward compatibility
async function songCommand(sock, chatId, message) {
    await mediaDownloadCommand(sock, chatId, message, null, 'song');
}

async function playCommand(sock, chatId, message, jid) {
    await mediaDownloadCommand(sock, chatId, message, null, 'play');
}

module.exports = {
    songCommand,
    playCommand,
    mediaDownloadCommand  // Unified handler
};