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
        let debugInfo = 'Exported numbers:\n';

        for (const participant of participants) {
            // Get the raw number from JID (e.g., "2348123456789")
            const rawNumber = participant.id.split('@')[0];
            // Use exactly this number, add '+' for international format
            const phoneNumber = `+${rawNumber}`;
            
            // Get WhatsApp display name (pushName)
            let name = participant.pushName;
            if (!name || name.trim() === '') {
                name = `TMD-${rawNumber}`;
            }
            // Sanitize name (remove characters that could break VCF)
            name = name.replace(/[;,]/g, '').trim();

            // Build VCF entry
            vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${phoneNumber}\nEND:VCARD\n`;
            
            // For debugging – you can check your console to verify numbers
            debugInfo += `${name} → ${phoneNumber}\n`;
        }

        // Optional: log the first few entries to see if numbers are correct
        console.log(debugInfo);

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