from fastapi import FastAPI, File, UploadFile
from whisper_asr import transcribe_audio
from intent import detect_intent
from agent import agent_decide

app = FastAPI()

@app.post("/process-voice")
async def process_voice(file: UploadFile = File(...)):
    audio_bytes = await file.read()

    text = transcribe_audio(audio_bytes)
    intent = detect_intent(text)
    result = agent_decide(intent, text)

    return {
        "transcription": text,
        "intent": intent,
        "result": result
    }
