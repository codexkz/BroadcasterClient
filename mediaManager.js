
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

        this.newMedia = function(){

        }

        this.closeMedia = function(){

        }

        //for sender
        // this.play =function(){
            
        // }

        // this.pause  =function(){
             
        // }

        // this.stop  =function(){
             
        // }
        
        this.createMediaplayer =function(elem){
            return (function bindEventHanddlerOnNewElement(mediaPlayerElem,parentElem){

                mediaPlayerElem.playbutton      = $(mediaPlayerElem).find('.play').attr('id','play'+$(parentElem).attr('data-id')) ;
                mediaPlayerElem.defaultBar      = $(mediaPlayerElem).find('.defaultBar').attr('id','defaultBar'+$(parentElem).attr('data-id')) ;
                mediaPlayerElem.progressBar     = $(mediaPlayerElem).find('.progressBar').attr('id','progressBar'+$(parentElem).attr('data-id'));
                mediaPlayerElem.mediaElement    = $('#audioContainer').find('[data-id="'+$(parentElem).attr('data-id')+'"]')[0] ;

                $(mediaPlayerElem).find('.play').on('click',playButtonHanddler);
                $(mediaPlayerElem).find('.defaultBar').on('click',defaultBarClickedHanddler);

                function playButtonHanddler(e){
                    e.stopPropagation();
                    if(!mediaPlayerElem.mediaElement.paused && !mediaPlayerElem.mediaElement.ended){
                        mediaPlayerElem.mediaElement.pause();
                        //$(parentElem).attr( 'data-status' , 'close' );
                        mediaPlayerElem.playbutton[0].textContent='play';
                        window.clearInterval(mediaPlayerElem.updateCounter);
                    }else{
                        mediaPlayerElem.mediaElement.play();
                        //$(parentElem).attr( 'data-status' , 'open' );
                        parentElem.playbutton[0].textContent ='pause';
                        mediaPlayerElem.updateCounter = window.setInterval(update,250);
                    }

                    function update(){
                        if(!mediaPlayerElem.mediaElement.ended){
                            var size = mediaPlayerElem.mediaElement.currentTime/mediaPlayerElem.mediaElement.duration*100;
                            mediaPlayerElem.progressBar[0].style.width=size+'%';
                        }else{
                            mediaPlayerElem.progressBar[0].style.width='0%';
                            //$(parentElem).attr( 'data-status' , 'close' );
                            mediaPlayerElem.playButton[0].textContent='play';
                        }
                    }
                }

                function defaultBarClickedHanddler(e){
                    e.stopPropagation();
                    var mouseX = e.clientX-(mediaPlayerElem.defaultBar[0].offsetLeft);
                    var defaultBarWidth= 244 ; //parseInt(window.getComputedStyle(mediaPlayerElem.defaultBar,null).getPropertyValue('width'));  //window.getComputedStyle(defaultBar,null).getPropertyValue("width")
                    var size = mouseX/defaultBarWidth*100;
                    mediaPlayerElem.progressBar[0].style.width = size + '%' ;
                    mediaPlayerElem.mediaElement.currentTime = mediaPlayerElem.mediaElement.duration * size / 100 ;
                }

                return  mediaPlayerElem ;

            })($(mediaPlayerElement).clone(false),elem);


            //return newMediaPlayerElement ;
            
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