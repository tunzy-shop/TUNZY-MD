const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

async function downloadImage(sock, message) {
    try {
        // Check quoted message first
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (quoted?.imageMessage) {
            const stream = await downloadContentFromMessage(quoted.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            return Buffer.concat(chunks);
        }

        // Check current message
        if (message.message?.imageMessage) {
            const stream = await downloadContentFromMessage(message.message.imageMessage, 'image');
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            return Buffer.concat(chunks);
        }

        return null;
    } catch (error) {
        console.error('Download Image Error:', error);
        return null;
    }
}

async function reminiCommand(sock, chatId, message, args) {
    try {
        // Download image from message
        const imageBuffer = await downloadImage(sock, message);
        
        if (!imageBuffer) {
            return sock.sendMessage(chatId, { 
                text: '_Reply to image to upscale_'
            }, { quoted: message });
        }

        // Convert buffer to base64
        const base64Image = imageBuffer.toString('base64');
        
        // Using prince API (the one from your original code)
        const apiUrl = `https://api.princetechn.com/api/tools/remini`;
        
        const response = await axios.post(apiUrl, {
            image: base64Image,
            apikey: "prince_tech_api_azfsbshfb"
        }, {
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.data && response.data.success && response.data.result?.image_base64) {
            // Convert base64 response back to buffer
            const enhancedBuffer = Buffer.from(response.data.result.image_base64, 'base64');
            
            // Send the enhanced image directly
            await sock.sendMessage(chatId, {
                image: enhancedBuffer,
                caption: '> HERE IS YOUR UPSCALED IMAGE.....'
            }, { quoted: message });
            
        } else if (response.data?.result?.image_url) {
            // If API returns URL instead of base64
            const imageResponse = await axios.get(response.data.result.image_url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            await sock.sendMessage(chatId, {
                image: imageResponse.data,
                caption: '> HERE IS YOUR UPSCALED IMAGE.....'
            }, { quoted: message });
            
        } else {
            throw new Error('Failed to enhance image');
        }

    } catch (error) {
        console.error('Remini Error:', error.message);
        
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to enhance image'
        }, { quoted: message });
    }
}

module.exports = { reminiCommand };