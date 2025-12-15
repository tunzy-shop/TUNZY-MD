const fs = require('fs');

async function unpairCommand(sock, chatId, message, q) {
    try {
        if (!q) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📱 UNPAIR DEVICE*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:* `.unpair <number>`\n*Example:* `.unpair 2347030626048`\n\n*Note:* Shows unpair instructions",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404912601381@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            });
        }

        const number = q.replace(/[^0-9]/g, '');
        
        if (!number || number.length < 10) {
            return await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ INVALID NUMBER*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nPlease provide valid WhatsApp number",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404912601381@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            });
        }

        await sock.sendMessage(chatId, {
            text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *🔧 UNPAIR INSTRUCTIONS*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*For number:* ${number}\n\n*Steps:*\n1. Open WhatsApp on your *PHONE*\n2. Go to *Settings* → *Linked Devices*\n3. Find device: *${number}*\n4. Tap → *Log out*\n\n*Note:* Remote unpairing not possible`,
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404912601381@newsletter',
                    newsletterName: 'TUNZY-MD',
                    serverMessageId: -1
                }
            }
        });

    } catch (error) {
        console.error('Unpair command error:', error);
        await sock.sendMessage(chatId, {
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ ERROR*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to process command.",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404912601381@newsletter',
                    newsletterName: 'TUNZY-MD',
                    serverMessageId: -1
                }
            }
        });
    }
}

module.exports = unpairCommand;