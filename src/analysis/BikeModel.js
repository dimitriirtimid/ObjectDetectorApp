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

      // const canvas = await this.getCanvas2();
      // console.log("canvas built");

      const rawImageData = base64DecToArr(imageBase64);
      console.log('array built');

      const tensor = imageToTensor(rawImageData);
      console.log('tensor created');

      const predictions = await model.detect(tensor);
      console.log("success: ", predictions);

      return predictions;
    }
      catch (err) {
      console.log('error - ' + err);
    }
}


// Copied from https://heartbeat.fritz.ai/image-classification-on-react-native-with-tensorflow-js-and-mobilenet-48a39185717c
const  imageToTensor = (rawImageData) => {
  const TO_UINT8ARRAY = true
  const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
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