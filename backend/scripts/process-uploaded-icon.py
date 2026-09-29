import os
import base64
from PIL import Image, ImageDraw, ImageFont

SRC_PATH = "/Users/amauri/.gemini/antigravity-ide/brain/17773ed4-f4f1-4d53-803f-25785247e5a5/.user_uploaded/media_1790693193514.jpg"

if not os.path.exists(SRC_PATH):
    raise FileNotFoundError(f"Source image not found: {SRC_PATH}")

print("Loading original image...")
img = Image.open(SRC_PATH).convert("RGBA")

# 1. Exact squircle crop (removing outer checkerboard)
# Bounds determined by color analysis: [127, 126, 897, 896]
crop_box = (127, 126, 897, 896)
cropped = img.crop(crop_box)
w, h = cropped.size

# 2. High-precision anti-aliased mask for the rounded squircle
scale = 4
mask_hi = Image.new("L", (w * scale, h * scale), 0)
draw = ImageDraw.Draw(mask_hi)
corner_radius = int(172 * scale)
draw.rounded_rectangle([0, 0, w * scale - 1, h * scale - 1], radius=corner_radius, fill=255)
mask = mask_hi.resize((w, h), Image.Resampling.LANCZOS)

cropped.putalpha(mask)

# 3. Create high-res 1024x1024 master
master = cropped.resize((1024, 1024), Image.Resampling.LANCZOS)

# Ensure directories exist
os.makedirs("public", exist_ok=True)
os.makedirs("src/assets", exist_ok=True)
os.makedirs("src/assets/images", exist_ok=True)

# 4. Save Master and Original
img.convert("RGB").save("public/logo-original.jpg", quality=95)
master.save("public/logo-master.png", "PNG")
master.save("src/assets/images/logo-master.png", "PNG")

# 5. Export all standard resolutions
p512 = master.resize((512, 512), Image.Resampling.LANCZOS)
p512.save("public/web-app-manifest-512x512.png", "PNG")
p512.save("src/assets/web-app-manifest-512x512.png", "PNG")

p192 = master.resize((192, 192), Image.Resampling.LANCZOS)
p192.save("public/web-app-manifest-192x192.png", "PNG")
p192.save("src/assets/web-app-manifest-192x192.png", "PNG")

p180 = master.resize((180, 180), Image.Resampling.LANCZOS)
p180.save("public/apple-touch-icon.png", "PNG")
p180.save("src/assets/apple-touch-icon.png", "PNG")

p96 = master.resize((96, 96), Image.Resampling.LANCZOS)
p96.save("public/favicon-96x96.png", "PNG")
p96.save("src/assets/favicon-96x96.png", "PNG")

# 6. Multi-resolution ICO (16, 32, 48)
p48 = master.resize((48, 48), Image.Resampling.LANCZOS)
p48.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
p48.save("src/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
p48.save("src/assets/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# 7. Generate vector SVG with embedded 512x512 high-res image
import io
buf = io.BytesIO()
p512.save(buf, format="PNG")
b64_png = base64.b64encode(buf.getvalue()).decode("utf-8")

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <clipPath id="squircleClip">
      <rect width="512" height="512" rx="114" ry="114" />
    </clipPath>
  </defs>
  <image href="data:image/png;base64,{b64_png}" width="512" height="512" clip-path="url(#squircleClip)" preserveAspectRatio="xMidYMid meet"/>
</svg>
'''

with open("public/favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

with open("src/assets/favicon.svg", "w", encoding="utf-8") as f:
    f.write(svg_content)

# 8. Create Horizontal Logos (for Header, Login and Reports)
# 800 x 200 canvas
def create_horizontal_logo(dark_mode=False):
    h_canvas = Image.new("RGBA", (800, 200), (0, 0, 0, 0))
    # Paste icon (160x160) at left (margin x=20, y=20)
    icon_160 = master.resize((160, 160), Image.Resampling.LANCZOS)
    h_canvas.paste(icon_160, (20, 20), mask=icon_160)
    
    h_draw = ImageDraw.Draw(h_canvas)
    
    # Try finding system font
    font_large = None
    font_sub = None
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFPro.ttf",
        "/Library/Fonts/Arial.ttf"
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                font_large = ImageFont.truetype(p, 64)
                font_sub = ImageFont.truetype(p, 22)
                break
            except Exception:
                continue
                
    if font_large is None:
        font_large = ImageFont.load_default()
        font_sub = ImageFont.load_default()
        
    text_x = 210
    text_y = 48
    
    # Brand title: "EduPsych" (Dark Slate / White) + " Pro" (Teal #00A2A4)
    primary_color = (255, 255, 255, 255) if dark_mode else (15, 23, 42, 255)
    teal_color = (0, 175, 175, 255) if dark_mode else (0, 127, 128, 255)
    sub_color = (148, 163, 184, 255) if dark_mode else (100, 116, 139, 255)
    
    # Draw "EduPsych"
    h_draw.text((text_x, text_y), "EduPsych", fill=primary_color, font=font_large)
    
    # Calculate offset for " Pro"
    bbox = h_draw.textbbox((text_x, text_y), "EduPsych", font=font_large)
    pro_x = bbox[2] + 8
    h_draw.text((pro_x, text_y), "Pro", fill=teal_color, font=font_large)
    
    # Subtitle: "GESTÃO CLÍNICA & PSICOPEDAGOGIA"
    h_draw.text((text_x, text_y + 75), "GESTÃO CLÍNICA & PSICOPEDAGOGIA", fill=sub_color, font=font_sub)
    
    return h_canvas

logo_light = create_horizontal_logo(dark_mode=False)
logo_light.save("public/logo-horizontal.png", "PNG")
logo_light.save("src/assets/images/logo-horizontal.png", "PNG")

logo_dark = create_horizontal_logo(dark_mode=True)
logo_dark.save("public/logo-horizontal-white.png", "PNG")
logo_dark.save("src/assets/images/logo-horizontal-white.png", "PNG")

print("All icons, favicons, SVG, and horizontal logos processed and generated successfully!")
