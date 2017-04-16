
(function (){

drawer = new Drawer();

function Drawer(){
    var container ;
    this.draw = function( rootDirectoryEntry , divContainer ){
        container = divContainer;
        drawDirectory( rootDirectoryEntry , divContainer );
        $('[data-id=0]').show();
    };

    function drawDirectory(directoryEntry,divContainer){
        let  currentDegree  = directoryEntry.degree ;
        directoryEntry.entity.directoryEntryList.each(function (node){
            divContainer.appendChild( createDirectoryEntryDiv(node.data) );
        });
    }

    function openDirectory(clickedDiv,divContainer){
        /*some error here...  can't find by class */
        $(divContainer).find('div').filter(function(){
            let isDegreeDeeper = parseInt($(this).data('degree')) == (parseInt($(clickedDiv).data('degree')) + 1 );
            let isChild = $(this).data('directory') == $(clickedDiv).data('id') ;
            return isDegreeDeeper && isChild;
        }).show();

        $(divContainer).find('div').filter(function(){
            let isDegreeSame = $(this).data('degree') == $(clickedDiv).data('degree');
            let isSelf = $(this).data('id') == $(clickedDiv).data('id') ;
            if( ($(this).data('type') == 'Directory') && isDegreeSame && !isSelf ) $(this).attr( 'data-status' , 'close' );
            return isDegreeSame && !isSelf;
        }).hide();
    }
    

    function closeDirectory(clickedDiv,divContainer){
        /*some error here...  can't find by class */
        $(divContainer).find('div').filter(function(){
            let isDegreeDeeper = (parseInt($(this).data('degree')) > parseInt($(clickedDiv).data('degree'))) ;
            if( ($(this).data('type') == 'Directory') && isDegreeDeeper ) $(this).attr( 'data-status' , 'close' );
            return isDegreeDeeper;
        }).hide();

        $(divContainer).find('div').filter(function(){
            let isDegreeSame = $(this).data('degree') == $(clickedDiv).data('degree');
            let isDirectorySame = $(this).data('directory') == $(clickedDiv).data('directory');
            return isDegreeSame && isDirectorySame;
        }).show();
    }

    function createDirectoryEntryDiv(directoryEntry){
        let text = document.createTextNode( directoryEntry.entity.name );
        let elem = document.createElement( 'div' );
            elem.setAttribute( 'class' , 'directoryEntry' );
            elem.setAttribute( 'data-id' , directoryEntry.uuid );
            elem.setAttribute( 'data-type' , directoryEntry.isDirectory? 'Directory': 'File');
            elem.setAttribute( 'data-created' , 'false');
            elem.setAttribute( 'data-directory' , directoryEntry.currentDirectory.entry ? directoryEntry.currentDirectory.entry.uuid : '' );
            elem.setAttribute( 'data-degree' , directoryEntry.degree);
            elem.setAttribute( 'data-status' , 'close' );
            elem.appendChild( text );
        if(directoryEntry.isDirectory) $(elem).hide().on('click',directoryClickHanddler);
        if(directoryEntry.isFile)      $(elem).hide().append(mediaManager.createMediaplayer());
        
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
        
        function directoryClickHanddler(){
            let originDiv = $('[data-id='+this.getAttribute('data-id')+']');

            if($(originDiv).attr('data-created') == 'false'){
                drawDirectory( directoryEntry , container);
                $(originDiv).attr( 'data-created' , 'true');
                $(originDiv).trigger('click');
                //$(originDiv).attr( 'data-status' , 'open' );
            }else{
                switch($(originDiv).attr('data-status')) {
                    case 'close':
                        openDirectory(originDiv,container);
                        $(originDiv).attr( 'data-status' , 'open' );
                        break;
                    case 'open':
                        closeDirectory(originDiv,container);
                        $(originDiv).attr( 'data-status' , 'close' );
                        break;
                    default:
                }
            } 
        }//end-directoryClickHanddler()

        // function fileClickHanddler(){
        //     let originDiv = $('[data-id='+this.getAttribute('data-id')+']');
        //     switch($(originDiv).attr('data-status')) {
        //         case 'close': 
        //                 if(directoryEntry.entity.type.split('/')[0] == 'video'){
        //                     let videoFile        = '?file='     + (window.URL.createObjectURL(directoryEntry.entity));
        //                     let videoTitle       = '&title='    + directoryEntry.entity.name;
        //                     let config   =  {  url:chrome.runtime.getURL('video.html') + videoFile + videoTitle , type:'popup' ,width:0 , height:0 }  ;
        //                     let callback = function(window){    $(originDiv).attr('data-window',window.id); } ;
        //                     chrome.runtime.onMessage.addListener(setVideoConfigAfterWindowAlready);
        //                     chrome.windows.create(config , callback );
        //                 }else{
        //                     //Avoid the Promise Error
        //                     setTimeout(function () {  if (audioElem.paused) audioElem.play(); }, 150 );
        //                     //audioElem.play(); 
        //                 }
        //                 $(originDiv).attr( 'data-status' , 'open' );
        //                 break;
        //         case 'open':
        //                 if(directoryEntry.entity.type.split('/')[0] == 'video'){ 
        //                     chrome.windows.remove(parseInt($(originDiv).attr('data-window'))); 
        //                     $(originDiv).attr( 'data-status' , 'close' );
        //                 }else{
        //                     audioElem.pause(); 
        //                     $(originDiv).attr( 'data-status' , 'close' );
        //                 }
        //                 break;
        //         default:
        //     }
        // }//end-fileClickHanddler()

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
        return elem;
    }//end-createDirectoryEntryDiv()

    // chrome.tabs.onRemoved.addListener(function (tabId,removeInfo){
    //     $('[data-window='+removeInfo.windowId+']').attr( 'data-status' , 'close' );
    // });
}//end-Drawer()
})();



