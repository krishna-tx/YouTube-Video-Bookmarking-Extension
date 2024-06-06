chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const youtubePlayer = document.getElementsByClassName('video-stream')[0];

    const url = message.url;
    const videoId = url.split("?")[1];
    let bookmarks = [];

    await chrome.storage.sync.get([videoId]).then((result) => {
        if(result[videoId]) {
            bookmarks = JSON.parse(result[videoId]);
        }
    });

    bookmarks.push(youtubePlayer.currentTime);

    jsonFile = {};
    jsonFile[videoId] = JSON.stringify(bookmarks);
    await chrome.storage.sync.set(jsonFile);

    // await chrome.storage.sync.get([videoId]).then((result) => {
    //     console.log(result[videoId]);
    // });

    // await chrome.storage.sync.clear();

    return true;
});