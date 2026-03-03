#!/bin/bash

# Upload script for Cloudflare R2
# Usage: ./scripts/upload.sh path/to/file.png
#
# Prerequisites:
# 1. Install wrangler: npm install -g wrangler
# 2. Login to Cloudflare: wrangler login
# 3. Set R2_BUCKET_NAME below

R2_BUCKET_NAME="thomasdhughes-media"
MEDIA_DOMAIN="media.thomasdhughes.com"

# Check if file argument is provided
if [ -z "$1" ]; then
    echo "Usage: ./scripts/upload.sh <file_path>"
    echo "Example: ./scripts/upload.sh ~/Desktop/my-image.png"
    exit 1
fi

FILE_PATH="$1"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found: $FILE_PATH"
    exit 1
fi

# Get filename
FILENAME=$(basename "$FILE_PATH")

# Generate a unique name with timestamp to avoid conflicts
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
EXTENSION="${FILENAME##*.}"
BASENAME="${FILENAME%.*}"
UNIQUE_NAME="${BASENAME}-${TIMESTAMP}.${EXTENSION}"

echo "Uploading $FILENAME to R2..."

# Upload to R2 using wrangler
wrangler r2 object put "$R2_BUCKET_NAME/$UNIQUE_NAME" --file="$FILE_PATH"

if [ $? -eq 0 ]; then
    URL="https://${MEDIA_DOMAIN}/${UNIQUE_NAME}"

    # Determine markdown syntax based on file type
    case "${EXTENSION,,}" in
        jpg|jpeg|png|gif|webp|svg)
            MARKDOWN="![${BASENAME}](${URL})"
            ;;
        mp4|webm|mov)
            MARKDOWN="<video src=\"${URL}\" controls width=\"100%\"></video>"
            ;;
        *)
            MARKDOWN="[${FILENAME}](${URL})"
            ;;
    esac

    echo ""
    echo "✓ Upload successful!"
    echo ""
    echo "URL: $URL"
    echo ""
    echo "Markdown (copied to clipboard):"
    echo "$MARKDOWN"

    # Copy to clipboard (works on macOS)
    echo -n "$MARKDOWN" | pbcopy 2>/dev/null && echo "(Copied to clipboard!)" || echo "(Install pbcopy for clipboard support)"
else
    echo "Error: Upload failed"
    exit 1
fi
