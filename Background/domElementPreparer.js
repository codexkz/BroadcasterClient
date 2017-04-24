
(function (){

domElementPreparer = new DomElementPreparer();

function DomElementPreparer(){
    var container ;
    this.init = function( rootDirectoryEntry , divContainer ){
        container = divContainer;
        createDirectory( rootDirectoryEntry , divContainer );
        $('.directoryEntry[data-id=0]').attr('data-style' , 'show' );
    };

    function createDirectory(directoryEntry,divContainer){
        directoryEntry.entity.directoryEntryList.each(function (node){
            divContainer.insertBefore( createDirectoryEntryDiv(node.data),divContainer.firstChild );
        });
    }

    function createDirectoryEntryDiv(directoryEntry){
        let text = document.createTextNode( directoryEntry.entity.name );
        let elem = document.createElement( 'div' );
            elem.setAttribute( 'id' , 'directoryEntry'+directoryEntry.uuid );
            elem.setAttribute( 'class' , 'directoryEntry' );
            elem.setAttribute( 'data-id' , directoryEntry.uuid );
            elem.setAttribute( 'data-type' , directoryEntry.isDirectory? 'Directory': 'File');
            elem.setAttribute( 'data-directory' , directoryEntry.currentDirectory.entry ? directoryEntry.currentDirectory.entry.uuid : '' );
            elem.setAttribute( 'data-degree' , directoryEntry.degree);
            elem.setAttribute( 'data-status' , 'close' );
            elem.setAttribute( 'data-style' , 'hide' );
            elem.appendChild( text );
        if(directoryEntry.isDirectory){
                createDirectory( directoryEntry , container);
        }
        if(directoryEntry.isFile){
                let audioElem = document.createElement('audio');
                audioElem.setAttribute( 'data-id' , directoryEntry.uuid );
                audioElem.setAttribute( 'data-music-name' , directoryEntry.entity.name );
                audioElem.setAttribute( 'data-status' , 'close' );
                audioElem.setAttribute( 'loop' , 'loop' );
                audioElem.setAttribute( 'type' , directoryEntry.entity.type );
                audioElem.setAttribute( 'src' , window.URL.createObjectURL(directoryEntry.entity) );
                document.getElementById('audioContainer').appendChild( audioElem );
                //document.getElementById('audioControlerContainer').appendChild( elem );
                $(elem).append(mediaManager.createMediaplayer(elem,audioElem));
        }
        return elem;
    }//end-createDirectoryEntryDiv()

}
})();



