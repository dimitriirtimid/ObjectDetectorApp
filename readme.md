# Installation

## Prerequisites
````
npm install -g expo-cli
````

## Install from repo
To run the app just clone this repo, cd to the root folder and run:
````
expo install
expo start
````

Then navigate to the expo url with your mobile phone through one of the way presented on the web page that pops up.

## Initial steps to setup
These steps were taken to construct this app. There is no need to repeat them if you just want to work from this repo.

````
expo init modeltest2
>> expo-template-bare-minimum
>> use yarn: N

cd modeltest2
cd ios/ && pod install && cd ..
expo install expo-gl-cpp
cd ios/ && pod install && cd ..
expo install expo-gl
cd ios/ && pod install && cd ..

npm install --save-dev metro metro-core

create metro config file in root folder: https://github.com/tensorflow/tfjs/tree/master/tfjs-react-native#step-3-configure-metro
- add 'ttf' and 'png' to the assetExts

expo install @tensorflow/tfjs
expo install @tensorflow/tfjs-react-native@alpha

expo install @react-native-community/async-storage
react-native link @react-native-community/async-storage
cd ios/ && pod install && cd ..

expo install canvas @tensorflow-models/coco-ssd

expo install react-native-webview
react-native link react-native-webview
expo install react-native-canvas

expo install expo-permissions
expo install expo-camera
expo install react-native-easy-grid
expo install @expo/vector-icons
expo install react-navigation
expo install react-navigation-tabs
expo install react-navigation-stack
expo install @expo/samples
expo install @tensorflow-models/body-pix

// fix UIManager getConstants warning: https://github.com/kmagiera/react-native-gesture-handler/issues/742
expo install react-native-gesture-handler   --> did  not work
manually changed "react-native-gesture-handler" in package.json to "~1.3.0",
npm install
expo start --clear
````