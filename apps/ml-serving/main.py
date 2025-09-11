from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="SIH ML Serving")

class ImageRequest(BaseModel):
    image_base64: str | None = None
    s3_key: str | None = None

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

@app.post("/infer/image")
async def infer_image(req: ImageRequest):
    # Placeholder: return trivial detection
    return {"detections": [], "model": "placeholder", "ms": 1}
