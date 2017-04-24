
var bgPage           = chrome.extension.getBackgroundPage();

var connectManager   = bgPage.connectManager ;
var controlerSocket  = connectManager.getControlerSocket();

var directoryManager = bgPage.directoryManager ;

var bgAudioes        = bgPage.document.getElementById('audioContainer');
var bgMusicBox       = bgPage.document.getElementById('directoryEntryContainer');
var bgPlayBox        = bgPage.document.getElementById('mediaPlayingContainer');
var popMusicBox      = document.getElementById('directoryEntryContainer');
var popPlayBox       = document.getElementById('mediaPlayingContainer');


var render           ;
