const { cmd } = require('../command');

// Block a user instantly
cmd({
    pattern: "block",
    react: "⚠️",
    alias: ["ban"],
    desc: "Block a user instantly.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { quoted, reply, isOwner }) => {
    try {
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");
        if (!quoted) return reply("⚠️ Please reply to the user's message to block them!");
        
        const target = quoted.sender;
        await robin.updateBlockStatus(target, "block");
        return reply(`✅ Successfully blocked: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Block Error:", e);
        return reply(`❌ Failed to block the user. Error: ${e.message}`);
    }
});

// Kick a mentioned user from the group
cmd({
    pattern: "kick",
    alias: ["remove", "ban"],
    react: "⚠️",
    desc: "Remove a mentioned user from the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");
        
        if (!quoted) return reply("⚠️ Please reply to the user's message you want to kick!");
        const target = quoted.sender;

        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(participant => participant.admin).map(admin => admin.id);
        
        if (groupAdmins.includes(target)) {
            return reply("⚠️ I cannot remove another admin from the group!");
        }

        await robin.groupParticipantsUpdate(from, [target], "remove");
        return reply(`✅ Successfully removed: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Kick Error:", e);
        reply(`❌ Failed to remove the user. Error: ${e.message}`);
    }
});

// Mute the group (admin-only messages)
cmd({
    pattern: "mute",
    alias: ["silence", "lock"],
    react: "⚠️",
    desc: "Set group chat to admin-only messages.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "announcement");
        return reply("✅ Group has been muted. Only admins can send messages now.");
    } catch (e) {
        console.error("Mute Error:", e);
        reply(`❌ Failed to mute the group. Error: ${e.message}`);
    }
});

// Unmute the group (everyone can send messages)
cmd({
    pattern: "unmute",
    alias: ["unlock"],
    react: "⚠️",
    desc: "Allow everyone to send messages in the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        await robin.groupSettingUpdate(from, "not_announcement");
        return reply("✅ Group has been unmuted. Everyone can send messages now.");
    } catch (e) {
        console.error("Unmute Error:", e);
        reply(`❌ Failed to unmute the group. Error: ${e.message}`);
    }
});

// Add a user to the group
cmd({
    pattern: "add",
    alias: ["invite"],
    react: "➕",
    desc: "Add a user to the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, args }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        if (!args[0]) return reply("⚠️ Please provide the phone number of the user to add!");
        const target = args[0].includes("@") ? args[0] : `${args[0]}@s.whatsapp.net`;

        await robin.groupParticipantsUpdate(from, [target], "add");
        return reply(`✅ Successfully added: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Add Error:", e);
        reply(`❌ Failed to add the user. Error: ${e.message}`);
    }
});

// Promote a mentioned user (grant admin privileges)
cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    react: "⚡",
    desc: "Grant admin privileges to a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        if (!quoted) return reply("⚠️ Please reply to the user's message you want to promote to admin!");
        const target = quoted.sender;

        await robin.groupParticipantsUpdate(from, [target], "promote");
        return reply(`✅ Successfully promoted to admin: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Promote Error:", e);
        reply(`❌ Failed to promote the user. Error: ${e.message}`);
    }
});

// Demote a mentioned user (remove admin privileges)
cmd({
    pattern: "demote",
    alias: ["member"],
    react: "⚠️",
    desc: "Remove admin privileges from a mentioned user.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply, quoted }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        if (!quoted) return reply("⚠️ Please reply to the user's message you want to remove admin privileges from!");
        const target = quoted.sender;

        const groupMetadata = await robin.groupMetadata(from);
        const groupAdmins = groupMetadata.participants.filter(participant => participant.admin).map(admin => admin.id);
        
        if (!groupAdmins.includes(target)) {
            return reply("⚠️ The mentioned user is not an admin!");
        }

        await robin.groupParticipantsUpdate(from, [target], "demote");
        return reply(`✅ Successfully removed admin privileges from: @${target.split('@')[0]}`);
    } catch (e) {
        console.error("Demote Error:", e);
        reply(`❌ Failed to demote the user. Error: ${e.message}`);
    }
});

// Leave the current group
cmd({
    pattern: "left",
    alias: ["leave", "exit"],
    react: "⚠️",
    desc: "Leave the current group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isOwner, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isOwner) return reply("⚠️ Only the owner can use this command!");

        await robin.groupLeave(from);
        return reply(`✅ Successfully left the group.`);
    } catch (e) {
        console.error("Leave Error:", e);
        reply(`❌ Failed to leave the group. Error: ${e.message}`);
    }
});

// Kick all members from the group
cmd({
    pattern: "kickall",
    react: "⚠️",
    alias: ["kickallmembers"],
    desc: "Remove all members from the group.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        if (!isBotAdmins) return reply("⚠️ I need to be an admin to execute this command!");

        const groupMetadata = await robin.groupMetadata(from);
        const members = groupMetadata.participants.map(participant => participant.id);
        await robin.groupParticipantsUpdate(from, members, "remove");

        return reply("✅ Successfully kicked all members from the group.");
    } catch (e) {
        console.error("Kick All Error:", e);
        reply(`❌ Failed to kick all members. Error: ${e.message}`);
    }
});

// Save all group members to a JSON file
cmd({
    pattern: "gsave",
    react: "📂",
    desc: "Save all group members' details (name and phone number) to a JSON file.",
    category: "main",
    filename: __filename
},
async (robin, mek, m, { from, isGroup, isAdmins, isBotAdmins, reply }) => {
    try {
        if (!isGroup) return reply("⚠️ This command can only be used in a group!");
        if (!isAdmins) return reply("⚠️ Only group admins can use this command!");
        
        const groupMetadata = await robin.groupMetadata(from);
        const members = groupMetadata.participants;

        const memberData = members.map(member => ({
            name: member.pushname,
            phone: member.id.split('@')[0]
        }));

        const fs = require('fs');
        const filePath = './group_members.json';
        fs.writeFileSync(filePath, JSON.stringify(memberData, null, 2));

        return reply("✅ Group members have been saved to `group_members.json`.");
    } catch (e) {
        console.error("Save Group Members Error:", e);
        reply(`❌ Failed to save group members. Error: ${e.message}`);
    }
});
