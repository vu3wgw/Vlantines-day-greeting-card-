"""
Background Removal API Server
Uses rembg with U2-Net model - lightweight, CPU-friendly, Docker-ready
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session
from PIL import Image
import io
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Background Remover API",
    description="Remove backgrounds from images using U2-Net",
    version="1.0.0"
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-load the model session for faster inference
# Using u2net model - good balance of quality and speed
# Alternatives: u2netp (faster, smaller), isnet-general-use (better edges)
session = None

@app.on_event("startup")
async def load_model():
    global session
    logger.info("Loading U2-Net model...")
    # isnet-general-use is better for general objects and people
    session = new_session("isnet-general-use")
    logger.info("Model loaded successfully!")

@app.get("/")
async def root():
    return {
        "service": "Background Remover API",
        "status": "running",
        "model": "isnet-general-use",
        "endpoints": {
            "POST /remove-background": "Upload image, get PNG with transparent background",
            "POST /remove-background-base64": "Upload image, get base64 data URL",
            "GET /health": "Health check"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model": "isnet-general-use"}

@app.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    output_format: str = "png"
):
    """
    Remove background from an uploaded image.
    Returns a PNG with transparent background.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        # Read the uploaded image
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))

        # Convert to RGB if necessary (handle RGBA, palette images, etc.)
        if input_image.mode not in ("RGB", "RGBA"):
            input_image = input_image.convert("RGB")

        logger.info(f"Processing image: {file.filename}, size: {input_image.size}")

        # Remove background using pre-loaded session
        output_image = remove(
            input_image,
            session=session,
            alpha_matting=True,  # Better edge quality
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
        )

        # Convert to bytes
        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", optimize=True)
        output_buffer.seek(0)

        logger.info(f"Background removed successfully for: {file.filename}")

        return Response(
            content=output_buffer.getvalue(),
            media_type="image/png",
            headers={
                "Content-Disposition": f"inline; filename=sticker_{file.filename}.png"
            }
        )

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")

@app.post("/remove-background-base64")
async def remove_background_base64(
    file: UploadFile = File(...)
):
    """
    Remove background and return as base64 data URL.
    Useful for direct embedding in frontend.
    """
    import base64

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        contents = await file.read()
        input_image = Image.open(io.BytesIO(contents))

        if input_image.mode not in ("RGB", "RGBA"):
            input_image = input_image.convert("RGB")

        output_image = remove(
            input_image,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
        )

        output_buffer = io.BytesIO()
        output_image.save(output_buffer, format="PNG", optimize=True)
        output_buffer.seek(0)

        base64_data = base64.b64encode(output_buffer.getvalue()).decode("utf-8")

        return {
            "success": True,
            "data_url": f"data:image/png;base64,{base64_data}",
            "original_filename": file.filename
        }

    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
