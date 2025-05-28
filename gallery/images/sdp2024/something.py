import os

def rename_jpg_files(folder_path):
    """Renames all .jpg files in the given folder with sequential numbers."""
    
    if not os.path.exists(folder_path):
        print(f"Error: Folder '{folder_path}' not found.")
        return

    jpg_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.jpg')]
    jpg_files.sort() # Sort files alphabetically for consistent renaming

    for index, filename in enumerate(jpg_files):
        src = os.path.join(folder_path, filename)
        dst = os.path.join(folder_path, f"{index + 1}.jpg")
        os.rename(src, dst)
        print(f"Renamed {filename} to {index + 1}.jpg")
    
    print(f"Renamed {len(jpg_files)} .jpg files in '{folder_path}'.")
    input("")

if __name__ == "__main__":
    folder_path = input("Enter the path to the folder containing .jpg files: ")
    rename_jpg_files(folder_path)