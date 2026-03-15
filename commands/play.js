const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, chatId, message) {
    const userMessageKey = message.key;
    let loadingMsgKey = null;

    try {
        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        const input = text.split(' ').slice(1).join(' ').trim();

        if (!input) {
            return await sock.sendMessage(chatId, { 
                text: "🎵 What song do you want to download? (send a name or YouTube link)"
            });
        }

        // React with hourglass
        await sock.sendMessage(chatId, { 
            react: { text: '⏳', key: userMessageKey } 
        });

        // Send temporary loading message
        const loadingMsg = await sock.sendMessage(chatId, { 
            text: "_⏳ Please wait, your download is in progress..._"
        });
        loadingMsgKey = loadingMsg.key;

        // Check if input is a YouTube URL
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
        let videoUrl;

        if (youtubeRegex.test(input)) {
            videoUrl = input; // direct link (e.g., your example)
        } else {
            const { videos } = await yts(input);
            if (!videos || videos.length === 0) {
                throw new Error("No videos found for your query.");
            }
            videoUrl = videos[0].url;
        }

        // Fetch audio from API
        const apiUrl = `https://apis-keith.vercel.app/download/dlmp3?url=${encodeURIComponent(videoUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.status || !data?.result?.downloadUrl) {
            throw new Error("API returned an invalid response.");
        }

        const audioUrl = data.result.downloadUrl;
        const title = data.result.title || "audio";

        // Update reaction to ✅
        await sock.sendMessage(chatId, { 
            react: { text: '✅', key: userMessageKey } 
        });

        // Delete loading message
        if (loadingMsgKey) {
            await sock.sendMessage(chatId, { delete: loadingMsgKey });
        }

        // Send the audio
        await sock.sendMessage(chatId, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`,
            ptt: false
        }, { quoted: message });

    } catch (error) {
        console.error('Error in playCommand:', error);

        // Clean up loading message
        if (loadingMsgKey) {
            try {
                await sock.sendMessage(chatId, { delete: loadingMsgKey });
            } catch (deleteError) {
                console.error('Failed to delete loading message:', deleteError);
            }
        }

        // React with ❌
        await sock.sendMessage(chatId, { 
            react: { text: '❌', key: userMessageKey } 
        });

        // Send formatted error message
        const errorMessage = error.message || "Unknown error occurred.";
        await sock.sendMessage(chatId, { 
            text: `✪ Error: ${errorMessage}`
        });
    }
}

module.exports = playCommand;