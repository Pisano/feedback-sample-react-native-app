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
  View
} from 'react-native'
import {
  feedbackSDKDebugMode,
  feedbackSDKBoot,
  feedbackSDKShow,
  feedbackSDKClear,
  feedbackSDKViewMode,
  feedbackSDKCallback
} from 'feedback-react-native-sdk'

class App extends Component {
  state = {
    fullName: null,
    email: null,
    phone: null,
    externalId: null,
    feedbackResult: feedbackSDKCallback.None,
    viewMode: feedbackSDKViewMode.Default,
    customTitle: null
  }
  
  componentDidMount() {
    feedbackSDKDebugMode(true);
    feedbackSDKBoot("appId", "accessKey", "apiUrl", "feedbackUrl", "eventUrl");
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
      <TextInput
      style={styles.input}
      onChangeText={(text) => this.setState({customTitle: text})}
      placeholder='Custom Title'>{this.state.customTitle}</TextInput>
      
      <View style={styles.hContainer}>
      <TouchableOpacity
      style={this.state.viewMode == feedbackSDKViewMode.Default ? styles.selectedViewMode : styles.viewMode}
      onPress={() =>
        this.setState({viewMode: feedbackSDKViewMode.Default})
      }>
      <Text style={{ color: '#ffffff' }}>Default</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
      style={this.state.viewMode == feedbackSDKViewMode.BottomSheet ? styles.selectedViewMode : styles.viewMode}
      onPress={() =>
        this.setState({viewMode: feedbackSDKViewMode.BottomSheet})
      }>
      <Text style={{ color: '#ffffff' }}>Bottom Sheet</Text>
      </TouchableOpacity>
      </View>
      
      <TouchableOpacity
      style={styles.show}
      onPress={() =>
        feedbackSDKShow(this.state.viewMode, this.state.customTitle, 25, "flowId", "languageCode", { "name": this.state.fullName, "email": this.state.email, "phoneNumber": this.state.phone, "externalId": this.state.externalId }, payload, (status) => {
          console.log(status)
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
            feedbackResult: feedbackSDKCallback.None
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
      hContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 16,
        paddingVertical: 8
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
      selectedViewMode: {
        alignItems: 'center',
        backgroundColor: '#21965a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
      },
      viewMode: {
        alignItems: 'center',
        backgroundColor: '#403f3e',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
      },
      clear: {
        alignItems: 'center',
        padding: 10,
        marginBottom: 10
      }
    })
    
    export default App;
    