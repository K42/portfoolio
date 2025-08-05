const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

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

const MAX_SIZE = 3000; // Maximum size for the larger side
const OUTPUT_QUALITY = 95; // JPEG quality (0-100)
const aggressive = true; // Set to true to overwrite original files

console.log("Starting photo resizing process...");

albumsList.forEach((album) => {
  console.log(`Processing album: ${album}`);
  const directoryPath = path.join(__dirname, `../assets/albums/${album}`);
  const outputDirectory = aggressive ? directoryPath : path.join(directoryPath, 'resized');

  // Ensure the output directory exists (if not in aggressive mode)
  if (!aggressive && !fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  // Read all files in the directory
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.error(`Error reading directory for album ${album}:`, err);
    }

    files
      .filter(file => /\.(jpg|jpeg|png)$/i.test(file)) // Process only image files
      .forEach(file => {
        const inputFilePath = path.join(directoryPath, file);
        const outputFilePath = aggressive ? `${inputFilePath}.tmp` : path.join(outputDirectory, file);

        sharp(inputFilePath)
          .resize({
            width: MAX_SIZE,
            height: MAX_SIZE,
            fit: sharp.fit.inside, // Ensures the image fits within the dimensions
            withoutEnlargement: true // Prevents upscaling smaller images
          })
          .toFormat('jpeg', { quality: OUTPUT_QUALITY }) // Convert to JPEG with high quality
          .toFile(outputFilePath)
          .then(() => {
            if (aggressive) {
              // Replace the original file with the temporary file
              fs.renameSync(outputFilePath, inputFilePath);
              console.log(`Resized and overwritten: ${inputFilePath}`);
            } else {
              console.log(`Resized and saved: ${outputFilePath}`);
            }
          })
          .catch(err => {
            console.error(`Error resizing file ${file}:`, err);
          });
      });
  });
});

console.log("Photo resizing process started...");