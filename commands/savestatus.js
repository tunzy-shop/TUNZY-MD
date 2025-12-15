const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

async function savestatusCommand(sock, chatId, message) {
    try {
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📱 SAVE STATUS*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:* Reply to a status with `.savestatus`\n\n*How to:*\n1. Go to status\n2. Reply to it\n3. Type: .savestatus\n\n*Supported:* Images, Videos, Text, Audio",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Check message type
        let mediaType = null;
        if (quotedMessage.imageMessage) mediaType = 'image';
        else if (quotedMessage.videoMessage) mediaType = 'video';
        else if (quotedMessage.audioMessage) mediaType = 'audio';
        else if (quotedMessage.extendedTextMessage) mediaType = 'text';
        else if (quotedMessage.conversation) mediaType = 'text';

        if (!mediaType) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ UNSUPPORTED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nThis type cannot be saved as status.",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }

        // Processing message
        await sock.sendMessage(chatId, {
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *⏳ DOWNLOADING*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nDownloading status...",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363422591784062@newsletter',
                    newsletterName: 'TUNZY-MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });

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
                    await downloadMedia(quotedMessage.imageMessage, filePath);
                    caption = '📸 Status Image Saved';
                    break;
                    
                case 'video':
                    filePath = path.join(tempDir, `status_${timestamp}.mp4`);
                    await downloadMedia(quotedMessage.videoMessage, filePath);
                    caption = '🎥 Status Video Saved';
                    break;
                    
                case 'audio':
                    filePath = path.join(tempDir, `status_${timestamp}.ogg`);
                    await downloadMedia(quotedMessage.audioMessage, filePath);
                    caption = '🎵 Status Audio Saved';
                    break;
                    
                case 'text':
                    const text = quotedMessage.extendedTextMessage?.text || quotedMessage.conversation || '';
                    filePath = path.join(tempDir, `status_${timestamp}.txt`);
                    fs.writeFileSync(filePath, text);
                    caption = '📝 Status Text Saved';
                    break;
            }

            if (fs.existsSync(filePath)) {
                const fileBuffer = fs.readFileSync(filePath);
                const fileSize = fs.statSync(filePath).size;
                
                if (fileSize > 50 * 1024 * 1024) {
                    fs.unlinkSync(filePath);
                    throw new Error('File too large (max 50MB)');
                }

                // Send the file
                const sendOptions = {
                    caption: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✅ STATUS SAVED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n${caption}\n📁 *File:* ${path.basename(filePath)}\n📊 *Size:* ${(fileSize / 1024 / 1024).toFixed(2)} MB`,
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363422591784062@newsletter',
                            newsletterName: 'TUNZY-MD',
                            serverMessageId: -1
                        }
                    }
                };

                if (mediaType === 'image') {
                    await sock.sendMessage(chatId, { image: fileBuffer, ...sendOptions }, { quoted: message });
                } else if (mediaType === 'video') {
                    await sock.sendMessage(chatId, { video: fileBuffer, ...sendOptions }, { quoted: message });
                } else if (mediaType === 'audio') {
                    await sock.sendMessage(chatId, { audio: fileBuffer, ...sendOptions }, { quoted: message });
                } else if (mediaType === 'text') {
                    await sock.sendMessage(chatId, {
                        document: fileBuffer,
                        fileName: `status_${timestamp}.txt`,
                        mimetype: 'text/plain',
                        ...sendOptions
                    }, { quoted: message });
                }

                // Cleanup after 30 seconds
                setTimeout(() => {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }, 30000);

            } else {
                throw new Error('Download failed');
            }

        } catch (downloadError) {
            console.error('Download error:', downloadError);
            throw downloadError;
        }

    } catch (error) {
        console.error('Save status error:', error);
        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ ERROR*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to save status:\n${error.message}`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363422591784062@newsletter',
                    newsletterName: 'TUNZY-MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

async function downloadMedia(message, filePath) {
    const stream = await downloadContentFromMessage(message, 'buffer');
    const buffer = await streamToBuffer(stream);
    fs.writeFileSync(filePath, buffer);
}

async function streamToBuffer(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks);
}

module.exports = savestatusCommand;