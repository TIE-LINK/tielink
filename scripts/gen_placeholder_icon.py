"""Generate placeholder icon files for tielink in PNG and ICO formats.
Requires Pillow: pip install Pillow
Usage: python scripts/gen_placeholder_icon.py
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "frontend" / "assets"

SIZES = [16, 24, 32, 48, 64, 128, 256]


def generate_png():
    try:
        from PIL import Image, ImageDraw
    except ImportError:
        print("Pillow not installed. Skipping PNG generation.")
        print("Install with: pip install Pillow")
        return False

    for size in SIZES:
        img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        margin = size // 8
        r = size // 5

        draw.rounded_rectangle(
            [margin, margin, size - margin, size - margin],
            radius=r,
            fill=(255, 77, 46, 255),
        )

        cx = size // 2
        cy = size // 2

        link_w = size // 3
        link_h = size // 4
        draw.arc(
            [cx - link_w, cy - link_h, cx + link_w, cy + link_h],
            start=0, end=270, fill=(255, 255, 255, 255), width=max(2, size // 16),
        )

        out = ASSETS / "icons" / f"app-icon-{size}.png"
        img.save(out, "PNG")
        print(f"  {out}")

    main_png = ASSETS / "icons" / "app-icon.png"
    img = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([16, 16, 240, 240], radius=56, fill=(255, 77, 46, 255))
    img.save(main_png, "PNG")
    print(f"  {main_png}")

    return True


def generate_ico():
    try:
        from PIL import Image
    except ImportError:
        print("Pillow not installed. Skipping ICO generation.")
        return False

    png_path = ASSETS / "icons" / "app-icon-256.png"
    if not png_path.exists():
        print("256px PNG not found. Run PNG generation first.")
        return False

    img = Image.open(png_path)
    ico_path = ASSETS / "icons" / "app-icon.ico"
    img.save(ico_path, "ICO", sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print(f"  {ico_path}")
    return True


def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    (ASSETS / "icons").mkdir(parents=True, exist_ok=True)

    print("Generating PNG icons...")
    png_ok = generate_png()

    print("Generating ICO icon...")
    generate_ico()

    print("Done.")
    return 0 if png_ok else 1


if __name__ == "__main__":
    sys.exit(main())
