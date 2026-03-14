// commands/vcf.js
const fs = require('fs');
const path = require('path');

async function vcfCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        
        let vcfData = '';
        participants.forEach((participant) => {
            const name = participant.notify || participant.id.split('@')[0];
            const number = participant.id.split('@')[0];
            vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL:+${number}\nEND:VCARD\n`;
        });

        const buffer = Buffer.from(vcfData, 'utf-8');
        
        await sock.sendMessage(chatId, {
            document: buffer,
            mimetype: 'text/x-vcard',
            fileName: `group_contacts_${Date.now()}.vcf`,
            caption: '✪ ```Group Contacts Export```'
        }, { quoted: message });
    } catch (error) {
        console.error('Error in vcf command:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to export contacts.' });
    }
}

module.exports = vcfCommand;