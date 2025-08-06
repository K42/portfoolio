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

albumsList.forEach(album => {
  const directoryPath = path.join(__dirname, `../assets/albums/${album}`);
  const manifestPath = path.join(directoryPath, 'manifest.json');

  // Read all files in the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error('Unable to scan directory:', err);
    }

    // Filter image files
    const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file))
      .filter(file => file !== 'cover.jpg' && file !== 'cover.png');

    // Read the existing manifest.json file
    let existingManifest = [];
    if (fs.existsSync(manifestPath)) {
      try {
        const manifestData = fs.readFileSync(manifestPath, 'utf8');
        existingManifest = JSON.parse(manifestData);
      } catch (err) {
        console.error(`Error reading or parsing manifest for album ${album}:`, err);
      }
    }

    // Create a map of existing entries for quick lookup
    const existingEntriesMap = new Map(
      existingManifest.map(entry => [entry.file, entry])
    );

    // Merge new data with existing data
    const updatedManifest = imageFiles.map(file => {
      const existingEntry = existingEntriesMap.get(file) || {};
      return {
        file: file,
        title: existingEntry.title || '',
        camera: existingEntry.camera || '',
        lens: existingEntry.lens || '',
        focal: existingEntry.focal || '',
        aperture: existingEntry.aperture || '',
        shutter: existingEntry.shutter || '',
        iso: existingEntry.iso || ''
      };
    });

    // Write the updated manifest.json
    fs.writeFile(manifestPath, JSON.stringify(updatedManifest, null, 2), err => {
      if (err) {
        return console.error('Error writing JSON file:', err);
      }
      console.log('Manifest updated successfully for album:', album);
    });
  });
});