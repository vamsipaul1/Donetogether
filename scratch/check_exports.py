import os
import re

def check_files(directory):
    duplicate_exports = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.tsx', '.ts')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        # Simple regex to find export default
                        matches = re.findall(r'^export default\s+', content, re.MULTILINE)
                        if len(matches) > 1:
                            duplicate_exports.append((path, len(matches)))
                except Exception as e:
                    print(f"Error reading {path}: {e}")
    return duplicate_exports

if __name__ == "__main__":
    src_dir = r"c:\Users\rangu\Downloads\DoneTogether\Front-end\src"
    duplicates = check_files(src_dir)
    if duplicates:
        print("Found duplicate default exports:")
        for path, count in duplicates:
            print(f"{path}: {count} exports")
    else:
        print("No duplicate default exports found in src.")
