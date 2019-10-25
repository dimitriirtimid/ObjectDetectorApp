import * as bodyPix from '@tensorflow-models/body-pix';

// const img = document.getElementById('image');
const img = 'dummy';

export async function loadAndPredict() {
    console.log('starting load and predict');
  const net = await bodyPix.load(/** optional arguments, see below **/);
  console.log('net:', net);

  /**
   * One of (see documentation below):
   *   - net.segmentPerson
   *   - net.segmentPersonParts
   *   - net.segmentMultiPerson
   *   - net.segmentMultiPersonParts
   * See documentation below for details on each method.
    */
  const segmentation = await net.segmentPerson(img);
  console.log(segmentation);
}
// loadAndPredict();