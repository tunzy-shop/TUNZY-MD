const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommandEdited(sock, chatId, message) {
    // Hidden "read more" to collapse WhatsApp message
    const readMore = String.fromCharCode(8206).repeat(4000);

    // Prepare caption
    const caption = `
┏━━━━━━━━━━━━━━━━━━━
┃ TUNZY-MD
┃ Version : 1.0.0
┃ Owner  : TUNZY SHOP
┃ YouTube: Tunzy Shop
┗━━━━━━━━━━━━━━━━━━━
${readMore}

┏━━━━━━━━[CORE]━━━━━━━
┃ .menu / .help
┃ .ping
┃ .alive
┃ .owner
┃ .jid
┃ .url
┃ .tts <text>
┃ .joke
┃ .quote
┃ .fact
┃ .news
┃ .weather <city>
┃ .lyrics <song>
┃ .8ball <question>
┃ .groupinfo
┃ .admins / .staff
┃ .vv
┃ .trt <text> <lang>
┃ .ss <link>
┃ .attp <text>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━[GROUP ADMIN]━━━━━
┃ .ban
┃ .kick
┃ .mute / .unmute
┃ .promote / .demote
┃ .del
┃ .warn
┃ .warnings
┃ .clear
┃ .tag
┃ .tagall
┃ .tagnotadmin
┃ .hidetag
┃ .antilink
┃ .antibadword
┃ .antitag
┃ .chatbot
┃ .welcome
┃ .goodbye
┃ .resetlink
┃ .setgname <name>
┃ .setgdesc <desc>
┃ .setgpp
┃ .accept all
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━[OWNER CONTROL]━━━━
┃ .mode <public/self>
┃ .update
┃ .settings
┃ .clearsession
┃ .cleartmp
┃ .antidelete
┃ .anticall
┃ .setpp <reply image>
┃ .setmention <reply msg>
┃ .mention
┃ .autoread
┃ .autoreact
┃ .autotyping
┃ .autostatus
┃ .autostatus react
┃ .pmblocker
┃ .pmblocker setmsg
┃ .savestatus
┗━━━━━━━━━━━━━━━━━━━━

┏━━━[MEDIA/STICKERS]━━━━
┃ .sticker
┃ .tgsticker
┃ .simage <reply sticker>
┃ .blur <reply image>
┃ .crop
┃ .removebg
┃ .meme
┃ .take
┃ .emojimix
┃ .igs <insta link>
┃ .igsc <insta link>
┃ .hd <reply image>
┗━━━━━━━━━━━━━━━━━━━━

┏━━━[IMAGE SEARCH]━━━━━
┃ .pies <country>
┃ .japan
┃ .korean
┃ .indonesia
┃ .china
┃ .hijab
┗━━━━━━━━━━━━━━━━━━━━

┏━━━━━━━[GAMES]━━━━━━━
┃ .tictactoe @user
┃ .hangman
┃ .guess <letter>
┃ .trivia
┃ .answer <answer>
┃ .truth
┃ .dare
┗━━━━━━━━━━━━━━━━━━━

┏━━[AI INTELLIGENCE]━━━
┃ .gpt <question>
┃ .gemini <question>
┃ .imagine <prompt>
┃ .flux <prompt>
┃ .sora <prompt>
┗━━━━━━━━━━━━━━━━━━━

┏━━[SOURCES/REPO]━━━━━
┃ .git
┃ .github
┃ .repo
┃ .sc
┃ .script
┗━━━━━━━━━━━━━━━━━━━

┏━━━━━[REACTION]━━━━━━
┃ .nom
┃ .poke
┃ .cry
┃ .kiss
┃ .pat
┃ .hug
┃ .wink
┃ .facepalm
┗━━━━━━━━━━━━━━━━━━━

┏━━━━━━[EFFECTS]━━━━━
┃ .heart
┃ .horny
┃ .lgbt
┃ .circle
┃ .lolice
┃ .its-so-stupid
┃ .namecard
┃ .oogway
┃ .tweet
┃ .ytcomment
┃ .comrade
┃ .gay
┃ .glass
┃ .jail
┃ .passed
┃ .triggered
┗━━━━━━━━━━━━━━━━━━

┏━━━[FUN / SOCIAL]━━━
┃ .compliment @user
┃ .insult @user
┃ .flirt
┃ .shayari
┃ .goodnight
┃ .roseday
┃ .character @user
┃ .wasted @user
┃ .ship @user
┃ .simp @user
┃ .stupid @user <text>
┗━━━━━━━━━━━━━━━━━━━

┏━━━━[TEXT DESIGN]━━━━
┃ .metalic
┃ .ice
┃ .snow
┃ .impressive
┃ .matrix
┃ .light
┃ .neon
┃ .devil
┃ .purple
┃ .thunder
┃ .hacker
┃ .sand
┃ .leaves
┃ .1917
┃ .arena
┃ .blackpink
┃ .glitch
┃ .fire
┗━━━━━━━━━━━━━━━━━━━

┏━━[MEDIA DOWNLOAD]━━━
┃ .song <name>
┃ .play <name>
┃ .spotify <name>
┃ .video <name>
┃ .instagram <link>
┃ .facebook <link>
┃ .tiktok <link>
┗━━━━━━━━━━━━━━━━━━━

┏━[SYSTEM UPDATE]━━━━
┃ Join Official Channel 👇
┗━━━━━━━━━━━━━━━━━━
    `;

    // 2️⃣ Check if bot_picture.jpg exists
    const imagePath = path.join(__dirname, '../assets/bot_picture.jpg');
    
    try {
        // 3️⃣ Send image with caption if exists
        if (fs.existsSync(imagePath)) {
            // Send image with caption (removed jpegThumbnail for speed)
            await sock.sendMessage(chatId, {
                image: { url: imagePath },
                caption: caption.trim(),
                mimetype: 'image/jpeg'
            });
        } else {
            // Send only text if image doesn't exist
            await sock.sendMessage(chatId, {
                text: caption
            });
        }
    } catch (error) {
        console.error('Error sending menu:', error);
        // If image fails to send, try sending just the text
        await sock.sendMessage(chatId, {
            text: `⚠️ Failed to load image\n\n${caption}`,
            quoted: message
        });
    }
}

module.exports = helpCommandEdited;