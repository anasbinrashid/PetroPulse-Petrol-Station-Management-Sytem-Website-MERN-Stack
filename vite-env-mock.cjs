// This file will be used to transform import.meta.env references in tests
module.exports = {
  process(sourceText, sourcePath) {
    return {
      code: sourceText.replace(/import\.meta\.env/g, '({ VITE_API_URL: "http://localhost:3000", MODE: "test", DEV: true, PROD: false })'),
    };
  },
}; 