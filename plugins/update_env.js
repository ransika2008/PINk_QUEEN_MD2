const { updateEnv, readEnv } = require('../lib/database');
const EnvVar = require('../lib/mongodbenv');
const { cmd } = require('../command');

cmd({
    pattern: "update",
    alias: ["updateenv"],
    desc: "Check and update environment variables",
    category: "owner",
    filename: __filename,
},
async (robin, mek, m, { from, q, reply, isOwner }) => {
    // Check if the user is the owner
    if (!isOwner) return reply("🚫 *You are not authorized to perform this action.*");

    // If no query is provided, prompt for the correct format
    if (!q) {
        return reply("🙇‍♂️ *Please provide the environment variable and its new value.* \n\nExample: `.update ALIVE_MSG: hello i am Isara Sihilel`");
    }

    // Find the position of the first colon or comma
    const colonIndex = q.indexOf(':');
    const commaIndex = q.indexOf(',');

    // Ensure we have a valid delimiter index
    const delimiterIndex = colonIndex !== -1 ? colonIndex : commaIndex;
    if (delimiterIndex === -1) {
        return reply("🫠 *Invalid format. Please use the format:* `.update KEY:VALUE`");
    }

    // Extract key and value from the query string
    const key = q.substring(0, delimiterIndex).trim();
    const value = q.substring(delimiterIndex + 1).trim();

    // Extract mode if provided
    const parts = value.split(/\s+/).filter(part => part.trim());
    const newValue = value; // Use the full value as provided by the user
    const mode = parts.length > 1 ? parts.slice(1).join(' ').trim() : '';

    // Define valid modes
    const validModes = ['public', 'private', 'groups', 'inbox'];
    const finalMode = validModes.includes(mode) ? mode : '';

    // Ensure the format is correct
    if (!key || !newValue) {
        return reply("🫠 *Invalid format. Please use the format:* `.update KEY:VALUE`");
    }

    // Specific checks for certain environment variables
    if (key === 'MODE' && !validModes.includes(newValue)) {
        return reply(`😒 *Invalid mode. Valid modes are: ${validModes.join(', ')}*`);
    }

    if (key === 'ALIVE_IMG' && !newValue.startsWith('https://')) {
        return reply("😓 *Invalid URL format. PLEASE PROVIDE A VALID IMAGE URL*");
    }

    if (key === 'AUTO_READ_STATUS' && !['true', 'false'].includes(newValue)) {
        return reply("😓 *Invalid value for AUTO_READ_STATUS. Please use `true` or `false`.*");
    }

    try {
        // Check if the environment variable exists in the database
        const envVar = await EnvVar.findOne({ key: key });

        if (!envVar) {
            // If the variable does not exist, fetch and list all existing environment variables
            const allEnvVars = await EnvVar.find({});
            const envList = allEnvVars.map(env => `${env.key}: ${env.value}`).join('\n');
            return reply(`❌ *The environment variable ${key} does not exist.*\n\n*Here are the existing environment variables:*\n\n${envList}`);
        }

        // Update the environment variable
        await updateEnv(key, newValue, finalMode);
        reply(`✅ *Environment variable updated successfully.*\n\n🗃️ *${key}* ➠ ${newValue} ${finalMode ? `\n*Mode:* ${finalMode}` : ''}`);
        
    } catch (err) {
        console.error('Error updating environment variable:', err.message);
        reply("🙇‍♂️ *Failed to update the environment variable. Please try again later.*");
    }
});
