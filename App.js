import React, { Component } from "react";

import {
  Text,
  View,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import AWS from "aws-sdk/dist/aws-sdk-react-native";
// Initialize the Amazon Cognito credentials provider
AWS.config.region = "eu-central-1"; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
  IdentityPoolId: "eu-central-1:44785595-57cf-4e3c-8b7b-ad75b8fae382",
});

let lexRunTime = new AWS.LexRuntime();
let lexUserId = "mediumBot" + Date.now();

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messages: {
    flex: 1,
    marginTop: 20,
  },
  botMessages: {
    color: "black",
    backgroundColor: "white",
    padding: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 20,
    borderTopLeftRadius: 20,
    marginBottom: 0,
    borderTopRightRadius: 20,
    alignSelf: "flex-start",
    bottom: 23,
    textAlign: "left",
    width: "75%",
  },
  userMessages: {
    backgroundColor: "#4287f5",
    color: "white",
    padding: 10,
    marginBottom: 10,
    marginRight: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    width: "65%",
    alignSelf: "flex-end",
    textAlign: "left",
  },
  textInput: {
    flex: 2,
    paddingLeft: 15,
  },
  responseContainer: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 0,
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#EEEFFA",
  },
  suggestionWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent : 'flex-end',
    paddingBottom : 10,
    paddingTop : 10
  },
  suggestion: {
    backgroundColor: "#228B22",
    paddingLeft : 20,
    paddingRight : 20,
    paddingTop : 10,
    paddingBottom : 10,
    borderRadius : 10,
    marginRight : 10
  },
  suggestionText : {
    fontWeight : '500',
    color : '#ffffff'
  }
});
export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userInput: "",
      messages: [],
      inputEnabled: true,
      suggestedMessages: ["Hi", "Janith", "Ravindu"],
    };
  }
  // Sends Text to the lex runtime
  handleTextSubmit() {
    let inputText = this.state.userInput.trim();
    if (inputText !== "") this.showRequest(inputText);
  }
  // Populates screen with user inputted message
  showRequest(inputText) {
    // Add text input to messages in state
    let oldMessages = Object.assign([], this.state.messages);
    oldMessages.push({ from: "user", msg: inputText });
    this.setState({
      messages: oldMessages,
      userInput: "",
      inputEnabled: false,
    });
    this.sendToLex(inputText);
  }
  // Responsible for sending message to lex
  sendToLex(message) {
    let params = {
      botAlias: "$LATEST",
      botName: "NonConformity",
      inputText: message,
      userId: lexUserId,
    };
    lexRunTime.postText(params, (err, data) => {
      if (err) {
        // TODO SHOW ERROR ON MESSAGES
      }
      if (data) {
        this.showResponse(data);
      }
    });
  }
  showResponse(lexResponse) {
    let lexMessage = lexResponse.message;
    let oldMessages = Object.assign([], this.state.messages);
    oldMessages.push({ from: "bot", msg: lexMessage });
    this.setState({
      messages: oldMessages,
      inputEnabled: true,
    });
  }
  renderTextItem(item) {
    let style, responseStyle;
    if (item.from === "bot") {
      style = styles.botMessages;
      responseStyle = styles.responseContainer;
    } else {
      style = styles.userMessages;
      responseStyle = {};
    }
    return (
      <View style={responseStyle}>
        <Text style={style}>{item.msg}</Text>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.messages}>
          <FlatList
            data={this.state.messages}
            renderItem={({ item }) => this.renderTextItem(item)}
            keyExtractor={(item, index) => index}
            extraData={this.state.messages}
          />
          <TouchableOpacity onPress={({ item }) => this.renderTextItem(item)}>
            <Text>{this.typeList}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.suggestionWrapper}>
          {this.state.suggestedMessages.map((message, index) => {
            return (
              <TouchableOpacity style={styles.suggestion} key={index}  onPress={() => this.showRequest(message)}>
                <Text style={styles.suggestionText}>{` ${message} `}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            onChangeText={(text) => this.setState({ userInput: text })}
            value={this.state.userInput}
            style={styles.textInput}
            editable={this.state.inputEnabled}
            placeholder={"Reply to non conformity bot!"}
            autoFocus={true}
            onSubmitEditing={this.handleTextSubmit.bind(this)}
          />
        </View>
      </View>
    );
  }
}
