const { ttdl } = require("ruhend-scraper");
const axios = require('axios');

// Store processed message IDs to prevent duplicates
const processedMessages = new Set();

async function tiktokCommand(sock, chatId, message) {
    let reactionSent = false;
    
    try {
        // Check if message has already been processed
        if (processedMessages.has(message.key.id)) {
            return;
        }
        
        // Add message ID to processed set
        processedMessages.add(message.key.id);
        
        // Clean up old message IDs after 5 minutes
        setTimeout(() => {
            processedMessages.delete(message.key.id);
        }, 5 * 60 * 1000);

        const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        
        if (!text) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a TikTok link for the video."
            });
        }

        // Extract URL from command
        const url = text.split(' ').slice(1).join(' ').trim();
        
        if (!url) {
            return await sock.sendMessage(chatId, { 
                text: "Please provide a TikTok link for the video."
            });
        }

        // Improved TikTok URL patterns
        const tiktokPatterns = [
            /https?:\/\/(?:www\.|vm\.|vt\.)?tiktok\.com\/(?:@[\w.-]+\/video\/\d+|t\/[\w-]+|\/video\/\d+)/,
            /https?:\/\/vt\.tiktok\.com\/[\w-]+\//,
            /https?:\/\/vm\.tiktok\.com\/[\w-]+\//,
            /tiktok\.com\/@[\w.-]+\/video\/\d+/,
            /https?:\/\/(?:www\.)?tiktok\.com\/share\/video\/\d+\/\?/
        ];

        const isValidUrl = tiktokPatterns.some(pattern => pattern.test(url));
        
        if (!isValidUrl) {
            return await sock.sendMessage(chatId, { 
                text: "That is not a valid TikTok link. Please provide a valid TikTok video link."
            });
        }

        // Send initial reaction
        try {
            await sock.sendMessage(chatId, {
                react: { text: '⏳', key: message.key }
            });
            reactionSent = true;
        } catch (reactError) {
            console.error("Failed to send reaction:", reactError.message);
        }

        let videoUrl = null;
        let description = null;
        let success = false;

        // Try Snaptik API first (most reliable)
        console.log("Trying Snaptik API...");
        try {
            // Get download page from Snaptik
            const snaptikResponse = await axios.get(`https://snaptik.app/abc?url=${encodeURIComponent(url)}`, {
                timeout: 15000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                }
            });
            
            const htmlContent = snaptikResponse.data;
            
            // Extract video URL from Snaptik page using regex
            const videoRegex = /<a[^>]*href="([^"]*)"[^>]*class="[^"]*download-file[^"]*"[^>]*>.*?<span[^>]*>Without Watermark<\/span>/s;
            const videoMatch = htmlContent.match(videoRegex);
            
            if (videoMatch && videoMatch[1]) {
                videoUrl = videoMatch[1];
                console.log("Found video URL from Snaptik:", videoUrl);
                
                // Extract description/title
                const titleRegex = /<h2[^>]*>([^<]+)<\/h2>/;
                const titleMatch = htmlContent.match(titleRegex);
                description = titleMatch ? titleMatch[1].trim() : "";
                
                success = true;
            }
        } catch (snaptikError) {
            console.log("Snaptik API failed:", snaptikError.message);
        }

        // If Snaptik failed, try other APIs
        if (!success) {
            // Try multiple TikTok download APIs with fallbacks
            const apiEndpoints = [
                // Primary: Siputzx API
                async () => {
                    try {
                        const apiUrl = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`;
                        const response = await axios.get(apiUrl, { 
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                        
                        console.log("Siputzx API Response:", JSON.stringify(response.data, null, 2));
                        
                        if (response.data && response.data.status && response.data.data) {
                            if (response.data.data.urls && Array.isArray(response.data.data.urls) && response.data.data.urls.length > 0) {
                                videoUrl = response.data.data.urls[0];
                            } else if (response.data.data.video_url) {
                                videoUrl = response.data.data.video_url;
                            } else if (response.data.data.url) {
                                videoUrl = response.data.data.url;
                            } else if (response.data.data.download_url) {
                                videoUrl = response.data.data.download_url;
                            }
                            
                            if (videoUrl) {
                                description = response.data.data.metadata?.desc || 
                                            response.data.data.description ||
                                            response.data.data.title || 
                                            response.data.data.metadata?.title || 
                                            "";
                                return true;
                            }
                        }
                    } catch (error) {
                        console.log("Siputzx API failed:", error.message);
                    }
                    return false;
                },

                // Fallback: TikWM API
                async () => {
                    try {
                        const apiUrl = `https://api.tikwm.com/api?url=${encodeURIComponent(url)}`;
                        const response = await axios.get(apiUrl, {
                            timeout: 10000,
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                        
                        console.log("TikWM API Response:", JSON.stringify(response.data, null, 2));
                        
                        if (response.data && response.data.code === 0 && response.data.data) {
                            if (response.data.data.play) {
                                videoUrl = response.data.data.play;
                            } else if (response.data.data.hdplay) {
                                videoUrl = response.data.data.hdplay;
                            }
                            
                            if (videoUrl) {
                                description = response.data.data.title || "";
                                return true;
                            }
                        }
                    } catch (error) {
                        console.log("TikWM API failed:", error.message);
                    }
                    return false;
                },

                // Fallback: Original ttdl method
                async () => {
                    try {
                        const downloadData = await ttdl(url);
                        console.log("ttdl response:", JSON.stringify(downloadData, null, 2));
                        
                        if (downloadData && downloadData.data && downloadData.data.length > 0) {
                            const videoData = downloadData.data.find(item => 
                                item.type === 'video' || 
                                /\.(mp4|mov|avi|mkv|webm)$/i.test(item.url)
                            );
                            
                            if (videoData && videoData.url) {
                                videoUrl = videoData.url;
                                description = downloadData.metadata?.desc || 
                                           downloadData.title || 
                                           videoData.title || 
                                           "";
                                return true;
                            }
                        }
                    } catch (error) {
                        console.log("ttdl failed:", error.message);
                    }
                    return false;
                }
            ];

            // Try each API endpoint until one succeeds
            for (let i = 0; i < apiEndpoints.length; i++) {
                console.log(`Trying API endpoint ${i + 1}...`);
                success = await apiEndpoints[i]();
                if (success && videoUrl) {
                    console.log(`Success with endpoint ${i + 1}:`, videoUrl);
                    break;
                }
            }
        }

        if (!success || !videoUrl) {
            // Update reaction to failure
            if (reactionSent) {
                try {
                    await sock.sendMessage(chatId, {
                        react: { text: '❌', key: message.key }
                    });
                } catch (error) {
                    console.error("Failed to send error reaction:", error.message);
                }
            }
            
            return await sock.sendMessage(chatId, { 
                text: "❌ Failed to download TikTok video. All download methods failed. Please try again with a different link or check if the video is available."
            }, { quoted: message });
        }

        // Update reaction to success
        if (reactionSent) {
            try {
                await sock.sendMessage(chatId, {
                    react: { text: '✅', key: message.key }
                });
            } catch (error) {
                console.error("Failed to send success reaction:", error.message);
            }
        }

        // Send the video
        try {
            // Create caption with description and hashtags
            let caption = "🎵 *TikTok Video*\n\n";
            if (description && description.trim() !== "") {
                caption += description + "\n\n";
            }
            caption += "⬇️ Downloaded by Tunzy-MD\n";
            caption += "🔗 Source: TikTok";
            
            console.log("Attempting to send video with URL:", videoUrl);
            console.log("Caption:", caption);
            
            // Try sending video via direct URL (most efficient)
            try {
                await sock.sendMessage(chatId, {
                    video: { url: videoUrl },
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });
                
                console.log("Video sent successfully via URL");
                return;
            } catch (urlError) {
                console.log("URL method failed:", urlError.message);
                
                // Download video as buffer and send
                console.log("Downloading video as buffer...");
                const videoResponse = await axios.get(videoUrl, {
                    responseType: 'arraybuffer',
                    timeout: 60000, // 60 second timeout
                    maxContentLength: 50 * 1024 * 1024, // 50MB limit
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.9',
                        'Referer': 'https://snaptik.app/',
                        'Sec-Fetch-Dest': 'video',
                        'Sec-Fetch-Mode': 'no-cors',
                        'Sec-Fetch-Site': 'cross-site'
                    }
                });
                
                const videoBuffer = Buffer.from(videoResponse.data);
                
                if (videoBuffer.length === 0) {
                    throw new Error("Video buffer is empty");
                }
                
                console.log(`Video buffer size: ${(videoBuffer.length / 1024 / 1024).toFixed(2)} MB`);
                
                // Send with buffer
                await sock.sendMessage(chatId, {
                    video: videoBuffer,
                    mimetype: "video/mp4",
                    caption: caption
                }, { quoted: message });
                
                console.log("Video sent successfully via buffer");
            }
            
        } catch (sendError) {
            console.error("Failed to send video:", sendError.message);
            
            // Check for specific errors
            if (sendError.message.includes("timeout") || sendError.message.includes("TIMEDOUT")) {
                await sock.sendMessage(chatId, { 
                    text: "❌ Video download timed out. The video might be too large. Please try a shorter video."
                }, { quoted: message });
            } else if (sendError.message.includes("413") || sendError.message.includes("too large")) {
                await sock.sendMessage(chatId, { 
                    text: "❌ Video is too large to send. Please try a shorter TikTok video."
                }, { quoted: message });
            } else {
                await sock.sendMessage(chatId, { 
                    text: "❌ Failed to send video. Please try again with a different link."
                }, { quoted: message });
            }
        }

    } catch (error) {
        console.error('Error in TikTok command:', error);
        
        // Update reaction to error if reaction was sent
        if (reactionSent) {
            try {
                await sock.sendMessage(chatId, {
                    react: { text: '❌', key: message.key }
                });
            } catch (reactError) {
                console.error("Failed to send error reaction:", reactError.message);
            }
        }
        
        await sock.sendMessage(chatId, { 
            text: "An error occurred while processing the request. Please try again later."
        }, { quoted: message });
    }
}

module.exports = tiktokCommand;