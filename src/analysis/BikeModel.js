import React, { Fragment } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { createCanvas } from 'canvas';
// import { Base64 } from 'js-base64';
import Canvas from 'react-native-canvas';
import jpeg from 'jpeg-js';


import bike from '../../images/bicycle_base64_bin';

import * as cocoSsd from '@tensorflow-models/coco-ssd';
// var fs = require('fs');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* Array of bytes to base64 string decoding */

function b64ToUint6 (nChr) {

  return nChr > 64 && nChr < 91 ?
      nChr - 65
    : nChr > 96 && nChr < 123 ?
      nChr - 71
    : nChr > 47 && nChr < 58 ?
      nChr + 4
    : nChr === 43 ?
      62
    : nChr === 47 ?
      63
    :
      0;

}

function base64DecToArr (sBase64, nBlockSize) {

  var
    sB64Enc = sBase64.replace(/[^A-Za-z0-9\+\/]/g, ""), nInLen = sB64Enc.length,
    nOutLen = nBlockSize ? Math.ceil((nInLen * 3 + 1 >>> 2) / nBlockSize) * nBlockSize : nInLen * 3 + 1 >>> 2, aBytes = new Uint8Array(nOutLen);

  for (var nMod3, nMod4, nUint24 = 0, nOutIdx = 0, nInIdx = 0; nInIdx < nInLen; nInIdx++) {
    nMod4 = nInIdx & 3;
    nUint24 |= b64ToUint6(sB64Enc.charCodeAt(nInIdx)) << 18 - 6 * nMod4;
    if (nMod4 === 3 || nInLen - nInIdx === 1) {
      for (nMod3 = 0; nMod3 < 3 && nOutIdx < nOutLen; nMod3++, nOutIdx++) {
        aBytes[nOutIdx] = nUint24 >>> (16 >>> nMod3 & 24) & 255;
      }
      nUint24 = 0;
    }
  }

  return aBytes;
}


const  imageToTensor = () => {
    const rawImageData = base64DecToArr(bike);
    console.log('array built');

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

  export const analyse = async () => {
    // Wait for tf to be ready.
    try{
    console.log("starting tf");
    await tf.ready();        
    // Signal to the app that tensorflow.js can now be used.
    console.log("tf ready");
    // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json');

    const model = await cocoSsd.load();
    console.log("model loaded");

    // const canvas = await this.getCanvas2();
    // console.log("canvas built");

    const tensor = imageToTensor();
    console.log('tensor created');

    // const predictions = await model.detect(canvas);
    const predictions = await model.detect(tensor);
    console.log("success: ", predictions);

    return predictions;
    }
    catch (err) {
    console.log('error - ' + err);

    }

}
