export const urlToBase64 = (url: string): Promise<string | undefined> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(undefined)
        return
      }
      ctx.drawImage(img, 0, 0)
      try {
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      } catch {
        resolve(undefined)
      }
    }
    img.onerror = () => {
      resolve(undefined)
    }
    img.src = url
  })
}
