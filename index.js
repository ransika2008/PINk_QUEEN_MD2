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
const express = require("express");
const { File } = require("megajs");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const ownerNumber = config.OWNER_NUM || process.env.OWNER_NUM;
const app = express();
const port = process.env.PORT || 8000;

// =================== SESSION-AUTH ============================
async function downloadSession() {
  const sessionFile = __dirname + "/auth_info_baileys/creds.json";

  if (!fs.existsSync(sessionFile)) {
    if (!config.SESSION_ID) {
      console.log("Please add your session to SESSION_ID env !!");
      return;
    }

    try {
      console.log("Downloading session file...");
      const filer = File
