// commands/unmute-user.js
const isAdmin = require('../lib/isAdmin');
const { mutedUsers } = require('./mute-user');

async function unmuteUserCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        // Check if sender is admin
        const senderId = message.key.participant || message.key.remoteJid;
        const adminStatus = await isAdmin(sock, chatId, senderId);
        
        if (!adminStatus.isSenderAdmin && !message.key.fromMe) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command.' 
            }, { quoted: message });
        }

        const mentioned = message.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please mention the user to unmute.\nExample: .unmute-user @user' 
            }, { quoted: message });
        }

        const targetJid = mentioned[0];
        
        if (mutedUsers.delete(targetJid)) {
            await sock.sendMessage(chatId, { 
                text: `✪ \`\`\`User Unmuted\`\`\`\n\n@${targetJid.split('@')[0]} can now send messages.`,
                mentions: [targetJid]
            }, { quoted: message });
        } else {
            await sock.sendMessage(chatId, { text: '❌ This user is not muted.' });
        }
    } catch (error) {
        console.error('Error in unmute-user command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to unmute user.' });
    }
}

module.exports = unmuteUserCommand;