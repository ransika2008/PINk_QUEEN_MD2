const { cmd } = require('../command');
const axios = require("axios");
const config = require('../config');

const GEMINI_API_KEY = config.GEMINI_API_KEY;  // Ensure this is correctly set in config.js
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

cmd({
  pattern: "gemini",
  alias: ["ai", "chatgpt"],
  react: '🤖',
  desc: "Ask anything to Google Gemini AI.",
  category: "ai",
  use: ".gemini <Your Question>",
  filename: __filename
}, async (conn, mek, msg, { args, pushname, reply }) => {
  try {
    const text = args.join(" ");
    if (!text) {
      return reply(`❗️ Please provide a question.`);
    }

    const prompt = `My name is ${pushname}, and you are Robin AI, a WhatsApp AI bot created by Isara Sihilel (ඉසර සිහිලැල්). Reply in the language the user speaks. Respond in a natural, human-like way with meaningful emojis. My question is: ${text}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }]
    };

    const response = await axios.post(GEMINI_API_URL, payload,
