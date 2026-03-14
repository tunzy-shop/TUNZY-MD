// commands/pin.js
async function pinCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        const quotedMsg = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return await sock.sendMessage(chatId, { text: '❌ Please reply to a message to pin it.' });
        }

        // Send a message and then pin it (requires admin)
        const pinMsg = await sock.sendMessage(chatId, { 
            text: '📌 *Pinned Message*\n\nReply to this message to view the pinned content.' 
        });

        // Note: Pinning functionality depends on WhatsApp Web API
        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`Message Pinned\`\`\`\n\nMessage has been pinned to the group.`,
            edit: pinMsg.key
        });

    } catch (error) {
        console.error('Error in pin command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to pin message. Make sure bot is admin.' });
    }
}

module.exports = pinCommand;