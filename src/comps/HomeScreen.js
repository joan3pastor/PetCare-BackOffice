import React from 'react';
import InboxList from "./InboxList";
import InboxDetail from "./InboxDetail";
import ChatList from "./ChatList";
import ChatDetail from "./ChatDetail";
import "./css/HomeScreen.css";
import axios from 'axios'; 
import _ from 'lodash';
import socketIOClient from 'socket.io-client';


class HomeScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      messages: [], 
      data: null, 
      mode:"inbox",
      lastUpdateChatList: "",
    }
    this.componentWillMount = this.componentWillMount.bind(this);  
    this.socket = socketIOClient('https://petcare-server.herokuapp.com');
    this.socket.emit('identification', this.props.session._id);
    console.log(this.props.session._id);
  }

  myCallbackSearch = (dataFromChild) => {
    this.setState({ data:{me: this.props.session.email,other: dataFromChild.name,otherId:dataFromChild.id}});
    console.log('CHECKMATE');
    console.log(dataFromChild);
  };

  myCallbackParent = (dataFromChild) => {
    this.setState({ data: dataFromChild });
    console.log('CHECK 3');
    console.log(dataFromChild);
  };

  async getMessages() {
    var resp = await axios({
      method: 'get',
      url: "https://petcare-server.herokuapp.com/inboxes",
      params: {
           to: this.props.session._id, 
      }
    });
    console.log('USER ID IS: '+ this.props.session._id);
    this.setState({ messages: resp.data});
    console.log(resp.data);
  };

  updateChatList() {
    this.setState({lastUpdateChatList: Date.now()});
  }

  componentWillMount() {
    this.getMessages();
  }

  changeToChat() {
    this.setState({mode: "chat"});
  }

  changeToInbox() {
    this.setState({mode: "inbox"});
  }

  render(){
    console.log("Rendering: " + this.state.mode);
    var message,
    list;
    if(this.state.mode === "inbox"){
      if(this.state.data != null){
        message = <InboxDetail id={this.state.data.id}
        from={this.state.data.from}
        createdDate={this.state.data.createdDate}
        subject={this.state.data.subject}
        body={this.state.data.body}
        tag={this.state.data.tag}
        />  
      }
      else{
        message = <p id='welcome'>Welcome!</p>;
      }
        list= <InboxList 
        changeToChat={this.changeToChat.bind(this)}
        messages = {this.state.messages} 
        username = {this.state.username}
        renderParent = {() => {
          this.setState({messages: []});
          this.componentWillMount();
        }}
        callbackFromParent={this.myCallbackParent}
        />
    }
    else if(this.state.mode === "chat") {
      if(this.state.data != null) {
        message = <ChatDetail 
                    me = {this.state.data.me} 
                    other = {this.state.data.other}
                    meId = {this.props.session._id}
                    otherId = {this.state.data.otherId}
                    updateChatList={this.updateChatList.bind(this)}
         />
      }
      else{
        message = <p id='welcome'>Welcome!</p>;
      }
      list = <ChatList
                messages = {this.state.messages} 
                changeToInbox={this.changeToInbox.bind(this)}
                callbackFromParent={this.myCallbackParent}
                me={this.props.session.email}
                sessionId={this.props.session._id}
                callbackFromParentSearch={this.myCallbackSearch}
                lastUpdated={this.state.lastUpdateChatList}
        />
    }
    console.log(message);
    return(
      <div className="Home">
        <div className="Left ">
        {list}
        </div>
        <div className="Right">
          {message}
        </div>
      </div>
    )
  }
}
  
  export default HomeScreen;
