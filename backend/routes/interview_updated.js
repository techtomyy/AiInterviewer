const express = require('express');
const multer = require('multer');
const OpenAI = require('openai');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const PythonShell = require('python-shell');
const axios = require('axios');
const { supabase } = require('../config/supabase');
require('dotenv').config();

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OpenAI with OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Function to parse resume content
async function parseResume(buffer, filename) {
  const ext = path.extname(filename).toLowerCase();

  try {
    if (ext === '.pdf') {
      const data = await pdf(buffer);
      return data.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (ext === '.txt' || ext === '.doc') {
      return buffer.toString('utf8');
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
    }
  } catch (error) {
    throw new Error(`Failed to parse resume: ${error.message}`);
  }
}

// Extract keywords from resume content
function extractKeywords(text) {
  const keywords = [];

  // Programming languages
  const programmingLanguages = ['javascript', 'js', 'html', 'css', 'python', 'java', 'typescript', 'ts', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'perl', 'bash', 'shell'];

  // Frameworks and libraries
  const frameworks = ['react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less'];

  // Databases
  const databases = ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite', 'firebase'];

  // Cloud and DevOps
  const cloudDevops = ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions', 'terraform', 'linux', 'ubuntu'];

  // Other skills
  const otherSkills = ['api', 'rest', 'graphql', 'git', 'agile', 'scrum', 'testing', 'unit testing', 'ci/cd', 'machine learning', 'ai', 'data science'];

  const allTechTerms = [...programmingLanguages, ...frameworks, ...databases, ...cloudDevops, ...otherSkills];

  // Find matches
  allTechTerms.forEach(term => {
    if (text.toLowerCase().includes(term)) {
      keywords.push(term.charAt(0).toUpperCase() + term.slice(1));
    }
  });

  return [...new Set(keywords)]; // Remove duplicates
}

// Generate interview questions using OpenAI
async function generateQuestions(jobRole, jobDescription, resumeContent) {
  // Check if API key is configured
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('AI service is not configured. Please set OPENAI_API_KEY environment variable.');
  }

  const extractedKeywords = extractKeywords(`${jobRole} ${jobDescription} ${resumeContent}`);

  // Determine if we have job-specific info or just resume
  const hasJobInfo = (jobRole && jobRole.trim()) || (jobDescription && jobDescription.trim());
  const hasResume = resumeContent && resumeContent.trim();

  let prompt;
  if (hasResume && !hasJobInfo) {
    // Resume-only: Focus entirely on resume keywords
    prompt = `
You are an expert technical interviewer conducting a real job interview. Based on the candidate's resume, generate 5 challenging interview questions that would be asked in an actual interview setting.

Resume Keywords Extracted: ${extractedKeywords.join(', ') || 'None extracted'}
Resume Content: ${resumeContent}

Requirements:
- Generate exactly 5 questions based SOLELY on the resume content and extracted keywords
- Mix of question types: 4 technical (deep questions about the specific technologies and skills mentioned in the resume), 1 behavioral
- Questions should be realistic and challenging, like what a human interviewer would ask
- Focus on the candidate's actual experience and skills from their resume
- Ask deep technical questions about the specific technologies they mention (e.g., if they know React, ask about advanced React concepts)
- Include questions that test their practical knowledge and problem-solving with those technologies
- Make questions conversational and natural, not robotic

Format your response as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Your question here - make it sound like a real interviewer",
      "type": "technical|behavioral|situational"
    },
    // ... 4 more
  ]
}
`;
  } else {
    // Job info + optional resume: Mix of job requirements and resume skills
    prompt = `
You are an expert technical interviewer conducting a real job interview. Based on the following information, generate 5 challenging interview questions that would be asked in an actual interview setting.

Job Role: ${jobRole || 'Not specified'}
Job Description: ${jobDescription || 'Not specified'}
Resume Keywords: ${extractedKeywords.join(', ') || 'None extracted'}
Resume Content: ${resumeContent || 'Not provided'}

Requirements:
- Generate exactly 5 questions
- Mix of question types: 3 technical (focused on extracted keywords like ${extractedKeywords.slice(0, 3).join(', ')}), 1 behavioral, 1 tricky/situational
- Questions should be realistic and challenging, like what a human interviewer would ask
- If resume keywords are available, ask deep technical questions about those specific technologies
- Include at least one "tricky" question that requires critical thinking
- Questions should assess real-world problem-solving abilities
- Make questions conversational and natural, not robotic

Format your response as JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "Your question here - make it sound like a real interviewer",
      "type": "technical|behavioral|situational"
    },
    // ... 4 more
  ]
}
`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 600,
    });

    const response = completion.choices[0].message.content;
    // Parse JSON from response
    const jsonMatch = response.match(/\{.*\}/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse AI response as JSON');
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate questions with AI');
  }
}

// POST /api/interview/generate-questions
router.post('/generate-questions', upload.single('resume'), async (req, res) => {
  try {
    const { jobRole, jobDescription } = req.body;
    let resumeContent = '';

    // Parse resume if file uploaded
    const hasFile = req.file !== undefined;
    if (hasFile) {
      try {
        resumeContent = await parseResume(req.file.buffer, req.file.originalname);
      } catch (parseError) {
        console.error('Resume parsing error:', parseError);
        // Continue with empty content if parsing fails, but log the error
        resumeContent = '';
      }
    } else if (req.body.resume) {
      // Fallback for text resume sent as string
      resumeContent = req.body.resume;
    }

    // Allow submission with just resume file upload, or job role + description
    const hasJobRole = jobRole && jobRole.trim().length > 0;
    const hasJobDescription = jobDescription && jobDescription.trim().length >= 10;

    if (!hasFile && (!hasJobRole || !hasJobDescription)) {
      return res.status(400).json({
        error: 'Please either upload a resume/CV or provide both job role and job description.'
      });
    }

    const aiResponse = await generateQuestions(jobRole, jobDescription, resumeContent);

    res.json({
      success: true,
      questions: aiResponse.questions || [],
      message: 'Questions generated successfully'
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/interview/analyze-session
router.post('/analyze-session', async (req, res) => {
  let tempVideoPath;
  try {
    const { sessionId } = req.body;
    const questions = JSON.parse(req.body.questions || '[]');

    if (!sessionId || !questions.length) {
      return res.status(400).json({ error: 'Session ID and questions are required' });
    }

    // Check API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'AI service is not configured. Please set OPENAI_API_KEY environment variable.' });
    }

    // Get session data from database
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('video_url, user_email')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (!session.video_url) {
      return res.status(400).json({ error: 'No video found for this session' });
    }

    // Download video from Supabase storage
    const videoUrl = session.video_url.startsWith('http')
      ? session.video_url
      : `${process.env.SUPABASE_URL}/storage/v1/object/public/interview-videos/${session.video_url}`;

    const response = await axios.get(videoUrl, { responseType: 'stream' });
    tempVideoPath = path.join(__dirname, '..', 'temp_uploads', `session_${sessionId}_${Date.now()}.mp4`);

    // Ensure temp directory exists
    const tempDir = path.dirname(tempVideoPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Save video to temp file
    const writer = fs.createWriteStream(tempVideoPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

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
      PythonShell.run(path.join(__dirname, '..', 'Processing', 'bodylang_mediapipe_modified.py'),
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

    // Calculate overall rating (0-7 scale)
    const speechScore = speechResult.speech_metrics.speech_clarity_score / 100;
    const bodyScore = (bodyResult.eye_contact_pct + bodyResult.posture_score) / 200; // Average of two metrics
    const overallScore = (speechScore + bodyScore) / 2;
    const overallRating = Math.min(7, Math.max(0, Math.round(overallScore * 7)));

    // Generate question-by-question analysis using OpenAI
    const questionsAnalysis = await Promise.all(questions.map(async (q, index) => {
      // Split transcription into segments for each question (simplified approach)
      const transcription = speechResult.transcription;
      const words = transcription.split(' ');
      const segmentSize = Math.floor(words.length / questions.length);
      const startIdx = index * segmentSize;
      const endIdx = (index + 1) * segmentSize;
      const userAnswer = words.slice(startIdx, endIdx).join(' ') || `Answer for question ${index + 1}`;

      // Generate AI correct answer and feedback
      const feedbackPrompt = `
Based on this interview question and the candidate's transcribed answer, provide:
1. An ideal answer that demonstrates strong knowledge and communication skills
2. Specific feedback on their response

Question: ${q.question}
Candidate's Answer: ${userAnswer}

Format as JSON:
{
  "ai_correct_answer": "The ideal comprehensive answer here",
  "ai_feedback": "Specific feedback on their response, highlighting strengths and areas for improvement"
}
`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: feedbackPrompt }],
          temperature: 0.7,
          max_tokens: 400,
        });

        const feedbackResponse = completion.choices[0].message.content;
        const jsonMatch = feedbackResponse.match(/\{.*\}/s);
        const feedbackData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
          ai_correct_answer: "This is a comprehensive answer that demonstrates strong knowledge and clear communication skills.",
          ai_feedback: "Your answer shows good understanding. Consider providing more specific examples and elaborating on your thought process."
        };

        return {
          question_number: index + 1,
          question: q.question,
          user_answer: userAnswer,
          ai_correct_answer: feedbackData.ai_correct_answer,
          ai_feedback: feedbackData.ai_feedback
        };
      } catch (error) {
        console.error('Error generating feedback for question:', error);
        return {
          question_number: index + 1,
          question: q.question,
          user_answer: userAnswer,
          ai_correct_answer: "This is a comprehensive answer that demonstrates strong knowledge and clear communication skills.",
          ai_feedback: "Your answer shows understanding of the core concepts. Consider providing more specific examples and elaborating on your thought process."
        };
      }
    }));

    const analysis = {
      overall_rating: overallRating,
      questions_analysis: questionsAnalysis,
      speech_analysis: {
        clarity_score: speechResult.speech_metrics.speech_clarity_score,
        speaking_rate: speechResult.speech_metrics.speaking_rate_wpm,
        filler_words: speechResult.speech_metrics.filler_words_count
      },
      body_language: {
        eye_contact: bodyResult.eye_contact_pct,
        posture: bodyResult.posture_score
      }
    };

    res.json({
      success: true,
      analysis: analysis,
      message: 'AI analysis completed successfully'
    });

  } catch (error) {
    console.error('Analyze session error:', error);
    res.status(500).json({ error: error.message });
  } finally {
    // Clean up temp file
    if (tempVideoPath && fs.existsSync(tempVideoPath)) {
      fs.unlinkSync(tempVideoPath);
    }
  }
});

module.exports = router;
