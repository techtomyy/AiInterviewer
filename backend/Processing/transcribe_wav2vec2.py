
import os
import subprocess
import tempfile
import requests
from supabase import create_client 
import torchaudio
import torch
from transformers import Wav2Vec2ForCTC, Wav2Vec2Processor

from dotenv import load_dotenv

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")  
load_dotenv()

MODEL_NAME = "facebook/wav2vec2-base-960h"

def download_from_supabase(bucket: str, path: str, local_path: str, public=True):
    if public:
        # build public URL: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
        #project = SUPABASE_URL.replace("https://", "").split(".")[0]
        url = f"{SUPABASE_URL}/storage/v1/object/public/{bucket}/{path}"
        r = requests.get(url, stream=True)
        r.raise_for_status()
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        return local_path
    
    else:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        data = supabase.storage.from_(bucket).download(path)
        with open(local_path, "wb") as f:
            f.write(data)
        return local_path

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
    # Example inputs; integrate with your backend to pass these dynamically
    bucket = "videos"
    path = "uploads/interview_123.mp4"   # path in Supabase
    with tempfile.TemporaryDirectory() as tmp:
        video_local = os.path.join(tmp, "interview.mp4")
        wav_local = os.path.join(tmp, "audio.wav")
        download_from_supabase(bucket, path, video_local, public=True)
        extract_audio(video_local, wav_local)
        text, confidence = transcribe(wav_local)
        print("TRANSCRIPTION:", text)
        print("CONF:", confidence)

if __name__ == "__main__":
    main()