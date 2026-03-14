// commands/gpp.js
const axios = require('axios');

async function gppCommand(sock, chatId, message) {
    try {
        let targetChat = chatId;
        
        // Check if user provided a group link
        const args = message.message?.conversation?.trim().split(' ') || [];
        if (args[1] && args[1].includes('chat.whatsapp.com')) {
            const link = args[1];
            const code = link.split('https://chat.whatsapp.com/')[1];
            const groupData = await sock.groupGetInviteInfo(code);
            targetChat = groupData.id;
        }

        const ppUrl = await sock.profilePictureUrl(targetChat, 'image').catch(() => null);
        
        if (!ppUrl) {
            return await sock.sendMessage(chatId, { 
                text: '❌ No profile picture found for this group/user.' 
            });
        }

        const response = await axios.get(ppUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(response.data, 'binary');

        await sock.sendMessage(chatId, { 
            image: buffer,
            caption: `✪ \`\`\`Profile Picture\`\`\`\n\nGroup: ${targetChat.split('@')[0]}` 
        }, { quoted: message });

    } catch (error) {
        console.error('Error in gpp command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to fetch profile picture.' });
    }
}

module.exports = gppCommand;