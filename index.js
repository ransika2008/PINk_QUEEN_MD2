const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const config = require("./config");
const qrcode = require("qrcode-terminal");
const axios = require("axios");
const { File } = require("megajs");
const express = require("express");

// Bot Configuration
const ownerNumber = config.OWNER_NUM;
const app = express();
const port = process.env.PORT || 8000;

// =================== MongoDB Connection ====================
async function connectDB() {
  try {
    const mongoose = require("mongoose");
    await mongoose.connect(config.MONGODB, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("🛜 MongoDB Connected ✅");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
}

// =================== Session Auth Handling ====================
async function downloadSession() {
  const sessionPath = __dirname + "/auth_info_baileys/creds.json";

  if (!fs.existsSync(sessionPath)) {
    if (!config.SESSION_ID) {
      console.log("⚠️ Please add your SESSION_ID to environment variables!");
      return;
    }

    try {
      console.log("⏳ Downloading session...");
      const sessdata = config.SESSION_ID;
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
      const data = await filer.downloadBuffer();
      fs.writeFileSync(sessionPath, data);
      console.log("✅ Session downloaded successfully!");
    } catch (error) {
      console.error("❌ Session download failed:", error);
    }
  }
}

// =================== WhatsApp Connection ====================
async function connectToWA() {
  try {
    await connectDB(); // Connect to MongoDB
    console.log("🔄 Connecting to WhatsApp...");

    const { state, saveCreds } = await useMultiFileAuthState(__dirname + "/auth_info_baileys/");
    const { version } = await fetchLatestBaileysVersion();

    const bot = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      auth: state,
      version,
    });

    bot.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log("🔄 Reconnecting...");
          connectToWA();
        } else {
          console.log("❌ Logged out. Please scan QR again.");
        }
      } else if (connection === "open") {
        console
