#!/usr/bin/env python3

import argparse
import os
from PIL import Image

def convert_images(input_dir, quality):
    if not os.path.isdir(input_dir):
        print(f"❌ The specified path '{input_dir}' is not a directory.")
        return

    output_dir = os.path.join(input_dir, "webp_converted")
    os.makedirs(output_dir, exist_ok=True)

    supported_formats = ('.png', '.jpg', '.jpeg')

    for filename in os.listdir(input_dir):
        if filename.lower().endswith(supported_formats):
            input_path = os.path.join(input_dir, filename)
            output_filename = os.path.splitext(filename)[0] + '.webp'
            output_path = os.path.join(output_dir, output_filename)

            try:
                with Image.open(input_path) as img:
                    if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                        background = Image.new('RGBA', img.size, (255, 255, 255, 255))
                        background.paste(img, mask=img.convert('RGBA').split()[-1])
                        img = background.convert('RGB')
                    else:
                        img = img.convert('RGB')

                    img.save(output_path, 'WEBP', quality=quality)
                    print(f"✅ Converted: {filename} → {output_filename} (Quality: {quality}%)")
            except Exception as e:
                print(f"⚠️ Failed to convert {filename}: {e}")

def main():
    parser = argparse.ArgumentParser(
        description="Convert PNG and JPG images to compressed WebP format."
    )
    parser.add_argument(
        "-d", "--directory",
        required=True,
        help="Path to the directory containing the images"
    )
    parser.add_argument(
        "-q", "--quality",
        type=int,
        default=90,
        help="Compression quality for WebP (default: 90)"
    )

    args = parser.parse_args()
    convert_images(args.directory, args.quality)

if __name__ == "__main__":
    main()
