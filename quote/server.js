const express = require("express");
const path = require("path");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Express app
const app = express();
app.use(express.static(path.join(__dirname, "public")));

// ✅ Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Themes for variety
const themes = [
  "overcoming fear of failure",
  "friendship and kindness",
  "courage in dark times",
  "discovering hidden talent",
  "the power of persistence",
  "self-love and confidence",
  "a journey of resilience",
  "turning dreams into reality",
  "hope after loss",
  "small steps leading to success"
];

// ✅ API route
app.get("/api/motivation", async (req, res) => {
  try {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    const randomizer = Math.floor(Math.random() * 100000);

    const prompt = `
    Generate something fresh and unique every time:
    1. A motivational quote (1 sentence).
    2. A motivational story of at least 150 words, based on the theme: "${randomTheme}".
    Do not reuse the same characters, names, or storylines from previous answers (avoid Elara!).
    Use different characters, different settings each time.
    Respond ONLY in JSON format:
    {
      "quote": "...",
      "story": "..."
    }
    Random seed: ${randomizer}
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.95, // high randomness
        topP: 0.9,
        topK: 50,
        maxOutputTokens: 800
      }
    });

    let text = result.response.text();

    // ✅ Clean up possible markdown fences
    let cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let data;
    try {
      data = JSON.parse(cleanText);
    } catch (err) {
      console.error("Parsing failed, raw response:", text);
      return res.json({
        quote: "Every new day holds a new chance for greatness.",
        story:
          "Life teaches us resilience through diversity of trials. With each struggle, we find strength. With each failure, we learn. The key is to keep moving, because the story of your life is written in the courage to continue."
      });
    }

    res.json(data);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).send("Error fetching motivation");
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
