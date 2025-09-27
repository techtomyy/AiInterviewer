const express = require('express');
const multer = require('multer');
const PythonShell = require('python-shell');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const router = express.Router();
const upload = multer({ dest: 'temp_uploads/' });

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, '..', 'temp_uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// POST /api/interview/analyze
router.post('/analyze', upload.single('video'), async (req, res) => {
  let tempVideoPath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI service is not configured. Please set OPENAI_API_KEY environment variable.' });
    }

    tempVideoPath = req.file.path;

    // Run speech analysis (transcription and metrics)
    const speechResult = await new Promise((resolve, reject) => {
      PythonShell.run(path.join(__dirname, '..', 'Processing', 'transcribe_wav2vec2_modified.py'), 
        { args: [tempVideoPath] }, 
        (err, results) => {
          if (err) reject(err);
          else {
            try {
              const output = JSON.parse(results.join(''));
              resolve(output);
            } catch (parseErr) {
              reject(new Error('Failed to parse speech analysis output'));
            }
          }
        }
      );
    });

    if (speechResult.error) {
      throw new Error(speechResult.error);
    }

    // Run body language analysis
    const bodyResult = await new Promise((resolve, reject) => {
      PythonShell.run(path.join(__dirname, '..', 'Processing', 'bodylang_mediapipe.py'), 
        { args: [tempVideoPath] }, 
        (err, results) => {
          if (err) reject(err);
          else {
            try {
              const output = JSON.parse(results.join(''));
              resolve(output);
            } catch (parseErr) {
              reject(new Error('Failed to parse body language analysis output'));
            }
          }
        }
      );
    });

    if (bodyResult.error) {
      throw new Error(bodyResult.error);
    }

    // Combine results
    const combinedAnalysis = {
      transcription: speechResult.transcription,
      overall_confidence: Math.round(
        (speechResult.speech_metrics.speech_clarity_score + 
         (bodyResult.eye_contact_pct + bodyResult.posture_score) / 2) / 3
      ),
      speech_metrics: speechResult.speech_metrics,
      body_language: {
        eye_contact_pct: bodyResult.eye_contact_pct,
        posture_score: bodyResult.posture_score,
        notes: "Analysis based on MediaPipe pose and face detection. Improve by maintaining eye contact and upright posture."
      }
    };

    // Generate recommendations using OpenAI
    const prompt = `
Based on this interview response analysis, generate 4-6 actionable recommendations for improvement. Focus on speech clarity, filler words, speaking rate, eye contact, and posture. Make them specific and encouraging.

Analysis:
- Transcription: ${combinedAnalysis.transcription.substring(0, 200)}...
- Speech Clarity: ${combinedAnalysis.speech_metrics.speech_clarity_score}/100
- Speaking Rate: ${combinedAnalysis.speech_metrics.speaking_rate_wpm} WPM
- Filler Words: ${combinedAnalysis.speech_metrics.filler_words_count}
- Eye Contact: ${combinedAnalysis.body_language.eye_contact_pct}%
- Posture Score: ${combinedAnalysis.body_language.posture_score}/100
- Overall Confidence: ${combinedAnalysis.overall_confidence}/100

Provide recommendations as a numbered list.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 400,
    });

    const recommendationsText = completion.choices[0].message.content;
    // Simple parsing to extract list items
    const recommendations = recommendationsText
      .split('\n')
      .filter(line => line.trim() && line.trim().match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim());

    const finalResult = {
      ...combinedAnalysis,
      recommendations: recommendations.length > 0 ? recommendations : [
        "Practice speaking clearly and at a moderate pace",
        "Reduce filler words by pausing instead",
        "Maintain eye contact with the camera",
        "Sit up straight to improve posture",
        "Structure your answers with clear examples"
      ]
    };

    res.json({
      success: true,
      ...finalResult,
      message: 'Analysis completed successfully'
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // Clean up temp file
    if (tempVideoPath && fs.existsSync(tempVideoPath)) {
      fs.unlinkSync(tempVideoPath);
    }
  }
});

module.exports = router;
