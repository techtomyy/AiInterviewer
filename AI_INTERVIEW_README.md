# AI Interview Assistant

The AI Interview Assistant is a new feature that provides personalized interview questions and detailed feedback based on your job description and resume.

## Features

### 1. Job Input Collection
- **Job Role**: Enter the position you're applying for
- **Job Description**: Paste the full job description
- **Resume Upload**: Optionally upload your resume for more personalized questions

### 2. AI-Generated Questions
- **5 Personalized Questions**: Generated based on your job input
- **Question Types**:
  - Technical questions (related to specific skills)
  - Behavioral questions (past experiences)
  - Situational questions (hypothetical scenarios)
- **Smart Keyword Extraction**: Questions are tailored to keywords found in your job description and resume

### 3. Interview Flow
- **Question-by-Question**: Answer one question at a time
- **Video Recording**: Use the existing video recording functionality
- **Progress Tracking**: See your progress through the 5 questions

### 4. AI Analysis & Feedback
- **Speech Analysis**:
  - Speech clarity scoring (0-100)
  - Speaking rate (words per minute)
  - Filler word detection and timestamps
  - Segment-level transcription with confidence scores
- **Body Language Analysis**:
  - Eye contact percentage
  - Posture scoring
  - Detailed notes and observations
- **Overall Confidence Score**: Combined score from all metrics
- **Actionable Recommendations**: Specific tips for improvement

### 5. Output Format
All feedback is provided in strict JSON format as specified:

```json
{
  "transcription": "full transcription text",
  "overall_confidence": 85,
  "speech_metrics": {
    "speech_clarity_score": 82,
    "speaking_rate_wpm": 120,
    "filler_words_count": 6,
    "filler_word_timestamps": [{"word":"um","start":1.2,"end":1.35}],
    "segment_transcripts": [{"start":0.0,"end":15.0,"text":"Answer text...","confidence":0.9}]
  },
  "body_language": {
    "eye_contact_pct": 72.5,
    "posture_score": 78,
    "notes": "Good eye contact but posture could improve."
  },
  "recommendations": [
    "Reduce filler words like 'um'",
    "Maintain better posture",
    "Slow down speaking pace",
    "Highlight specific skills from resume more clearly"
  ]
}
```

## How to Use

1. **Access the Feature**:
   - Go to your Dashboard
   - Click on "AI Interview Assistant" in the Quick Actions section
   - Or navigate directly to `/ai-interview`

2. **Provide Job Information**:
   - Fill in your job role (e.g., "Frontend Developer")
   - Paste the job description
   - Optionally upload your resume

3. **Review Generated Questions**:
   - AI will generate 5 personalized questions
   - Review and select questions to practice
   - Click "Start Interview" when ready

4. **Complete the Interview**:
   - Answer each question using the video recording interface
   - Progress through all 5 questions

5. **Review Feedback**:
   - Get detailed analysis for each response
   - View overall scores and recommendations
   - Download or copy feedback data

## Technical Implementation

### Components Created:
- `JobInputForm.tsx`: Collects job information and resume
- `InterviewQuestions.tsx`: Displays and manages AI-generated questions
- `AIFeedbackDisplay.tsx`: Shows detailed analysis and feedback
- `ai-interview.tsx`: Main page orchestrating the interview flow

### Services:
- `interviewService.ts`: Handles question generation and analysis logic

### Key Features:
- **Mock Data**: Currently uses mock analysis when API is unavailable
- **Local Storage**: Saves progress between sessions
- **Responsive Design**: Works on desktop and mobile
- **Integration**: Seamlessly integrates with existing video recording system

## Future Enhancements

- **Real Speech Analysis**: Integration with speech-to-text APIs
- **Computer Vision**: Real body language analysis using camera input
- **Machine Learning**: More sophisticated question generation
- **Historical Tracking**: Track improvement over time
- **Export Options**: PDF reports and detailed analytics

## Development Notes

- The system currently uses mock data for analysis when the backend API is not available
- All components are built with TypeScript and follow the existing design system
- The feature is fully integrated with the existing authentication and routing system
- Feedback data can be copied as JSON or downloaded for external analysis
