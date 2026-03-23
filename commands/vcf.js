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
                // Try to get the contact's WhatsApp name
                const contact = await sock.onWhatsApp(jid);
                if (contact && contact[0] && contact[0].name) {
                    name = contact[0].name;
                } else {
                    // If no WhatsApp name, try to get push name from group
                    name = participant.notify || participant.pushName || '';
                }
                
                // If still no name, use the format TMD-234 + country code + number
                if (!name || name.trim() === '') {
                    // Extract country code (assuming number starts with country code)
                    // This is a simple approach - you might need to adjust based on your number format
                    let countryCode = '';
                    if (number.startsWith('234')) {
                        countryCode = '234';
                    } else if (number.startsWith('1')) {
                        countryCode = '1';
                    } else if (number.startsWith('44')) {
                        countryCode = '44';
                    } else if (number.startsWith('91')) {
                        countryCode = '91';
                    } else {
                        // Default to first 1-3 digits as country code
                        countryCode = number.match(/^\d{1,3}/)?.[0] || '';
                    }
                    
                    name = `TMD-${countryCode}${number}`;
                }
            } catch (error) {
                console.error(`Error getting name for ${jid}:`, error);
                // Fallback to group notify name or number
                name = participant.notify || `TMD-${number}`;
            }
            
            // Clean the name to ensure it's valid for VCF
            name = name.replace(/[;,]/g, '').trim();
            
            vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL:${number}\nEND:VCARD\n`;
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