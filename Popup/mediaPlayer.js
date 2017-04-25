
function injectDirectoryHanndlerToElement() {
		this.addEventListener('click',function (){
            console.log('sdfsdfji');
             let clickedDiv = this ;
             if($(clickedDiv).attr('data-status') == 'close' ){
                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeDeeper = parseInt($(this).data('degree')) == (parseInt($(clickedDiv).data('degree')) + 1 );
                        let isChild = $(this).data('directory') == $(clickedDiv).data('id') ;
                        if(isDegreeDeeper && isChild) bgPage.$('#directoryEntryContainer >.directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','show'); // record to bg
                        return isDegreeDeeper && isChild;
                    });

                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeSame = $(this).data('degree') == $(clickedDiv).data('degree');
                        let isSelf = $(this).data('id') == $(clickedDiv).data('id') ;
                        if( ($(this).data('type') == 'Directory') && isDegreeSame && !isSelf ){
                            $(this).attr( 'data-status' , 'close' );
                            bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-status','close'); // record to bg
                        } 
                        if(isDegreeSame && !isSelf) bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','hide'); // record to bg
                        return isDegreeSame && !isSelf;
                    });

                    bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(clickedDiv).data('id')+']').attr('data-status','open'); // record to bg
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
                    });

                    $(popMusicBox).find('.directoryEntry').filter(function(){
                        let isDegreeSame =  parseInt($(this).data('degree')) == (parseInt($(clickedDiv).data('degree')) );
                        let isDirectorySame = $(this).data('directory') == $(clickedDiv).data('directory');
                        if(isDegreeSame && isDirectorySame) bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(this).data('id')+']').attr('data-style','show'); // record to bg
                        return isDegreeSame && isDirectorySame;
                    });

                     bgPage.$('#directoryEntryContainer > .directoryEntry[data-id='+$(clickedDiv).data('id')+']').attr('data-status','close'); // record to bg
                     return ;
             }
        });
}

function injectMediaPlayerHanddlersToElement () {

         setMediaPlayerShowAffect(this);

		 $(this).find('.play').on('click',function(){
		 		bgPage.mediaManager.play($(this).parent().parent().attr('data-id'),true);
		 });

		 $(this).find('.defaultBar').on('click',function(){
		 		bgPage.mediaManager.progress($(this).parent().parent().attr('data-id'),true);
		 });

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