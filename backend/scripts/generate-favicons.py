import math
from PIL import Image, ImageDraw, ImageFilter

def create_favicon(size=1024):
    # Create image with RGBA
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    scale = size / 512.0
    
    # 1. Background Squircle with subtle gradient
    # Color 1: #005A5B (Deep Teal), Color 2: #007F80 (Brand Teal), Color 3: #0EA5E9 (Cyan/Sky)
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    
    # Draw vertical/diagonal gradient
    for y in range(size):
        ratio = y / size
        # Smooth interpolation
        r = int(0 * (1 - ratio) + 14 * ratio)
        g = int(90 * (1 - ratio) + 140 * ratio)
        b = int(91 * (1 - ratio) + 180 * ratio)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
        
    # Mask for rounded rectangle (squircle)
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    corner_radius = int(112 * scale)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=corner_radius, fill=255)
    
    # Apply mask to gradient
    img.paste(bg, (0, 0), mask=mask)
    
    # 2. Subtle top glass highlight
    highlight = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    h_draw = ImageDraw.Draw(highlight)
    for y in range(int(size * 0.45)):
        alpha = int(45 * (1 - (y / (size * 0.45))))
        h_draw.line([(0, y), (size, y)], fill=(255, 255, 255, alpha))
    img.paste(highlight, (0, 0), mask=mask)
    
    # 3. Draw the Psychology & Pedagogy (Ψ - Psi) Symbol with high precision
    # We will draw the symbol on an overlay
    sym = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    s_draw = ImageDraw.Draw(sym)
    
    stroke_w = int(36 * scale)
    half_w = stroke_w // 2
    
    # Central stem
    stem_x = int(256 * scale)
    stem_top = int(145 * scale)
    stem_bot = int(385 * scale)
    s_draw.line([(stem_x, stem_top), (stem_x, stem_bot)], fill=(255, 255, 255, 255), width=stroke_w)
    s_draw.ellipse([stem_x - half_w, stem_top - half_w, stem_x + half_w, stem_top + half_w], fill=(255, 255, 255, 255))
    s_draw.ellipse([stem_x - half_w, stem_bot - half_w, stem_x + half_w, stem_bot + half_w], fill=(255, 255, 255, 255))
    
    # Curved U-shape for the Psi wings
    # Left tip: (140, 180), Bottom center: (256, 340), Right tip: (372, 180)
    points = []
    # Parametric curve from t = -1 (left tip) to t = 1 (right tip)
    steps = 100
    for i in range(steps + 1):
        t = -1.0 + (2.0 * i / steps)
        # Parabolic/catenary curve
        x = 256.0 + 116.0 * t
        # y drops from 180 down to 340 at center
        y = 340.0 - 160.0 * (1.0 - t * t)
        points.append((x * scale, y * scale))
        
    for i in range(len(points) - 1):
        p1 = points[i]
        p2 = points[i+1]
        s_draw.line([p1, p2], fill=(255, 255, 255, 255), width=stroke_w)
        s_draw.ellipse([p1[0] - half_w, p1[1] - half_w, p1[0] + half_w, p1[1] + half_w], fill=(255, 255, 255, 255))
    
    # Left & Right Wing Tips rounded
    left_tip = points[0]
    right_tip = points[-1]
    s_draw.ellipse([left_tip[0] - half_w, left_tip[1] - half_w, left_tip[0] + half_w, left_tip[1] + half_w], fill=(255, 255, 255, 255))
    s_draw.ellipse([right_tip[0] - half_w, right_tip[1] - half_w, right_tip[0] + half_w, right_tip[1] + half_w], fill=(255, 255, 255, 255))
    
    # 4. Cognitive Insight Sparks / Nodes
    # Left & Right spheres
    r_node = int(22 * scale)
    s_draw.ellipse([left_tip[0] - r_node, left_tip[1] - r_node, left_tip[0] + r_node, left_tip[1] + r_node], fill=(240, 253, 250, 255))
    s_draw.ellipse([right_tip[0] - r_node, right_tip[1] - r_node, right_tip[0] + r_node, right_tip[1] + r_node], fill=(240, 253, 250, 255))
    
    # Center Cognitive Star / Diamond at top of stem
    star_y = int(120 * scale)
    r_star = int(20 * scale)
    s_draw.ellipse([stem_x - r_star, star_y - r_star, stem_x + r_star, star_y + r_star], fill=(255, 255, 255, 255))
    
    # Inner dot
    inner_r = int(8 * scale)
    s_draw.ellipse([stem_x - inner_r, star_y - inner_r, stem_x + inner_r, star_y + inner_r], fill=(0, 127, 128, 255))
    
    # 5. Drop shadow for symbol to give high-end tactile feel
    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    s_mask = sym.split()[3]
    sh_draw = ImageDraw.Draw(shadow)
    sh_draw.bitmap((0, int(6 * scale)), sym, fill=(0, 40, 45, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(int(10 * scale)))
    
    # Composite: background -> shadow -> symbol
    final_img = Image.alpha_composite(img, shadow)
    final_img = Image.alpha_composite(final_img, sym)
    
    return final_img

# Generate master 1024x1024
master = create_favicon(1024)

# Output files
import os
os.makedirs("public", exist_ok=True)
os.makedirs("src/assets/images", exist_ok=True)

# 1. High-res PNGs
p512 = master.resize((512, 512), Image.Resampling.LANCZOS)
p512.save("public/web-app-manifest-512x512.png", "PNG")

p192 = master.resize((192, 192), Image.Resampling.LANCZOS)
p192.save("public/web-app-manifest-192x192.png", "PNG")

p180 = master.resize((180, 180), Image.Resampling.LANCZOS)
p180.save("public/apple-touch-icon.png", "PNG")

p96 = master.resize((96, 96), Image.Resampling.LANCZOS)
p96.save("public/favicon-96x96.png", "PNG")

p48 = master.resize((48, 48), Image.Resampling.LANCZOS)
p32 = master.resize((32, 32), Image.Resampling.LANCZOS)
p16 = master.resize((16, 16), Image.Resampling.LANCZOS)

# 2. Multi-resolution ICO (16, 32, 48)
p48.save("public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
p48.save("src/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

print("Favicon PNG and ICO generation completed successfully!")
