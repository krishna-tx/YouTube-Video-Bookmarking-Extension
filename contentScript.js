/**
 * function that takes in time in seconds and formats it into the form hh:mm:ss
 * @param {*} time - the playtime in seconds
 * @returns a string with the formatted time
 */
function formatTime(time) {
    const hours = Math.floor(time / 3600);
    const remainder = time % 3600;
    const minutes = Math.floor(remainder / 60);
    const seconds = remainder % 60;

    let formattedTime = "";
    if(hours > 0) {
        formattedTime += hours + ":";
    }
    if(minutes == 0) {
        if(hours > 0) { formattedTime += "00"; }
        else { formattedTime += "0"; }
    }
    else if(minutes < 10) {
        if(hours > 0) { formattedTime += "0" + minutes; }
        else { formattedTime += minutes; }
    }
    else {
        formattedTime += minutes;
    }
    formattedTime += ":";
    if(seconds == 0) {
        formattedTime += "00";
    }
    else if(seconds < 10) {
        formattedTime += "0" + seconds;
    }
    else {
        formattedTime += seconds;
    }
    return formattedTime;
}

/**
 * function that handles the event when it gets a message from popup.js
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const youtubePlayer = document.getElementsByClassName('video-stream')[0];

    // gets the current tab and text from message
    const tab = message["tab"];
    const text = message["text"];

    // parses the tab's url for the videoId
    const url = tab.url.split("?")[1];
    const videoId = url.split("&")[0];

    // "Add a Bookmark" button is clicked
    if(text == "bookmarkButtonClicked") {
        let bookmarks = {};
    
        // get existing bookmarks
        await chrome.storage.sync.get([videoId]).then((result) => {
            if(result[videoId]) {
                bookmarks = result[videoId];
            }
        });

        // format the time
        const currentTime = Math.floor(youtubePlayer.currentTime);
        const formattedTime = formatTime(currentTime);

        // add bookmark if that timestamp doesn't already exist
        if(!(currentTime in bookmarks)) {
            bookmarks[currentTime] = formattedTime;
        }

        jsonFile = {};
        jsonFile[videoId] = bookmarks;
        await chrome.storage.sync.set(jsonFile);

        // refresh the popup page
        chrome.runtime.sendMessage(
            {
                "text": "refreshBookmarks"
            }
        );
    }
    // play button is clicked
    else if(text == "playBookmark") {
        const currentTime = message["currentTime"];
        youtubePlayer.currentTime = currentTime;
    }
    // delete button is clicked
    else if(text == "deleteBookmark") {
        let bookmarks = {};
    
        // get existing bookmarks
        await chrome.storage.sync.get([videoId]).then((result) => {
            if(result[videoId]) {
                bookmarks = result[videoId];
            }
        });

        const currentTime = message["currentTime"];

        delete bookmarks[currentTime]; // remove bookmark from storage

        jsonFile = {};
        jsonFile[videoId] = bookmarks;
        await chrome.storage.sync.set(jsonFile);

        // refresh the popup page
        chrome.runtime.sendMessage(
            {
                "text": "refreshBookmarks"
            }
        );
    }
    return true;
});