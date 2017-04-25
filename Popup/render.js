(function (){

popContainerRender = new PopContainerRender();

function PopContainerRender(){
    this.init =function(){
        //bgContainerObserver.disconnect();
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
            let cln = bgPlayBoxNodes[i].cloneNode(true);
            popPlayBox.appendChild(cln);
        }  

        bgContainerObserver.observe(); 
    }

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
                    $(this).css('height',(parseInt(originHeight) + 200) + 'px');
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
        var musicBoxObserverConfig   = { childList: true,  attributes: true , subtree: true } ;
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
                    console.log(mutationRecords[i].target.id+':'+mutationRecords[i].type);
            if(mutationRecords[i].type == 'attributes'){
                    // updatePlayBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
                    updateMusicBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
            }
            if(mutationRecords[i].type == 'childList') {
                    updateMusicBoxChildList(mutationRecords[i].target.id );
            } 
                
            } 
        }

        function playBoxMutationHandler(mutationRecords){
            for(var i in mutationRecords){
                if(mutationRecords[i].type == 'childList'){
                    //   for( var j =0 ; j < mutationRecords[i].addedNodes.length ; j++ ){
                    //       updatePlayBoxChildList(mutationRecords[i].addedNodes[j].getAttribute('playing-data-id'),'add');
                    //   }
                    //   for( var k =0 ; k < mutationRecords[i].removedNodes.length ; k++ ){
                    //       updatePlayBoxChildList(mutationRecords[i].removedNodes[k].getAttribute('playing-data-id'),'remove');
                    //   }
                }  
            } 
        }




        function updateMusicBoxChildList(trgetDiv){
            let cln = bgPage.$('#'+trgetDiv)[0].cloneNode(true);
            let expando = jQuery['expando']+'1';
            console.log(expando);
            console.log(cln); 
            console.log($('#'+trgetDiv)); 
            $(cln)[0][expando] = $('#'+trgetDiv)[0][expando] ;
            console.log($(cln)); 
            //$('#'+trgetDiv).replaceWith(cln) ;
            //console.log($('#'+trgetDiv)); 
            //$('#'+trgetDiv).find('div[data-type="File"]').each(function(){ setMediaPlayerShowAffect(this); });
        }

        function updateMusicBoxAttribute(trgetDiv,attributeName){
            let attr = bgPage.$('#'+trgetDiv).attr(attributeName);
            $('#'+trgetDiv).attr(attributeName , attr) ;
            //if($('#'+trgetDiv).attr('data-type')=='File') setMediaPlayerShowAffect($('#'+trgetDiv)[0]);
        }

        // function updatePlayBoxChildList(trgetDataId,status){
        //     if(status == 'add'){
        //         let cln = bgPage.$('#directoryEntryContainer').clone(true,true);
        //         $(cln).find('[data-id='+trgetDataId+']').attr('id','directoryEntry'+trgetDataId+'playbox');
        //         $(cln).find('[data-id='+trgetDataId+'] > .mediaPlayer').attr('id','mediaPlayer'+trgetDataId+'playbox');
        //         $(cln).find('[data-id='+trgetDataId+'] > .mediaPlayer > .play').attr('id','play'+trgetDataId+'playbox');
        //         $(cln).find('[data-id='+trgetDataId+'] > .mediaPlayer > .defaultBar').attr('id','defaultBar'+trgetDataId+'playbox');
        //         $(cln).find('[data-id='+trgetDataId+'] > .mediaPlayer > .defaultBar > .progressBar').attr('id','progressBar'+trgetDataId+'playbox');
        //         $('#mediaPlayingContainer').append($(cln).find('[data-id="'+trgetDataId+'"]'));
        //         $('#mediaPlayingContainer').find('div[data-type="File"]').each(function(){ setMediaPlayerShowAffect(this); });
        //     }
        //     if(status == 'remove'){
        //         $('#mediaPlayingContainer').find('[data-id="'+trgetDataId+'"]').remove();
        //     }
        // }

        // function updatePlayBoxAttribute(trgetDiv,attributeName){
        //     let attr = bgPage.$('#'+trgetDiv).attr(attributeName);
        //     $('#'+trgetDiv+'playbox').attr(attributeName , attr) ;
        //     //if($('#'+trgetDiv+'playbox').attr('data-type')=='File') setMediaPlayerShowAffect($('#'+trgetDiv+'playbox')[0]); 
        // }
    }
})();
