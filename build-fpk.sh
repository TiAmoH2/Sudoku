#!/bin/bash
set -e

echo "=== Building HexaGrid 16x16 Sudoku for Feiniu fnOS ==="

# 1. Build frontend assets
echo "[1/4] Compiling frontend assets with Vite..."
npm run build

# 2. Setup FPK staging directory
OUTPUT_DIR="dist-fpk"
STAGING_DIR="dist-fpk/staging"
rm -rf "$OUTPUT_DIR"
mkdir -p "$STAGING_DIR/app/ui" "$STAGING_DIR/cmd" "$STAGING_DIR/config"

echo "[2/4] Copying package files into fnOS staging structure..."
cp manifest "$STAGING_DIR/manifest"
cp manifest.json "$STAGING_DIR/manifest.json"
cp ICON.PNG "$STAGING_DIR/ICON.PNG" 2>/dev/null || true
cp ICON_256.PNG "$STAGING_DIR/ICON_256.PNG" 2>/dev/null || true

# Copy UI config and built dist to app/ui
cp app/ui/config "$STAGING_DIR/app/ui/config"
cp -r dist/* "$STAGING_DIR/app/ui/"

# Copy lifecycle commands and configs
cp cmd/* "$STAGING_DIR/cmd/"
chmod +x "$STAGING_DIR/cmd/"*
cp config/* "$STAGING_DIR/config/"

# Copy runtime server files
cp server.ts "$STAGING_DIR/app/"
cp package.json "$STAGING_DIR/app/"

echo "[3/4] Staging directory prepared successfully in $STAGING_DIR"

# 4. Pack into .fpk if fnpack is available
FNPACK_CMD=${FNPACK_BIN:-fnpack}
if command -v "$FNPACK_CMD" >/dev/null 2>&1; then
  echo "[4/4] Packing with $FNPACK_CMD..."
  "$FNPACK_CMD" pack "$STAGING_DIR" "$OUTPUT_DIR/hexagrid-sudoku-1.0.0.fpk"
  echo ">>> Success: Generated $OUTPUT_DIR/hexagrid-sudoku-1.0.0.fpk"
else
  echo "[4/4] Note: 'fnpack' CLI tool not found in PATH."
  echo "     You can download fnpack from https://developer.fnnas.com/ and run:"
  echo "     fnpack pack $STAGING_DIR $OUTPUT_DIR/hexagrid-sudoku-1.0.0.fpk"
fi

echo "=== Build finished ==="
