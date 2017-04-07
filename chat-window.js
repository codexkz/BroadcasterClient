
//css injection
var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = chrome.extension.getURL('chat-window.css');
(document.head||document.documentElement).appendChild(style);

//html injection
var htmlFileURL = chrome.runtime.getURL('chatroom.html');
var htmlString = '' ;
var xhr = new XMLHttpRequest();
    xhr.open('POST', htmlFileURL ,  true );
    xhr.onreadystatechange = onReadyStateChangeHanddler ;
    xhr.send();
function onReadyStateChangeHanddler(){
    if (xhr.readyState === 4 && xhr.status == 200) {
        htmlString = xhr.responseText;
        let doc = new DOMParser().parseFromString(htmlString, 'text/html');
        document.body.appendChild(doc.all[0].getElementsByClassName('chatRoom')[0]);    
        // document.body.appendChild(document.importNode(doc.getElementsByTagName('div')[0],true));
        main();
    }
}


//main logic 
function main(){
        var tab = null    ;
        var chatRoom = document.getElementById('chatRoom');
        var chatHeader = document.getElementById('chatHeader');
        var chatMenu = document.getElementById('chatMenu-hide');
        var chatMenuList = document.getElementById('chatMenuList');
        var chatSubMenu_ChageName = document.getElementById('chatSubMenu-ChageName-hide');
        
        var chatArea = document.getElementById('chatArea');
        var chatTyping = document.getElementById('chatTyping');
        var chatInputBar = document.getElementById('chatInputBar');


        chrome.runtime.sendMessage({'action': 'getCurrentTabInfo'});
        dragable('chatRoom','chatRoom');


        //change ball mode &  window mode
        chatRoom.addEventListener('dblclick',windowModeChange);
        chatHeader.addEventListener('dblclick',windowModeChange);
        chatMenu.addEventListener('dblclick',function(e){e.stopPropagation()});
        chatSubMenu_ChageName.addEventListener('dblclick',function(e){e.stopPropagation()});
        chatArea.addEventListener('dblclick',function(e){e.stopPropagation()});
        chatTyping.addEventListener('dblclick',function(e){e.stopPropagation()});
        chatInputBar.addEventListener('dblclick',function(e){e.stopPropagation()});
        function windowModeChange(event){

            if(event)event.stopPropagation();

            if(chatRoom.getAttribute('id') == 'chatRoom'){
                chatRoom.setAttribute('id','chatRoom-ball');
                return;
            }

            if(chatRoom.getAttribute('id') == 'chatRoom-ball'){
                chatRoom.setAttribute('id','chatRoom');
                return;
            }
        }
        
        //change menu show &  menu hide
        chatMenu.addEventListener('mouseenter', menuModeChange);
        chatMenu.addEventListener('mouseleave', menuModeChange);
        chatMenuList.addEventListener('click', menuModeChange);
        function menuModeChange(event){

            if(event)event.stopPropagation();

            if(chatMenu.getAttribute('id') == 'chatMenu'){
                chatMenu.setAttribute('id','chatMenu-hide');
                return;
            }

            if(chatMenu.getAttribute('id') == 'chatMenu-hide' && event.type !='mouseleave'){
                chatMenu.setAttribute('id','chatMenu');
                return;
            }
        }

        
        var chatMenu_ChageName = chatMenu.getElementsByClassName('chageName')[0];
        chatMenu_ChageName.addEventListener('click', subMenuModeChange);

        //change submenu show &  submenu hide
        var chatSubMenu_ChageName_input = chatSubMenu_ChageName.getElementsByClassName('chatSubMenu-ChageName-input')[0];
            chatSubMenu_ChageName.addEventListener('mouseleave', subMenuModeChange);
            chatSubMenu_ChageName_input.addEventListener('keyup', sendChageNameMessageHanddler);
        function subMenuModeChange(event){
            if(event)event.stopPropagation();

            if(chatSubMenu_ChageName.getAttribute('id') == 'chatSubMenu-ChageName'){
                chatSubMenu_ChageName.setAttribute('id','chatSubMenu-ChageName-hide');
                return;
            }

            if(chatSubMenu_ChageName.getAttribute('id') == 'chatSubMenu-ChageName-hide' && event.type !='mouseleave'){
                chatSubMenu_ChageName.setAttribute('id','chatSubMenu-ChageName');
                let getUserName = {
                        'action'      : 'getUserName'         ,
                 };
                chrome.runtime.sendMessage(getUserName,function(response){
                        chatSubMenu_ChageName_input.value = response.data ;
                });
                return;
            }
        }

        function sendChageNameMessageHanddler(e){
            //send 
            if(e.keyCode == 13 && this.value.trim() ){
                //console.log('sendMessage : '+ chatInputBar.value);
                let controlmessage = {
                        'action'      : 'reName'              ,
                        'actionType'  : 'control'             ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                        'data'        : this.value.trim()     
                    };  
                try{
                    chrome.runtime.sendMessage(controlmessage);
                }catch(e){
                    // 如果sendMessge有錯誤就要重新刷新頁面
                    window.location.reload();
                }
                subMenuModeChange(e);
                return;
            }
        }



        //send message to pulgin
        chatInputBar.addEventListener('keyup',sendNewMessageHanddler);
        function sendNewMessageHanddler(e){
            //send 
            if(e.keyCode == 13 && chatInputBar.value.trim() ){
                //console.log('sendMessage : '+ chatInputBar.value);
                let newMessage = {
                        'tab'         : tab                   ,
                        'action'      : 'newMessage'          ,
                        'actionType'  : 'insert'              ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                        'messageID'   : ''                    ,
                        'messagetype' : 'text'                ,
                        'message'     : chatInputBar.value.trim()  
                    };  

                let stopTyping = {
                        'action'      : 'stopTyping'          ,
                        'actionType'  : 'notification'        ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                 };
                try{
                    chrome.runtime.sendMessage(newMessage,function(){
                        chrome.runtime.sendMessage(stopTyping);
                    });
                }catch(e){
                    // 如果sendMessge有錯誤就要重新刷新頁面
                    window.location.reload();
                }
                chatInputBar.value = '';
                return;
            }

            //stop typing
            if(!chatInputBar.value.trim()){
                let stopTyping = {
                        'action'      : 'stopTyping'          ,
                        'actionType'  : 'notification'        ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                 };
                chrome.runtime.sendMessage(stopTyping);
                return;
            }

            //typing
            if(e.keyCode != 13){
                let startTyping = {
                        'action'      : 'startTyping'          ,
                        'actionType'  : 'notification'        ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                 };
                chrome.runtime.sendMessage(startTyping);
                return;
            }

            

        }
        chatInputBar.addEventListener('focusout',function(){
            let stopTyping = {
                        'action'      : 'stopTyping'          ,
                        'actionType'  : 'notification'        ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                 };
                chrome.runtime.sendMessage(stopTyping);
                return;
        });
        
        
        //receive message from pulgin
        chrome.runtime.onMessage.addListener(receiveNewMessageHanddler);
        function receiveNewMessageHanddler(request, sender, sendResponse) {
           //console.log(request.action);

            if((request.action == "newMessage")){
                //console.log(request);
                switch(request.actionType){
                    case "insert":
                                    createMessageDiv({'senderName':request.senderName,
                                                      'message'   :request.message,
                                                      'timestamp' :request.timestamp,
                                                      'messageID' :request.messageID,
                                                      'style'     :''});
                                    chatArea.scrollTop = chatArea.scrollHeight;
                                    break;
                    case "modify":
                                    let elems = chatArea.getElementsByClassName('sender');
                                    for(let i  in elems){
                                        if(elems[i].getAttribute &&　(elems[i].getAttribute('data-timestamp') == request.oldtimestamp) ){
                                            elems[i].setAttribute('data-timestamp',request.timestamp) ;
                                            elems[i].nextSibling.textContent = request.message ; 
                                            let date = new Date(parseInt(request.timestamp)) ;
                                            elems[i].nextSibling.nextSibling.textContent =  ' edit - '
                                                                                            +date.getFullYear()+'/'
                                                                                            +(date.getMonth()+1)+'/'
                                                                                            +date.getDate() +' '
                                                                                            +date.getHours()+':'
                                                                                            +date.getMinutes()+':'
                                                                                            +date.getSeconds()+' ' ;
                                        } 
                                    }
                                    break;
                    case "delete":
                                    break;
                }
                return;
            }

            if((request.action == "channelInfo")){
                switch(request.actionType){
                    case "memberIn":
                                    break;

                    case "memberOut":
                                    break;
                                    
                    case "vioceFromTheSky":
                                    break;
                }
            }

            if((request.action =="renewTyping")){
                
                //clear
                while (chatTyping.firstChild)  chatTyping.removeChild(chatTyping.firstChild);
                if(request.typingCount ==0) return;
                
                createNotationDiv(request.senderName);

                if(request.typingCount >=2 ){
                    createNotationDiv('& '+request.typingCount+'others are typing');
                    return;
                }

                createNotationDiv('is typing');
                return;
            }

            if((request.action == "setCurrentTabInfo")){
                //console.log('get TabId '+request.tab.id);
                tab = request.tab ; 
                chrome.runtime.sendMessage({'action': 'getMessageInChatContainer','tab':tab});
                return;
            }

            if((request.action == "setMessageInChatContainer")){
                let messageContainerDom = new DOMParser().parseFromString(request.dom, 'text/html').documentElement.children[1];
                for (let i = 0; i < messageContainerDom.children.length; i++) {
                        let senderName = messageContainerDom.children[i].getAttribute('data-sendername');
                        let message    = messageContainerDom.children[i].textContent;
                        let status     = messageContainerDom.children[i].getAttribute('data-timestamp');
                        let messageID  = messageContainerDom.children[i].getAttribute('data-messageID');
                        createMessageDiv({'senderName':senderName,
                                          'message'   :message,
                                          'timestamp' :status,
                                          'messageID' :messageID,
                                          'style'     :''});
                }
                chatArea.scrollTop = chatArea.scrollHeight;
                return;
            }
            
            if((request.action =="showNotConnectInfo")){
                createMessageDiv({'senderName':'System',
                                  'message'   :'Didn\'t Connect To Channel !',
                                  'timestamp' :'',
                                  'messageID' :'',
                                  'style'     :'color:red !important;'});
                chatArea.scrollTop = chatArea.scrollHeight;
                return;
            }

            if((request.action == "reName")){
                let elems = chatArea.getElementsByClassName('sender');
                for(let i  in elems){
                    if(elems[i].textContent ==( request.senderName+' : ')) 
                        elems[i].textContent = request.data + ' : ';
                }
            }

            if((request.action == "resetMessageInChatContainer")){
                while (chatArea.firstChild) chatArea.removeChild(chatArea.firstChild);
            }
        }
        
        function modifyMessageHanddler(e){
            //send 
            if(e.keyCode == 13 && this.value.trim() ){
                let newMessage = {
                        'action'      : 'newMessage'          ,
                        'actionType'  : 'modify'              ,
                        'target'      : 'all'                 ,
                        'timestamp'   : new Date().getTime()  ,
                        'oldtimestamp': this.previousSibling.getAttribute('data-timestamp'),
                        'messageID'   : this.previousSibling.getAttribute('data-messageID'),      
                        'messagetype' : 'text'                ,
                        'message'     : this.value.trim()  
                    };  
                try{
                    chatInputBar.focus();
                    chrome.runtime.sendMessage(newMessage);
                    
                }catch(e){
                    // 如果sendMessge有錯誤就要重新刷新頁面
                    window.location.reload();
                }
                chatInputBar.value = '';
                return;
            }
        }

        var temp ='';
        function changeForm(){
             let nextTag = this.nextSibling ;
             if(this.tagName == 'DIV' || this.tagName == 'div'){
                //var e = document.getElementsByTagName('span')[0];
                let newtag = document.createElement('textarea');
                temp = this.textContent;
                newtag.value = this.textContent;
                newtag.addEventListener('keyup',modifyMessageHanddler);
                newtag.addEventListener('focusout',changeForm);
                this.parentNode.insertBefore(newtag, nextTag);
                this.parentNode.removeChild(this);
                newtag.focus();
                return;
             }

             if((this.tagName == 'TEXTAREA' || this.tagName == 'textarea') ){
                let newtag = document.createElement('div');
                newtag.setAttribute('class','content');
                newtag.textContent = temp ;
                newtag.addEventListener('dblclick',changeForm);
                this.parentNode.insertBefore(newtag, nextTag);
                this.parentNode.removeChild(this);
                return;
             }
        }

        function createMessageDiv(config){
            let message = document.createElement('div');
                message.setAttribute( 'class' ,'message' );
                message.setAttribute( 'style' , config.style );
            let sender = document.createElement('div');
                sender.setAttribute( 'class' ,'sender' );
                sender.setAttribute( 'data-timestamp' , config.timestamp );
                sender.setAttribute( 'data-messageID' , config.messageID );
                sender.textContent = config.senderName +' : ';
            let content = document.createElement('div');
                content.setAttribute( 'class' ,'content' );
                content.textContent = config.message ;
            if(config.timestamp)content.addEventListener('dblclick',changeForm);
            let status = document.createElement('div');
                status.setAttribute( 'class' ,'status' );
            let date = new Date(parseInt(config.timestamp)) ;
                status.textContent = date.getFullYear()+'/'
                                    +(date.getMonth()+1)+'/'
                                    +date.getDate() +' '
                                    +date.getHours()+':'
                                    +date.getMinutes()+':'
                                    +date.getSeconds()+' ';
                                    
            message.appendChild(sender);
            message.appendChild(content);
            if(config.timestamp)message.appendChild(status);
            chatArea.appendChild(message);
        };

        function createNotationDiv(senderName){
            let span ;
            
            for(let i=0 ; i < senderName.length  ; i++){
                span = document.createElement('div');
                if(senderName.charAt(i) == ' ')
                    span.textContent = '　'; //full space
                else 
                    span.textContent = senderName.charAt(i);
                chatTyping.appendChild(span);
            }

            span = document.createElement('div');
            span.textContent = '　'; //full space
            chatTyping.appendChild(span);   
        };

        
};

function dragable (clickEl,dragEl) {
  var p = get(clickEl);
  var t = get(dragEl);
  var drag = false;
  var mousemoveTemp = null;
  offsetX = 0;
  offsetY = 0;

  if (t) {
    var move = function (x,y) {
        let style   = window.getComputedStyle(t,null);
        let left    = (parseInt(style.getPropertyValue('left'))   + x ) + "px";
        let bottom  = (parseInt(style.getPropertyValue('bottom')) - y ) + "px";
        t.style.cssText += '; ' + 'left : ' + left + ' !important' ; // to append
        t.style.cssText += '; ' + 'bottom : ' + bottom + ' !important' ; // to append
        //style.setProperty('left'  , left    , 'important');
        //style.setProperty('bottom', bottom  , 'important');
    }

    var mouseMoveHandler = function (e) {
      e = e || window.event;

      if(!drag){return true};

      var x = mouseX(e);
      var y = mouseY(e);
      if (x != offsetX || y != offsetY) {
        move(x-offsetX,y-offsetY);
        offsetX = x;
        offsetY = y;
      }
      return false;
    }

    var start_drag = function (e) {
      e = e || window.event;

      //if(event.target.nodeName == 'INPUT') return true;

      offsetX=mouseX(e);
      offsetY=mouseY(e);

      if(drag) return stop_drag();
      drag=true; // basically we're using this to detect dragging

      // save any previous mousemove event handler:
      if (document.body.onmousemove) {
        mousemoveTemp = document.body.onmousemove;
      }
      document.body.onmousemove = mouseMoveHandler;
      return true;
    }

    var stop_drag = function () {
      drag=false;      

      // restore previous mousemove event handler if necessary:
      if (mousemoveTemp) {
        document.body.onmousemove = mousemoveTemp;
        mousemoveTemp = null;
      }
      return false;
    }
    p.onmousedown = start_drag;
    p.onmouseup = stop_drag;
  };

  function get (el) {
        if (typeof el == 'string') return document.getElementById(el);
        return el;
  }

  function mouseX (e) {
        if (e.pageX) {
            return e.pageX;
        }
        if (e.clientX) {
            return e.clientX + (document.documentElement.scrollLeft ?
                                document.documentElement.scrollLeft :
                                document.body.scrollLeft);
        }
        return null;
   }

   function mouseY (e) {
        if (e.pageY) {
            return e.pageY;
        }
        if (e.clientY) {
            return e.clientY + (document.documentElement.scrollTop ?
                                document.documentElement.scrollTop :
                                document.body.scrollTop);
        }
        return null;
    }   
}





// function str2DOMElement(htmlStr) {
//     let domObject = stringObject.split(separator,howmany)
//     let allowTag = ['div','input']
//     return element;
//     //宣告層級計數器
//     //遇到< 就放到stack中暫存 層級+1 , 遇到 >就從stack中拿取 層級 -1 ,組合成tag 並將當前層級計數給tag 
//     //組合起來的<>會放到tag stack中
//     //被放到tag stack中的tag 會跟最上頭的tag比較層級 如果層級相等就疊上去 如果層級比較大
//     let tagStringStack =  ;
//     <<<><><<<<><><><><<<>>>><>>>><><><><>>>>
//     function domObject(){

//     }

// }
// if (!('Notification' in window)) {
//     alert('這個瀏覽器不支援 Notification');
// }else if (Notification.permission === 'granted') {
//     setTimeout(startNotification, 3000);
// }else if (Notification.permission !== 'denied') {
//     Notification.requestPermission(function (permission){
//         if (permission === 'granted') {
//            setTimeout(startNotification, 3000);
//         }
//     });
// }

// function startNotification(){
//         var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
//         var newMessageObserver  = new MutationObserver (newMessageMutationHandler);
//         var obsConfig           = { childList: true,  subtree: true };
//         var messageBox          = document.getElementsByClassName('SquareCssResource-chatRoom')[0];
//             newMessageObserver.observe (messageBox, obsConfig);

//         function newMessageMutationHandler(mutationRecords){
//              mutationRecords.forEach ( function (mutation) {
//                         if(isNewMessage(mutation)){
//                                 var messageDom = document.createElement('div');
//                                     messageDom.innerHTML = mutation.target.innerHTML;
//                                     setTimeout(function(){notifyMe(messageDom);}, 120);
//                         }
//              });

//              function isNewMessage(mutation){
//                     var isNotEveryTimeChanger =   mutation.target.innerHTML != '<span style="color:green"></span>';
//                     var isLastChild           =   mutation['nextSibling'] == null ;
//                     return isNotEveryTimeChanger && isLastChild ;
//              }
//         };

//         var notificationArray = [];
    
//         function notifyMe(messageDom) {
//             if(isNotSelf(messageDom)) {
//                 var title      = messageDom.getElementsByClassName('GlobalCssResource-colorNickname')[0].textContent;
//                 var message     = messageDom.getElementsByClassName('gwt-HTML SquareCssResource-message')[0].textContent ;
//                 var options = { body: message , icon:keroIcon , sound:keroSound};
//                 var notification = new Notification(title,options);
//                 soundAudio.play();
//                 setNotificationArray(notification);
//                 notification.onclick =  function() { 
//                     window.focus(); 
//                     this.close();
//                     notificationArray.splice(notificationArray.indexOf(this), 1);
//                 };
//             }
        
//         }

//         function setNotificationArray(notification){
//             notificationArray.push(notification);
//             if(notificationArray.length > 3) notificationArray.shift().close();
//         }

//         function isNotSelf(messageDom){
//             if(messageDom.getElementsByClassName('GlobalCssResource-colorNickname')[0] == undefined) return false;
//             var isNotSelf   = messageDom.getElementsByClassName('GlobalCssResource-colorNickname')[0].textContent !=
//                               document.getElementsByClassName('gwt-TextBox SquareCssResource-nicknameField')[0].value;
//             return isNotSelf ;
//         }
// };