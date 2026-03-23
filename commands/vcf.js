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
            // Get the raw phone number from JID (e.g., "2348123456789")
            let rawNumber = participant.id.split('@')[0];
            
            // Remove any non-digit characters (just in case)
            let cleanNumber = rawNumber.replace(/\D/g, '');
            
            // Build the phone number with '+' for international format
            const formattedNumber = `+${cleanNumber}`;
            
            // Get the WhatsApp name (pushName) – this is the name the user set on WhatsApp
            let name = participant.pushName;
            if (!name || name.trim() === '') {
                // Fallback: TMD- followed by the full number (including country code)
                name = `TMD-${cleanNumber}`;
            }

            // Sanitize name (remove characters that can break VCF)
            name = name.replace(/[;,]/g, '').trim();

            // Build VCF entry
            vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${formattedNumber}\nEND:VCARD\n`;
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