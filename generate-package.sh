#!/bin/bash
# Tizen Build Package Generator
# This script generates an Samsung Tizen build package (.wgt file) from a given directory

# Function to display usage information
usage() {
    echo "Usage: $0 <source_directory> [output_directory]"
    echo "  <source_directory>: The directory containing your Tizen app source code"
    echo "  [output_directory]: Optional. The directory where the .ipk file will be saved. Defaults to the current directory."
    exit 1
}

# Check if at least one argument is provided
if [ "$#" -lt 1 ]; then
    usage
fi

# Assign arguments to variables
SOURCE_DIR="$1"
OUTPUT_DIR="../${2:-.}"  # Use second argument if provided, otherwise use current directory

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Source directory does not exist."
    exit 1
fi

# Navigate to the source directory
cd "$SOURCE_DIR" || exit 1

# Check if package.json exists and read version
if [ ! -f "../package.json" ]; then
    echo "Error: package.json not found in the specified folder."
    exit 1
fi

# Read version from package.json
# Try using jq if available, otherwise fall back to grep/sed
if command -v jq >/dev/null 2>&1; then
    VERSION=$(jq -r .version ../package.json)
else
    VERSION=$(grep -o '"version": "[^"]*"' ../package.json | cut -d'"' -f4)
fi

if [ -z "$VERSION" ]; then
    echo "Error: Could not read version from package.json"
    exit 1
fi

# Check if output directory exists, create if it doesn't
if [ ! -d "$OUTPUT_DIR" ]; then
    echo "Error: Destination directory does not exist."
    mkdir -p "$OUTPUT_DIR"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create output directory."
        exit 1
    fi
fi

# Check if config.xml exists
if [ ! -f "config.xml" ]; then
    echo "Error: config.xml not found in the specified folder."
    exit 1
fi

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)

# Copy all files to the temporary directory
cp -R ./* "$TEMP_DIR"

# Generate the signature file
tizen certificate --alias MyTizenCert --password MyPassword

# Sign the widget
tizen security-profiles add --name MyProfile --author MyTizenCert --password MyPassword

# Package the widget
tizen package -t wgt -s MyProfile -- "$TEMP_DIR"

# Move the .wgt file to the output directory with version
for file in "$TEMP_DIR"/*.wgt; do
    filename=$(basename "$file")
    new_filename="${filename%.*}_${VERSION}.wgt"
    mv "$file" "$OUTPUT_DIR/$new_filename"
done

# Clean up
rm -rf "$TEMP_DIR"

echo "Widget file (.wgt) has been generated successfully with version ${VERSION}."
