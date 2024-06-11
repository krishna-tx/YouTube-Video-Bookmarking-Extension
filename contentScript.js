chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const youtubePlayer = document.getElementsByClassName('video-stream')[0];

    const tab = message["tab"];
    const text = message["text"];

    if(text == "bookmarkButtonClicked") {
        const url = tab.url;
        const videoId = url.split("?")[1];
        let bookmarks = [];
    
        await chrome.storage.sync.get([videoId]).then((result) => {
            if(result[videoId]) {
                bookmarks = JSON.parse(result[videoId]);
            }
        });
    
        bookmarks.push(Math.round(youtubePlayer.currentTime));

        bookmarks.sort((x, y) => {
            return x-y;
        });
    
        jsonFile = {};
        jsonFile[videoId] = JSON.stringify(bookmarks);
        await chrome.storage.sync.set(jsonFile);
    
        // await chrome.storage.sync.get([videoId]).then((result) => {
        //     console.log(result[videoId]);
        // });
    
        // await chrome.storage.sync.clear();
    }
    else if(text == "movePlayer") {
        const bookmarkTime = message["bookmarkTime"];
        youtubePlayer.currentTime = bookmarkTime;
    }
    return true;
});