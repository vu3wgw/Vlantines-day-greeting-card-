"""
Background Removal API Server
Uses rembg with U2-Net model - lightweight, CPU-friendly, Docker-ready
Also provides green screen compositing for hybrid videos
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from rembg import remove, new_session
from PIL import Image
from pydantic import BaseModel
from typing import List, Optional, Dict
import io
import logging
import cv2
import numpy as np
import requests
import tempfile
import os

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


# ============ GREEN SCREEN COMPOSITING ============

class Position(BaseModel):
    x: float
    y: float
    width: float
    height: float

class GreenScreenRegion(BaseModel):
    index: int
    startFrame: int
    endFrame: int
    position: Position
    fitMode: str = "cover"

class UserImage(BaseModel):
    url: str
    index: int

class ChromaSettings(BaseModel):
    hue_range: List[int] = [35, 85]
    sat_range: List[int] = [40, 255]
    val_range: List[int] = [40, 255]
    edge_feather: int = 5
    spill_removal: float = 0.5

class CompositeRequest(BaseModel):
    base_video_path: str
    user_images: List[UserImage]
    green_screen_regions: List[GreenScreenRegion]
    chroma_settings: Optional[ChromaSettings] = ChromaSettings()

def remove_green_spill(frame: np.ndarray, strength: float) -> np.ndarray:
    """Remove green color cast from edges"""
    b, g, r = cv2.split(frame)
    g_adjusted = g - (g - (b + r) / 2) * strength
    g_adjusted = np.clip(g_adjusted, 0, 255).astype(np.uint8)
    return cv2.merge([b, g_adjusted, r])

def download_image(url: str) -> np.ndarray:
    """Download image from URL and convert to numpy array"""
    try:
        if url.startswith("file://"):
            # Local file
            file_path = url[7:]  # Remove 'file://' prefix
            img = Image.open(file_path)
        else:
            # Remote URL
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            img = Image.open(io.BytesIO(response.content))

        # Convert to RGB numpy array
        img = img.convert("RGB")
        return cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    except Exception as e:
        logger.error(f"Failed to download image from {url}: {str(e)}")
        raise

def fit_image_to_region(image: np.ndarray, target_width: int, target_height: int, fit_mode: str) -> np.ndarray:
    """Resize image to fit target dimensions based on fit mode"""
    img_h, img_w = image.shape[:2]

    if fit_mode == "fill":
        # Stretch to exact dimensions
        return cv2.resize(image, (target_width, target_height))

    elif fit_mode == "contain":
        # Fit inside, preserve aspect ratio, may have letterbox
        scale = min(target_width / img_w, target_height / img_h)
        new_w = int(img_w * scale)
        new_h = int(img_h * scale)
        resized = cv2.resize(image, (new_w, new_h))

        # Create canvas and center image
        canvas = np.zeros((target_height, target_width, 3), dtype=np.uint8)
        x_offset = (target_width - new_w) // 2
        y_offset = (target_height - new_h) // 2
        canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = resized
        return canvas

    else:  # "cover"
        # Fill region completely, crop if needed
        scale = max(target_width / img_w, target_height / img_h)
        new_w = int(img_w * scale)
        new_h = int(img_h * scale)
        resized = cv2.resize(image, (new_w, new_h))

        # Crop to target size (center crop)
        x_offset = (new_w - target_width) // 2
        y_offset = (new_h - target_height) // 2
        return resized[y_offset:y_offset+target_height, x_offset:x_offset+target_width]

@app.post("/composite-green-screen")
async def composite_green_screen(request: CompositeRequest):
    """
    Replace green screen areas with user images in FIFO order.

    Process:
    1. Load base video
    2. For each frame:
       - Detect green pixels using HSV color space
       - Create alpha mask with refined edges
       - Composite appropriate user image into green region
    3. Output composited video
    """
    try:
        logger.info(f"Starting green screen compositing for: {request.base_video_path}")

        # Validate base video path
        video_path = request.base_video_path
        if video_path.startswith("file://"):
            video_path = video_path[7:]  # Remove 'file://' prefix

        if not os.path.exists(video_path):
            raise HTTPException(status_code=400, detail=f"Base video not found: {video_path}")

        # Open base video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Failed to open base video")

        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        logger.info(f"Video properties: {width}x{height} @ {fps}fps, {total_frames} frames")

        # Pre-load user images
        logger.info(f"Loading {len(request.user_images)} user images...")
        loaded_images: Dict[int, np.ndarray] = {}
        for img_data in request.user_images:
            loaded_images[img_data.index] = download_image(img_data.url)
            logger.info(f"Loaded image {img_data.index} from {img_data.url}")

        # Create output video writer
        output_fd, output_path = tempfile.mkstemp(suffix=".mp4", prefix="composited_")
        os.close(output_fd)  # Close the file descriptor, we'll use the path

        # Use H.264 codec for compatibility
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

        if not out.isOpened():
            raise HTTPException(status_code=500, detail="Failed to create output video writer")

        # Process each frame
        frame_index = 0
        settings = request.chroma_settings

        logger.info("Starting frame processing...")

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Step 1: Create green screen mask
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

            # Define green color range in HSV
            lower_green = np.array([
                settings.hue_range[0],
                settings.sat_range[0],
                settings.val_range[0]
            ], dtype=np.uint8)
            upper_green = np.array([
                settings.hue_range[1],
                settings.sat_range[1],
                settings.val_range[1]
            ], dtype=np.uint8)

            # Create binary mask
            mask = cv2.inRange(hsv, lower_green, upper_green)

            # Step 2: Refine mask edges
            kernel = np.ones((5, 5), np.uint8)
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
            mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

            # Gaussian blur for soft edges
            if settings.edge_feather > 0:
                mask = cv2.GaussianBlur(mask, (0, 0), settings.edge_feather)

            # Normalize to 0-1 range for alpha blending
            mask_float = mask.astype(float) / 255.0

            # Step 3: Composite user images into green regions
            composited_frame = frame.copy()

            # Find which region(s) are active in this frame
            for region in request.green_screen_regions:
                if frame_index < region.startFrame or frame_index > region.endFrame:
                    continue

                # Get corresponding user image
                if region.index not in loaded_images:
                    logger.warning(f"No image found for region {region.index}")
                    continue

                user_img = loaded_images[region.index]

                # Calculate pixel coordinates from normalized values
                pos = region.position
                x = int(pos.x * width)
                y = int(pos.y * height)
                w = int(pos.width * width)
                h = int(pos.height * height)

                # Ensure coordinates are within bounds
                x = max(0, min(x, width - 1))
                y = max(0, min(y, height - 1))
                w = min(w, width - x)
                h = min(h, height - y)

                if w <= 0 or h <= 0:
                    continue

                # Resize user image to fit region
                user_img_resized = fit_image_to_region(user_img, w, h, region.fitMode)

                # Get corresponding mask region
                region_mask = mask_float[y:y+h, x:x+w]

                # Blend user image with background in green region
                if region_mask.shape[:2] == user_img_resized.shape[:2]:
                    for c in range(3):  # BGR channels
                        composited_frame[y:y+h, x:x+w, c] = (
                            composited_frame[y:y+h, x:x+w, c] * (1 - region_mask) +
                            user_img_resized[:, :, c] * region_mask
                        ).astype(np.uint8)

            # Step 4: Green spill removal (optional)
            if settings.spill_removal > 0:
                composited_frame = remove_green_spill(composited_frame, settings.spill_removal)

            out.write(composited_frame)
            frame_index += 1

            # Log progress every 100 frames
            if frame_index % 100 == 0:
                logger.info(f"Processed {frame_index}/{total_frames} frames ({frame_index/total_frames*100:.1f}%)")

        cap.release()
        out.release()

        logger.info(f"Green screen compositing completed! Output: {output_path}")

        return {
            "success": True,
            "output_video_path": output_path,
            "processing_time_ms": 0,  # TODO: Add timing
            "frame_count": frame_index
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during green screen compositing: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Compositing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
