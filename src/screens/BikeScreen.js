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

/* UTF-8 array to DOMString and vice versa */

function UTF8ArrToStr (aBytes) {

  var sView = "";

  for (var nPart, nLen = aBytes.length, nIdx = 0; nIdx < nLen; nIdx++) {
    nPart = aBytes[nIdx];
    sView += String.fromCharCode(
      nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */
        /* (nPart - 252 << 30) may be not so safe in ECMAScript! So...: */
        (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */
        (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */
        (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */
        (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
      : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */
        (nPart - 192 << 6) + aBytes[++nIdx] - 128
      : /* nPart < 127 ? */ /* one byte */
        nPart
    );
  }

  return sView;

}


// /      /      7      /      A      N      g      A      /      w      D
// 111111 111111 111011 111111 000000 001101 100000 000000 111111 110000 000011
// 1111 1111 1111 1110 1111 1111 0000 0000 1101 1000 0000 0000 1111 1111 0000 0000 11
// FF        FE        FF        00        D8        00        FF        00

// const decode = str => {
//   const binstr = Base64.atob(str);
//   const arr = new Uint8Array(binstr.length);
//   for (var i = 0; i < binstr.length; i++) {
//     arr[i] = binstr.charCodeAt(i);
//   }
//   return arr;
// }

export default class BikeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isTfReady: false,
      message: 'initial',
      canvas: null,
    }
  }
// export default function App() {
  
  handleCanvas = (canvas) => {
    this.setState({ canvas });
    // const ctx = canvas.getContext('2d');
    // ctx.fillStyle = 'purple';
    // ctx.fillRect(0, 0, 100, 100);
  }

render() {
  // const img =        <Image source={require('./bicycle.jpeg')} 
  // style={{width: "10%", height: "10%"}}
  // onload={() => {
  //   console.log('Image loaded!');
  //   // ctx.drawImage(img, 0, 0);

  // }}
  // />

var myArray = base64DecToArr("QmFzZSA2NCDigJQgTW96aWxsYSBEZXZlbG9wZXIgTmV0d29yaw==");
  return (
    <View style={styles.container}>
      <Fragment>
      <Text>Open up App.tsx to start working on your app!</Text>
      <Text>{'my binary: ' + UTF8ArrToStr(myArray)}</Text>
      <Text>{this.state.message}</Text>
      <Button
                    title="Analyse"
                    onPress={ () => this.mountModel() } 
                />
       <Canvas ref={this.handleCanvas}/>
       {/* {img} */}
      </Fragment>
    </View>
  );
}

getCanvas = async () => {
  const arr = base64DecToArr(bike);
  console.log('array:' + arr[0]);
  const blob = new Blob([arr], {type : 'image/jpg'});
  console.log('blob created');
  // const canvas = createCanvas(1000, 1000);
  
  const canvas = this.state.canvas;
  if (!canvas)
    throw new Error("No canvas in state");

  const ctx = canvas.getContext('2d');
  console.log('canvas created');





  // const imageBitMap = await createImageBitmap(blob);
  // console.log('bitmap created', imageBitMap);

  // for (var prop in imageBitMap) {
  //   console.log(prop + ': ' + imageBitMap[prop]);
  // }

  // ctx.drawImage(imageBitMap, 0, 0);
  console.log('image drawn', ctx);

  console.log('decoding jpeg');
  var rawImageData = jpeg.decode(arr);
  console.log(rawImageData);

  var myImageData = ctx.getImageData(0, 0, rawImageData.width, rawImageData.height);
  // console.log('image data pre copy:', myImageData);

  for (var i = 0; i < rawImageData.width * rawImageData.height * 4; i++)
  myImageData.data[i] = rawImageData.data[i];
    // console.log('image data post copy:', myImageData);

    ctx.putImageData(myImageData, 0, 0);

  // ctx.drawImage(rawImageData, 0, 0);


  return canvas;
}


getCanvas2 = async () => {
  const arr = base64DecToArr(bike);
  console.log('array:' + arr[0]);
  // const blob = new Blob([arr], {type : 'image/jpg'});
  // console.log('blob created');
  
  const canvas = this.state.canvas;
  if (!canvas)
    throw new Error("No canvas in state");

  // const ctx = canvas.getContext('2d');
  // console.log('canvas created');


  console.log('decoding jpeg');
  var rawImageData = jpeg.decode(arr);
  // console.log(rawImageData);

  // var myImageData = ctx.getImageData(0, 0, rawImageData.width, rawImageData.height);

  // for (var i = 0; i < rawImageData.width * rawImageData.height * 4; i++)
  // myImageData.data[i] = rawImageData.data[i];

  //   ctx.putImageData(myImageData, 0, 0);

  return canvas;
}

  imageToTensor() {
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

  mountModel = async () => {
    // Wait for tf to be ready.
    try{
    console.log("starting tf");
    await tf.ready();        
    this.setState({  message: 'tf ready' });
    // Signal to the app that tensorflow.js can now be used.
    console.log("tf ready");
    // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
    // const model = await tf.loadLayersModel('https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/model.json');

    const model = await cocoSsd.load();
    this.setState({  message: 'model loaded' });
    console.log("model loaded");

    // const canvas = await this.getCanvas2();
    // console.log("canvas built");

    const tensor = this.imageToTensor();
    console.log('tensor created');

    // const predictions = await model.detect(canvas);
    const predictions = await model.detect(tensor);
    this.setState({  message: 'success: ' + predictions });
    console.log("success: ", predictions);

    }
    catch (err) {
    this.setState({  message: 'error - ' + err });

    }

  }

}
