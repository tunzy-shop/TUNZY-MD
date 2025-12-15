const fs = require('fs');
const path = require('path');

async function autojoinCommand(sock, chatId, message, args) {
    try {
        const configPath = './data/autojoin.json';
        
        // Create config if not exists
        if (!fs.existsSync(configPath)) {
            const defaultConfig = {
                enabled: true,
                channel: "120363422591784062@newsletter",
                welcomeMessage: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *🤖 WELCOME TO TUNZY-MD*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n✅ Auto-joined to community!"
            };
            fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
        }
        
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        
        if (!args) {
            // Show current status
            return await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *🤖 AUTO-JOIN SETTINGS*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Status:* ${config.enabled ? '✅ Enabled' : '❌ Disabled'}\n*Channel:* ${config.channel || 'Not set'}\n\n*Usage:*\n.autojoin enable/disable\n.autojoin status`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        
        const action = args.toLowerCase();
        
        if (action === 'enable') {
            config.enabled = true;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *✅ AUTO-JOIN ENABLED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nAuto-join feature is now enabled!",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
        } else if (action === 'disable') {
            config.enabled = false;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
            await sock.sendMessage(chatId, {
                text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ AUTO-JOIN DISABLED*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nAuto-join feature is now disabled!",
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
            
        } else if (action === 'status') {
            await sock.sendMessage(chatId, {
                text: `╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *📊 AUTO-JOIN STATUS*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\n*Enabled:* ${config.enabled ? '✅ Yes' : '❌ No'}\n*Channel:* ${config.channel}\n\nNext restart will ${config.enabled ? 'enable' : 'disable'} auto-join.`,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363422591784062@newsletter',
                        newsletterName: 'TUNZY-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Autojoin command error:', error);
        await sock.sendMessage(chatId, {
            text: "╭━━━━━━━━━━━━━━━━━━┈⊷\n┃✮│➣ *❌ ERROR*\n╰━━━━━━━━━━━━━━━━━━┈⊷\n\nFailed to process autojoin command.",
            contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363422591784062@newsletter',
                    newsletterName: 'TUNZY-MD',
                    serverMessageId: -1
                }
            }
        }, { quoted: message });
    }
}

module.exports = autojoinCommand;