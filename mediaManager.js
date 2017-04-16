
(function(){

    mediaManager = new MediaManager() ;

    function MediaManager(){
        var htmlFileURL = chrome.runtime.getURL('mediaPlayer.html');
        var mediaPlayerElement = null ;

        (function init(){
            var xhr = new XMLHttpRequest();
            xhr.open('POST', htmlFileURL ,  false );
            xhr.onload  = onLoadHanddler ;
            xhr.send();
            function onLoadHanddler(){
                if (xhr.readyState === 4 && xhr.status == 200) {
                    console.log('i have work');
                    let doc = new DOMParser().parseFromString(xhr.responseText, 'text/html');
                    mediaPlayerElement = doc.all[0].getElementsByClassName('mediaPlayer')[0];
                    console.log(mediaPlayerElement);    
                }
            }
        })();



        // let audioElem ;
        // if(directoryEntry.isFile){
        //         elem.setAttribute( 'data-created' , 'true');
        //         audioElem = document.createElement('audio');
        //         audioElem.setAttribute( 'data-id' , directoryEntry.uuid );
        //         audioElem.setAttribute( 'data-music-name' , directoryEntry.entity.name );
        //         audioElem.setAttribute( 'data-status' , 'close' );
        //         audioElem.setAttribute( 'loop' , 'loop' );
        //         audioElem.setAttribute( 'type' , directoryEntry.entity.type );
        //         audioElem.setAttribute( 'src' , window.URL.createObjectURL(directoryEntry.entity) );
        //         document.getElementById('audioContainer').appendChild( audioElem );
        //         //document.getElementById('audioControlerContainer').appendChild( elem );
        //         $('#audioControlerContainer').append($(elem).clone(true));
        // }
        
        

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

        this.newMedia = function(){

        }

        this.closeMedia = function(){

        }

        //for sender
        this.play =function(){
            
        }

        this.pause  =function(){
             
        }

        this.stop  =function(){
             
        }
        
        this.createMediaplayer =function(){
            return $(mediaPlayerElement).clone(true) ;
            
            //             function fileClickHanddler(){
            // let originDiv = $('[data-id='+this.getAttribute('data-id')+']');
            // switch($(originDiv).attr('data-status')) {
            //     case 'close': 
            //             if(directoryEntry.entity.type.split('/')[0] == 'video'){
            //                 let videoFile        = '?file='     + (window.URL.createObjectURL(directoryEntry.entity));
            //                 let videoTitle       = '&title='    + directoryEntry.entity.name;
            //                 let config   =  {  url:chrome.runtime.getURL('video.html') + videoFile + videoTitle , type:'popup' ,width:0 , height:0 }  ;
            //                 let callback = function(window){    $(originDiv).attr('data-window',window.id); } ;
            //                 chrome.runtime.onMessage.addListener(setVideoConfigAfterWindowAlready);
            //                 chrome.windows.create(config , callback );
            //             }else{
            //                 //Avoid the Promise Error
            //                 setTimeout(function () {  if (audioElem.paused) audioElem.play(); }, 150 );
            //                 //audioElem.play(); 
            //             }
            //             $(originDiv).attr( 'data-status' , 'open' );
            //             break;
            //     case 'open':
            //             if(directoryEntry.entity.type.split('/')[0] == 'video'){ 
            //                 chrome.windows.remove(parseInt($(originDiv).attr('data-window'))); 
            //                 $(originDiv).attr( 'data-status' , 'close' );
            //             }else{
            //                 audioElem.pause(); 
            //                 $(originDiv).attr( 'data-status' , 'close' );
            //             }
            //             break;
            //     default:
            // }
        }//end-fileClickHanddler()

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
        // return elem;

        //close vedio window 
        chrome.tabs.onRemoved.addListener(function (tabId,removeInfo){
            $('[data-window='+removeInfo.windowId+']').attr( 'data-status' , 'close' );
        });
    }
})();