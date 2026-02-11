"""
Test script for green screen compositing endpoint
"""
import requests
import json
import sys

# Configuration
API_URL = "http://localhost:8001/composite-green-screen"
BASE_VIDEO_PATH = r"H:\house\code\Vlantines day viral hook\video\shot1 v1.mp4"

# Test with a sample image from Unsplash
TEST_IMAGE_URL = "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?w=800"

# Green screen regions (placeholder - adjust based on actual video)
green_screen_regions = [
    {
        "index": 0,
        "startFrame": 0,
        "endFrame": 500,
        "position": {
            "x": 0.2,
            "y": 0.3,
            "width": 0.6,
            "height": 0.4
        },
        "fitMode": "cover"
    },
    {
        "index": 1,
        "startFrame": 501,
        "endFrame": 1000,
        "position": {
            "x": 0.15,
            "y": 0.25,
            "width": 0.7,
            "height": 0.5
        },
        "fitMode": "cover"
    },
    {
        "index": 2,
        "startFrame": 1001,
        "endFrame": 1517,
        "position": {
            "x": 0.1,
            "y": 0.2,
            "width": 0.8,
            "height": 0.6
        },
        "fitMode": "cover"
    }
]

# Request payload
payload = {
    "base_video_path": BASE_VIDEO_PATH,
    "user_images": [
        {"url": TEST_IMAGE_URL, "index": 0},
        {"url": "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?w=800", "index": 1},
        {"url": "https://images.unsplash.com/photo-1518568814500-bf0f8d125f46?w=800", "index": 2}
    ],
    "green_screen_regions": green_screen_regions,
    "chroma_settings": {
        "hue_range": [35, 85],
        "sat_range": [40, 255],
        "val_range": [40, 255],
        "edge_feather": 5,
        "spill_removal": 0.5
    }
}

print("Testing green screen compositing endpoint...")
print(f"API URL: {API_URL}")
print(f"Base video: {BASE_VIDEO_PATH}")
print(f"Number of user images: {len(payload['user_images'])}")
print(f"Number of regions: {len(green_screen_regions)}")
print("\nSending request...")

try:
    response = requests.post(API_URL, json=payload, timeout=300)

    if response.status_code == 200:
        result = response.json()
        print("\n✅ SUCCESS!")
        print(f"Output video: {result['output_video_path']}")
        print(f"Frames processed: {result['frame_count']}")
        print(f"\nYou can now view the output video at:")
        print(f"  {result['output_video_path']}")
    else:
        print(f"\n❌ ERROR: {response.status_code}")
        print(response.text)
        sys.exit(1)

except requests.exceptions.Timeout:
    print("\n❌ Request timeout - video processing may take a while")
    sys.exit(1)
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    sys.exit(1)
