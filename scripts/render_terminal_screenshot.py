"""
render_terminal_screenshot.py
------------------------------
Renders real captured terminal output (from the actual `npx jest` runs) as
a terminal-styled PNG image, for use as report evidence. This is NOT
synthetic/fake data — the text content is copied verbatim from the actual
command output files (test-run-output.txt / ai-mistake-demo-output.txt).
"""
import sys
from PIL import Image, ImageDraw, ImageFont

def render(input_path, output_path, title="Terminal", width=1180):
    with open(input_path, "r", encoding="utf-8") as f:
        raw_lines = f.read().splitlines()

    # Strip ANSI escape codes and the node deprecation warning noise
    import re
    ansi_escape = re.compile(r'\x1b\[[0-9;]*m')
    lines = []
    for l in raw_lines:
        l = ansi_escape.sub('', l)
        if "DeprecationWarning" in l or "trace-deprecation" in l:
            continue
        lines.append(l)

    font_size = 15
    line_height = 21
    padding = 22
    titlebar_h = 34

    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", font_size)
        font_bold = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf", font_size)
    except Exception:
        font = ImageFont.load_default()
        font_bold = font

    height = titlebar_h + padding * 2 + line_height * len(lines)
    img = Image.new("RGB", (width, height), (13, 17, 23))
    draw = ImageDraw.Draw(img)

    # Title bar
    draw.rectangle([0, 0, width, titlebar_h], fill=(30, 36, 48))
    for i, (cx, color) in enumerate([(20, (255, 95, 86)), (42, (255, 189, 46)), (64, (39, 201, 63))]):
        draw.ellipse([cx, titlebar_h/2-6, cx+12, titlebar_h/2+6], fill=color)
    draw.text((90, titlebar_h/2 - font_size/2), title, font=font, fill=(150, 160, 180))

    y = titlebar_h + padding
    for line in lines:
        color = (200, 208, 224)
        if line.strip().startswith("PASS"):
            color = (61, 220, 151)
        elif line.strip().startswith("FAIL"):
            color = (255, 107, 107)
        elif "✓" in line:
            color = (61, 220, 151)
        elif "✕" in line:
            color = (255, 107, 107)
        elif line.strip().startswith(("Test Suites:", "Tests:", "Time:")):
            color = (124, 158, 255)
        elif line.strip().startswith(("File", "-----", "All files")):
            color = (245, 166, 35)
        elif "Expected:" in line or "Received:" in line:
            color = (255, 189, 46)
        draw.text((padding, y), line, font=font, fill=color)
        y += line_height

    img.save(output_path)
    print(f"Saved {output_path} ({width}x{height})")

if __name__ == "__main__":
    render(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "Terminal")
