
(function(){

    let defaultserver={     
        'ip'    : 'localhost',
        'port'  : '8082'
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

        this.getMediaSendSocket =function(mediasockpairid){
            for(var i in mediaSendSocketArray){
                if(mediaSendSocketArray[i].mediasockpairid && mediaSendSocketArray[i].mediasockpairid == mediasockpairid  )
                    return mediaSendSocketArray[i];
            }
            return null ;
        }

        this.getMediaReceiveSocket =function(mediasockpairid){
            for(var i in mediaReceiveSocketArray){
                if(mediaReceiveSocketArray[i].mediasockpairid && mediaReceiveSocketArray[i].mediasockpairid == mediasockpairid  )
                    return mediaReceiveSocketArray[i];
            }
            return null ;
        }

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
                let actionType        = responseJson.messageBody.actionType ;
                let dataId            = responseJson.messageBody.data.id ;
                let dataName          = responseJson.messageBody.data.name ;

                if(responseJson.userName == connectManager.getUserName() && actionType == 'MediaSendSocket' ){ //MediaSenfer
                    connectManager.createMediaSendSocket(mediaSocketPairID);
                    mediaManager.sychron({
                        'actionType' : actionType,
                        'dataId'     : dataId,
                        'dataName'   : dataName,
                        'pairID'     : mediaSocketPairID
                    });
                } 
                    
                else { //MediaReceiver
                    connectManager.createMediaReceiveSocket(mediaSocketPairID);
                    mediaManager.sychron({
                        'actionType' : actionType,
                        'dataId'     : dataId,
                        'dataName'   : dataName,
                        'pairID'     : mediaSocketPairID
                    });
                }                                                     
                    
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
        instance.binaryType = "blob";
        instance.onopen = onOpen ;
        instance.onmessage = onMessage ;
        instance.onclose = onClose ;
        instance.onerror = onError ; 

    instance.doSend = function (blob){
        try{
            instance.send(blob);
        }
        catch(e){
            for(var i in  e)
             console.log(i+' : '+e[i]);
        }
    };

    function onOpen(){
        console.log('MediaSendSocket:ConnectSuccess ,' + instance.mediasockpairid );
    };

    function onMessage(response){
        if (response.data instanceof Blob) {
            //get blob data
            // let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // source = audioCtx.createBufferSource();
            // audioCtx.decodeAudioData(response.data, function(buffer) {
            //     source.buffer = buffer;
            //     source.connect(audioCtx.destination);
            //     source.loop = true;
            // },
            // function(e){ console.log("Error with decoding audio data" + e.err); 
            // });
            document.getElementById('audioElemReceive'+instance.mediasockpairid).setAttribute('src',window.URL.createObjectURL(response.data));
            // $('#audioContainer > [data-id='+ response.dataId +']').attr('src');
            // blobhandler(response.data);
   		}
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
        instance.binaryType = "blob";  
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
        if (response.data instanceof Blob) {
            //get blob data
            blobhandler(response.data);
   		}
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


