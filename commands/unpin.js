// commands/unpin.js
const isAdmin = require('../lib/isAdmin');

async function unpinCommand(sock, chatId, message) {
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

        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`Message Unpinned\`\`\`\n\nAll pinned messages have been removed.`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in unpin command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to unpin message.' });
    }
}

module.exports = unpinCommand;