/**
 * Image utility functions
 */

/**
 * Compresses an image file if it exceeds the specified size.
 * 
 * @param {File} file The image file to compress
 * @param {Object} options Compression options
 * @param {number} options.maxSizeMB Maximum size in MB (default 2)
 * @param {number} options.maxWidth Maximum width (default 1920)
 * @param {number} options.maxHeight Maximum height (default 1920)
 * @param {number} options.quality Initial quality (default 0.8)
 * @returns {Promise<File>} A promise that resolves to the compressed File object
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxSizeMB = 2,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8
  } = options

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  // If file is already smaller than maxSizeMB, return it as is
  if (file.size <= maxSizeBytes) {
    return file
  }

  console.log(`Compressing image: ${file.name}, current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`)

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        // Calculate new dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Iteratively reduce quality until size is under maxSizeMB
        let currentQuality = quality
        
        const getBlob = (q) => {
          return new Promise((res) => {
            canvas.toBlob((blob) => {
              res(blob)
            }, 'image/jpeg', q)
          })
        }

        const tryCompress = async (q) => {
          const blob = await getBlob(q)
          if (blob.size <= maxSizeBytes || q <= 0.2) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
            resolve(compressedFile)
          } else {
            // Reduce quality and try again
            await tryCompress(q - 0.1)
          }
        }

        tryCompress(currentQuality).catch(reject)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}
