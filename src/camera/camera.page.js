// src/camera.page.js file
import React from 'react';
import { View, Text, Image, Button } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import Toolbar from './toolbar.component';
import Gallery from './gallery.component';
import styles from './styles';
import loadAndPredict from '../tsexample/bodypix';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

import * as cocoSsd from '@tensorflow-models/coco-ssd';


export default class CameraPage extends React.Component {
    camera = null;
    state = {
        captures: [],
        // setting flash to be turned off by default
        flashMode: Camera.Constants.FlashMode.off,
        capturing: null,
        // start the back camera by default
        cameraType: Camera.Constants.Type.back,
        hasCameraPermission: null,

        lastImageUri: null,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync();
        this.setState({ capturing: false, captures: [photoData, ...this.state.captures], lastImageUri: photoData.uri })
    };

    handleLongCapture = async () => {
        const videoData = await this.camera.recordAsync();
        this.setState({ capturing: false, captures: [videoData, ...this.state.captures] });
    };
    async componentDidMount() {
        const camera = await Permissions.askAsync(Permissions.CAMERA);
        const audio = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
        const hasCameraPermission = (camera.status === 'granted' && audio.status === 'granted');

        this.setState({ hasCameraPermission });
    };

    runModel = async () => {
        console.log('trying to load');

        const model = await tf.loadLayersModel('file://Users/dimitri/Downloads/model1/model.json');
        console.log('loaded');

        // loadAndPredict();
    }
    runModel3 = () => {
        // const img = document.getElementById('testimage');       // fails as we have no document in a native app
        const img = this.state.lastImageUri;
        
        // Load the model.
        console.log('cocoSsd', cocoSsd);
        let model;
        cocoSsd.load()
        .then( m => {
            model = m
            console.log('model', model);
        })
        .catch(err => { 
            console.log('error22:', err)
        });

        // Classify the image.
        // const predictions = await model.detect(img);
        const predictions = "hoi";
        console.log('Predictions: ');
        console.log(predictions);
    }

    runModel2 = async () => {
        // const img = document.getElementById('testimage');       // fails as we have no document in a native app
        const img = this.state.lastImageUri;
        
        // Load the model.
        console.log('cocoSsd', cocoSsd);
        const model = await cocoSsd.load({});
        console.log('model', model);
        // Classify the image.
        // const predictions = await model.detect(img);
        const predictions = "hoi";
        console.log('Predictions: ');
        console.log(predictions);
    }

    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, captures, lastImageUri } = this.state;

        if (hasCameraPermission === null) {
            return <Text>Please allow this app to access the camera.</Text>;
        } else if (hasCameraPermission === false) {
            return <Text>Access to camera has been denied. </Text>;
        }

        console.log('lastimageuri:', lastImageUri);

        return (

            <View flex="1">
                { !lastImageUri ?
                <React.Fragment>
                    <Camera
                        type={cameraType}
                        flashMode={flashMode}
                        style={styles.preview}
                        ref={camera => this.camera = camera}
                    />

                    {captures.length > 0 && <Gallery captures={captures}/>}
                    <Toolbar 
                        capturing={capturing}
                        flashMode={flashMode}
                        cameraType={cameraType}
                        setFlashMode={this.setFlashMode}
                        setCameraType={this.setCameraType}
                        onCaptureIn={this.handleCaptureIn}
                        onCaptureOut={this.handleCaptureOut}
                        onLongCapture={this.handleLongCapture}
                        onShortCapture={this.handleShortCapture}
                    />
                </React.Fragment>
                :
                <React.Fragment>
                <Text>Begin image</Text>
                <Image id="testimage" source={{ uri: lastImageUri }} style={styles.galleryImage} />
                <Button
                    title="Analyse"
                    onPress={this.runModel} 
                />
                <Text>End image</Text>
                </React.Fragment>

                }

            </View>
        );
    };
};