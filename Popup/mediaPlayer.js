
function injectDirectoryHanndlerToElement() {
		this.addEventListener('click',function (){
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
        });
}



function injectMediaPlayerHanddlersToElement () {
		 $(this).find('.play').on('click',function(){
		 		bgPage.mediaManager.play($(this).data('id'),true);
		 });

		 $(this).find('.defaultBar').on('click',function(){
		 		bgPage.mediaManager.progress();
		 });

         // while (this.firstChild)  this.removeChild(this.firstChild);
         // for(let i=0 ; i < nodes.length  ; i++  ) this.appendChild( nodes[i] );   
}