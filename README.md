<div align="center">
  
# ✨ TUNZY-MD UPDATED VERSION ✨

<img src="assets/bot_picture.jpg" alt="TUNZY-MD Bot" width="300" height="300" style="border-radius: 50%; border: 3px solid #3B82F6; box-shadow: 0 10px 30px -10px #3B82F6;">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=30&duration=3000&pause=1000&color=3B82F6&center=true&vCenter=true&width=435&lines=TUNZY+MD;WHATSAPP+BOT;UPDATED+VERSION" alt="Typing SVG" />

### 🚀 Developed by [TUNZY SHOP](https://github.com/tunzy-shop)

[![GitHub stars](https://img.shields.io/github/stars/tunzy-shop/TUNZY-MD?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/tunzy-shop/TUNZY-MD/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/tunzy-shop/TUNZY-MD?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/tunzy-shop/TUNZY-MD/network)
[![GitHub license](https://img.shields.io/github/license/tunzy-shop/TUNZY-MD?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/tunzy-shop/TUNZY-MD/blob/main/LICENSE)

---

## 📋 DEPLOYMENT PLATFORMS

<div align="center">

[![Katabumb](https://img.shields.io/badge/Katabumb-Deploy_Now-3B82F6?style=for-the-badge&logo=cloudflare&logoColor=white)](https://dashboard.katabump.com)
[![bothosting](https://img.shields.io/badge/bothosting-Deploy_Now-3B82F6?style=for-the-badge&logo=heroku&logoColor=white)](https://bothosting.com)

</div>

---

## 🎥 VIDEO TUTORIALS

<div align="center">

[![YouTube](https://img.shields.io/badge/Deploy_on_Katabumb-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/watch?v=YOUR_KATABUMB_VIDEO)
[![YouTube](https://img.shields.io/badge/Deploy_on_bothosting-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/watch?v=YOUR_BOTHOSTING_VIDEO)

</div>

---

## 📜 SETUP SCRIPT
1. Create index.js in your panel
2. Paste the code 👇🏽
3. Edit to ur number and owner name
4. And deploy and wait for pairing code

```javascript

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = {
    OWNER_NUMBER: '2250779042402', // CHANGE THIS TO YOUR NUMBER
    OWNER_NAME: 'TUNZY', // Change this to your name
    BOT_NAME: 'TUNZY-MD'
};

try {
    console.log('📦 Setting up TUNZY-MD...');
    
    // Clone repository
    console.log('⏳ Cloning repository...');
    execSync('git clone https://github.com/tunzy-shop/TUNZY-MD temp-dir', { stdio: 'inherit' });
    
    // Move files from temp-dir to current directory
    console.log('📂 Moving files...');
    const files = fs.readdirSync('temp-dir');
    for (const file of files) {
        if (file !== '.git') {
            const srcPath = path.join('temp-dir', file);
            const destPath = path.join(process.cwd(), file);
            
            // Remove destination if it exists
            if (fs.existsSync(destPath)) {
                fs.rmSync(destPath, { recursive: true, force: true });
            }
            
            // Move file
            fs.renameSync(srcPath, destPath);
        }
    }
    
    // Remove temp directory
    fs.rmdirSync('temp-dir', { recursive: true });
    
    console.log('⚙️ Configuring files...');
    
    // ============================================
    // EDIT SETTINGS.JS - WITH COLON FORMAT
    // ============================================
    
    const settingsPath = path.join(process.cwd(), 'settings.js');
    if (fs.existsSync(settingsPath)) {
        console.log('📝 Reading settings.js...');
        
        // Read the file
        let content = fs.readFileSync(settingsPath, 'utf8');
        let lines = content.split('\n');
        let newLines = [];
        let modified = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let originalLine = line;
            
            // Check for botOwner line with colon format
            if (line.includes('botOwner:')) {
                // Replace with botOwner: 'NAME', // Your name
                line = `  botOwner: '${config.OWNER_NAME}', // Your name`;
                if (line !== originalLine) {
                    console.log(`  ✅ Line ${i+1}: Updated botOwner to "${config.OWNER_NAME}"`);
                    modified = true;
                }
            }
            // Check for ownerNumber line with colon format
            else if (line.includes('ownerNumber:')) {
                // Replace with ownerNumber: 'NUMBER', // Set your number here
                line = `  ownerNumber: '${config.OWNER_NUMBER}', // Set your number here without + symbol, just add country code & number without any space`;
                if (line !== originalLine) {
                    console.log(`  ✅ Line ${i+1}: Updated ownerNumber to "${config.OWNER_NUMBER}"`);
                    modified = true;
                }
            }
            
            newLines.push(line);
        }
        
        // Write back if modified
        if (modified) {
            fs.writeFileSync(settingsPath, newLines.join('\n'));
            console.log('✅ settings.js has been updated successfully');
        } else {
            console.log('⚠️ No changes needed in settings.js');
        }
        
        // Show final content
        console.log('\n📄 Final settings.js content:');
        const finalContent = fs.readFileSync(settingsPath, 'utf8');
        const finalLines = finalContent.split('\n');
        for (let i = 0; i < finalLines.length; i++) {
            if (finalLines[i].includes('botOwner') || finalLines[i].includes('ownerNumber')) {
                console.log(`   ${finalLines[i].trim()}`);
            }
        }
        
    } else {
        console.log('❌ settings.js not found!');
    }
    
    // ============================================
    // EDIT DATA/OWNER.JSON
    // ============================================
    
    const ownerJsonPath = path.join(process.cwd(), 'data', 'owner.json');
    if (fs.existsSync(ownerJsonPath)) {
        try {
            // Write the array with owner number
            const ownerData = [config.OWNER_NUMBER];
            fs.writeFileSync(ownerJsonPath, JSON.stringify(ownerData, null, 2));
            console.log('✅ Updated data/owner.json');
        } catch (e) {
            console.log('❌ Error updating owner.json:', e.message);
        }
    }
    
    // ============================================
    // EDIT DATA/PREMIUM.JSON
    // ============================================
    
    const premiumJsonPath = path.join(process.cwd(), 'data', 'premium.json');
    if (fs.existsSync(premiumJsonPath)) {
        try {
            // Write the array with owner number
            const premiumData = [config.OWNER_NUMBER];
            fs.writeFileSync(premiumJsonPath, JSON.stringify(premiumData, null, 2));
            console.log('✅ Updated data/premium.json');
        } catch (e) {
            console.log('❌ Error updating premium.json:', e.message);
        }
    }
    
    console.log('\n📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('\n✅✅✅ SETUP COMPLETE! ✅✅✅');
    console.log('\n📱 Settings updated:');
    console.log(`   botOwner: '${config.OWNER_NAME}', // Your name`);
    console.log(`   ownerNumber: '${config.OWNER_NUMBER}', // Set your number here`);
    console.log(`   data/owner.json: ["${config.OWNER_NUMBER}"]`);
    console.log(`   data/premium.json: ["${config.OWNER_NUMBER}"]`);
    
    console.log('\n🚀 Starting bot...');
    console.log('\n📱 Scan the QR code below with WhatsApp:\n');
    
    execSync('npm start', { stdio: 'inherit' });
    
} catch (err) {
    console.error('\n❌ Setup failed:', err.message);
    console.log('\n💡 Tip: If you see "npm error ENOENT", change startup command to: node index.js');
}
