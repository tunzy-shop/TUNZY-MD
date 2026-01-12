const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

class ImageEnhancer {
    constructor() {
        this.apis = [
            {
                name: 'BigJPG',
                url: 'https://bigjpg.com/api/task/',
                method: 'post',
                free: true,
                reliable: true
            },
            {
                name: 'Let\'s Enhance',
                url: 'https://api.letsenhance.io/v1/enhance',
                method: 'post',
                free: false, // Has free tier
                reliable: true
            },
            {
                name: 'Waifu2x',
                url: 'https://waifu2x.booru.pics/',
                method: 'post',
                free: true,
                reliable: true
            },
            {
                name: 'Prince API',
                url: 'https://api.princetechn.com/api/tools/remini',
                method: 'post',
                free: true,
                reliable: true
            }
        ];
    }

    async enhanceImage(buffer) {
        const base64Image = buffer.toString('base64');
        
        // Try BigJPG first (best free option)
        try {
            const formData = new FormData();
            formData.append('file', buffer, {
                filename: 'image.jpg',
                contentType: 'image/jpeg'
            });
            
            const response = await axios.post('https://bigjpg.com/api/task/', formData, {
                timeout: 45000,
                headers: {
                    ...formData.getHeaders(),
                    'X-API-Key': 'free', // BigJPG has free API
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.data?.url) {
                const imgResponse = await axios.get(response.data.url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                return Buffer.from(imgResponse.data);
            }
        } catch (error) {
            console.log('BigJPG failed, trying next...');
        }

        // Try Waifu2x
        try {
            const response = await axios.post('https://waifu2x.booru.pics/', {
                image: base64Image,
                scale: 2,
                noise: 1
            }, {
                timeout: 45000,
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.data?.url) {
                const imgResponse = await axios.get(response.data.url, {
                    responseType: 'arraybuffer',
                    timeout: 30000
                });
                return Buffer.from(imgResponse.data);
            }
        } catch (error) {
            console.log('Waifu2x failed, trying next...');
        }

        // Fallback to Prince API
        const { data } = await axios.post('https://api.princetechn.com/api/tools/remini', {
            image: base64Image,
            apikey: "prince_tech_api_azfsbshfb"
        }, { timeout: 60000 });
        
        if (data?.success && data?.result?.image_base64) {
            return Buffer.from(data.result.image_base64, 'base64');
        }
        
        throw new Error('All APIs failed');
    }
}

async function reminiCommand(sock, chatId, message) {
    try {
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage || message.message?.imageMessage;
        
        if (!imageMsg) return sock.sendMessage(chatId, { 
            text: '_Reply to image to upscale_' 
        }, { quoted: message });

        const stream = await downloadContentFromMessage(imageMsg, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        
        const enhancer = new ImageEnhancer();
        const enhancedBuffer = await enhancer.enhanceImage(buffer);
        
        await sock.sendMessage(chatId, {
            image: enhancedBuffer,
            caption: '> HERE IS YOUR UPSCALED IMAGE.....'
        }, { quoted: message });
        
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to enhance image' 
        }, { quoted: message });
    }
}