import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import jpeg from 'jpeg-js';
import { base64DecToArr } from '../util/Base64';
import { resizeImage } from '../util/ImageUtils';
import * as cocoSsd from '@tensorflow-models/coco-ssd';


const targetWidth = 100;
const targetHeight = 100;       // when set to 0 targetHeight will be calculated while retaining the aspect ratio

let model = null;
let modelPromise = null;

export const triggerLoadModel = () => {
  if (!modelPromise)
    modelPromise = loadModel();
}

export const loadModel = async () => {
  if (!model) {
    console.log("starting tf");
    await tf.ready();        
    console.log("tf ready");
    // const model = await tf.loadLayersModel(asyncStorageIO('object-detector-model')); --> does not work with expo
    // await model.save(asyncStorageIO('object-detector-model')); --> does not work with expo

    // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json');
    model = await cocoSsd.load();
    console.log("model loaded");
  }
}


// Thanks to https://heartbeat.fritz.ai/image-classification-on-react-native-with-tensorflow-js-and-mobilenet-48a39185717c

export const analyse = async (imageBase64) => {
  try {
    const startTime = Date.now();

    await loadModel();
    console.log((Date.now() - startTime) + " model loaded");

    let rawImageData = base64DecToArr(imageBase64);
    console.log((Date.now() - startTime) + ' array built');

    const TO_UINT8ARRAY = true
    let { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY)
    console.log((Date.now() - startTime) + " image decoded: ", { width, height, length: data.length });
    rawImageData = null;  // release memory

    const actualTargetHeight = targetHeight > 0 ? targetHeight : Math.round(targetWidth*height/width);
    console.log("resizing to " + targetWidth + "x" + actualTargetHeight);

    let targetBuffer = new Uint8Array(targetWidth * actualTargetHeight * 3)
    console.log((Date.now() - startTime) + ' buffer created');

    resizeImage(data, width, height, targetBuffer, targetWidth, actualTargetHeight, 4);
    console.log((Date.now() - startTime) + ' image resized');
    data = null;          // release memory
  
    const tensor = tf.tensor3d(targetBuffer, [targetWidth, actualTargetHeight, 3])
    console.log((Date.now() - startTime) + ' tensor created');
    targetBuffer = null;  // release memory

    const predictions = await model.detect(tensor);
    console.log((Date.now() - startTime) + " success: ", predictions);
    return predictions;
  }
    catch (err) {
    console.log('error - ' + err);
    return [];
  }
}
