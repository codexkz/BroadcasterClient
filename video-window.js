var QueryString = function () {
  // This function is anonymous, is executed immediately and 
  // the return value is assigned to QueryString!
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
        // If first entry with this name
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
        // If third or later entry with this name
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}();


document.title = QueryString.title;
var playingVideo = document.getElementById('video');


window.onload = function() {
    playingVideo.setAttribute('src' , QueryString.file );
    chrome.runtime.sendMessage({action: "alreadySetWindow"});

    playingVideo.onloadeddata = function(e) {
        var width = this.videoWidth;
        var height = this.videoHeight;
        console.log(width+'/'+height);
        window.resizeTo(width, parseInt(height)+36);
    };
    
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if ((request.action == "getTabDOM")) {
      sendResponse({ dom: document.body.innerHTML });
    }

    if ((request.action == "setVolume")) {
      playingVideo.volume = request.data ;
      //sendResponse({ dom: document.body.innerHTML });
    }

    if ((request.action == "setCurrentTime")) {
      playingVideo.currentTime = request.data ;
      //sendResponse({ dom: document.body.innerHTML });
    }

    if ((request.action == "play")) {
      playingVideo.play() ;
      //sendResponse({ dom: document.body.innerHTML });
    }
  }
);