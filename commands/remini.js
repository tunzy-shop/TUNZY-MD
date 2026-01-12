const axios = require('axios');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const FormData = require('form-data');

async function reminiCommand(sock, chatId, message) {
    try {
        // Get image from message or quoted message
        const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const imageMsg = quoted?.imageMessage || message.message?.imageMessage;
        
        // If no image found, show usage message
        if (!imageMsg) {
            return sock.sendMessage(chatId, { 
                text: '_Reply to image to upscale_'
            }, { quoted: message });
        }

        // Download the image
        const stream = await downloadContentFromMessage(imageMsg, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // Validate image
        if (buffer.length === 0) {
            throw new Error('Empty image received');
        }
        
        if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
            throw new Error('Image too large (max 10MB)');
        }

        // **BEST API: DeepAI Super-Resolution API**
        // Highly reliable, free tier available, excellent results
        const formData = new FormData();
        formData.append('image', buffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg'
        });
        
        const response = await axios.post('https://api.deepai.org/api/torch-srgan', formData, {
            timeout: 45000, // 45 seconds
            headers: {
                ...formData.getHeaders(),
                'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K', // Free demo key
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            validateStatus: function (status) {
                return status >= 200 && status < 500; // Accept 400-499 for error handling
            }
        });

        // Check API response thoroughly
        if (response.status === 200 && response.data && response.data.output_url) {
            // Download the enhanced image
            const imageResponse = await axios.get(response.data.output_url, {
                responseType: 'arraybuffer',
                timeout: 30000,
                maxContentLength: 20 * 1024 * 1024 // 20MB max
            });
            
            if (imageResponse.status === 200 && imageResponse.data && imageResponse.data.length > 0) {
                // Send the enhanced image
                await sock.sendMessage(chatId, {
                    image: Buffer.from(imageResponse.data),
                    caption: '> HERE IS YOUR UPSCALED IMAGE.....'
                }, { quoted: message });
                return;
            } else {
                throw new Error('Failed to download enhanced image');
            }
        }
        
        // If DeepAI fails, try BigJPG as fallback
        console.log('DeepAI failed, trying BigJPG...');
        await tryBigJPG(sock, chatId, message, buffer);
        
    } catch (error) {
        console.error('Enhancement Error:', error.message);
        await handleError(sock, chatId, message, error);
    }
}

// BigJPG Fallback Function
async function tryBigJPG(sock, chatId, message, buffer) {
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
                'X-API-Key': 'free',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (response.data && response.data.url) {
            const imageResponse = await axios.get(response.data.url, {
                responseType: 'arraybuffer',
                timeout: 30000
            });
            
            await sock.sendMessage(chatId, {
                image: Buffer.from(imageResponse.data),
                caption: '> HERE IS YOUR UPSCALED IMAGE.....'
            }, { quoted: message });
            return;
        }
        throw new Error('BigJPG failed');
    } catch (bigJpgError) {
        console.error('BigJPG also failed:', bigJpgError.message);
        throw bigJpgError;
    }
}

// Comprehensive Error Handler
async function handleError(sock, chatId, message, error) {
    let errorMessage = '❌ Failed to enhance image';
    
    // Detailed error categorization
    if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
            errorMessage = '⏰ Request timeout. The server is taking too long.';
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            errorMessage = '🌐 Network error. Please check your connection.';
        } else if (error.code === 'ECONNRESET') {
            errorMessage = '🔌 Connection reset. Please try again.';
        } else if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            switch (status) {
                case 400:
                    errorMessage = '📸 Invalid image format or corrupted file.';
                    break;
                case 401:
                case 403:
                    errorMessage = '🔑 API authentication failed.';
                    break;
                case 404:
                    errorMessage = '🔍 Enhancement service not found.';
                    break;
                case 413:
                    errorMessage = '📁 Image too large (max 10MB).';
                    break;
                case 429:
                    errorMessage = '⏰ Rate limit exceeded. Try again in a minute.';
                    break;
                case 500:
                case 502:
                case 503:
                case 504:
                    errorMessage = '🔧 Server error. Please try again later.';
                    break;
                default:
                    errorMessage = `❌ Server error (${status}).`;
            }
        }
    } else if (error.message.includes('Empty image')) {
        errorMessage = '📸 No image data received.';
    } else if (error.message.includes('too large')) {
        errorMessage = '📁 Image too large. Maximum size is 10MB.';
    } else if (error.message.includes('download')) {
        errorMessage = '📥 Failed to download enhanced image.';
    } else if (error.message.includes('format')) {
        errorMessage = '🖼️ Unsupported image format. Use JPG or PNG.';
    }
    
    // Final fallback: Try one more time with Prince API if all else fails
    try {
        if (errorMessage.includes('Server error') || errorMessage.includes('Rate limit')) {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage || message.message?.imageMessage;
            
            if (imageMsg) {
                const stream = await downloadContentFromMessage(imageMsg, 'image');
                let buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                
                const base64 = buffer.toString('base64');
                const { data } = await axios.post('https://api.princetechn.com/api/tools/remini', {
                    image: base64,
                    apikey: "prince_tech_api_azfsbshfb"
                }, { timeout: 30000 });
                
                if (data?.success && data?.result?.image_base64) {
                    const enhanced = Buffer.from(data.result.image_base64, 'base64');
                    await sock.sendMessage(chatId, {
                        image: enhanced,
                        caption: '> HERE IS YOUR UPSCALED IMAGE.....'
                    }, { quoted: message });
                    return;
                }
            }
        }
    } catch (finalError) {
        console.error('Final fallback failed:', finalError.message);
    }
    
    // Send error message
    await sock.sendMessage(chatId, { 
        text: errorMessage 
    }, { quoted: message });
}

module.exports = { reminiCommand };