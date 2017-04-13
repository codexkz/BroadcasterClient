
(function(){

    let defaultserver={     
        'ip'    : '10.1.16.115',
        'port'  : '8080'
    };

    connectManager = new ConnectManager(defaultserver) ;

    function ConnectManager(server){
        let connectServerUri = "http://" + server.ip + ":" + server.port + "/BroadcasterServer/Connect.do";
        let wsUri            = "ws://" + server.ip + ":" + server.port + "/BroadcasterServer";
        let userUUID=''                ;
        let userName=''                ;
        let channelID=''               ;
        let channelPassword=''         ;
        let connectMode = 'stream'     ;
        let controlerSocket            ;
        let controlerSocketReconnector ;
        let chatSocket                 ;
        let chatSocketReconnector      ;
        let mediaSendSocketArray    = []   ; //use only stream mode
        let mediaReceiveSocketArray = []   ; //use only stream mode
        let messageHeader ;

        // (function initConnectManager(){})();

        this.connect = function ( config , successCallback , errorCallback){
            connectManager.resetConnect();
            channelID       = config.id || 'default';
            channelPassword = config.pw || 'default';

            let xhr = new XMLHttpRequest();
                xhr.open('POST', connectServerUri ,  true );
                xhr.onreadystatechange = onReadyStateChange ;
                xhr.send('{ "id" : "' + channelID  + '", "pw" : "' + channelPassword + '" }');
            
            function onReadyStateChange() {
                  if (xhr.readyState === 4 && xhr.status == 200) {
                        connectSuccessFunc(xhr.responseText);
                        console.log(xhr.responseText);
                  }
                  if (xhr.readyState === 4 && xhr.status != 200) {
                        connectErrorFunc('{ "retcode" : "' + xhr.status  + '", "retmsg" : "' + xhr.statusText + '" }');
                  }
            };


            function connectSuccessFunc(responseStr){
                let response  = JSON.parse(responseStr) ;
                console.log(response);
                if(response.retcode == "100"){
                    userUUID  = response.messageBody.data.uuid ;
                    userName  = response.messageBody.data.name ;
                    console.log("Get UUID : "+userUUID);
                    response.messageBody.data.uuid = '';
                    connectManager.createControlerSocket(successCallback , errorCallback);
                    connectManager.endSocketReconnector();
                    connectManager.startSocketReconnector(successCallback , errorCallback);
                    chatManager.clearChatContainer();
                    chatManager.clearTypingContainer();    
                    chatManager.clearMemberContainer();
                    chatManager.newMessage(response);
                    return;
                }

                connectErrorFunc(responseStr);
                
            };

            function connectErrorFunc(responseStr){
                let response  = JSON.parse(responseStr) ;
                console.log('ConnectError , Retcode : ' + response.retcode + ' , Retmsg : ' + response.retmsg );
                errorCallback();
            };
        };

        this.resetConnect = function (){
            connectServerUri = "http://" + server.ip + ":" + server.port + "/BroadcasterServer/Connect.do";
            wsUri            = "ws://" + server.ip + ":" + server.port + "/BroadcasterServer";
            userUUID         = null   ;
            channelID        = null   ;
            channelPassword  = null   ;
            connectMode = 'stream'    ;
            mediaSendSocketArray    = []   ; //use only stream mode
            mediaReceiveSocketArray = []   ; //use only stream mode
            controlerSocket  = null   ;
            chatSocket       = null   ;
        };


        this.changeMode =function (){
            connectMode = connectMode ==='stream' ? 'sychron' : 'stream' ;
            controlerSocket.send({action:'changeMode', content : connectMode});
        };

        this.getMessageHeader = function(){
            messageHeader = { 'userUUID' : userUUID    ,
                              'userName' : userName    ,
                              'channelID' :channelID   ,
                              'channelPassword' : channelPassword , 
                              'connectMode' : connectMode,
                              'messageBody' :'' }
            return JSON.parse(JSON.stringify(messageHeader));  //clone 
        };

        this.getControlerSocket = function(){
            return controlerSocket ;
        };

        this.getChatSocket = function(){
            return chatSocket ;
        };


        this.createControlerSocket = function (successCallback , errorCallback){
            controlerSocket = new ControlerSocket( wsUri +'/ControlerSockect/'+ encodeURI(userUUID) + '/' + encodeURI(channelID)+ '/' + encodeURI(channelPassword) ,successCallback , errorCallback );
        };

        this.createChatSocket = function (){
            chatSocket      = new ChatSocket( wsUri +'/ChatSocket/'+ encodeURI(userUUID) + '/' + encodeURI(channelID) + '/' + encodeURI(channelPassword)  );
        };

        this.createMediaSendSocket = function (mediasockpairid){
            let mediaSendSocket = new MediaSendSocket( wsUri +'/MediaSocket/'+ encodeURI(userUUID) + '/' + encodeURI(channelID) + '/' + encodeURI(channelPassword) + '/' + 'sender' + '/' + mediasockpairid );
            mediaSendSocket.mediasockpairid = mediasockpairid ;
            mediaSendSocketArray.push( mediaSendSocket );
        };

        this.createMediaReceiveSocket = function (mediasockpairid){
            let mediaReceiveSocket = new MediaReceiveSocket( wsUri +'/MediaSocket/'+ encodeURI(userUUID) + '/' + encodeURI(channelID) + '/' + encodeURI(channelPassword) + '/' + 'receiver' + '/' + mediasockpairid )
            mediaReceiveSocket.mediasockpairid = mediasockpairid ;
            mediaReceiveSocketArray.push( mediaReceiveSocket );
        };


        this.startSocketReconnector = function (successCallback , errorCallback){
            controlerSocketReconnector = setInterval( function(){
                if(controlerSocket && controlerSocket.readyState==3){
                    console.log('ControlerSocket:ReConnect');
                    connectManager.createControlerSocket(successCallback , errorCallback);
                }
            } , 5000);

            chatSocketReconnector = setInterval( function(){
                if(controlerSocket && controlerSocket.readyState==1 && chatSocket.readyState==3){
                    console.log('ChatSocket:ReConnect');
                    connectManager.createChatSocket();
                }
            } , 5000);
            
        // setInterval( function(){
        //     if( && )connectManager.createMediaSendSocket();
        // } , 5000);

        // setInterval( function(){
        //     if( && )connectManager.createMediaReceiveSocket();
        // } , 5000);
        }
        
        this.endSocketReconnector = function (){
            clearInterval(controlerSocketReconnector);
            clearInterval(chatSocketReconnector);
        }

        this.getUserName =function(){
            return userName ;
        }

        this.setUserName =function(newName){
            userName = newName ;
        }

        this.getChannelID =function(){
            return channelID ;
        }

    }
})();


function ControlerSocket(connectURL, successCallback , errorCallback){
    let instance = new WebSocket(connectURL);  
    instance.onopen = onOpen ;
    instance.onmessage = onMessage ;
    instance.onclose = onClose ;
    instance.onerror = onError ;
    instance.doSend = function (messageBody){
        let message = connectManager.getMessageHeader();
            message.messageBody = messageBody ;
            message.messageBody.senderName = message.userName;
        instance.send(JSON.stringify(message));
    };

    function onOpen(){
        console.log('ControlerSocket:ConnectSuccess');
        connectManager.createChatSocket();
        successCallback();
    };

    function onMessage(response){
        let responseJson = JSON.parse(response.data);
        switch(responseJson.messageBody.action){
            case 'reName':
                if(responseJson.userName == connectManager.getUserName())  
                    connectManager.setUserName(responseJson.messageBody.data);
                chatManager.newMessage(responseJson);
                break;
            case 'openMediaSocket':
                let mediaSocketPairID = responseJson.messageBody.mediaSocketPairID ;
                if(responseJson.userName == connectManager.getUserName()) //MediaSenfer
                    connectManager.createMediaSendSocket(mediaSocketPairID);
                else                                                      //MediaReceiver
                    connectManager.createMediaReceiveSocket(mediaSocketPairID);
                break;
            default:
        }
    };  
    function onClose(e){
        console.log('ControlerSocket:ConnectClose , Retcode : ' + e.code + ' , Retmsg : ' + e.reason );
        if(e.reason = "VerificationError" ) connectManager.endSocketReconnector();
        if(connectManager.getChatSocket().readyState==1) connectManager.getChatSocket().close(e);
        errorCallback();
    };  
    function onError(){
        console.log('ControlerSocket:ConnectError');
    };  

    return instance;  
}

function ChatSocket(connectURL){
    let instance = new WebSocket(connectURL);  
        instance.onopen = onOpen ;
        instance.onmessage = onMessage ;
        instance.onclose = onClose ;
        instance.onerror = onError ;
    
    instance.doSend = function (messageBody){
        let message = connectManager.getMessageHeader();
            message.messageBody = messageBody ;
            message.messageBody.senderName = message.userName;
        instance.send(JSON.stringify(message));
    };


    function onOpen(){
        console.log('ChatSocket:ConnectSuccess');
    };

    function onMessage(response){
        let responseJson = JSON.parse(response.data);
        chatManager.newMessage(responseJson);
    };  

    function onClose(e){
        console.log('ChatSocket:ConnectClose , Retcode : ' + e.code + ' , Retmsg : ' + e.reason );
    };  
    function onError(){
        console.log('ChatSocket:ConnectError');
    };    
    return instance;  
}

//Upload Media  & Receive Commnad 
function MediaSendSocket(connectURL){
    let instance = new WebSocket(connectURL);  
        instance.onopen = onOpen ;
        instance.onmessage = onMessage ;
        instance.onclose = onClose ;
        instance.onerror = onError ; 

    instance.doSend = function (messageBody){
        // let message = connectManager.getMessageHeader();
        //     message.messageBody = messageBody ;
        //     message.messageBody.senderName = message.userName;
        // instance.send(JSON.stringify(message));
    };


    function onOpen(){
        console.log('MediaSendSocket:ConnectSuccess ,' + instance.mediasockpairid );
    };

    function onMessage(response){
        // let responseJson = JSON.parse(response.data);
        // chatManager.newMessage(responseJson);
    };  

    function onClose(e){
        console.log('MediaSendSocket:ConnectClose ,' + instance.mediasockpairid + ', Retcode : ' + e.code + ' , Retmsg : ' + e.reason);
    };  
    function onError(){
        console.log('MediaSendSocket:ConnectError ,' + instance.mediasockpairid );
    };    
    return instance;  
}

//Download Media  & Send Commnad 
function MediaReceiveSocket(connectURL){
    let instance = new WebSocket(connectURL);  
        instance.onopen = onOpen ;
        instance.onmessage = onMessage ;
        instance.onclose = onClose ;
        instance.onerror = onError ;

    instance.doSend = function (messageBody){
        // let message = connectManager.getMessageHeader();
        //     message.messageBody = messageBody ;
        //     message.messageBody.senderName = message.userName;
        // instance.send(JSON.stringify(message));
    };


    function onOpen(){
        console.log('MediaReceiveSocket:ConnectSuccess ,' + instance.mediasockpairid );
    };

    function onMessage(response){
        // let responseJson = JSON.parse(response.data);
        // chatManager.newMessage(responseJson);
    };  

    function onClose(e){
        console.log('MediaReceiveSocket:ConnectClose ,' + instance.mediasockpairid + ', Retcode : ' + e.code + ' , Retmsg : ' + e.reason);
    };  
    function onError(){
        console.log('MediaReceiveSocket:ConnectError ,' + instance.mediasockpairid );
    };    
    return instance;  
}