import os
import sys

def install_and_run():
    # Attempt to import PIL, install if missing
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--break-system-packages", "Pillow"])
        from PIL import Image, ImageDraw, ImageFont

    os.makedirs("icons", exist_ok=True)

    sizes = [16, 48, 128]
    
    for size in sizes:
        # Create an image with a premium gradient background
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # Draw a rounded rectangle / circle
        padding = size // 8
        shape_range = [padding, padding, size - padding, size - padding]
        
        # Indigo/violet gradient approximation
        color_start = (99, 102, 241, 255) # Indigo-500
        color_end = (79, 70, 229, 255) # Indigo-600
        
        # Fill circle
        draw.ellipse(shape_range, fill=color_start, outline=color_end, width=max(1, size // 24))
        
        # Draw a stylized "J" in the middle
        # If font is not available, we draw it using lines/arcs
        # Let's draw it using paths to avoid font dependency
        cx = size // 2
        cy = size // 2
        w = size // 6
        h = size // 3
        
        # Draw the "J" shape with simple lines
        # Top bar
        draw.line([cx - w, cy - h, cx + w, cy - h], fill=(255, 255, 255, 255), width=max(2, size // 10))
        # Vertical stem
        draw.line([cx, cy - h, cx, cy + w], fill=(255, 255, 255, 255), width=max(2, size // 10))
        # Hook bottom
        draw.arc([cx - w, cy + w - w, cx, cy + w + w], 0, 180, fill=(255, 255, 255, 255), width=max(2, size // 10))

        img.save(f"icons/icon{size}.png")
        print(f"Generated icons/icon{size}.png")

if __name__ == "__main__":
    install_and_run()
