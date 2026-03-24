// commands/vcf.js
async function vcfCommand(sock, chatId, message) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return await sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' });
        }

        const groupMetadata = await sock.groupMetadata(chatId);
        const participants = groupMetadata.participants;
        
        let vcfData = '';

        for (const participant of participants) {
            try {
                const number = participant.id.split('@')[0];
                let name = participant.notify || participant.pushName || '';
                
                if (!name) {
                    const countryCode = number.match(/^\d{1,3}/)?.[0] || '';
                    name = `TMD-${countryCode}${number}`;
                }
                
                name = name.replace(/[;,]/g, '').trim();
                vcfData += `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;TYPE=CELL:${number}\nEND:VCARD\n`;
            } catch (err) {
                continue;
            }
        }

        if (!vcfData) {
            return await sock.sendMessage(chatId, { text: '❌ No contacts to export.' });
        }

        await sock.sendMessage(chatId, {
            document: Buffer.from(vcfData, 'utf-8'),
            mimetype: 'text/x-vcard',
            fileName: `contacts_${Date.now()}.vcf`,
            caption: `✪ Exported ${participants.length} contacts`
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error:', error);
        await sock.sendMessage(chatId, { text: '❌ Failed to export contacts.' });
    }
}

module.exports = vcfCommand;