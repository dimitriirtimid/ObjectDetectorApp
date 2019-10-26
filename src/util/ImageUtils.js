
// Buffer should contain at least 3 bytres (UInt8 entries) (RGB) per pixel
export const resizeImage = (buffer, width, height, targetBuffer, targetWidth, targetHeight, inputBufferBytesPerPixel=3) => {
    if (targetWidth > width || targetHeight > height)
      throw new Error("Error resizing, target width and height may not exceed orginal width and height");
  
    let targetIdx = 0;
    for (let i = 0; i < targetHeight; i++) {
      for (let j = 0; j < targetWidth; j++) {
        const x = Math.round(width*j/targetWidth);
        const y = Math.round(height*i/targetHeight);
        const idx = (y*width + x)*inputBufferBytesPerPixel;
  
        targetBuffer[targetIdx++] = buffer[idx + 0];
        targetBuffer[targetIdx++] = buffer[idx + 1];
        targetBuffer[targetIdx++] = buffer[idx + 2];
      }
    }
  }