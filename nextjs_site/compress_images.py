import os
from PIL import Image

def compress_images_in_dir(directory):
    total_saved = 0
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            # Only process large images > 500KB
            if file.lower().endswith(('.png', '.jpg', '.jpeg')) and os.path.getsize(file_path) > 500 * 1024:
                try:
                    img = Image.open(file_path)
                    original_size = os.path.getsize(file_path)
                    
                    # Convert to RGB if it's RGBA (for JPEG saving)
                    if img.mode in ("RGBA", "P"):
                        img = img.convert("RGB")
                    
                    # Calculate new size, max 1920x1080 bounding box
                    max_size = (1920, 1080)
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                    
                    # Save over the original file
                    img.save(file_path, "JPEG", optimize=True, quality=80)
                    
                    new_size = os.path.getsize(file_path)
                    saved = original_size - new_size
                    total_saved += saved
                    count += 1
                    
                    print(f"Compressed {file}: {original_size/1024/1024:.2f}MB -> {new_size/1024/1024:.2f}MB")
                except Exception as e:
                    print(f"Failed to compress {file}: {e}")
                    
    print(f"\nDone! Compressed {count} images.")
    print(f"Total space saved: {total_saved / 1024 / 1024:.2f} MB")

compress_images_in_dir(r"D:\Sejal_Intern\CPS_Lab\CPS_LAB\nextjs_site\public")
