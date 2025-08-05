const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../assets/albums/grzyby');
const manifestPath = path.join(directoryPath, 'manifest.json');

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    return console.error('Unable to scan directory:', err);
  }

  // Filter image files and create JSON entries
  const jsonList = files
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file)) // Include only image files
    .map(file => ({
      file: file,
      title: path.parse(file).name
    }));

  // Write the updated manifest.json
  fs.writeFile(manifestPath, JSON.stringify(jsonList, null, 2), err => {
    if (err) {
      return console.error('Error writing JSON file:', err);
    }
    console.log('Manifest updated successfully!');
  });
});