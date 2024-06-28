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

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const youtubePlayer = document.getElementsByClassName('video-stream')[0];

    const tab = message["tab"];
    const text = message["text"];

    if(text == "bookmarkButtonClicked") {
        const url = tab.url.split("?")[1];
        const videoId = url.split("&")[0];
        let bookmarks = {};
    
        await chrome.storage.sync.get([videoId]).then((result) => {
            if(result[videoId]) {
                bookmarks = result[videoId];
            }
        });

        // add bookmark if that timestamp doesn't already exist
        const currentTime = Math.floor(youtubePlayer.currentTime);
        const formattedTime = formatTime(currentTime);


        if(!(currentTime in bookmarks)) {
            bookmarks[currentTime] = formattedTime;
        }

        jsonFile = {};
        jsonFile[videoId] = bookmarks;
        await chrome.storage.sync.set(jsonFile);

        chrome.runtime.sendMessage(
            {
                "text": "refreshBookmarks"
            }
        );
    
        // await chrome.storage.sync.clear();
        // chrome.storage.sync.get(console.log);
    }
    else if(text == "playBookmark") {
        const currentTime = message["currentTime"];
        youtubePlayer.currentTime = currentTime;
    }
    else if(text == "deleteBookmark") {
        const url = tab.url.split("?")[1];
        const videoId = url.split("&")[0];
        let bookmarks = {};
    
        await chrome.storage.sync.get([videoId]).then((result) => {
            if(result[videoId]) {
                bookmarks = result[videoId];
            }
        });

        const currentTime = message["currentTime"];

        delete bookmarks[currentTime];

        jsonFile = {};
        jsonFile[videoId] = bookmarks;
        await chrome.storage.sync.set(jsonFile);

        chrome.runtime.sendMessage(
            {
                "text": "refreshBookmarks"
            }
        );

    }
    return true;
});