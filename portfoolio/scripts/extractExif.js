const fs = require('fs');
const path = require('path');
const { exiftool } = require('exiftool-vendored');

const albumsList = [
  "brenna2025",
  "grzyby",
  "brenna2024",
  "landscape",
  "sojki2025",
  "natura",
  "ptaki",
  "zwierza"
];

console.log("Starting EXIF extraction process...");

albumsList.forEach(async (album) => {
  console.log(`Processing album: ${album}`);
  const directoryPath = path.join(__dirname, `../assets/albums/${album}`);
  const manifestPath = path.join(directoryPath, 'manifest.json');

  // Read the manifest.json file
  fs.readFile(manifestPath, 'utf8', async (err, data) => {
    if (err) {
      return console.error(`Error reading manifest for album ${album}:`, err);
    }

    console.log(`Successfully read manifest for album: ${album}`);

    let manifest;
    try {
      manifest = JSON.parse(data);
    } catch (parseErr) {
      return console.error(`Error parsing manifest for album ${album}:`, parseErr);
    }

    // Process each file in the manifest
    for (const entry of manifest) {
      const filePath = path.join(directoryPath, entry.file);
      console.log(`Processing file: ${entry.file}`);

      try {
        // Extract EXIF data
        const exifData = await exiftool.read(filePath);
        console.log(`Extracted EXIF data for file: ${entry.file}`);

        // Update only blank fields in the manifest entry
        entry.camera = entry.camera || exifData.Make || '';
        entry.lens = entry.lens || exifData.LensModel || '';
        entry.focal = entry.focal || exifData.FocalLength || '';
        entry.aperture = entry.aperture || exifData.FNumber || '';
        entry.shutter = entry.shutter || exifData.ExposureTime || '';
        entry.iso = entry.iso || exifData.ISO || '';
        console.log(`Updated manifest entry for file: ${entry.file}`);
      } catch (exifErr) {
        console.error(`Error extracting EXIF data for file ${entry.file}:`, exifErr);
      }
    }

    // Write the updated manifest.json
    fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), (writeErr) => {
      if (writeErr) {
        return console.error(`Error writing updated manifest for album ${album}:`, writeErr);
      }
      console.log(`Manifest updated successfully with EXIF data for album: ${album}`);
    });
  });
});

// Ensure exiftool process is properly closed
process.on('exit', () => {
  console.log("Closing exiftool process...");
  exiftool.end();
  console.log("EXIF extraction process completed.");
});