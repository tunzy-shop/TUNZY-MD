const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function savestatusCommand(sock, chatId, message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            return await sock.sendMessage(chatId, {
                text: "✪ *📱 SAVE STATUS*\n\n*Usage:* Reply to a status with `.savestatus`\n\n*How to:*\n1. Go to status\n2. Reply to it\n3. Type: .savestatus\n\n*Supported:* Images, Videos, Text, Audio"
            }, { quoted: message });
        }

        // Check message type
        let mediaType = null;
        let mediaMessage = null;
        
        if (quotedMessage.imageMessage) {
            mediaType = 'image';
            mediaMessage = quotedMessage.imageMessage;
        } else if (quotedMessage.videoMessage) {
            mediaType = 'video';
            mediaMessage = quotedMessage.videoMessage;
        } else if (quotedMessage.audioMessage) {
            mediaType = 'audio';
            mediaMessage = quotedMessage.audioMessage;
        } else if (quotedMessage.extendedTextMessage) {
            mediaType = 'text';
        } else if (quotedMessage.conversation) {
            mediaType = 'text';
        }

        if (!mediaType) {
            return await sock.sendMessage(chatId, {
                text: "✪ *⚠️ UNSUPPORTED*\n\nThis type cannot be saved as status."
            }, { quoted: message });
        }

        // Create temp directory
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const timestamp = Date.now();
        let filePath = '';
        let caption = '';

        try {
            switch (mediaType) {
                case 'image':
                    filePath = path.join(tempDir, `status_${timestamp}.jpg`);
                    await downloadMedia(mediaMessage, filePath, sock);
                    caption = '🖼️ Status Image Saved';
                    break;
                    
                case 'video':
                    filePath = path.join(tempDir, `status_${timestamp}.mp4`);
                    await downloadMedia(mediaMessage, filePath, sock);
                    caption = '🎥 Status Video Saved';
                    break;
                    
                case 'audio':
                    filePath = path.join(tempDir, `status_${timestamp}.ogg`);
                    await downloadMedia(mediaMessage, filePath, sock);
                    caption = '🎵 Status Audio Saved';
                    break;
                    
                case 'text':
                    const text = quotedMessage.extendedTextMessage?.text || quotedMessage.conversation || '';
                    filePath = path.join(tempDir, `status_${timestamp}.txt`);
                    fs.writeFileSync(filePath, text);
                    caption = '📝 Status Text Saved';
                    break;
            }

            if (mediaType !== 'text' && !fs.existsSync(filePath)) {
                throw new Error('Download failed - file not created');
            }

            const fileSize = fs.statSync(filePath).size;
            
            if (fileSize > 50 * 1024 * 1024) {
                fs.unlinkSync(filePath);
                throw new Error('File too large (max 50MB)');
            }

            const fileBuffer = fs.readFileSync(filePath);
            
            // Send the file directly
            if (mediaType === 'image') {
                await sock.sendMessage(chatId, { 
                    image: fileBuffer,
                    caption: `✪ *STATUS SAVED*\n\n${caption}\n📁 *File:* ${path.basename(filePath)}\n📊 *Size:* ${(fileSize / 1024 / 1024).toFixed(2)} MB`
                }, { quoted: message });
            } else if (mediaType === 'video') {
                await sock.sendMessage(chatId, { 
                    video: fileBuffer,
                    caption: `✪ *STATUS SAVED*\n\n${caption}\n📁 *File:* ${path.basename(filePath)}\n📊 *Size:* ${(fileSize / 1024 / 1024).toFixed(2)} MB`
                }, { quoted: message });
            } else if (mediaType === 'audio') {
                await sock.sendMessage(chatId, { 
                    audio: fileBuffer,
                    caption: `✪ *STATUS SAVED*\n\n${caption}\n📁 *File:* ${path.basename(filePath)}\n📊 *Size:* ${(fileSize / 1024 / 1024).toFixed(2)} MB`
                }, { quoted: message });
            } else if (mediaType === 'text') {
                await sock.sendMessage(chatId, {
                    document: fileBuffer,
                    fileName: `status_${timestamp}.txt`,
                    mimetype: 'text/plain',
                    caption: `✪ *STATUS SAVED*\n\n${caption}\n📁 *File:* ${path.basename(filePath)}\n📊 *Size:* ${(fileSize / 1024).toFixed(2)} KB`
                }, { quoted: message });
            }

            // Cleanup after 30 seconds
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (cleanupError) {
                        console.error('Cleanup error:', cleanupError);
                    }
                }
            }, 30000);

        } catch (downloadError) {
            console.error('Download error:', downloadError);
            
            // Clean up any partial file
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            throw new Error(downloadError.message || 'Failed to download media');
        }

    } catch (error) {
        console.error('Save status error:', error);
        await sock.sendMessage(chatId, {
            text: `✪ *❌ ERROR*\n\nFailed to save status:\n${error.message || 'Unknown error'}`
        }, { quoted: message });
    }
}

async function downloadMedia(message, filePath, sock) {
    try {
        let mediaType = 'image';
        if (message.mimetype?.includes('video')) mediaType = 'video';
        if (message.mimetype?.includes('audio')) mediaType = 'audio';
        
        let stream;
        try {
            stream = await downloadContentFromMessage(message, mediaType);
        } catch (streamError) {
            stream = await downloadContentFromMessage(message, 'buffer');
        }
        
        const writeStream = fs.createWriteStream(filePath);
        
        for await (const chunk of stream) {
            writeStream.write(chunk);
        }
        
        writeStream.end();
        
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        
    } catch (error) {
        console.error('Download media error:', error);
        throw error;
    }
}

module.exports = savestatusCommand;