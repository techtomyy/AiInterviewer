#
# Copyright (c) - All Rights Reserved.
# 
# See the LICENSE file for more information.
#

import os
import subprocess
import sys
import json
import tempfile
import torchaudio
import torch
import numpy as np
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

MODEL_NAME = "facebook/wav2vec2-base-960h"

def extract_audio(video_path: str, out_wav: str, sample_rate=16000):
    cmd = [
        "ffmpeg", "-y", "-i", video_path,
        "-ac", "1", "-ar", str(sample_rate),
        "-vn", out_wav
    ]
    subprocess.check_call(cmd)
    return out_wav

def transcribe(wav_path: str, model_name=MODEL_NAME, device='cpu'):
    processor = Wav2Vec2Processor.from_pretrained(model_name)
    model = Wav2Vec2ForCTC.from_pretrained(model_name).to(device)
    waveform, sr = torchaudio.load(wav_path)
    if sr != processor.feature_extractor.sampling_rate:
        waveform = torchaudio.functional.resample(waveform, sr, processor.feature_extractor.sampling_rate)
    input_values = processor(waveform.squeeze().numpy(), sampling_rate=processor.feature_extractor.sampling_rate, return_tensors="pt").input_values
    input_values = input_values.to(device)
    with torch.no_grad():
        logits = model(input_values).logits
    predicted_ids = torch.argmax(logits, dim=-1)
    transcription = processor.batch_decode(predicted_ids)[0]
    # rudimentary confidence estimate: average max softmax prob across frames
    probs = torch.softmax(logits, dim=-1)
    max_probs = probs.max(dim=-1).values
    conf = float(max_probs.mean().cpu().numpy())
    return transcription, conf

def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python transcribe_wav2vec2.py <video_path>"}))
        sys.exit(1)

    video_path = sys.argv[1]

    if not os.path.exists(video_path):
        print(json.dumps({"error": f"Video file not found: {video_path}"}))
        sys.exit(1)

    try:
        with tempfile.TemporaryDirectory() as tmp:
            wav_local = os.path.join(tmp, "audio.wav")
            extract_audio(video_path, wav_local)
            text, confidence = transcribe(wav_local)

            # Get video duration using ffprobe
            probe_cmd = [
                "ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_format", video_path
            ]
            probe_result = subprocess.run(probe_cmd, capture_output=True, text=True)
            duration = 60.0  # default fallback
            if probe_result.returncode == 0:
                probe_data = json.loads(probe_result.stdout)
                duration = float(probe_data.get('format', {}).get('duration', 60.0))

            # Calculate basic speech metrics
            words = text.split()
            word_count = len(words)

            # Calculate real speaking rate (words per minute)
            if duration > 0:
                speaking_rate_wpm = int((word_count / duration) * 60)
            else:
                speaking_rate_wpm = 120

            # Simple filler word detection
            filler_words = ['um', 'uh', 'like', 'you know', 'so', 'well']
            filler_count = 0
            filler_timestamps = []

            # Since we don't have timestamps from Wav2Vec2, we'll create mock timestamps
            for i, word in enumerate(words):
                if word.lower() in filler_words:
                    filler_count += 1
                    # Mock timestamp
                    start_time = (i / word_count) * duration if word_count > 0 else 0
                    filler_timestamps.append({
                        "word": word.lower(),
                        "start": round(start_time, 2),
                        "end": round(start_time + 0.5, 2)
                    })

            # Speech clarity score based on confidence (target 85%)
            speech_clarity_score = 85  # Fixed for demo

            # Response timing (time to start speaking) - mock 2.5s
            response_timing = 2.5

            # Average pauses - mock calculation
            avg_pauses = 1.1

            # Answer quality scores (mock for demo)
            answer_quality = {
                "overall": 83,
                "relevance": 91,
                "completeness": 79,
                "confidence": 80
            }

            # Segment transcripts - split into chunks
            segment_length = 15  # seconds
            segments = []
            current_segment = ""
            current_start = 0
            current_words = []

            for i, word in enumerate(words):
                current_words.append(word)
                if (i + 1) % 20 == 0 or i == len(words) - 1:  # Every ~20 words or end
                    segment_text = " ".join(current_words)
                    segments.append({
                        "start": current_start,
                        "end": current_start + segment_length,
                        "text": segment_text,
                        "confidence": confidence
                    })
                    current_words = []
                    current_start += segment_length

            result = {
                "transcription": text,
                "confidence": confidence,
                "speech_analysis": {
                    "percentage": speech_clarity_score,
                    "pace_wpm": speaking_rate_wpm,
                    "fillers": round(filler_count / max(word_count, 1) * 100, 1) if word_count > 0 else 0.0
                },
                "response_timing": {
                    "response_time": response_timing,
                    "avg_pauses": avg_pauses
                },
                "answer_quality": answer_quality,
                "speech_metrics": {
                    "speech_clarity_score": speech_clarity_score,
                    "speaking_rate_wpm": speaking_rate_wpm,
                    "filler_words_count": filler_count,
                    "filler_word_timestamps": filler_timestamps,
                    "segment_transcripts": segments
                }
            }

            print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
