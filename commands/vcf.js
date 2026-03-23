// vcf.js - Generate vCard contact files with person names
const fs = require('fs');
const path = require('path');

/**
 * Generate VCF (vCard) contact file for a specific person
 * @param {Object} person - Person details
 * @param {string} person.number - Phone number
 * @param {string} person.name - Person's full name
 * @param {string} person.role - Role (e.g., "Bot Owner", "Premium User")
 * @param {string} botName - Bot name
 * @param {string} [outputPath] - Custom output path
 */
function generatePersonVCF(person, botName, outputPath = null) {
    try {
        // Format phone number (remove any non-digit characters)
        const phoneNumber = person.number.replace(/\D/g, '');
        
        // Sanitize name for filename (remove special characters)
        const sanitizedName = person.name.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Create vCard content
        const vcfContent = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${person.name}`,
            `N:${person.name};;;`,
            `TEL;TYPE=CELL:${phoneNumber}`,
            `ORG:${botName}`,
            `TITLE:${person.role || 'Bot User'}`,
            'CATEGORIES:WHATSAPP,BOT',
            `NOTE:${person.role || 'User'} for ${botName}\\nWhatsApp Bot: https://github.com/tunzy-shop/TUNZY-MD`,
            'END:VCARD'
        ].join('\n');

        // Determine output path - use person's name as filename
        const finalPath = outputPath || path.join(process.cwd(), 'contacts', `${sanitizedName}.vcf`);
        
        // Ensure directory exists
        const dir = path.dirname(finalPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write VCF file
        fs.writeFileSync(finalPath, vcfContent, 'utf8');
        console.log(`✅ Generated contact: ${person.name} (${phoneNumber}) -> ${finalPath}`);
        
        return finalPath;
    } catch (error) {
        console.error(`❌ Failed to generate VCF for ${person.name}:`, error.message);
        throw error;
    }
}

/**
 * Generate VCF for bot owner from settings.js
 * Uses the owner's actual name
 */
function generateOwnerVCF() {
    try {
        // Read settings.js
        const settingsPath = path.join(process.cwd(), 'settings.js');
        if (!fs.existsSync(settingsPath)) {
            throw new Error('settings.js not found!');
        }

        // Read and parse settings.js content
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        
        // Extract ownerNumber
        const ownerNumberMatch = settingsContent.match(/ownerNumber:\s*['"]([^'"]+)['"]/);
        const ownerNumber = ownerNumberMatch ? ownerNumberMatch[1] : null;
        
        // Extract botOwner name (person's actual name)
        const ownerNameMatch = settingsContent.match(/botOwner:\s*['"]([^'"]+)['"]/);
        const ownerName = ownerNameMatch ? ownerNameMatch[1] : null;
        
        // Extract bot name
        const botNameMatch = settingsContent.match(/botName:\s*['"]([^'"]+)['"]/);
        const botName = botNameMatch ? botNameMatch[1] : 'TUNZY-MD';

        if (!ownerNumber || !ownerName) {
            console.warn('⚠️ Could not find ownerNumber or botOwner in settings.js');
            console.warn('Using default values...');
            
            // Generate VCF with default values
            generatePersonVCF({
                number: ownerNumber || '2250779042402',
                name: ownerName || 'TUNZY',
                role: 'Bot Owner'
            }, botName);
        } else {
            // Generate VCF with actual owner name
            generatePersonVCF({
                number: ownerNumber,
                name: ownerName,
                role: 'Bot Owner'
            }, botName);
        }

    } catch (error) {
        console.error('❌ Error generating owner VCF:', error.message);
    }
}

/**
 * Generate VCF for all people in a JSON file
 * Each person should have 'name' and 'number' fields
 * @param {string} jsonPath - Path to JSON file
 * @param {string} role - Role for these contacts (e.g., "Owner", "Premium User")
 * @param {string} botName - Bot name
 */
function generateFromJSON(jsonPath, role, botName) {
    try {
        if (!fs.existsSync(jsonPath)) {
            console.log(`⚠️ ${jsonPath} not found, skipping`);
            return;
        }

        const people = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        
        if (!Array.isArray(people) || people.length === 0) {
            console.log(`⚠️ No people found in ${jsonPath}`);
            return;
        }

        console.log(`\n📇 Generating VCF files for ${people.length} ${role}(s)...\n`);
        
        // Generate individual VCF files for each person using their actual name
        people.forEach((person, index) => {
            // Handle both string (just number) and object (with name and number) formats
            let personData;
            
            if (typeof person === 'string') {
                // If it's just a number string, use generic name
                personData = {
                    number: person,
                    name: `${role} ${index + 1}`,
                    role: role
                };
            } else if (typeof person === 'object') {
                // If it's an object with name and number
                personData = {
                    number: person.number || person.phone || person,
                    name: person.name || `${role} ${index + 1}`,
                    role: role
                };
            }
            
            generatePersonVCF(personData, botName);
        });
        
        console.log(`\n✅ Generated ${people.length} contact VCF files in 'contacts/' folder\n`);

    } catch (error) {
        console.error(`❌ Error generating VCF from ${jsonPath}:`, error.message);
    }
}

/**
 * Generate VCF for owners from data/owner.json
 * Uses actual names if available in the JSON
 */
function generateOwnersVCF() {
    const ownerJsonPath = path.join(process.cwd(), 'data', 'owner.json');
    
    // Read bot name from settings
    const settingsPath = path.join(process.cwd(), 'settings.js');
    let botName = 'TUNZY-MD';
    if (fs.existsSync(settingsPath)) {
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        const botNameMatch = settingsContent.match(/botName:\s*['"]([^'"]+)['"]/);
        if (botNameMatch) botName = botNameMatch[1];
    }
    
    generateFromJSON(ownerJsonPath, 'Bot Owner', botName);
}

/**
 * Generate VCF for premium users from data/premium.json
 * Uses actual names if available in the JSON
 */
function generatePremiumVCF() {
    const premiumJsonPath = path.join(process.cwd(), 'data', 'premium.json');
    
    // Read bot name from settings
    const settingsPath = path.join(process.cwd(), 'settings.js');
    let botName = 'TUNZY-MD';
    if (fs.existsSync(settingsPath)) {
        const settingsContent = fs.readFileSync(settingsPath, 'utf8');
        const botNameMatch = settingsContent.match(/botName:\s*['"]([^'"]+)['"]/);
        if (botNameMatch) botName = botNameMatch[1];
    }
    
    generateFromJSON(premiumJsonPath, 'Premium User', botName);
}

/**
 * Generate a combined VCF with all contacts
 */
function generateCombinedVCF() {
    try {
        const contactsDir = path.join(process.cwd(), 'contacts');
        if (!fs.existsSync(contactsDir)) {
            console.log('⚠️ No contacts folder found');
            return;
        }
        
        const vcfFiles = fs.readdirSync(contactsDir).filter(f => f.endsWith('.vcf'));
        
        if (vcfFiles.length === 0) {
            console.log('⚠️ No VCF files found in contacts folder');
            return;
        }
        
        // Combine all VCF files
        let combinedContent = '';
        vcfFiles.forEach(file => {
            const filePath = path.join(contactsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            combinedContent += content + '\n';
        });
        
        const combinedPath = path.join(process.cwd(), 'all_contacts.vcf');
        fs.writeFileSync(combinedPath, combinedContent, 'utf8');
        console.log(`\n✅ Combined all contacts into: ${combinedPath}`);
        
    } catch (error) {
        console.error('❌ Error creating combined VCF:', error.message);
    }
}

// Command-line interface
if (require.main === module) {
    const args = process.argv.slice(2);
    
    console.log('📇 TUNZY-MD VCF Generator - Contact Cards with Names\n');
    
    if (args.includes('--owners') || args.includes('-o')) {
        // Generate VCF for all owners from owner.json
        console.log('Generating VCF files for all bot owners...');
        generateOwnersVCF();
    } 
    else if (args.includes('--premium') || args.includes('-p')) {
        // Generate VCF for premium users
        console.log('Generating VCF files for premium users...');
        generatePremiumVCF();
    }
    else if (args.includes('--all') || args.includes('-a')) {
        // Generate all VCFs
        console.log('Generating VCF files for all contacts...');
        generateOwnerVCF();
        generateOwnersVCF();
        generatePremiumVCF();
        generateCombinedVCF();
    }
    else if (args.includes('--combine') || args.includes('-c')) {
        // Combine all existing VCFs
        generateCombinedVCF();
    }
    else if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage:');
        console.log('  node vcf.js                 Generate owner VCF from settings.js');
        console.log('  node vcf.js --owners -o     Generate VCF for all owners from owner.json');
        console.log('  node vcf.js --premium -p    Generate VCF for premium users from premium.json');
        console.log('  node vcf.js --all -a        Generate VCF for all contacts');
        console.log('  node vcf.js --combine -c    Combine all VCF files into one');
        console.log('  node vcf.js --help -h       Show this help message');
        console.log('\nJSON Format Examples:');
        console.log('  Simple array (numbers only):');
        console.log('  ["2250779042402", "1234567890"]');
        console.log('\n  With names (recommended):');
        console.log('  [');
        console.log('    {"name": "John Doe", "number": "2250779042402"},');
        console.log('    {"name": "Jane Smith", "number": "1234567890"}');
        console.log('  ]');
    }
    else {
        // Default: Generate single owner VCF
        generateOwnerVCF();
    }
}

module.exports = { 
    generatePersonVCF, 
    generateOwnerVCF, 
    generateOwnersVCF, 
    generatePremiumVCF,
    generateFromJSON,
    generateCombinedVCF
};