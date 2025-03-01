const { cmd, commands } = require("../command");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("../lib/msg.js"); // Adjust the path as needed

cmd(
  {
    pattern: "sticker",
    alias: ["s", "stick"],
    react: "⌛",
    desc: "Convert an image or video to a sticker",
    category: "utility",
    filename: __filename,
  },
  async (
    robin,
    mek,
    m,
    {
      from,
      quoted,
      body,
      isCmd,
      command,
      args,
      q,
      isGroup,
      sender,
      senderNumber,
      botNumber2,
      botNumber,
      pushname,
      isMe,
      isOwner,
      groupMetadata,
      groupName,
      participants,
      groupAdmins,
      isBotAdmins,
      isAdmins,
      reply,
    }
  ) => {
    try {
      // Check if the message is a quoted image or video
      if (!quoted || !(quoted.imageMessage || quoted.videoMessage)) {
        return reply("❌ Please reply to an image or video to convert it to a sticker.");
      }

      // Download the media from the quoted message
      const media = await downloadMediaMessage(quoted, "stickerInput");
      if (!media) {
        return reply("❌ Failed to download the media. Try again!");
      }

      // Create a new sticker with the downloaded media
      const sticker = new Sticker(media, {
        pack: "PINk_QUEEN_MD", // Sticker pack name
        author: "CHAMINDU", // Sticker author name
        type: StickerTypes.FULL, // Sticker type (FULL or CROPPED)
        quality: 50, // Quality of the sticker (0-100)
      });

      // Convert the sticker to buffer and send it
      const buffer = await sticker.toBuffer();
      await robin.sendMessage(from, { sticker: buffer }, { quoted: mek });
    } catch (e) {
      console.error("Error creating sticker:", e);
      reply(`❌ Error: ${e.message || e}`);
    }
  }
);
