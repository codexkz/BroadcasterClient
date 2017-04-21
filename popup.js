
var bgPage           = chrome.extension.getBackgroundPage();

var connectManager   = bgPage.connectManager ;
var controlerSocket  = connectManager.getControlerSocket();

var directoryManager = bgPage.directoryManager ;
var chatManager      = bgPage.chatManager ;

var bgAudioes        = bgPage.document.getElementById('audioContainer');
var bgMusicBox       = bgPage.document.getElementById('directoryEntryContainer');
var bgPlayBox        = bgPage.document.getElementById('mediaPlayingContainer');
var popMusicBox      = document.getElementById('directoryEntryContainer');
var popPlayBox       = document.getElementById('mediaPlayingContainer');


var connectManager = bgPage.connectManager ;

/*
*  MutationObserver bgPage is changing , if true refresh the list 
*/

var MutationObserver    = window.MutationObserver || window.WebKitMutationObserver;
var musicBoxObserver    = new MutationObserver (musicBoxMutationHandler);
var playBoxObserver     = new MutationObserver (playBoxMutationHandler);
var obsConfig           = { childList: true, characterData: true, attributes: true, subtree: true };

$(bgMusicBox).each ( function () {
    musicBoxObserver.observe (this, obsConfig);
} );

$(bgPlayBox).each ( function () {
    playBoxObserver.observe (this, obsConfig);
} );

function musicBoxMutationHandler (mutationRecords) {
    for(var i in mutationRecords){
        console.log(i+':'+mutationRecords[i].target.id+'-'+mutationRecords[i].type+'-'+ mutationRecords[i].attributeName);
        // for( var j in mutationRecords[i] )
        //   console.log(j +' : '+ mutationRecords[i][j]);
    }
        
    for(var i in mutationRecords){
      if(mutationRecords[i].type == 'attributes') updateMusicBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
      if(mutationRecords[i].type == 'attributes') updatePlayBoxAttribute(mutationRecords[i].target.id , mutationRecords[i].attributeName);
      if(mutationRecords[i].type == 'childList')  updateMusicBoxChildList(mutationRecords[i].target.id );
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
    hiddenNotOpenAudioTag(popPlayBox);
}

function hiddenNotOpenAudioTag(trgetDiv){
    $(popPlayBox).find('.directoryEntry[data-status="open"]').show();
    $(popPlayBox).find('.directoryEntry[data-status="close"]').hide();
}


/*
*  popup.html init 
*/

(function init(){
    //lightBar.createScrollbarInTarget("directoryEntryContainer");

    if (window.File && window.FileReader && window.FileList && window.Blob) {
        // Great success! All the File APIs are supported.
        document.addEventListener("DOMContentLoaded", function (){
            // Get the previous status
            let imageObj = {path : {"128": "Icons/active.png"}}
            if(bgMusicBox.firstChild)  updateMusicBoxChildList(popMusicBox.id); 
            if(bgPlayBox.firstChild)   $(bgPlayBox).children().each(function(){updatePlayBoxChildList($(this).attr('playing-data-id'),'add');});
            //hiddenNotOpenAudioTag(popPlayBox); 
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


function setMediaPlayerShowAffect(elem){
          elem.addEventListener('mouseenter',changeHightWrapper);
          elem.addEventListener('mouseleave',changeHightWrapper);
          elem.addEventListener('click',function(e){e.stopImmediatePropagation();});
          var originHeight = $(elem).css('height');
          $(elem).css('height',originHeight);
          function changeHightWrapper(e){
              changeHight.call(elem,e,originHeight);
          }
 } 

function changeHight(e,originHeight){
   if( ($(this).css('height') == (originHeight)) && (e.type !='mouseleave')){
         $(this).css('height',(parseInt(originHeight) + 200) + 'px');
         $(this).css('display','block');
         $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
            $(this).find('.mediaPlayer').css('display','block');
         });
         return ;
   }
   if((e.type !='mouseenter')){
         $(this).css('height',originHeight);
         $(this).css('display','block');
         $(this).find('.mediaPlayer').css('display','none');
         $(this).one("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function(){
            $(this).find('.mediaPlayer').css('display','none');
         });
         return ;
   }
}


function updateMusicBoxChildList(trgetDiv){
    let cln = bgPage.$('#'+trgetDiv).clone(true,true);
    $('#'+trgetDiv).replaceWith(cln) ;
    $('#'+trgetDiv).find('div[data-type="File"]').each(function(){ setMediaPlayerShowAffect(this); });
}

function updateMusicBoxAttribute(trgetDiv,attributeName){
    let attr = bgPage.$('#'+trgetDiv).attr(attributeName);
    $('#'+trgetDiv).attr(attributeName , attr) ;
    //if($('#'+trgetDiv).attr('data-type')=='File') setMediaPlayerShowAffect($('#'+trgetDiv)[0]);  ;
}

function updatePlayBoxChildList(trgetDataId,status){
    if(status == 'add'){
        let cln = bgPage.$('#directoryEntryContainer').clone(true,true);
        $(cln).find('[data-id="'+trgetDataId+'"]').attr('id','directoryEntry'+trgetDataId+'playbox');
        $(cln).find('[data-id="'+trgetDataId+'"] > .mediaPlayer').attr('id','mediaPlayer'+trgetDataId+'playbox');
        $(cln).find('[data-id="'+trgetDataId+'"] > .mediaPlayer > .play').attr('id','play'+trgetDataId+'playbox');
        $(cln).find('[data-id="'+trgetDataId+'"] > .mediaPlayer > .defaultBar').attr('id','defaultBar'+trgetDataId+'playbox');
        $(cln).find('[data-id="'+trgetDataId+'"] > .mediaPlayer > .defaultBar > .progressBar').attr('id','progressBar'+trgetDataId+'playbox');
        $('#mediaPlayingContainer').append($(cln).find('[data-id="'+trgetDataId+'"]'));
        $('#mediaPlayingContainer').find('div[data-type="File"]').each(function(){ setMediaPlayerShowAffect(this); });
    }

    if(status == 'remove'){
        $('#mediaPlayingContainer').find('[data-id="'+trgetDataId+'"]').remove();
    }
}

function updatePlayBoxAttribute(trgetDiv,attributeName){
    let attr = bgPage.$('#'+trgetDiv).attr(attributeName);
    $('#'+trgetDiv+'playbox').attr(attributeName , attr) ;
    //if($('#'+trgetDiv+'playbox').attr('data-type')=='File') setMediaPlayerShowAffect($('#'+trgetDiv+'playbox')[0]);  ;
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

    bgPage.drawer.draw(directorySystem.getRootDirectoryEntry(),bgMusicBox);
    updateMusicBoxChildList(popMusicBox.id);
    //updatePlayBoxChildList(popPlayBox.id);

    /*
    filePicker.getMusicFileList().each(function(node){
                  let str ='';
                  for(let i in node.data.path)
                      str+=node.data.path[i]+'$'+node.data.path.length+'$';
                  console.log(str +' = '+ node.data.file.name);
            });


    //for(var i in e.target )
    //  console.log(i+' = '+e.target[i]+'\n');
    
    */

    // Reset progress indicator on new file selection.

    /*
    progress.style.width = '0%';
    progress.textContent = '0%';

    reader = new FileReader();
    reader.onerror = errorHandler;
    reader.onprogress = updateProgress;
    reader.onabort = function(e) {
      alert('File read cancelled');
    };
    reader.onloadstart = function(e) {
      document.getElementById('progress_bar').className = 'loading';
    };
    reader.onload = function(e) {
      // Ensure that the progress bar displays 100% at the end.
      progress.style.width = '100%';
      progress.textContent = '100%';
      setTimeout(function(){document.getElementById('progress_bar').className='';}, 2000);
    }

    // Read in the image file as a binary string.
    
    //reader.readAsBinaryString(e.target.files[0]);
    console.log('double fuck');
    var bgPage = chrome.extension.getBackgroundPage();
    var bgmUrl = URL.createObjectURL(e.target.files[0]);

    bgPage.setBGM(bgPage,bgmUrl);
    for(var i in bgPage )
     console.log(i+' = '+bgPage[i]+'\n');
    

    let files = e.target.files;
    for (let i=0; i<files.length; i++) {
           console.log(e.target.files[i].webkitRelativePath);
      };
    //reader.readAsBinaryString(e.target.files[0]);
    //reader.readAsBinaryString(e.target.files[1]);

     let output = document.getElementById("listing");
     

     for (let i=0; i<files.length; i++) {
          let item = document.createElement("li");
          //item.innerHTML = URL.createObjectURL(files[i])
          item.innerHTML = files[i].webkitRelativePath;
          output.appendChild(item);
      };
      */
}









  // function abortRead() {
  //   reader.abort();
  // }

  // function errorHandler(evt) {
  //   switch(evt.target.error.code) {
  //     case evt.target.error.NOT_FOUND_ERR:
  //       alert('File Not Found!');
  //       break;
  //     case evt.target.error.NOT_READABLE_ERR:
  //       alert('File is not readable');
  //       break;
  //     case evt.target.error.ABORT_ERR:
  //       break; // noop
  //     default:
  //       alert('An error occurred reading this file.');
  //   };
  // }

  // function updateProgress(evt) {
  //   // evt is an ProgressEvent.
  //   if (evt.lengthComputable) {
  //     var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
  //     // Increase the progress bar length.
  //     if (percentLoaded < 100) {
  //       progress.style.width = percentLoaded + '%';
  //       progress.textContent = percentLoaded + '%';
  //     }
  //   }
  // }

  //document.getElementById('files').addEventListener('change', handleFileSelect, false);












// document.addEventListener("DOMContentLoaded", function () {
//     $('#aaa').on('click',aaa);
// });

// function aaa(){
//   chrome.browserAction.setPopup({popup: "index.html"});
//   window.location.href="index.html";
// };






/**
 * A linked-list with key-based map. Use case: recent items cache, storing the
 * last X items with linear-time lookup and removal (constant average cost per
 * operation)
 *
 * - Adding an item to head will remove any existing items with that key
 * - Adding to head will remove an item from tail if needed to prevent
 *   exceeding max length
 */

// function LinkedHashMap(maxLength) {
//   this.map = {};
//   this.head = null;
//   this.tail = null;
//   this.length = 0;
//   this.maxLength = maxLength;
// }

// LinkedHashMap.prototype = {
//   get: function(key) {
//     var item = this.map[key] || {};
//     return item.payload;
//   },

//   addHead: function(key, payload) {
//     this.remove(key);
//     if (this.length === this.maxLength) {
//       this.removeTail();
//     }
//     var item = {
//       key: key,
//       prev: null,
//       next: this.head,
//       payload: payload
//     };
//     if (this.head) {
//       this.head.prev = item;
//     }
//     this.head = item;
//     if (!this.tail) {
//       this.tail = item;
//     }
//     this.map[key] = item;
//     this.length += 1;
//   },

//   removeTail: function() {
//     if (this.tail) {
//       this.removeItem(this.tail);
//     }
//   },

//   // remove item by key
//   remove: function(key) {
//     var item = this.map[key];
//     if (!item) return;
//     this.removeItem(item);
//   },

//   // this removes an item from the link chain and updates length/map
//   removeItem: function(item) {
//     if (this.head === item) {
//       this.head = item.next;
//     }
//     if (this.tail === item) {
//       this.tail = item.prev;
//     }
//     if (item.prev) {
//       item.prev.next = item.next;
//     }
//     if (item.next) {
//       item.next.prev = item.prev;
//     }
//     delete this.map[item.key];
//     this.length -= 1;
//   }
// };







/*
     for(var i in this.files[0])
        console.log(i+' = '+this.files[0][i]+'\n');
     var files = this.files;
     var numFiles = files.length;
      for (var i = 0; i < numFiles; i++) {
         var file = files[i];
         console.log(file.name+' = '+file.path+'\n');
      }
*/



//var StorageInfo = window.webkitTemporaryStorage || navigator.webkitPersistentStorage;
//var RequestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem; 
//window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, successHandler , errorHandler );
//window.RequestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, successHandler , errorHandler );
 

/*
StorageInfo.requestQuota( 10*1024*1024, function(grantedBytes) {
  RequestFileSystem(window.PERSISTENT, grantedBytes, successHandler, errorHandler);
}, errorHandler);








function successHandler(fs) {
    console.log('Opened file system: ' + fs.name);
    console.log('File system root: ' + fs.root);
    for(var i in fs.root)
        console.log(i+' = '+fs.root[i]+'\n');

    
    fs.root.getFile('fuck.txt', {create: true, exclusive: true},function(fileEntry) {
      console.log('fuck u');
    // fileEntry.isFile === true
    // fileEntry.name == 'log.txt'
    // fileEntry.fullPath == '/log.txt'

    }, errorHandler); 
}



function errorHandler(e) {
  var msg = '';
  switch (e.message) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
}
*/