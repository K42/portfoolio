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
]

albumsList.forEach(album => {

    const directoryPath = path.join(__dirname, `../assets/albums/${album}`);
    const manifestPath = path.join(directoryPath, 'manifest.json');
    
    // Read all files in the directory
    fs.readdir(directoryPath, (err, files) => {
      if (err) {
        return console.error('Unable to scan directory:', err);
      }
    
      // Filter image files and create JSON entries
      const jsonList = files
        .filter(file => /\.(jpg|jpeg|png)$/i.test(file))
        .filter(file => file !== 'cover.jpg' && file !== 'cover.png')
        .map(file => ({
          file: file,
          title: path.parse(file).name,
          camera: file.camera || '',
          lens: file.lens || '',
          focal: file.focal || '',
          aperture: file.aperture || '',
          shutter: file.shutter || '',
          iso: file.iso || ''
        }));
    
      // Write the updated manifest.json
      fs.writeFile(manifestPath, JSON.stringify(jsonList, null, 2), err => {
        if (err) {
          return console.error('Error writing JSON file:', err);
        }
        console.log('Manifest updated successfully for album:', album);
      });
    });
});