const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message, jid) {
    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const searchQuery = text.split(' ').slice(1).join(' ').trim();
        
        if (!searchQuery) {
            return await sock.sendMessage(chatId, { 
                text: "What song do you want to download?"
            });
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
            console.log('Reaction not supported, continuing...');
        }

        // Search for the song
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            // Remove loading reaction and send error
            await sock.sendMessage(chatId, {
                react: {
                    text: "",
                    key: message.key
                }
            });
            return await sock.sendMessage(chatId, { 
                text: "No songs found!"
            });
        }

        // Get the first video result
        const video = videos[0];
        const urlYt = video.url;

        // Fetch audio data from API
        const response = await axios.get(`https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`, {
            timeout: 30000 // 30 second timeout
        });
        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.downloadUrl) {
            // Remove loading reaction
            await sock.sendMessage(chatId, {
                react: {
                    text: "",
                    key: message.key
                }
            });
            return await sock.sendMessage(chatId, { 
                text: "Failed to fetch audio from the API. Please try again later."
            });
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || video.title;
        const thumbnail = data.result.thumbnail || video.thumbnail;

        // Change reaction to ✅
        try {
            await sock.sendMessage(chatId, {
                react: {
                    text: "✅",
                    key: message.key
                }
            });
        } catch (reactError) {
            console.log('Reaction update failed');
        }

        // Create message with audio and thumbnail as a web message
        const messageOptions = {
            audio: { 
                url: audioUrl 
            },
            mimetype: "audio/mpeg",
            fileName: `${title.substring(0, 100)}.mp3`.replace(/[^\w\s.-]/gi, ''),
            contextInfo: {
                externalAdReply: {
                    title: title.substring(0, 60),
                    body: "🎵 Audio Download",
                    mediaType: 1, // 1 for audio, 2 for image
                    thumbnailUrl: thumbnail,
                    sourceUrl: urlYt,
                    mediaUrl: urlYt,
                    showAdAttribution: true
                }
            }
        };

        // Send the audio with embedded thumbnail
        await sock.sendMessage(chatId, messageOptions, { quoted: message });

        // Remove reaction after sending
        setTimeout(async () => {
            try {
                await sock.sendMessage(chatId, {
                    react: {
                        text: "",
                        key: message.key
                    }
                });
            } catch (error) {
                console.log('Failed to remove reaction');
            }
        }, 2000);

    } catch (error) {
        console.error('Error in play command:', error);
        
        // Remove loading reaction on error
        try {
            await sock.sendMessage(chatId, {
                react: {
                    text: "",
                    key: message.key
                }
            });
        } catch (reactError) {
            // Ignore reaction errors
        }
        
        // Send error message
        let errorMessage = "Download failed. Please try again later.";
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = "Request timeout. The server took too long to respond.";
        } else if (error.response) {
            errorMessage = `API Error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = "No response from server. Please check your connection.";
        }
        
        await sock.sendMessage(chatId, { 
            text: errorMessage
        });
    }
}

module.exports = playCommand;