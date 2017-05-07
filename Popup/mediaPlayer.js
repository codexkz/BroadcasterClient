
function injectDirectoryHanndlerToElement() {
		this.addEventListener('click',function (){
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


		 $(this).find('.play').on('click',function(e){
                e.preventDefault();
                e.stopImmediatePropagation();
                //let thisElem = this ;
                if(true){ //todo
                    let dataID   =   $(this).parent().parent().attr('data-id')   ;
                    let dataName =   $(this).parent().parent().attr('data-name') ;
                    bgPage.mediaManager.createMediasocketRequest(dataID,dataName);
                }else{
                    bgPage.mediaManager.play($(this).parent().parent().attr('data-id'),true); // record to bg
                }
		 });


		 $(this).find('.defaultBar').on('click',function(e){
                e.preventDefault();
                e.stopImmediatePropagation();
		 		bgPage.mediaManager.progress($(this).parent().parent().attr('data-id'),true,e.clientX); // record to bg
		 });

}

