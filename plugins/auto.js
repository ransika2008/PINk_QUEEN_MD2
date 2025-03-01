const fs = require('fs');
const path = require('path');
const { readEnv } = require('../lib/database');
const { cmd } = require('../command');

// Function to safely read JSON files
const readJSON = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️ Warning: ${filePath} not found!`);
            return {}; // Return empty object if file doesn't exist
        }
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`❌ Error reading JSON file: ${filePath}`, error);
        return {}; // Return empty object on error
    }
};

// Load JSON files once to optimize performance
const autoVoiceData = readJSON(path.join(__dirname, '../my_data/autovoice.json'));
const autoStickerData = readJSON(path.join(__dirname, '../my_data/autosticker.json'));
const autoReplyData = readJSON(path.join(__dirname, '../my_data/autoreply.json'));

// Universal command to handle all "body" events
cmd({
    on: "body"
}, async (robin, mek, m, { from, body }) => {
    try {
        const config = await readEnv();
        const lowerBody = body.toLowerCase();

        // Auto Voice
        if (config.AUTO_VOICE === 'true' && autoVoiceData[lowerBody]) {
            await robin.sendPresenceUpdate('recording', from);
            await robin.sendMessage(from, {
                audio: { url: autoVoiceData[lowerBody] },
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: mek });
        }

        // Auto Sticker
        if (config.AUTO_STICKER === 'true' && autoStickerData[lowerBody]) {
            await robin.sendMessage(from, {
                sticker: { url: autoStickerData[lowerBody] },
                package: 'S_I_H_I_L_E_L'
            }, { quoted: mek });
        }

        // Auto Reply
        if (config.AUTO_REPLY === 'true' && autoReplyData[lowerBody]) {
            await m.reply(autoReplyData[lowerBody]);
        }

    } catch (error) {
        console.error("❌ Error in auto-response command:", error);
    }
});
