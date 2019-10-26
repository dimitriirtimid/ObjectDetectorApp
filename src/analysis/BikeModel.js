import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import jpeg from 'jpeg-js';
import { base64DecToArr } from '../util/Base64';
import { resizeImage } from '../util/ImageUtils';
import * as cocoSsd from '@tensorflow-models/coco-ssd';


const targetWidth = 100;
const targetHeight = 100;


// Thanks to https://heartbeat.fritz.ai/image-classification-on-react-native-with-tensorflow-js-and-mobilenet-48a39185717c

  export const analyse = async (imageBase64) => {
    try {
      console.log("starting tf");
      await tf.ready();        
      console.log("tf ready");

      // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json');
      const model = await cocoSsd.load();
      console.log("model loaded");

      let rawImageData = base64DecToArr(imageBase64);
      console.log('array built');

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
    
      const buffer2 = resizeImage(buffer, width, height, targetWidth, targetHeight);
      console.log('image resized');
      buffer = null;  // release memory
    
      const tensor = tf.tensor3d(buffer2, [targetWidth, targetHeight, 3])
      console.log('tensor created');
      rawImageData = null;  // release memory

      const predictions = await model.detect(tensor);
      console.log("success: ", predictions);
      return predictions;
    }
      catch (err) {
      console.log('error - ' + err);
      return [];
    }
}
