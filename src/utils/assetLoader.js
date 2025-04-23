// src/utils/assetLoader.js
// Utility for loading assets (images, etc.) for useAsset hook and tests.
// Modular, reusable, and testable for high maintainability.

export const assetLoader = {
  loadImage: (src, options = {}) => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      Object.assign(img, options);
      img.src = src;
    });
  },
  // Add other asset loading utilities as needed for scalability.
};
