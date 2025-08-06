const fs = require('fs');
const path = require('path');

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

console.log("Starting manifest cleanup process...");

albumsList.forEach(album => {
  const directoryPath = path.join(__dirname, `../assets/albums/${album}`);
  const manifestPath = path.join(directoryPath, 'manifest.json');

  // Check if manifest.json exists
  if (!fs.existsSync(manifestPath)) {
    console.warn(`Manifest not found for album: ${album}`);
    return;
  }

  // Read the manifest.json file
  let manifest;
  try {
    const manifestData = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestData);
  } catch (err) {
    console.error(`Error reading or parsing manifest for album ${album}:`, err);
    return;
  }

  // Filter out entries for files that no longer exist
  const cleanedManifest = manifest.filter(entry => {
    const filePath = path.join(directoryPath, entry.file);
    if (fs.existsSync(filePath)) {
      return true; // Keep the entry if the file exists
    } else {
      console.warn(`File not found: ${entry.file} (removing from manifest)`);
      return false; // Remove the entry if the file does not exist
    }
  });

  // Write the cleaned manifest back to the file
  fs.writeFile(manifestPath, JSON.stringify(cleanedManifest, null, 2), err => {
    if (err) {
      console.error(`Error writing cleaned manifest for album ${album}:`, err);
    } else {
      console.log(`Manifest cleaned successfully for album: ${album}`);
    }
  });
});

console.log("Manifest cleanup process completed.");