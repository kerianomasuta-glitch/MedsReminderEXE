"""Remove flat backgrounds from the MedsReminder brand assets."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

# High-quality source with flat panel background
SOURCE = Path(
    r"C:\Users\keria\.cursor\projects\c-MedsReminderEXE\assets\c__Users_keria_AppData_Roaming_Cursor_User_workspaceStorage_3b0b2ffcac1c351e8a7e9c622d920ec8_images_image-0ab8927a-6f21-4b5e-88f7-c852b5138597.png"
)
OUTPUT_FULL = Path(r"C:\MedsReminderEXE\FE\assets\images\medsreminder-logo-transparent.png")
OUTPUT_ICON = Path(r"C:\MedsReminderEXE\FE\assets\images\medsreminder-icon-transparent.png")


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    return ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) ** 0.5


def is_background(rgb: tuple[int, int, int], refs: list[tuple[int, int, int]]) -> bool:
    r, g, b = rgb
    brightness = (r + g + b) / 3
    spread = max(r, g, b) - min(r, g, b)

    if any(color_distance(rgb, ref) <= 22 for ref in refs):
        return True

    if brightness >= 228 and spread <= 24:
        return True

    if r >= 225 and g >= 232 and b >= 240 and spread <= 20:
        return True

    return False


def remove_background(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    pixels = rgba.load()

    refs = [
        pixels[0, 0][:3],
        pixels[w - 1, 0][:3],
        pixels[0, h - 1][:3],
        pixels[w - 1, h - 1][:3],
        pixels[w // 2, 0][:3],
    ]

    visited = [[False] * w for _ in range(h)]
    queue: deque[tuple[int, int]] = deque()

    def seed(x: int, y: int) -> None:
        if 0 <= x < w and 0 <= y < h and not visited[y][x] and is_background(pixels[x, y][:3], refs):
            visited[y][x] = True
            queue.append((x, y))

    for x in range(w):
        seed(x, 0)
        seed(x, h - 1)
    for y in range(h):
        seed(0, y)
        seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        pixels[x, y] = (*pixels[x, y][:3], 0)
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and is_background(pixels[nx, ny][:3], refs):
                visited[ny][nx] = True
                queue.append((nx, ny))

    return rgba


def trim_transparent(img: Image.Image, padding: int = 16) -> Image.Image:
    rgba = img.convert("RGBA")
    alpha = rgba.split()[3]
    bbox = alpha.getbbox()
    if not bbox:
        return rgba

    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(rgba.width, right + padding)
    bottom = min(rgba.height, bottom + padding)
    return rgba.crop((left, top, right, bottom))


def split_icon(full: Image.Image) -> Image.Image:
    rgba = full.convert("RGBA")
    w, h = rgba.size
    pixels = rgba.load()

    top, bottom, left, right = h, 0, w, 0
    cutoff = int(h * 0.72)

    for y in range(cutoff):
        for x in range(w):
            if pixels[x, y][3] > 10:
                top = min(top, y)
                bottom = max(bottom, y)
                left = min(left, x)
                right = max(right, x)

    pad = 10
    return rgba.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(w, right + pad),
            min(h, bottom + pad),
        )
    )


def main() -> None:
    OUTPUT_FULL.parent.mkdir(parents=True, exist_ok=True)
    source = Image.open(SOURCE)
    cleaned = remove_background(source)
    full = trim_transparent(cleaned, padding=16)
    icon = trim_transparent(split_icon(cleaned), padding=10)

    full.save(OUTPUT_FULL, format="PNG")
    icon.save(OUTPUT_ICON, format="PNG")

    print(f"Saved full branding: {OUTPUT_FULL} ({full.size[0]}x{full.size[1]})")
    print(f"Saved icon only: {OUTPUT_ICON} ({icon.size[0]}x{icon.size[1]})")


if __name__ == "__main__":
    main()
