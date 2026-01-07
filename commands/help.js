const settings = require('../settings');

async function helpCommandEdited(sock, chatId, message) {
    // Hidden "read more" to collapse WhatsApp message
    const readMore = String.fromCharCode(8206).repeat(4000);

    // 1️⃣ Send a temporary loading message
    const loadingMsg = await sock.sendMessage(
        chatId,
        { text: 'Loading menu...' },
        { quoted: message }
    );

    // 2️⃣ Delay for effect
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3️⃣ Full menu text
    const helpMessage = `
┏━━━━━━━━━━━━━━━━━━━━━━┓
┃ TUNZY-MD
┃ Version : ${settings.version || '1.0.0'}
┃ Owner  : TUNZY SHOP
┃ YouTube: ${global.ytch || 'Not Set'}
┗━━━━━━━━━━━━━━━━━━━━━━┛
${readMore}

╭━━〔 CORE COMMANDS 〕━━┈⊷
│ .menu / .help
│ .ping
│ .alive
│ .owner
│ .jid
│ .url
│ .tts <text>
│ .joke
│ .quote
│ .fact
│ .news
│ .weather <city>
│ .lyrics <song>
│ .8ball <question>
│ .groupinfo
│ .admins / .staff
│ .vv
│ .trt <text> <lang>
│ .ss <link>
│ .attp <text>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 GROUP ADMINISTRATION 〕━━┈⊷
│ .ban
│ .kick
│ .mute / .unmute
│ .promote / .demote
│ .del
│ .warn
│ .warnings
│ .clear
│ .tag
│ .tagall
│ .tagnotadmin
│ .hidetag
│ .antilink
│ .antibadword
│ .antitag
│ .chatbot
│ .welcome
│ .goodbye
│ .resetlink
│ .setgname <name>
│ .setgdesc <desc>
│ .setgpp
│ .accept all
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 OWNER CONTROL PANEL 〕━━┈⊷
│ .mode <public/self>
│ .update
│ .settings
│ .clearsession
│ .cleartmp
│ .antidelete
│ .anticall
│ .setpp <reply image>
│ .setmention <reply msg>
│ .mention
│ .autoread
│ .autoreact
│ .autotyping
│ .autostatus
│ .autostatus react
│ .pmblocker
│ .pmblocker setmsg
│ .savestatus
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 MEDIA & STICKERS 〕━━┈⊷
│ .sticker
│ .tgsticker
│ .simage <reply sticker>
│ .blur <reply image>
│ .crop
│ .removebg
│ .meme
│ .take
│ .emojimix
│ .igs <insta link>
│ .igsc <insta link>
│ .hd <reply image>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 IMAGE SEARCH (PIES) 〕━━┈⊷
│ .pies <country>
│ .japan
│ .korean
│ .indonesia
│ .china
│ .hijab
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 GAMES & ENTERTAINMENT 〕━━┈⊷
│ .tictactoe @user
│ .hangman
│ .guess <letter>
│ .trivia
│ .answer <answer>
│ .truth
│ .dare
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 AI INTELLIGENCE HUB 〕━━┈⊷
│ .gpt <question>
│ .gemini <question>
│ .imagine <prompt>
│ .flux <prompt>
│ .sora <prompt>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 SOURCE & REPOSITORY 〕━━┈⊷
│ .git
│ .github
│ .repo
│ .sc
│ .script
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 REACTIONS & EMOTES 〕━━┈⊷
│ .nom
│ .poke
│ .cry
│ .kiss
│ .pat
│ .hug
│ .wink
│ .facepalm
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 EFFECTS & GENERATORS 〕━━┈⊷
│ .heart
│ .horny
│ .lgbt
│ .circle
│ .lolice
│ .its-so-stupid
│ .namecard
│ .oogway
│ .tweet
│ .ytcomment
│ .comrade
│ .gay
│ .glass
│ .jail
│ .passed
│ .triggered
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 FUN & SOCIAL 〕━━┈⊷
│ .compliment @user
│ .insult @user
│ .flirt
│ .shayari
│ .goodnight
│ .roseday
│ .character @user
│ .wasted @user
│ .ship @user
│ .simp @user
│ .stupid @user <text>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 TEXT DESIGNER 〕━━┈⊷
│ .metalic
│ .ice
│ .snow
│ .impressive
│ .matrix
│ .light
│ .neon
│ .devil
│ .purple
│ .thunder
│ .hacker
│ .sand
│ .leaves
│ .1917
│ .arena
│ .blackpink
│ .glitch
│ .fire
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 MEDIA DOWNLOADS 〕━━┈⊷
│ .song <name>
│ .play <name>
│ .spotify <name>
│ .video <name>
│ .instagram <link>
│ .facebook <link>
│ .tiktok <link>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 SYSTEM UPDATES 〕━━┈⊷
│ Join Official Channel 👇👇
╰━━━━━━━━━━━━━━━━━┈⊷
`;

    // 4️⃣ Send the menu as a forwarded message from your channel
    await sock.sendMessage(chatId, { 
        text: helpMessage,
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363422591784062@newsletter', // your channel JID
                newsletterName: 'TUNZY-MD'            // display name
            }
        }
    });
}

module.exports = helpCommandEdited;