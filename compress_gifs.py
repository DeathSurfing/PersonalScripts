import os
import argparse
import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed

def compress_gif(input_path, output_path, lossy_level=80):
    print(f"🔄 Compressing: {input_path}")
    try:
        subprocess.run([
            "gifsicle",
            f"--lossy={lossy_level}",
            "-O3",
            input_path,
            "-o", output_path
        ], check=True)
        print(f"✅ Saved to: {output_path}\n")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error compressing {input_path}: {e}\n")
        return False

def main():
    parser = argparse.ArgumentParser(description="Lossy LZW compress all GIFs in a directory (multi-threaded).")
    parser.add_argument(
        "--directory", "-d",
        type=str,
        default=os.getcwd(),
        help="Directory containing GIFs (default: current directory)"
    )
    parser.add_argument(
        "--lossy",
        type=int,
        default=80,
        help="Lossy compression level (0-200). Default is 80."
    )
    parser.add_argument(
        "--threads",
        type=int,
        default=4,
        help="Number of threads to use for compression. Default is 4."
    )
    args = parser.parse_args()

    input_dir = os.path.abspath(args.directory)
    output_dir = os.path.join(input_dir, "output")
    lossy_level = args.lossy
    thread_count = args.threads

    print("📦 Starting GIF compression (multi-threaded)...")
    print(f"📂 Input Directory : {input_dir}")
    print(f"📁 Output Directory: {output_dir}")
    print(f"🎚️  Lossy Level     : {lossy_level}")
    print(f"🔢 Threads          : {thread_count}\n")

    os.makedirs(output_dir, exist_ok=True)

    tasks = []

    for root, _, files in os.walk(input_dir):
        if os.path.abspath(root).startswith(os.path.abspath(output_dir)):
            print(f"⏩ Skipping output directory: {root}")
            continue

        for file in files:
            if file.lower().endswith(".gif"):
                input_path = os.path.join(root, file)
                rel_path = os.path.relpath(input_path, input_dir)
                output_path = os.path.join(output_dir, rel_path)
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                tasks.append((input_path, output_path))

    gif_count = len(tasks)
    print(f"🚀 Dispatching {gif_count} GIFs to be compressed...\n")

    success_count = 0
    with ThreadPoolExecutor(max_workers=thread_count) as executor:
        futures = [executor.submit(compress_gif, inp, out, lossy_level) for inp, out in tasks]
        for future in as_completed(futures):
            if future.result():
                success_count += 1

    print(f"\n🏁 Finished! Successfully compressed {success_count}/{gif_count} GIFs.")

if __name__ == "__main__":
    main()
