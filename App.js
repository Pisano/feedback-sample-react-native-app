/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  SafeAreaView,
} from 'react-native'
import {
  feedbackSDKDebugMode,
  feedbackSDKBoot,
  feedbackSDKShow,
  feedbackSDKClear
} from 'feedback-react-native-sdk'

class App extends Component {
  state = {
    fullName: null,
    email: null,
    phone: null,
    externalId: null,
    feedbackResult: ''
  }

  componentDidMount() {
    feedbackSDKDebugMode(true);
    feedbackSDKBoot("",
      "",
      "",
      "",
      null);
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>

        <TextInput
          style={styles.input}
          placeholder='Fullname'
          onChangeText={(text) => this.setState({fullName: text})}
          >{this.state.fullName}</TextInput>
        <TextInput
          style={styles.input}
          placeholder='Email' 
          onChangeText={(text) => this.setState({email: text})}
          keyboardType='email-address'>{this.state.email}</TextInput>
        <TextInput
          style={styles.input}
          placeholder='Phone' 
          onChangeText={(text) => this.setState({phone: text})}
          keyboardType='phone-pad'>{this.state.phone}</TextInput>
        <TextInput
          style={styles.input}
          onChangeText={(text) => this.setState({externalId: text})}
          placeholder='ExternalId'>{this.state.externalId}</TextInput>

        <Text>{this.state.text}</Text>
        <TouchableOpacity
          style={styles.show}
          onPress={() =>
            feedbackSDKShow(null, null, { "name": this.state.fullName, "email": this.state.email, "phoneNumber": this.state.phone, "externalId": this.state.externalId }, null, (status) => {
              this.setState({
                feedbackResult: status
              })
            })}>
          <Text style={{ color: '#ffffff' }}>Show</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clear}
          onPress={() =>
            this.setState({
              feedbackResult: ''
            }, () =>
              feedbackSDKClear()
            )
          }>
          <Text>Clear</Text>
        </TouchableOpacity>

        <Text>{this.state.feedbackResult}</Text>
      </SafeAreaView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    margin: 8
  },
  input: {
    borderColor: '#000000',
    borderWidth: 1,
    padding: 8,
    marginVertical: 8
  },
  show: {
    alignItems: 'center',
    backgroundColor: '#2596be',
    padding: 10,
    marginBottom: 10
  },
  clear: {
    alignItems: 'center',
    padding: 10,
    marginBottom: 10
  }
})

export default App;
