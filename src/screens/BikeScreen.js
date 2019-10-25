import React, { Fragment } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as model from '../analysis/BikeModel';


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default class BikeScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isTfReady: false,
      message: 'initial',
      predictions: [],
    }
  }

  analyse = async () => {
    this.setState({  message: 'analyzing' });
    const predictions = await model.analyse_bike();
    this.setState({  message: 'success: ' + predictions , predictions});
  }

  render() {
    return (
      <View style={styles.container}>
        <Fragment>
        <Text>Open up App.tsx to start working on your app!</Text>
        <Text>{this.state.message}</Text>
        <Button
                      title="Analyse"
                      onPress={ () => this.analyse() } 
                  />
        { this.state.predictions.map( (prediction, idx) => 
            <Text key={idx}> {prediction.class + ':' + prediction.score} </Text>
        )}
        </Fragment>
      </View>
    );
  }

}
