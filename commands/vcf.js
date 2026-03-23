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

        for (const participant of participants) {
            const jid = participant.id;
            const number = jid.split('@')[0];
            
            let name = '';
            
            try {
                // Get the person's WhatsApp name from pushName
                if (participant.pushName && participant.pushName.trim() !== '') {
                    name = participant.pushName;
                } else {
                    // If no name, save as TMD-number
                    name = `TMD-${number}`;
                }
                
                // Clean the name for VCF format
                name = name.replace(/[;,]/g, '').trim();
                
                // Add to VCF data
                vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL:+${number}\nEND:VCARD\n`;
                
            } catch (error) {
                console.error(`Error processing ${jid}:`, error);
                // Fallback to TMD-number if error occurs
                name = `TMD-${number}`;
                vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL:+${number}\nEND:VCARD\n`;
            }
        }

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