// document.addEventListener("DOMContentLoaded", function () {
//     var imageObj = {path : {"128": "Icons/active.png"}}
//     chrome.browserAction.setIcon(imageObj);
// });

// let config = {
//     id : "stop",
//     title : "Stop Brocaster",
//     onclick : function stopHandler(){
//         console.log('stop');
//     }
// }
// chrome.contextMenus.create(config);
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: 'm1', // you'll use this in the handler function to identify this context menu item
        title: 'Stop',
        contexts: ['all'],
    });
});

chrome.contextMenus.onClicked.addListener(menuHandler);


function menuHandler(info, tab) {
    if (info.menuItemId === "m1") { // here's where you'll need the ID
        console.log('hello! w');
    }
}

// chrome.contextMenus.create({
//   "title": "Click Me",
//   "contexts": ["page", "selection", "image", "link"]
// });

// Must be synchronously called on event page load,
//   for instance in the top level code
//chrome.contextMenus.onClicked.addListener(clickHandler);


// chrome.extension.onMessage.addListener(
// function (request, sender, sendResponse) {
//     if (request.cmd == "setOnOffState") {
//         isExtensionOn = request.data.value;
//     }

//     if (request.cmd == "getOnOffState") {
//         sendResponse(isExtensionOn);
//     }
// });


// var isExtensionOn = false;
// chrome.extension.sendMessage({ cmd: "setOnOffState", data: { value: isExtensionOn } });

// //GET VARIABLE
// chrome.extension.sendMessage({ cmd: "isAutoFeedMode" }, function (response) {
//     if (response == true) {
//      //Run the rest of your content-script in here..
//     }
// });

