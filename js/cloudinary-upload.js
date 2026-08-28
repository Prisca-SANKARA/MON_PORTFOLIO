import { cloudinaryConfig } from './firebase-config.js';

/**
 * Upload un fichier vers Cloudinary (upload "unsigned", pas besoin de backend).
 * @param {File} file
 * @param {'image'|'raw'|'auto'} resourceType - 'image' pour photos, 'raw' pour PDF/documents
 * @param {(percent:number)=>void} onProgress
 * @returns {Promise<string>} l'URL sécurisée (https) du fichier uploadé
 */
export function uploadFileToCloudinary(file, resourceType = 'image', onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('Aucun fichier fourni'));

    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'portfolio');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (res.secure_url) resolve(res.secure_url);
        else reject(new Error(res.error?.message || 'Échec upload Cloudinary'));
      } catch (err) {
        reject(err);
      }
    };
    xhr.onerror = () => reject(new Error('Erreur réseau pendant l\'upload'));
    xhr.send(formData);
  });
}

/** Raccourci pour les images (comportement historique de cette fonction). */
export function uploadImageToCloudinary(file, onProgress = () => {}) {
  return uploadFileToCloudinary(file, 'image', onProgress);
}
