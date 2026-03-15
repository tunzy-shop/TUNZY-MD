<div align="center">
  
# ✨ TUNZY-MD UPDATED VERSION ✨

<img src="assets/bot_picture.jpg" alt="TUNZY-MD Bot" width="300" height="300" style="border-radius: 50%; border: 3px solid #3B82F6; box-shadow: 0 10px 30px -10px #3B82F6;">

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=30&duration=3000&pause=1000&color=3B82F6&center=true&vCenter=true&width=435&lines=TUNZY+MD;BOT+WHATSAPP;UPDATED+VERSION" alt="Typing SVG" />

### 🚀 Developed by [TUNZY SHOP](https://github.com/tunzy-shop)

[![GitHub stars](https://img.shields.io/github/stars/tunzy-shop/TUNZY-MD?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/tunzy-shop/TUNZY-MD/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/tunzy-shop/TUNZY-MD?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/tunzy-shop/TUNZY-MD/network)
[![GitHub license](https://img.shields.io/github/license/tunzy-shop/TUNZY-MD?style=for-the-badge&logo=github&color=3B82F6)](https://github.com/tunzy-shop/TUNZY-MD/blob/main/LICENSE)

---

## 📋 DEPLOYMENT PLATFORMS

<div align="center">

[![Katabumb](https://img.shields.io/badge/Katabumb-Deploy_Now-3B82F6?style=for-the-badge&logo=cloudflare&logoColor=white)](https://katabumb.com)
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

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const config = {
    OWNER_NUMBER: '234XXXXXXXXXX', // CHANGE THIS TO YOUR NUMBER
    BOT_NAME: 'TUNZY-MD',
    OWNER_NAME: 'YourName'
};

try {
    console.log('📦 Setting up TUNZY-MD...');
    
    // Clone repository
    console.log('⏳ Cloning repository...');
    execSync('git clone https://github.com/tunzy-shop/TUNZY-MD temp-dir', { stdio: 'inherit' });
    
    // Move files
    const files = fs.readdirSync('temp-dir');
    for (const file of files) {
        if (file !== '.git') {
            if (fs.existsSync(file)) {
                fs.rmSync(file, { recursive: true, force: true });
            }
            fs.renameSync(`temp-dir/${file}`, file);
        }
    }
    fs.rmdirSync('temp-dir', { recursive: true });
    
    // Update owner.json
    if (fs.existsSync('data/owner.json')) {
        let ownerData = JSON.parse(fs.readFileSync('data/owner.json', 'utf8'));
        if (!Array.isArray(ownerData)) ownerData = [];
        const ownerWithSuffix = config.OWNER_NUMBER.includes('@') ? 
            config.OWNER_NUMBER : `${config.OWNER_NUMBER}@s.whatsapp.net`;
        if (!ownerData.includes(ownerWithSuffix)) {
            ownerData.push(ownerWithSuffix);
            fs.writeFileSync('data/owner.json', JSON.stringify(ownerData, null, 2));
            console.log('✅ Owner number configured');
        }
    }
    
    // Update premium.json
    if (fs.existsSync('data/premium.json')) {
        let premiumData = JSON.parse(fs.readFileSync('data/premium.json', 'utf8'));
        if (!Array.isArray(premiumData)) premiumData = [];
        const ownerWithSuffix = config.OWNER_NUMBER.includes('@') ? 
            config.OWNER_NUMBER : `${config.OWNER_NUMBER}@s.whatsapp.net`;
        if (!premiumData.includes(ownerWithSuffix)) {
            premiumData.push(ownerWithSuffix);
            fs.writeFileSync('data/premium.json', JSON.stringify(premiumData, null, 2));
        }
    }
    
    console.log('📦 Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    
    console.log('🚀 Starting bot...');
    console.log('\n📱 Scan the QR code below with WhatsApp:\n');
    execSync('npm start', { stdio: 'inherit' });
    
} catch (err) {
    console.error('❌ Setup failed:', err.message);
    console.log('\n💡 Tip: If you see "npm error ENOENT", change startup command to: node index.js');
}