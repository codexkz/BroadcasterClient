(function (){

render = new Render();

function Render(){
    this.init =function(){
        let bgMusicBoxNodes = bgMusicBox.childNodes ;
        let bgPlayBoxNodes = bgPlayBox.childNodes ;
        for(let i = 0 ; i < bgMusicBoxNodes.length ; i++){
            let cln = bgMusicBoxNodes[i].cloneNode(true);
            if( cln.getAttribute('data-type') == 'Directory' ) cln.addEventListener('click',directoryHanndler);
            popMusicBox.appendChild(cln);
        } 
        for(let j = 0 ; j < bgPlayBoxNodes.length ; j++){
            let cln = bgPlayBoxNodes[j].cloneNode(true);
            popPlayBox.appendChild(cln);
        }  

        function directoryHanndler(){
             let clickedDiv = this ;
             if($(clickedDiv).attr('data-status') == 'close' ){
                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeDeeper = parseInt($(this).data('degree')) == (parseInt($(clickedDiv).data('degree')) + 1 );
                        let isChild = $(this).data('directory') == $(clickedDiv).data('id') ;
                        if(isDegreeDeeper && isChild) bgPage.$('#directoryEntryContainer >.directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','show'); // record to bg
                        return isDegreeDeeper && isChild;
                    }).attr('data-style','show');

                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeSame = $(this).data('degree') == $(clickedDiv).data('degree');
                        let isSelf = $(this).data('id') == $(clickedDiv).data('id') ;
                        if( ($(this).data('type') == 'Directory') && isDegreeSame && !isSelf ){
                            $(this).attr( 'data-status' , 'close' );
                            bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-status','close'); // record to bg
                        } 
                        if(isDegreeSame && !isSelf) bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','hide'); // record to bg
                        return isDegreeSame && !isSelf;
                    }).attr('data-style','hide');

                    bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(clickedDiv).data('id')+']').attr('data-status','open'); // record to bg
                    $(clickedDiv).attr('data-status','open');
                    return ;
             }

             if($(clickedDiv).attr('data-status') == 'open'){
                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeDeeper = (parseInt($(this).data('degree')) > parseInt($(clickedDiv).data('degree'))) ;
                        if( ($(this).data('type') == 'Directory') && isDegreeDeeper ){
                             $(this).attr( 'data-status' , 'close' );
                             bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-status','close'); // record to bg
                        }
                        if(isDegreeDeeper) bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','hide'); // record to bg
                        return isDegreeDeeper;
                    }).attr('data-style','hide');

                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeSame =  parseInt($(this).data('degree')) == (parseInt($(clickedDiv).data('degree')) );
                        let isDirectorySame = $(this).data('directory') == $(clickedDiv).data('directory');
                        if(isDegreeSame && isDirectorySame) bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','show'); // record to bg
                        return isDegreeSame && isDirectorySame;
                    }).attr('data-style','show');

                     bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(clickedDiv).data('id')+']').attr('data-status','close'); // record to bg
                    $(clickedDiv).attr('data-status','close');
                    return ;
             }
                
        }
    }

    
}
})();

/*
*  MutationObserver bgPage is changing , if true refresh the list 
*/

var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
var musicBoxObserver    = new MutationObserver (musicBoxMutationHandler);
var playBoxObserver     = new MutationObserver (playBoxMutationHandler);
var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true };

$(bgMusicBox).each ( function () {
    musicBoxObserver.observe (this, { childList: true,  attributes: true , subtree: true });
} );

$(bgPlayBox).each ( function () {
    playBoxObserver.observe (this, { childList: true,  attributes: true });
} );

function musicBoxMutationHandler (mutationRecords) {
    for(var i in mutationRecords){
      if(mutationRecords[i].type == 'attributes'){
            // updatePlayBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
            // updateMusicBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
      }
      if(mutationRecords[i].type == 'childList') {
            // updateMusicBoxChildList(mutationRecords[i].target.id );
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



// function setMediaPlayerShowAffect(elem){
//           elem.addEventListener('mouseenter',changeHightWrapper);
//           elem.addEventListener('mouseleave',changeHightWrapper);
//           elem.addEventListener('click',function(e){e.stopImmediatePropagation();});
//           var originHeight = $(elem).css('height');
//           $(elem).css('height',originHeight);
//           function changeHightWrapper(e){
//               changeHight.call(elem,e,originHeight);
//           }
//  } 

// function changeHight(e,originHeight){
//    if( ($(this).css('height') == (originHeight)) && (e.type !='mouseleave')){
//          $(this).css('height',(parseInt(originHeight) + 200) + 'px');
//          $(this).css('display','block');
//          $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
//             $(this).find('.mediaPlayer').css('display','block');
//          });
//          return ;
//    }
//    if((e.type !='mouseenter')){
//          $(this).css('height',originHeight);
//          $(this).css('display','block');
//          $(this).find('.mediaPlayer').css('display','none');
//          $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
//             $(this).find('.mediaPlayer').css('display','none');
//          });
//          return ;
//    }
// }


// function updateMusicBoxChildList(trgetDiv){
//     let cln = bgPage.$('#'+trgetDiv).clone(true,true);
//     $('#'+trgetDiv).replaceWith(cln) ;
//     $('#'+trgetDiv).find('div[data-type="File"]').each(function(){ setMediaPlayerShowAffect(this); });
// }

// function updateMusicBoxAttribute(trgetDiv,attributeName){
//     let attr = bgPage.$('#'+trgetDiv).attr(attributeName);
//     $('#'+trgetDiv).attr(attributeName , attr) ;
//     if($('#'+trgetDiv).attr('data-type')=='File') setMediaPlayerShowAffect($('#'+trgetDiv)[0]);
// }

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