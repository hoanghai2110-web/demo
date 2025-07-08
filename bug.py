import os
import re

res_dir = "app/src/main/res/layout"

def fix_xml_file(path):
    with open(path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Xóa dòng trắng đầu nếu có
    if lines and lines[0].strip() == "":
        lines.pop(0)

    content = "".join(lines)

    # Nếu có "app:" và chưa có xmlns:app thì thêm vào thẻ đầu tiên
    if "app:" in content and 'xmlns:app=' not in content:
        content = re.sub(r'(<\w+[^>]*\s)(xmlns:android="[^"]+")', 
                         r'\1\2 xmlns:app="http://schemas.android.com/apk/res-auto"', 
                         content, count=1)

        print(f"✔️ Đã thêm xmlns:app cho: {path}")

    # Ghi lại file
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# Duyệt tất cả file layout
for root, dirs, files in os.walk(res_dir):
    for file in files:
        if file.endswith(".xml"):
            fix_xml_file(os.path.join(root, file))