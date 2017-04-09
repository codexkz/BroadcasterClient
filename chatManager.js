
(function(){

    chatManager = new ChatManager() ;

    function ChatManager(){
        
        let tabMap =  new Map();

        //handdle all message from chat-window
        chrome.runtime.onMessage.addListener(chatMessageSendHanddler);
        function chatMessageSendHanddler(request, sender, sendResponse){
            
            if(request.action=='setCurrentTabInfo'){
                tabMap.set( sender.tab.id , sender.tab ) ;
                console.log(memberContainer.innerHTML);
                chrome.tabs.sendMessage( sender.tab.id , { 'action' : 'setDomInContainer' , 'chatContainerDom' : chatContainer.innerHTML , 'memberContainerDom' : memberContainer.innerHTML });
                // chrome.tabs.sendMessage( sender.tab.id , { 'action' : 'setCurrentTabInfo' , 'tab' : sender.tab });
                return;
            } 

            if(request.action=='closeTab'){
                tabMap.delete( request.tab.id ) ;
                return;
            } 

            if(request.action=='newMessage'){
                console.log('newMessage create message : ' + request.message );
                let messageJson = {
                    'senderName'  : ''                    ,
                    'action'      : request.action        ,
                    'actionType'  : request.actionType    ,
                    'target'      : request.target        ,
                    'timestamp'   : request.timestamp     ,
                    'oldtimestamp': request.oldtimestamp  ,
                    'messageID'   : request.messageID     ,
                    'messagetype' : request.messagetype   ,
                    'message'     : request.message    
                };

                try{
                    if(connectManager.getChatSocket().readyState==3 ) throw "showNotConnectInfo" ;
                    connectManager.getChatSocket().doSend(messageJson) ;
                }catch(e){
                    chrome.tabs.sendMessage( sender.tab.id , { 'action' : 'showNotConnectInfo' });
                }
                return;
            }

            if(request.action =='stopTyping'){
                let messageJson = {
                    'senderName'  : ''                    ,
                    'action'      : request.action        ,
                    'actionType'  : request.actionType    ,
                    'target'      : request.target        ,
                    'timestamp'   : request.timestamp     ,
                };
                try{
                    connectManager.getChatSocket().doSend(messageJson) ;
                }catch(e){}
                return;
            }

            if(request.action =='startTyping'){
                let messageJson = {
                    'senderName'  : ''                    ,
                    'action'      : request.action        ,
                    'actionType'  : request.actionType    ,
                    'target'      : request.target        ,
                    'timestamp'   : request.timestamp     ,
                };
                try{
                    if( !isJustSendSudden(request.timestamp) ) connectManager.getChatSocket().doSend(messageJson) ;
                }catch(e){}
                return;

                function isJustSendSudden(timestamp){
                     let senderTag = $(typingContainer).find('[data-sendername="'+ connectManager.getUserName() +'"]');
                     if(senderTag.length == 0) 
                        return false;
                     
                     let newTimestamp    = parseInt(timestamp);
                     let oldTimestamp    = parseInt($(senderTag).attr('data-timestamp'));
                     $(senderTag).attr('data-timestamp',newTimestamp);
                     if( (newTimestamp - oldTimestamp) >= 500  ) {
                        return false;
                     }
                     
                     return true ;
                }
            }

            // if(request.action =='getMessageInChatContainer' ){
            //     chrome.tabs.sendMessage( sender.tab.id , { 'action' : 'setMessageInChatContainer' , 'dom' : chatContainer.innerHTML });
            //     return;
            // }

            if(request.action =='getUserName' ){
                sendResponse({'data':connectManager.getUserName()});
                //chrome.tabs.sendMessage( sender.tab.id , { 'action' : 'setMessageInChatContainer' , 'dom' : chatContainer.innerHTML });
                return;
            }

            if(request.action=='reName'){
                if( request.data == connectManager.getUserName()) return;
                let messageJson = {
                    'senderName'  : ''                    ,
                    'action'      : request.action        ,
                    'actionType'  : request.actionType    ,
                    'target'      : request.target        ,
                    'timestamp'   : request.timestamp     ,
                    'data'        : request.data          ,
                };

                try{
                    if(connectManager.getControlerSocket().readyState==3 ) throw "showNotConnectInfo" ;
                    connectManager.getControlerSocket().doSend(messageJson) ;
                }catch(e){
                    chrome.tabs.sendMessage( sender.tab.id , { 'action' : 'showNotConnectInfo' });
                }
                return;
            }
        }

        //if get new message , put into chatContainer 
        this.newMessage = function (newJsonMessge){
            /*
            *        {
            *          userUUID        : userUUID            ,
            *          channelID       : channelID           ,
            *          channelPassword : channelPassword     , 
            *          connectMode     : connectMode         ,
            *          messgeBody      : {
            *                               action      : action          ,
            *                               actionType  : actionType      ,
            *                               target      : target          ,
            *                               timestamp   : timestamp       ,
            *                               messagetype : messagetype     ,
            *                               message     : message 
            *                            }     
            *        }
            *
            */

            if(newJsonMessge.messageBody.actionType === 'control'){
                if(newJsonMessge.messageBody.action === 'reName'){
                    let senderName = newJsonMessge.messageBody.senderName ;
                    $(chatContainer).find('[data-sendername="'+ senderName +'"]').each(function(){
                            $(this).attr('data-sendername',newJsonMessge.messageBody.data);
                    });

                    $(memberContainer).find('[data-membername="'+ senderName +'"]').each(function(){
                            $(this).attr('data-membername',newJsonMessge.messageBody.data);
                    });
                    tabMap.forEach(function(value, key, map){
                        chrome.tabs.sendMessage( key , newJsonMessge.messageBody );
                    });
                    return;
                 }
            }

            if(newJsonMessge.messageBody.actionType === 'channelInfo'){
                switch(newJsonMessge.messageBody.action){
                    case "connectSuccessInit":
                                let memberArray = newJsonMessge.messageBody.data.members ;
                                for( let i in memberArray){
                                    let member = document.createElement( 'div' );
                                        member.setAttribute( 'data-membername'  ,  memberArray[i].name );
                                    $(memberContainer).append(member);
                                }
                                tabMap.forEach(function(value, key, map){
                                        chrome.tabs.sendMessage( key ,newJsonMessge.messageBody );
                                });
                                break;

                    case "memberIn":
                                let member = document.createElement( 'div' );
                                    member.setAttribute( 'data-membername'  ,  newJsonMessge.messageBody.data  );
                                    //member.setAttribute( 'data-timestamp'   ,  newJsonMessge.messageBody.timestamp   );
                                $(memberContainer).append(member);
                                tabMap.forEach(function(value, key, map){
                                        chrome.tabs.sendMessage( key , newJsonMessge.messageBody );
                                });
                                break;
                    case "memberOut":
                                $(typingContainer).find('[data-membername="'+ newJsonMessge.messageBody.data +'"]').remove();
                                tabMap.forEach(function(value, key, map){
                                        chrome.tabs.sendMessage( key , newJsonMessge.messageBody );
                                });
                                break;
                    case "vioceFromTheSky":
                    
                                break;
                }
                return;
            }

            if(newJsonMessge.messageBody.actionType === 'notification'){
                 if(newJsonMessge.messageBody.action === 'startTyping' && isNewTyping(newJsonMessge) ){
                    let elem = document.createElement( 'div' );
                        elem.setAttribute( 'data-sendername'  ,  newJsonMessge.messageBody.senderName  );
                        elem.setAttribute( 'data-timestamp'   ,  newJsonMessge.messageBody.timestamp   );
                    $(typingContainer).append(elem);
                    renewTyping();
                    return;
                 }

                 if(newJsonMessge.messageBody.action === 'stopTyping'){
                    $(typingContainer).find('[data-sendername="'+ newJsonMessge.messageBody.senderName +'"]').remove();
                    renewTyping();
                    return;
                 }

                 function isNewTyping(jsonMessge){
                     let senderName = jsonMessge.messageBody.senderName ;
                     let senderTag = $(typingContainer).find('[data-sendername="'+ senderName +'"]');
                     if(senderTag.length == 0) 
                        return true;
                     
                     let newTimestamp    = parseInt(jsonMessge.messageBody.timestamp);
                     let oldTimestamp    = parseInt($(senderTag).attr('data-timestamp'));
                     $(senderTag).attr('data-timestamp',newTimestamp);
                     if( (newTimestamp - oldTimestamp) > (3 * 1000)  ) {
                        return true;
                     }
                     
                     return false ;
                 }

                 function renewTyping(){
                     let timestampTamp = 0;
                     let target ;
                     let typingCount = 0 ;
                     //console.log(typingCount);
                     $(typingContainer).children('div').each(function(){
                            let timestamp  = parseInt($(this).attr('data-timestamp'));
                            typingCount++;
                            if(timestamp > timestampTamp){
                                timestampTamp = timestamp ;
                                target = $(this) ;
                            }
                     });
                     //console.log("after"+typingCount);
                     tabMap.forEach(function(value, key, map){
                        chrome.tabs.sendMessage( key , { 'action' : 'renewTyping' , 
                                                         'senderName' : $(target).attr('data-sendername') ,
                                                         'typingCount':typingCount } );
                     });
                 }
            }

            if(newJsonMessge.messageBody.actionType === 'insert'){
                 let elem = document.createElement( 'div' );
                     //console.log(newJsonMessge.messageBody);
                     //elem.setAttribute( 'data-sender'    ,  newJsonMessge.messgeBody.sender       );
                     elem.setAttribute( 'data-sendername'  ,  newJsonMessge.messageBody.senderName  );
                     elem.setAttribute( 'data-action'      ,  newJsonMessge.messageBody.action      );
                     elem.setAttribute( 'data-actionType'  ,  newJsonMessge.messageBody.actionType  );
                     elem.setAttribute( 'data-target'      ,  newJsonMessge.messageBody.target      );
                     elem.setAttribute( 'data-timestamp'   ,  newJsonMessge.messageBody.timestamp   );
                     elem.setAttribute( 'data-messageID'   ,  newJsonMessge.messageBody.messageID   );
                     elem.setAttribute( 'data-messagetype' ,  newJsonMessge.messageBody.messagetype );
                 $(elem).text(newJsonMessge.messageBody.message); 
                 $(chatContainer).append(elem);
                 tabMap.forEach(function(value, key, map){
                            chrome.tabs.sendMessage( key , newJsonMessge.messageBody );
                 });
                 return;
            }

            if(newJsonMessge.messageBody.actionType === 'modify'){
                 $(chatContainer).find('[data-messageID="'+ newJsonMessge.messageBody.messageID +'"]')
                                 .attr('data-timestamp'  , newJsonMessge.messageBody.timestamp )
                                 .attr('data-messagetype', newJsonMessge.messageBody.messagetype )
                                 .text( newJsonMessge.messageBody.message ); 
                 tabMap.forEach(function(value, key, map){
                            chrome.tabs.sendMessage( key , newJsonMessge.messageBody );
                 });
                 return;
            }

            if(newJsonMessge.messageBody.actionType === 'delete'){
                 $(chatContainer).find('[data-messageID="'+ newJsonMessge.messageBody.messageID +'"]')
                                 .remove();
                 return; 
            }
        };


        this.clearChatContainer = function(){
            $(chatContainer).empty();
            tabMap.forEach(function(value, key, map){
                    chrome.tabs.sendMessage( key ,  { 'action' : 'resetMessageInChatContainer'});
            });
            return;
        }

        this.clearTypingContainer = function(){
            $(typingContainer).empty();
            tabMap.forEach(function(value, key, map){
                    chrome.tabs.sendMessage( key ,  { 'action' : 'resetTypingInTypingContainer'});
            });
            return;
        }

        this.clearMemberContainer = function(){
            $(memberContainer).empty();
            tabMap.forEach(function(value, key, map){
                    chrome.tabs.sendMessage( key ,  { 'action' : 'resetMemberInMemberContainer'});
            });
            return;
        }

        
    }

})();


        //if get new message , send  to  chat-window
        // let MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
        // let messageObserver  = new MutationObserver (messageMutationHandler);
        // let obsConfig           = { childList: true,  attributes: true, characterData: true };
        //     // console.log(chatContainer.innerHTML);
        //     messageObserver.observe (chatContainer, obsConfig);
        
        // function messageMutationHandler(mutationRecords){
        //     console.log(tabMap);
        //     for(var i  in tabMap){
        //         console.log(i+' : '+tabMap)
        //     }
        //     mutationRecords.forEach ( function (mutation) {
        //             tabMap.forEach(function(value, key, map){
        //                     chrome.tabs.sendMessage( key , mutation.target);
        //             })
        //     });
        // }