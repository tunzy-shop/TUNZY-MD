// commands/block.js
const config = require('../config'); // Assuming config.js exists with bot settings
const isOwner = require('../lib/isOwner'); // Fixed import name (matches repo's likely structure)

async function blockCommand(sock, chatId, message, senderId, msgText) {
    try {
        // Check if sender is owner (using the imported function)
        const senderIsOwner = await isOwner(senderId, sock);
        
        // Allow if fromMe (bot itself) or owner
        if (!message.key.fromMe && !senderIsOwner) {
            return await sock.sendMessage(chatId, { 
                text: '❌ This command is only for the owner/sudo.' 
            }, { quoted: message });
        }

        // Extract target JID - improved logic
        let targetJid = null;
        
        // Check for mentioned users
        const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length > 0) {
            targetJid = mentioned[0];
        }
        
        // If in DM and no mention, use the chat ID as target
        if (!targetJid && chatId.endsWith('@s.whatsapp.net')) {
            targetJid = chatId;
        }

        // If still no target, try to extract from command text (e.g., .block 1234567890@s.whatsapp.net)
        if (!targetJid) {
            const args = msgText.split(' ').slice(1);
            if (args.length > 0 && args[0].includes('@s.whatsapp.net')) {
                targetJid = args[0];
            }
        }

        if (!targetJid) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Please mention a user, reply to their message, or provide their JID.\n' +
                      'Examples:\n' +
                      '• .block @user\n' +
                      '• .block 1234567890@s.whatsapp.net\n' +
                      '• Use in user\'s DM' 
            }, { quoted: message });
        }

        // Prevent blocking the bot owner or yourself
        if (targetJid === senderId) {
            return await sock.sendMessage(chatId, { 
                text: '❌ You cannot block yourself.' 
            }, { quoted: message });
        }

        // Check if target is the bot owner (optional safety)
        const ownerJid = config.OWNER_NUMBER.includes('@') ? 
                         config.OWNER_NUMBER : `${config.OWNER_NUMBER}@s.whatsapp.net`;
        if (targetJid === ownerJid) {
            return await sock.sendMessage(chatId, { 
                text: '❌ Cannot block the bot owner.' 
            }, { quoted: message });
        }

        // Perform the block
        await sock.updateBlockStatus(targetJid, 'block');

        // Send success response with proper mention
        await sock.sendMessage(chatId, { 
            text: `✪ \`\`\`User Blocked\`\`\`\n\n@${targetJid.split('@')[0]} has been blocked successfully.`,
            mentions: [targetJid]
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error in block command:', error);
        await sock.sendMessage(chatId, { 
            text: '❌ Failed to block user. Error: ' + error.message 
        });
    }
}

module.exports = blockCommand;