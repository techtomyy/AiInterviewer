# AI Interview Assistant

The AI Interview Assistant is a new feature that provides personalized interview questions and detailed feedback based on your job description and resume.

## Features

### 1. Job Input Collection (Modal-Based)

- **Modal Interface**: Clean, centered modal that appears when clicking interview buttons
- **Job Role**: Enter the position you're applying for
- **Job Description**: Paste the full job description or describe the role
- **Resume Upload**: Optionally upload your resume/CV for more personalized questions
- **Close Options**: X button or click outside to close the modal

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
    "filler_word_timestamps": [{ "word": "um", "start": 1.2, "end": 1.35 }],
    "segment_transcripts": [
      { "start": 0.0, "end": 15.0, "text": "Answer text...", "confidence": 0.9 }
    ]
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

   - Go to your Dashboard (now titled "Job Role / Job Position")
   - Click any of these buttons:
     - "New Interview" (header)
     - "Start Your First Interview" (when no sessions exist)
     - "Start New Interview" (Quick Actions)
     - "AI Interview Assistant" (Quick Actions)

2. **Provide Job Information**:

   - Modal opens with "Tell me about your job interview"
   - Fill in your job role (e.g., "Frontend Developer")
   - Paste the job description or describe the role
   - Optionally upload your resume/CV (PDF, DOC, DOCX, or TXT)
   - Click "Generate Interview Questions" or "Cancel"

3. **Review Generated Questions**:

   - AI generates 5 personalized questions based on your input
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

- `JobInputModal.tsx`: Modal for collecting job information and resume
- `JobInputForm.tsx`: Form component (reused from original implementation)
- `InterviewQuestions.tsx`: Displays and manages AI-generated questions
- `AIFeedbackDisplay.tsx`: Shows detailed analysis and feedback
- `ai-interview.tsx`: Main page orchestrating the interview flow

### Services:

- `interviewService.ts`: Handles question generation and analysis logic

### Key Features:

- **Modal-Based UX**: Clean, non-disruptive interface
- **Multiple File Support**: PDF, DOC, DOCX, and TXT resume uploads
- **Keyword Extraction**: AI analyzes resume content for better questions
- **Responsive Design**: Works on desktop and mobile
- **Integration**: Seamlessly integrates with existing video recording system
- **Error Handling**: Graceful handling of file upload errors and API failures

## Dashboard Integration

The dashboard now features:

- **Updated Title**: "Job Role / Job Position"
- **Modal Triggers**: All interview buttons open the job input modal
- **Consistent UX**: Same modal for all interview initiation methods
- **Data Persistence**: Job information saved to localStorage for interview flow

## Future Enhancements

- **Real Speech Analysis**: Integration with speech-to-text APIs
- **Computer Vision**: Real body language analysis using camera input
- **Machine Learning**: More sophisticated question generation
- **Historical Tracking**: Track improvement over time
- **Export Options**: PDF reports and detailed analytics

## Development Notes

- The system uses a modal-based approach for better user experience
- All components are built with TypeScript and follow the existing design system
- The feature is fully integrated with the existing authentication and routing system
- Resume upload supports multiple file formats with size validation (5MB limit)
- Feedback data can be copied as JSON or downloaded for external analysis
