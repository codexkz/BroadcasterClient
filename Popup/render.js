(function (){

popContainerRender = new PopContainerRender();

function PopContainerRender(){
    this.init =function(){
        let bgMusicBoxNodes = bgMusicBox.childNodes ;
        let bgPlayBoxNodes = bgPlayBox.childNodes ;
        for(let i = 0 ; i < bgMusicBoxNodes.length ; i++){
            let cln = bgMusicBoxNodes[i].cloneNode(true);
            popMusicBox.appendChild(cln);
            if( cln.getAttribute('data-type') == 'Directory' ) injectDirectoryHanndlerToElement.call(cln);
            if( cln.getAttribute('data-type') == 'File' )      {
                setMediaPlayerShowAffect(cln);
                injectMediaPlayerHanddlersToElement.call(cln);
            }
        } 
        for(let i = 0 ; i < bgPlayBoxNodes.length ; i++){
            let cln = createPlayBoxMediaPlayer(bgPlayBoxNodes[i].getAttribute('playing-data-id'));
            $(popPlayBox).append(cln);
            setMediaPlayerShowAffect(cln);
            injectMediaPlayerHanddlersToElement.call(cln);
        }  

        bgContainerObserver.observe(); 
    }

}

})();


/*
*  MutationObserver bgPage is changing , if true refresh the list 
*/
(function (){
    bgContainerObserver = new BgContainerObserver();
    function BgContainerObserver(){
        var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
        var musicBoxObserver    = new MutationObserver (musicBoxMutationHandler);
        var playBoxObserver     = new MutationObserver (playBoxMutationHandler);
        //var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true };
        var musicBoxObserverConfig   = { childList: true,  attributes: true , characterData: true, subtree: true} ;
        var playBoxObserverConfig    = { childList: true,  attributes: true } ;

        this.observe = function (){
           
            $(bgMusicBox).each ( function () { musicBoxObserver.observe (this, musicBoxObserverConfig ); } );
            $(bgPlayBox).each ( function () { playBoxObserver.observe (this, playBoxObserverConfig ); } );

            console.log('start observe');
        }

        this.unobserve = function (){
            $(bgMusicBox).each ( function () { musicBoxObserver.disconnect();} );
            $(bgPlayBox).each ( function () { playBoxObserver.disconnect(); } );
            console.log('end observe');
        }


        function musicBoxMutationHandler (mutationRecords) {
            for(var i in mutationRecords){
                // console.log(mutationRecords[i].target.id+':'+ mutationRecords[i].type);
                if(mutationRecords[i].type == 'attributes'){
                        updatePlayBoxAndMusicBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
                }
                if(mutationRecords[i].type == 'childList' ) {
                        //console.log(mutationRecords[i].target.id+':'+ mutationRecords[i].addedNodes);
                        updateMusicBoxChildList(mutationRecords[i].target.id , mutationRecords[i].addedNodes );
                } 
                if(mutationRecords[i].type == 'characterData') {
                        updatePlayBoxAndMusicBoxCharacterData(mutationRecords[i].target.parentNode.id , mutationRecords[i].target);
                }
            } 
        }

        function playBoxMutationHandler(mutationRecords){
            for(var i in mutationRecords){
                if(mutationRecords[i].type == 'childList'){
                      for( var j =0 ; j < mutationRecords[i].addedNodes.length ; j++ ){
                          updatePlayBoxChildList(mutationRecords[i].addedNodes[j].getAttribute('playing-data-id'),'add');
                      }
                      for( var k =0 ; k < mutationRecords[i].removedNodes.length ; k++ ){
                          updatePlayBoxChildList(mutationRecords[i].removedNodes[k].getAttribute('playing-data-id'),'remove');
                      }
                }  
            } 
        }

        function updateMusicBoxChildList(trgetDiv,nodes){
             for (let i = 0 ; i < nodes.length ; i++ ) {
                $('#'+trgetDiv).empty();                //todo : wired
                $('#'+trgetDiv).append(nodes[i]) ;
            }
        }
        
        function updatePlayBoxChildList(trgetDataId,status){
            if(status == 'add'){
                let cln = createPlayBoxMediaPlayer(trgetDataId);
                $(popPlayBox).append(cln);
                setMediaPlayerShowAffect(cln);
                injectMediaPlayerHanddlersToElement.call(cln);
            }
            if(status == 'remove'){
                $(popPlayBox).find('[data-id="'+trgetDataId+'"]').remove();
                if($(popPlayBox).is(':empty')) $('#playBoxWindow').attr('id','playBoxWindow-hide');
            }
        }

        function updatePlayBoxAndMusicBoxAttribute(trgetDiv,attributeName){
            let attr = bgPage.$('#'+trgetDiv).attr(attributeName);
            $('#'+trgetDiv).attr(attributeName , attr) ;
            $('#'+trgetDiv+'playbox').attr(attributeName , attr) ;
        }

        function updatePlayBoxAndMusicBoxCharacterData(trgetDiv,characterData){
            $('#'+trgetDiv).text(characterData.data);
        }
    }
})();


function setMediaPlayerShowAffect (elem){
        elem.addEventListener('mouseenter',changeHightWrapper);
        elem.addEventListener('mouseleave',changeHightWrapper);
        elem.addEventListener('click',function(e){e.stopImmediatePropagation();});
        let originHeight = $(elem).css('height');
        $(elem).css('height',originHeight);
        function changeHightWrapper(e){
            changeHight.call(elem,e,originHeight);
        }
} 

function changeHight (e,originHeight){
    if( ($(this).css('height') == (originHeight)) && (e.type !='mouseleave')){
            $(this).css('height',(parseInt(originHeight) + 80) + 'px');
            $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
                $(this).find('.mediaPlayer').css('display','block');
            });
            return ;
    }
    if((e.type !='mouseenter')){
            $(this).css('height',originHeight);
            $(this).find('.mediaPlayer').css('display','none');
            $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
                $(this).find('.mediaPlayer').css('display','none');
            });
            return ;
    }
}

function createPlayBoxMediaPlayer(trgetDataId){
    let text = document.createTextNode(bgPage.$('#directoryEntryContainer > [data-id='+trgetDataId+']').attr('data-name') );
    let cln = document.createElement('div');
    $(cln).append(text);
    $(cln).append(bgPage.mediaManager.getMediaPlayerElementTemplet());
    $(cln).attr('data-type','File');
    $(cln).attr('data-id',trgetDataId);
    $(cln).attr('class','directoryEntry');
    $(cln).find('.mediaPlayer').attr('id','mediaPlayer'+trgetDataId+'playbox');
    $(cln).find('.mediaPlayer > .play').attr('id','play'+trgetDataId+'playbox').text('pause');
    $(cln).find('.mediaPlayer > .defaultBar').attr('id','defaultBar'+trgetDataId+'playbox');
    $(cln).find('.mediaPlayer > .defaultBar > .progressBar').attr('id','progressBar'+trgetDataId+'playbox');
    return cln ;
}