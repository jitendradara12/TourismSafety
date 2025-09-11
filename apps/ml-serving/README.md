# ML Serving (FastAPI)

Minimal inference server used by the SIH safety platform prototype.

Run locally:

```
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Health check:

```
curl http://localhost:8000/healthz
```

Endpoints:
- GET /healthz → { status: "ok" }
- POST /infer/image → placeholder response with detections: []

