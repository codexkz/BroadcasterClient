
(function(){

    mediaManager = new MediaManager() ;

    function MediaManager(){
        let htmlFileURL = chrome.runtime.getURL('Popup/mediaPlayer.html');
        let mediaPlayerElement = null ;


        (function init(){
            var xhr = new XMLHttpRequest();
            xhr.open('POST', htmlFileURL ,true);
            xhr.onload  = onLoadHanddler ;
            xhr.send();
            function onLoadHanddler(){
                if (xhr.readyState === 4 && xhr.status == 200) {
                    let doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
                    mediaPlayerElement = doc.all[0].getElementsByClassName('mediaPlayer')[0];
                }
            }
        })();

         //自聽模式
         //send
         //播放曲目:點選自聽按鈕

        //stream 模式
        //send
        //播放曲目:點選曲目表時，點選播放按鈕
        
        //control 模式
        //send
        //播放曲目:點選曲目表時，點選播放按鈕
        

        //receive
        //接收從controler送來的訊息,開啟新playlist標籤，送新的媒體串流過來
        //控制曲目方式

        //receive
        //接收從controler送來的訊息,開啟新playlist標籤，並且連到指定的空間取得音樂路徑，下載完成後通知已下載完成
        //控制曲目方式

        this.closeMedia = function(){

        }

        //for sender
        // this.play =function(){
            
        // }

        // this.pause  =function(){
             
        // }

        // this.stop  =function(){
             
        // }

        
        this.play = function(dataID,isSelfListener){
            
            let mediaPlayerElem = $('#directoryEntryContainer > [data-id='+dataID+'] > .mediaPlayer')[0];
            let mediaElem       = $('#audioContainer > [data-id='+ dataID +']')[0] ;
            if(!mediaElem.paused && !mediaElem.ended){
                // if(mediaElem.getAttribute('type').split('/')[0] == 'video'){
                //     chrome.windows.remove(parseInt($(mediaPlayerElem).parent().attr('data-window'))); 
                // }else{
                if(isSelfListener){
                    mediaElem.pause();
                }else{
                    mediasocketRequest();
                }
                //}
                //$(mediaPlayerElem).parent().attr( 'data-status' , 'close' );
                mediaPlayerElem.playbutton[0].innerText = 'play';
                mediaManager.removeFromMediaPlayingContainer(mediaPlayerElem.dataID);
                window.clearInterval(mediaPlayerElem.updateCounter);
            }else{
                // if(mediaElem.getAttribute('type').split('/')[0] == 'video'){
                //     let videoFile        = '?file='     + mediaElem.getAttribute('src');
                //     let videoTitle       = '&title='    + mediaElem.getAttribute('data-media-name');
                //     let config   =  {  url:chrome.runtime.getURL('Windows/video-window.html') + videoFile + videoTitle , type:'popup' ,width:0 , height:0 }  ;
                //     let callback = function(window){   $(mediaPlayerElem).parent().attr('data-window',window.id); } ;
                //     chrome.runtime.onMessage.addListener(setVideoConfigAfterWindowAlready);
                //     chrome.windows.create(config , callback );
                // }else{
                if(isSelfListener){
                    mediaElem.play();
                }else{
                    mediasocketRequest();
                    //mediaPlayerElem.mediasockpairid = mediasocketRequest(,true);
                }
                //}
                //$(mediaPlayerElem).parent().attr( 'data-status' , 'open' );
                mediaPlayerElem.playbutton[0].innerText = 'pause';
                mediaManager.insertToMediaPlayingContainer(mediaPlayerElem.dataID);
                mediaPlayerElem.updateCounter = window.setInterval(update,250);
            }
            function update(){
                if(!mediaElem.ended){
                    var size = mediaElem.currentTime/mediaElem.duration*100;
                    mediaPlayerElem.progressBar[0].style.width=size+'%';
                }else{
                    mediaPlayerElem.progressBar[0].style.width='0%';
                    //$(mediaPlayerElem).parent().attr( 'data-status' , 'close' );
                    mediaPlayerElem.playbutton[0].innerText = 'play';
                    mediaManager.removeFromMediaPlayingContainer(mediaPlayerElem.dataID);
                }
            }
        }

        this.progress = function(dataID,isSelfListener,clientX){
            if(isSelfListener){
                let mediaPlayerElem = $('#directoryEntryContainer > [data-id='+dataID+'] > .mediaPlayer')[0];
                let mediaElem       = $('#audioContainer > [data-id='+ dataID +']')[0] ;
                let mouseX = clientX-(mediaPlayerElem.defaultBar[0].offsetLeft);
                let defaultBarWidth= 244 ; //parseInt(window.getComputedStyle(mediaPlayerElem.defaultBar,null).getPropertyValue('width'));  //window.getComputedStyle(defaultBar,null).getPropertyValue("width")
                let size = mouseX/defaultBarWidth*100;
                mediaPlayerElem.progressBar[0].style.width = size + '%' ;
                mediaElem.currentTime = mediaElem.duration * size / 100 ;
            }
        }

        this.createMediaplayer =function(parentElem){
            let elem = mediaPlayerElement.cloneNode(true);
            elem.dataID          = $(parentElem).attr('data-id');
            elem.defaultBar      = $(elem).find('.defaultBar').attr('id','defaultBar'+ elem.dataID ) ;
            elem.progressBar     = $(elem).find('.progressBar').attr('id','progressBar'+ elem.dataID );
            elem.playbutton      = $(elem).find('.play').attr('id','play'+  elem.dataID );
            elem.syncbutton      = $(elem).find('.sync').attr('id','sync'+  elem.dataID );
            elem.loopbutton      = $(elem).find('.loop').attr('id','loop'+  elem.dataID );
            elem.fadebutton      = $(elem).find('.fade').attr('id','fade'+  elem.dataID );
            $(elem).attr('id','mediaPlayer'+  elem.dataID ) ;
            return  elem ;
        }

        this.getMediaPlayerElementTemplet = function(){
            return mediaPlayerElement.cloneNode(true);
        }

        this.insertToMediaPlayingContainer = function(dataID){
            let targetDivList = $('#mediaPlayingContainer').find('[data-id="'+dataID+'"]');
            if(targetDivList.length == 0 ) $('#mediaPlayingContainer').append($(document.createElement( 'div' )).attr('playing-data-id',dataID));
        }
        this.removeFromMediaPlayingContainer = function(dataID){
            let targetDivList = $('#mediaPlayingContainer').find('[playing-data-id="'+dataID+'"]');
            if(targetDivList.length > 0 )  $(targetDivList).remove();
        }
        

        this.createMediasocketRequest = function(dataID,dataName){
            let messageJson = {
                    'action'       : 'openMediaSocket'     ,
                    'actionType'   : 'MediaSendSocket'     ,
                    'target'       : 'all'                 ,
                    'data'         : {
                        'id'   : dataID   ,
                        'name' : dataName
                    }     
            };    
            connectManager.getControlerSocket().doSend(messageJson);
        }

        this.sychron = function(response){
            if(response.actionType == 'MediaReceiveSocket'){
                //let mediaReceiveSocket = connectManager.getMediaSendSocket(response.pairID);
                receiveMedia(response);
                return;
            }


            if(response.actionType == 'MediaSendSocket'){
                let mediaSendSocket = connectManager.getMediaSendSocket(response.pairID);
                let dataUrl         = $('#audioContainer > [data-id='+ response.dataId +']').attr('src');
                receiveMedia(response);
                sendMedia(dataUrl,mediaSendSocket);

                function sendMedia(url,socket){
                    //getBlobFromObjectURL
                    var xhr = new XMLHttpRequest();
                        xhr.open('GET', url, true);
                        xhr.responseType = 'arraybuffer';
                        xhr.onload = function(e) { 
                            if (this.status == 200){
                                let arraybuffer = this.response ;
                                setTimeout(function(){
                                    socket.doSend(arraybuffer); 
                                },0);
                            }
                        };
                        xhr.send();
                }
                return;
            }

            function receiveMedia(response){
                    let text = document.createTextNode( response.dataName );
                    let elem = document.createElement( 'div' );
                    let audioElem = document.createElement('audio');
                        elem.setAttribute( 'id' , 'directoryEntryReceive'+response.pairID );
                        elem.setAttribute( 'class' , 'directoryEntry' );
                        elem.setAttribute( 'data-id' , 'Receive'+response.pairID );
                        elem.setAttribute( 'data-type' , 'File' );
                        elem.setAttribute( 'data-directory' , '' );
                        elem.setAttribute( 'data-degree' , '0');
                        elem.setAttribute( 'data-status' , 'close' );
                        elem.setAttribute( 'data-style' , 'hide' );
                        elem.setAttribute( 'data-name'  , response.dataName );
                        elem.appendChild( text );
                        audioElem.setAttribute( 'id' , 'audioElemReceive'+response.pairID );
                        audioElem.setAttribute( 'data-id' , 'Receive'+response.pairID );
                        audioElem.setAttribute( 'data-media-name' , response.dataName );
                        audioElem.setAttribute( 'data-status' , 'close' );
                        audioElem.setAttribute( 'loop' , 'loop' );
                        audioElem.setAttribute( 'type' , 'blob' );
                        audioElem.setAttribute( 'src' ,  '' );
                        audioElem.setAttribute( 'autoplay' ,  'autoplay' );
                        document.getElementById('audioContainer').appendChild( audioElem );
                        elem.appendChild(mediaManager.createMediaplayer(elem,audioElem));
                        $('#mediaPlayingContainer').append($(document.createElement( 'div' )).attr('playing-data-id','Receive'+response.pairID));
            }

        }
        // function mediasockpairid(){

        // }

        //instance.objectUrlConverter = new Worker('worker.js');  
        
        // function setVideoConfigAfterWindowAlready(request, sender, sendResponse) {
        //     if(request.action == 'alreadySetWindow'){
        //         //it's asynchronized ?
        //         chrome.tabs.sendMessage(sender.tab.id, {action: "setVolume",data:100});
        //         chrome.tabs.sendMessage(sender.tab.id, {action: "setCurrentTime",data:audioElem.currentTime});
        //         chrome.tabs.sendMessage(sender.tab.id, {action: "play"});
        //         audioElem.volume  = 0 ;
        //         //Avoid the Promise Error
        //         setTimeout(function () {  if (audioElem.paused) audioElem.play(); }, 150 );
        //     }
        // }

        // //close vedio window 
        // chrome.tabs.onRemoved.addListener(function (tabId,removeInfo){
        //     $('[data-window='+removeInfo.windowId+']').attr( 'data-status' , 'close' );
        // });
    }
})();