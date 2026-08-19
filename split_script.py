import re

with open('index.html', 'r') as f:
    lines = f.readlines()

# Extract CSS (lines 17-2692, 0-indexed: 16-2691)
css_lines = lines[16:2692]
with open('css/style.css', 'w') as f:
    f.writelines(css_lines)

# Extract JS (lines 3635-4215, 0-indexed: 3634-4214)
js_lines = lines[3634:4215]
with open('js/script.js', 'w') as f:
    f.writelines(js_lines)

# Now rebuild index.html
# We want lines 0-14, then our link tag, then lines 2693 to 3632, then our script tag, then lines 4216 to end.
# Wait, let's just do it by replacing the blocks.

html_content = "".join(lines)
# Replace the style block
style_pattern = re.compile(r'<style>.*?</style>', re.DOTALL)
html_content = style_pattern.sub('<link rel="stylesheet" href="css/style.css">', html_content, count=1)

# Replace the script block at the end (be careful to not match the lenis script at the top)
script_pattern = re.compile(r'<script>\s*document\.addEventListener.*?<\/script>', re.DOTALL)
html_content = script_pattern.sub('<script src="js/script.js"></script>', html_content, count=1)

# Now replace media paths
# Look for src="something.extension" and replace with src="assets/images/something.extension"
# Extensions: gif, webp, jpg, avif, png, mp4
media_pattern = re.compile(r'(src=")([^"]+\.(?:gif|webp|jpg|avif|png|mp4))(")')
def replace_media(match):
    path = match.group(2)
    # Don't replace if it's an external url or already has assets/images
    if path.startswith('http') or path.startswith('assets/images/'):
        return match.group(0)
    return f'{match.group(1)}assets/images/{path}{match.group(3)}'

html_content = media_pattern.sub(replace_media, html_content)

with open('index.html', 'w') as f:
    f.write(html_content)

print("Split successful!")
