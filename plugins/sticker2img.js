const { cmd } = require("../command");
const { Sticker } = require("wa-sticker-formatter");
const { downloadMediaMessage } = require("../lib/msg.js"); // Adjust the path as needed

cmd(
  {
    pattern: "toimg",
    alias: ["img", "i"],
    react: "⚡",
    desc: "Convert a sticker to an image",
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
      reply,
    }
  ) => {
    try {
      // Ensure the message contains a sticker to convert
      if (!quoted || !quoted.stickerMessage) {
        return reply("⚠️ Please reply to a sticker to convert it to an image.");
      }

      // Download the sticker from the quoted message
      const stickerBuffer = await downloadMediaMessage(quoted, "stickerInput");
      if (!stickerBuffer) {
        return reply("⚠️ Failed to download the sticker. Try again!");
      }

      // Convert the sticker buffer to an image (using Sticker class)
      const sticker = new Sticker(stickerBuffer, {
        pack: "PINk_QUEEN_MD",
        author: "> CHAMINDU ~*PINk QUEEN MD*~",
      });

      // Get the image buffer
      const imageBuffer = await sticker.toBuffer({ format: "image/jpeg" });

      // Send the image as a response
      await robin.sendMessage(
        from,
        {
          image: imageBuffer,
          caption: "Here is your converted image!\n\n𝐌𝐚𝐝𝐞 𝐛𝐲 CHAMINDU",
        },
        { quoted: mek }
      );
    } catch (e) {
      console.error("Error:", e);
      reply(`⚠️ Error: ${e.message || e}`);
    }
  }
);
