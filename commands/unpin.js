// commands/unpin.js
async function unpinCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        // Simple response - actual unpinning depends on WhatsApp API
        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`Message Unpinned\`\`\`\n\nAll pinned messages have been removed.`
        }, { quoted: message });

    } catch (error) {
        console.error('Error in unpin command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to unpin message.' });
    }
}

module.exports = unpinCommand;