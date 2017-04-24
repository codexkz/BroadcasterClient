/*
*  popup.html init 
*/

(function init(){

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        document.addEventListener("DOMContentLoaded", function (){
            // Get the previous status
            //let imageObj = {path : {"128": "Icons/active.png"}};
            
            render.init();

            if(controlerSocket && controlerSocket.readyState ==1)  connectSuccessFunc();
            if(controlerSocket && controlerSocket.readyState ==3)  connectFailFunc();
            $('#channelID').val( (connectManager.getChannelID()=='default') ? '' : connectManager.getChannelID() );

            // Change button style become defualt
            $('#channelID').on('keyup',connectPreFunc);
            $('#channelPassword').on('keyup',connectPreFunc);
            
            //main 
            $('#filepicker').on('change',handlePickedFiles);
            $('#connect').on('click',handleConnect);
        });
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
})(); 


/*
*  pickedFiles 
*/

function handlePickedFiles(e){
    var directorySystem  ;
    directorySystem = directoryManager.createDirectorySystem(e.target.files);
    directorySystem.draw();

    while (bgMusicBox.firstChild) bgMusicBox.removeChild(bgMusicBox.firstChild);
    while (bgPlayBox.firstChild)  bgPlayBox.removeChild(bgPlayBox.firstChild);
    while (bgAudioes.firstChild)  bgAudioes.removeChild(bgAudioes.firstChild);

    bgPage.domElementPreparer.init(directorySystem.getRootDirectoryEntry(),bgMusicBox);
    render.init();
}


// Change playlist mode 
$('#audioWindow-hide').on('click',changeMode);
$('#audioWindow-hide').on('mouseleave',changeMode);

function changeMode(e){
    if(($(this).attr('id')=='audioWindow-hide') &&  (e.type != 'mouseleave')){
         $(this).attr('id','audioWindow');
         return;
    }
    if($(this).attr('id')=='audioWindow'){
         $(this).attr('id','audioWindow-hide');
         return;
    }
}

/*
*  connect signal handdle 
*/

function handleConnect(e){
    let channelID       = $('#channelID').val();
    let channelPassword = $('#channelPassword').val();
    connectManager.connect({ id:channelID ,pw:channelPassword },connectSuccessFunc,connectFailFunc);
}


function connectPreFunc(){
        $('#connectLabel').attr('class','connectButton');
        $('#connectLabel').text('Connect');
}

function connectSuccessFunc(){
        $('#connectLabel').attr('class','connectButton-success');
        $('#connectLabel').text('Success');
}

function connectFailFunc(){
        $('#connectLabel').attr('class','connectButton-fail');
        $('#connectLabel').text('Fail');
}
