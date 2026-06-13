#!/bin/bash

TARGET_DIR="../poe2-price-checker/dataParser"

rsync -av --exclude-from='.gitignore' --exclude='data/json' --exclude='data/vendor' --exclude="*.ipynb" --exclude="*.json" --exclude='.git' ./ "$TARGET_DIR"

cp ./data/vendor/config.json "$TARGET_DIR/data/vendor"

echo "Files successfully copied to $TARGET_DIR, excluding git-ignored files and 'data' directory."
