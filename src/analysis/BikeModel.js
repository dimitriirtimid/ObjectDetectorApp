import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import jpeg from 'jpeg-js';
import { base64DecToArr } from '../util/Base64'

import bike from '../../images/bicycle_base64_bin';
import * as cocoSsd from '@tensorflow-models/coco-ssd';


  export const analyse_bike = async () => {
    return await analyse(bike);
  }

  export const analyse = async (imageBase64) => {
    try {
      console.log("starting tf");
      await tf.ready();        
      // Signal to the app that tensorflow.js can now be used.
      console.log("tf ready");
      // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json');

      const model = await cocoSsd.load();
      console.log("model loaded");

      let rawImageData = base64DecToArr(imageBase64);
      console.log('array built');

      // const tensor = imageToTensor(rawImageData);
      // const tensor = imageToTensorScaled(rawImageData);
      const tensor = imageToTensorScaled2(rawImageData);
      console.log('tensor created');

      rawImageData = null;

      const predictions = await model.detect(tensor);
      console.log("success: ", predictions);

      return predictions;
      // return [];
    }
      catch (err) {
      console.log('error - ' + err);
      return [];
    }
}


// Copied from https://heartbeat.fritz.ai/image-classification-on-react-native-with-tensorflow-js-and-mobilenet-48a39185717c
const  imageToTensor = (rawImageData) => {
  const TO_UINT8ARRAY = true
  const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
  console.log("image decoded: ", { width, height, length: data.length });
  // Drop the alpha channel info for mobilenet
  const buffer = new Uint8Array(width * height * 3)
  let offset = 0 // offset into original data
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset]
    buffer[i + 1] = data[offset + 1]
    buffer[i + 2] = data[offset + 2]

    offset += 4
  }

  return tf.tensor3d(buffer, [height, width, 3])
}

const  imageToTensorScaled = (rawImageData) => {
  const TO_UINT8ARRAY = true
  let { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
  console.log("image decoded: ", { width, height, length: data.length });
  // Drop the alpha channel info for mobilenet
  let buffer = new Uint8Array(width * height * 3)
  let offset = 0 // offset into original data
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset]
    buffer[i + 1] = data[offset + 1]
    buffer[i + 2] = data[offset + 2]

    offset += 4
  }
  data = null;  // release memory

  const buffer2 = new Uint8Array((width/2) * (height/2) * 3)

  let idx = 0;
  for (let i = 0; i < height; i += 2)
    for (let j = 0; j < width; j += 6) {
      buffer2[idx++] = buffer[i*width + j + 0];
      buffer2[idx++] = buffer[i*width + j + 1];
      buffer2[idx++] = buffer[i*width + j + 2];
    }

  buffer = null;  // release memory
  return tf.tensor3d(buffer2, [height/2, width/2, 3])
}

const  imageToTensorScaled2 = (rawImageData) => {
  const targetWidth = 100;
  const targetHeight = 100;

  const TO_UINT8ARRAY = true
  let { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
  console.log("image decoded: ", { width, height, length: data.length });
  // Drop the alpha channel info for mobilenet
  let buffer = new Uint8Array(width * height * 3)
  let offset = 0 // offset into original data
  for (let i = 0; i < buffer.length; i += 3) {
    buffer[i] = data[offset]
    buffer[i + 1] = data[offset + 1]
    buffer[i + 2] = data[offset + 2]

    offset += 4
  }
  data = null;  // release memory

  // const buffer2 = new Uint8Array(targetWidth * targetHeight * 3)

  // let idx = 0;
  // for (let i = 0; i < targetHeight; i++)
  //   for (let j = 0; j < targetWidth; j += 3) {
  //     buffer2[idx++] = buffer[i*width + j + 0];
  //     buffer2[idx++] = buffer[i*width + j + 1];
  //     buffer2[idx++] = buffer[i*width + j + 2];
  //   }

  const buffer2 = resizeImage(buffer, width, height, targetWidth, targetHeight);
  buffer = null;  // release memory

  return tf.tensor3d(buffer2, [targetWidth, targetHeight, 3])
}

// Buffer should contain 3 UInt8 entries (RGB) per pixel
const resizeImage = (buffer, width, height, targetWidth, targetHeight) => {
  if (targetWidth > width || targetHeight > height)
    throw new Error("Error resizing, target width and height may not exceed orginal width and height");

  let targetBuffer = new Uint8Array(targetWidth * targetHeight * 3)

  let targetIdx = 0;
  for (let i = 0; i < targetHeight; i++)
    for (let j = 0; j < targetWidth; j++) {
      const x = Math.round(width*j/targetWidth);
      const y = Math.round(height*i/targetHeight);
      const idx = (y*width + x)*3;

      targetBuffer[targetIdx++] = buffer[idx + 0];
      targetBuffer[targetIdx++] = buffer[idx + 1];
      targetBuffer[targetIdx++] = buffer[idx + 2];
    }

  return targetBuffer;
}