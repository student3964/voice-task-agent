import whisper
import tempfile

model = whisper.load_model("small")

def transcribe_audio(file):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(file)
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    return result["text"]
