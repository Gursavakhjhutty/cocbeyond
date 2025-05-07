//server/index.js

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import bodyParser from 'body-parser';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.use(bodyParser.json());

const users = {};
const USERS_DB = [];

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev_key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
  
    if (!token) return res.status(401).json({ error: 'Missing token' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
};

function extractJsonFromGeminiResponse(responseText) {
    const match = responseText.match(/```json\s*([\s\S]*?)```/);
    if (!match) {
      throw new Error("No JSON block found in Gemini response.");
    }
  
    try {
      const parsed = JSON.parse(match[1]);
  
      if (!Array.isArray(parsed)) {
        throw new Error("Expected an array");
      }
  
      return parsed.map(item => ({
        name: item.name,
        quantity: parseInt(item.quantity) || 1,
        weight: parseFloat(item.weight?.toString().replace(/[^\d.]/g, '')) || 0,
      }));
    } catch (e) {
      console.error("Failed to parse Gemini JSON block:", e);
      throw e;
    }
};

function extractSingleJsonObject(text) {
    const match = text.match(/```json\s*([\s\S]*?)```/);
    if (!match) return null;
  
    try {
      return JSON.parse(match[1]);
    } catch (e) {
      console.error("Failed to parse Gemini weapon JSON block:", e);
      return null;
    }
};

async function queryGemini(prompt) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });
  
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
};

app.post('/api/save-character', authenticateToken, (req, res) => {
    const userEmail = req.user.email;
    const character = req.body.character;
  
    if (!character) {
      return res.status(400).json({ error: 'Missing character data' });
    }
  
    const savePath = path.join('characters', `${userEmail}.json`);
    fs.writeFile(savePath, JSON.stringify(character, null, 2), (err) => {
      if (err) {
        console.error("Save error:", err);
        return res.status(500).json({ error: 'Failed to save character' });
      }
      res.json({ message: 'Character saved successfully' });
    });
});

app.get('/api/load-character', authenticateToken, (req, res) => {
    const userEmail = req.user.email;
    const filePath = path.join('characters', `${userEmail}.json`);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'No saved character found' });
    }
  
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error("Read error:", err);
        return res.status(500).json({ error: 'Failed to load character' });
      }
  
      try {
        const character = JSON.parse(data);
        res.json({ character });
      } catch (parseErr) {
        res.status(500).json({ error: 'Corrupt character file' });
      }
    });
});

app.post('/api/signup', (req, res) => {
    const { email, password } = req.body;
    if (USERS_DB[email]) return res.status(400).json({ error: 'User already exists' });
  
    USERS_DB[email] = { password }; // store user
    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    res.json({ token });
  });
  
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = USERS_DB[email];
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
  
    const token = jwt.sign({ email }, process.env.JWT_SECRET);
    res.json({ token });
});

app.post('/api/occupation-description', async (req, res) => {
  const { occupation } = req.body;
  if (!occupation) return res.status(400).json({ error: 'Missing occupation field' });

  const prompt = `Describe the following occupation as it pretains to the 1920's: ${occupation}. In 4 or less sentences.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      }),
    });

    const data = await response.json();
    const description = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Description unavailable.';
    res.json({ description });
  } catch (err) {
    console.error('Gemini API Error:', err);
    const data = await response.json();
    console.log('Gemini Raw Response:', JSON.stringify(data, null, 2));
    res.status(500).json({ description: 'Description unavailable.' });
  }
});
  
app.post('/api/generate-equipment', async (req, res) => {
    const { occupation } = req.body;
    if (!occupation) return res.status(400).json({ error: 'Missing occupation field' });
  
    const prompt = `
      Give a short JSON array of 3 to 5 equipment items appropriate for a Call of Cthulhu character with the occupation "${occupation}".
      Each item should include:
      - name (string)
      - quantity (number)
      - weight (number in pounds)
      Respond with raw JSON only, no markdown or explanation.
    `;
  
    try {
      const rawText = await queryGemini(prompt);
      const equipment = extractJsonFromGeminiResponse(rawText);
      res.json({ equipment });
    } catch (err) {
      console.error('Gemini Equipment Error:', err);
      res.status(500).json({ error: 'Failed to generate equipment.' });
    }
});

app.post('/api/generate-weapon', async (req, res) => {
    const { occupation } = req.body;
    if (!occupation) return res.status(400).json({ error: 'Missing occupation field' });
  
    const prompt = `
      Give a single JSON object representing a weapon appropriate for a Call of Cthulhu character with the occupation "${occupation}".
      Include:
      - name
      - damage (e.g. "2D6")
      - range (e.g. "100 yards")
      - usesPerRound (e.g. "1" or "Automatic")
      - bullets (number or null)
      - cost (e.g. "$20")
      - malfunction (e.g. "98+")
      Return only raw JSON with no explanation.
    `;
  
    try {
      const rawText = await queryGemini(prompt);
      const weapon = extractSingleJsonObject(rawText);
      res.json({ weapon });
    } catch (err) {
      console.error('Gemini Weapon Error:', err);
      res.status(500).json({ error: 'Failed to generate weapon.' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});