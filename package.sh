#!/bin/bash
# ─────────────────────────────────────────────────────────
# MedPad Installer Builder
# Creates native installers using jpackage
# - macOS: .dmg   (run this script on macOS)
# - Windows: .msi (run this script on Windows)
# ─────────────────────────────────────────────────────────

set -e

APP_NAME="MedPad"
APP_VERSION="1.0.0"
VENDOR="MedPad"
DESCRIPTION="Prescription writing application for doctors"
MAIN_JAR="medpad-1.0-SNAPSHOT.jar"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$PROJECT_DIR/target"
JAR_PATH="$TARGET_DIR/$MAIN_JAR"
OUTPUT_DIR="$TARGET_DIR/installer"

# ─── Check prerequisites ────────────────────────────────
if [ ! -f "$JAR_PATH" ]; then
    echo "JAR not found. Building first..."
    mvn clean package -DskipTests -q -f "$PROJECT_DIR/pom.xml"
fi

if ! command -v jpackage &> /dev/null; then
    JPACKAGE="$JAVA_HOME/bin/jpackage"
    if [ ! -f "$JPACKAGE" ]; then
        echo "ERROR: jpackage not found. Ensure JDK 17+ is installed."
        exit 1
    fi
else
    JPACKAGE="jpackage"
fi

# ─── Clean output directory ─────────────────────────────
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

# ─── Detect OS and set installer type ───────────────────
OS_TYPE="$(uname -s)"
case "$OS_TYPE" in
    Darwin*)
        INSTALLER_TYPE="dmg"
        echo "Building macOS .dmg installer..."
        ;;
    MINGW*|MSYS*|CYGWIN*|Windows*)
        INSTALLER_TYPE="msi"
        echo "Building Windows .msi installer..."
        ;;
    Linux*)
        INSTALLER_TYPE="deb"
        echo "Building Linux .deb installer..."
        ;;
    *)
        echo "Unknown OS: $OS_TYPE"
        exit 1
        ;;
esac

# ─── Build the installer ────────────────────────────────
$JPACKAGE \
    --type "$INSTALLER_TYPE" \
    --name "$APP_NAME" \
    --app-version "$APP_VERSION" \
    --vendor "$VENDOR" \
    --description "$DESCRIPTION" \
    --input "$TARGET_DIR" \
    --main-jar "$MAIN_JAR" \
    --main-class org.springframework.boot.loader.launch.JarLauncher \
    --dest "$OUTPUT_DIR" \
    --java-options "-Dserver.port=8080" \
    --java-options "-Dspring.datasource.url=jdbc:h2:file:~/medpad_data/medpad_db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE"

echo ""
echo "════════════════════════════════════════════════════"
echo "  Installer created successfully!"
echo "  Location: $OUTPUT_DIR"
ls -lh "$OUTPUT_DIR"/*."$INSTALLER_TYPE"
echo ""
echo "  After installing, open http://localhost:8080"
echo "  in your browser to use MedPad."
echo "════════════════════════════════════════════════════"
