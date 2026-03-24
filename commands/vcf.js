// commands/vcf.js
// VCF Contact Generator - Gets all group members and sends VCF file

const fs = require('fs');
const path = require('path');

const vcfCommand = {
    name: 'vcf',
    description: 'Generate VCF contact file with all group members',
    usage: '.vcf',
    category: 'utility',
    aliases: ['contact', 'savecontact'],
    
    async execute(sock, message, args, prefix, config) {
        const sender = message.key.remoteJid;
        const isGroup = sender.endsWith('@g.us');
        
        // Only work in groups
        if (!isGroup) {
            return; // Silent fail in private chats
        }
        
        try {
            // Get all group members
            const groupMetadata = await sock.groupMetadata(sender);
            const participants = groupMetadata.participants;
            
            if (!participants || participants.length === 0) {
                return; // No members found, silent fail
            }
            
            // Generate VCF entries for all members
            let processedContacts = [];
            
            for (const participant of participants) {
                const jid = participant.id;
                const number = jid.split('@')[0];
                
                if (number) {
                    // Try to get the participant's name from group metadata
                    let contactName = null;
                    
                    // Check if participant has a name in group
                    if (participant.name) {
                        contactName = participant.name;
                    } else if (groupMetadata.participants) {
                        // Try to find push name or other name
                        const participantInfo = groupMetadata.participants.find(p => p.id === jid);
                        if (participantInfo && participantInfo.pushName) {
                            contactName = participantInfo.pushName;
                        }
                    }
                    
                    // Generate VCF entry
                    const vcfEntry = generateVcfEntry(number, contactName);
                    if (vcfEntry) {
                        processedContacts.push(vcfEntry);
                    }
                }
            }
            
            // Create and send VCF file
            if (processedContacts.length > 0) {
                const vcfContent = processedContacts.join('\n');
                const fileName = `group_contacts_${Date.now()}.vcf`;
                const filePath = path.join(__dirname, '..', 'temp', fileName);
                
                // Ensure temp directory exists
                const tempDir = path.join(__dirname, '..', 'temp');
                if (!fs.existsSync(tempDir)) {
                    fs.mkdirSync(tempDir, { recursive: true });
                }
                
                // Write VCF file
                fs.writeFileSync(filePath, vcfContent);
                
                // Read the file
                const vcfBuffer = fs.readFileSync(filePath);
                
                // Send only the VCF file
                await sock.sendMessage(sender, {
                    document: vcfBuffer,
                    mimetype: 'text/vcard',
                    fileName: fileName
                });
                
                // Clean up temp file
                fs.unlinkSync(filePath);
            }
            
        } catch (error) {
            // Silent fail
            console.error('VCF Command Error:', error);
        }
    }
};

/**
 * Generate VCF entry for a contact
 * @param {string} number - Phone number
 * @param {string|null} name - Contact name (if available)
 * @returns {string} VCF entry
 */
function generateVcfEntry(number, name) {
    if (!number) return '';
    
    // Clean the number
    let cleanNumber = number.toString().replace(/[^\d]/g, '');
    
    // Format display name: use name if available, otherwise use number
    let displayName;
    if (name && name.trim() !== '' && name !== 'undefined' && name !== 'null') {
        displayName = name.trim();
    } else {
        displayName = cleanNumber.replace(/^0+/, '');
    }
    
    // Format number for VCF
    let vcfNumber = number;
    if (!vcfNumber.startsWith('+')) {
        vcfNumber = '+' + cleanNumber;
    }
    
    // Escape special characters
    const escapedName = displayName
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,');
    
    return `BEGIN:VCARD
VERSION:3.0
FN:${escapedName}
N:${escapedName};;;
TEL;TYPE=CELL:${vcfNumber}
END:VCARD`;
}

module.exports = vcfCommand;