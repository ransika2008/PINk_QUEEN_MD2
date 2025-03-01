const { readEnv } = require('../lib/database');
const { cmd } = require('../command');

cmd({
    pattern: "alive",
    react: "🤖",
    desc: "Check if the bot is online.",
    category: "main",
    filename: __filename
}, async (robin, mek, m, { from, quoted, reply }) => {
    try {
        // Send sticker
        await robin.sendMessage(from, {
            sticker: { url: 'https://github.com/ransika2008/Img-2/raw/refs/heads/main/File%20from%20%F0%9D%93%A8.%F0%9D%93%9C%20%F0%9D%93%92%F0%9D%93%97%F0%9D%93%9C%F0%9D%93%98%F0%9D%93%9D%F0%9D%93%93%F0%9D%93%A4' },
            package: 'S_I_H_I_L_E_L'
        }, { quoted: mek });

        // Update presence
        await robin.sendPresenceUpdate('recording', from);

        // Send voice note
        await robin.sendMessage(from, {
            audio: { url: 'https://github.com/ransika2008/Img-2/raw/refs/heads/main/Adio/Top%205%20Trending%20Songs%202025%20%23shorts%20%23trending%20%23song%20%23viralvideo.mp3' },
            mimetype: 'audio/mpeg',
            ptt: true
        }, { quoted: mek });

        // Get environment config
        const config = await readEnv();

        // Validate ALIVE_IMG and ALIVE_MSG
        if (!config.ALIVE_IMG || !config.ALIVE_MSG) {
            return reply("⚠️ ALIVE_IMG or ALIVE_MSG is not set in the environment variables.");
        }

        // Send image with caption
        await robin.sendMessage(from, {
            image: { url: config.ALIVE_IMG },
            caption: config.ALIVE_MSG
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in 'alive' command:", e);
        reply(`❌ Error: ${e.message}`);
    }
});
