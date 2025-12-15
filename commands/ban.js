const fs = require('fs');
const { channelInfo } = require('../lib/messageConfig');
const isAdmin = require('../lib/isAdmin');
const { isSudo } = require('../lib/index');

async function banCommand(sock, chatId, message) {
    // Restrict in groups to admins; in private to owner/sudo
    const isGroup = chatId.endsWith('@g.us');
    if (isGroup) {
        const senderId = message.key.participant || message.key.remoteJid;
        const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);
        if (!isBotAdmin) {
            await sock.sendMessage(chatId, { 
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ BOT NOT ADMIN*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nMake bot admin to use ban command.",
                ...channelInfo 
            }, { quoted: message });
            return;
        }
        if (!isSenderAdmin && !message.key.fromMe) {
            await sock.sendMessage(chatId, { 
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *⛔ PERMISSION DENIED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nOnly group admins can ban users.",
                ...channelInfo 
            }, { quoted: message });
            return;
        }
    } else {
        const senderId = message.key.participant || message.key.remoteJid;
        const senderIsSudo = await isSudo(senderId);
        if (!message.key.fromMe && !senderIsSudo) {
            await sock.sendMessage(chatId, { 
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *👑 OWNER ONLY*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nOnly bot owner can ban in private chat.",
                ...channelInfo 
            }, { quoted: message });
            return;
        }
    }
    
    let userToBan;
    
    // Check for mentioned users
    if (message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
        userToBan = message.message.extendedTextMessage.contextInfo.mentionedJid[0];
    }
    // Check for replied message
    else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
        userToBan = message.message.extendedTextMessage.contextInfo.participant;
    }
    
    if (!userToBan) {
        await sock.sendMessage(chatId, { 
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📛 BAN COMMAND*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Usage:*\n`.ban @user` - Ban mentioned user\n`.ban` (reply to user) - Ban replied user",
            ...channelInfo 
        });
        return;
    }

    // Prevent banning the bot itself
    try {
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (userToBan === botId || userToBan === botId.replace('@s.whatsapp.net', '@lid')) {
            await sock.sendMessage(chatId, { 
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ CANNOT BAN*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nYou cannot ban the bot account.",
                ...channelInfo 
            }, { quoted: message });
            return;
        }
    } catch {}

    try {
        // Add user to banned list
        const bannedUsers = JSON.parse(fs.readFileSync('./data/banned.json'));
        if (!bannedUsers.includes(userToBan)) {
            bannedUsers.push(userToBan);
            fs.writeFileSync('./data/banned.json', JSON.stringify(bannedUsers, null, 2));
            
            // Get user info
            const userInfo = await sock.onWhatsApp(userToBan);
            const userName = userInfo[0]?.name || userToBan.split('@')[0];
            
            await sock.sendMessage(chatId, { 
                text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✅ USER BANNED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n👤 *User:* ${userName}\n📱 *ID:* ${userToBan.split('@')[0]}\n⏰ *Time:* ${new Date().toLocaleTimeString()}\n\nUser can no longer use bot commands.`,
                mentions: [userToBan],
                ...channelInfo 
            });
        } else {
            await sock.sendMessage(chatId, { 
                text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *⚠️ ALREADY BANNED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n${userToBan.split('@')[0]} is already banned!`,
                mentions: [userToBan],
                ...channelInfo 
            });
        }
    } catch (error) {
        console.error('Error in ban command:', error);
        await sock.sendMessage(chatId, { 
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ BAN FAILED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to ban user!",
            ...channelInfo 
        });
    }
}

module.exports = banCommand;