import os
import argparse
from pathlib import Path

def parse_gitignore(directory: str) -> set:
    """
    Parses the .gitignore file in the given directory and returns a set of patterns to ignore.
    
    Args:
        directory (str): The directory containing the .gitignore file.
    
    Returns:
        set: A set of patterns to ignore.
    """
    gitignore_path = os.path.join(directory, ".gitignore")
    ignore_patterns = set()

    if os.path.isfile(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as file:
            for line in file:
                line = line.strip()
                if line and not line.startswith("#"):  # Skip comments and empty lines
                    ignore_patterns.add(line)
    return ignore_patterns

def is_ignored(path: str, ignore_patterns: set, root_directory: str) -> bool:
    """
    Checks if a given path matches any of the ignore patterns.
    
    Args:
        path (str): The path to check.
        ignore_patterns (set): The set of patterns to ignore.
        root_directory (str): The root directory to resolve relative paths.
    
    Returns:
        bool: True if the path should be ignored, False otherwise.
    """
    relative_path = os.path.relpath(path, root_directory)
    for pattern in ignore_patterns:
        if pattern.startswith("/"):
            # Pattern is relative to the root directory
            if relative_path.startswith(pattern[1:]):
                return True
        else:
            # Pattern matches anywhere in the path
            if pattern in relative_path:
                return True
    return False

def generate_file_tree(directory: str, prefix: str = "", ignore_patterns: set = None, root_directory: str = None) -> str:
    """
    Recursively generates the file tree structure of a given directory, excluding files and directories
    listed in the .gitignore file.
    
    Args:
        directory (str): The directory to generate the tree for.
        prefix (str): Prefix for formatting (used internally for recursion).
        ignore_patterns (set): Patterns to ignore (from .gitignore).
        root_directory (str): The root directory to resolve relative paths.
    
    Returns:
        str: The file tree structure as a string.
    """
    if root_directory is None:
        root_directory = directory

    if not os.path.isdir(directory):
        return f"Error: {directory} is not a valid directory."

    tree = []
    try:
        entries = os.listdir(directory)
        entries.sort()  # Sort entries for consistent output
        for index, entry in enumerate(entries):
            full_path = os.path.join(directory, entry)
            if is_ignored(full_path, ignore_patterns, root_directory):
                continue  # Skip ignored files/directories

            if os.path.isdir(full_path):
                # Directory
                tree.append(f"{prefix}├── {entry}/")
                if index == len(entries) - 1:
                    tree.append(generate_file_tree(full_path, prefix + "    ", ignore_patterns, root_directory))
                else:
                    tree.append(generate_file_tree(full_path, prefix + "│   ", ignore_patterns, root_directory))
            else:
                # File
                tree.append(f"{prefix}├── {entry}")
    except Exception as e:
        return f"Error accessing {directory}: {e}"

    return "\n".join(tree)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate the file tree of a given directory, excluding files in .gitignore.")
    parser.add_argument("directory", type=str, help="Directory to generate the file tree for.")

    args = parser.parse_args()
    ignore_patterns = parse_gitignore(args.directory)
    file_tree = generate_file_tree(args.directory, ignore_patterns=ignore_patterns)

    print(f"\nFile Tree for {args.directory} (excluding .gitignore):\n")
    print(file_tree)