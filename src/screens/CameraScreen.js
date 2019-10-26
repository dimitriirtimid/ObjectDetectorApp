// src/camera.page.js file
import React from 'react';
import { View, Text, Image, Button } from 'react-native';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import Toolbar from '../components/CameraToolbar';
import styles from '../styles/CameraStyles';
import '@tensorflow/tfjs-react-native';
import * as model from '../analysis/BikeModel';

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
        predictions: null,
    };

    setFlashMode = (flashMode) => this.setState({ flashMode });
    setCameraType = (cameraType) => this.setState({ cameraType });
    handleCaptureIn = () => this.setState({ capturing: true });

    handleCaptureOut = () => {
        if (this.state.capturing)
            this.camera.stopRecording();
    };

    handleShortCapture = async () => {
        const photoData = await this.camera.takePictureAsync( {base64: true} );
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


    analyse = async () => {
        this.setState({  message: 'analyzing' });

        const capture64 = this.state.captures[0].base64;
        const predictions = await model.analyse(capture64);
        this.setState({  message: 'success: ' + predictions , predictions});
    }

    reset = () => {
        this.setState({lastImageUri: null, predictions: null});
    }
    render() {
        const { hasCameraPermission, flashMode, cameraType, capturing, lastImageUri, predictions } = this.state;
        const analysisReady = lastImageUri && (predictions !== null);

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
                    <Image id="testimage" source={{ uri: lastImageUri }} style={styles.galleryImage} />
                    <Button
                        title={analysisReady ? "Again" : "Analyse"}
                        onPress={analysisReady ? this.reset : this.analyse} 
                    />
                    { analysisReady && this.state.predictions.length === 0 && <Text>I don't know this</Text>}
                    { analysisReady && this.state.predictions.map( (prediction, idx) => 
                        <Text key={idx}> {prediction.class + ':' + prediction.score} </Text>
                    )}
                </React.Fragment>

                }

            </View>
        );
    };
};