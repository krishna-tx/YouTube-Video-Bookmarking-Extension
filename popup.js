function bookmarkButtonClicked() {
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        await chrome.tabs.sendMessage(
            currTab.id,
            {
                "tab": currTab,
                "text": "bookmarkButtonClicked"
            }
        );
    });
}

function movePlayer() {
    const currentTime = this.getAttribute("currentTime");
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        await chrome.tabs.sendMessage(
            currTab.id,
            {
                "tab": currTab,
                "text": "movePlayer",
                "currentTime": currentTime
            }
        );
    });
}

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

const youtubeURL = "https://www.youtube.com/watch";

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        const bookmarkButton = document.getElementById("bookmark-button");
        if(currTab.url.includes(youtubeURL)) { // send message to service worker
            await chrome.runtime.sendMessage(
                currTab
            );
            bookmarkButton.addEventListener("click", bookmarkButtonClicked);

            // load bookmarks
            const url = currTab.url;
            const videoId = url.split("?")[1];
            await chrome.storage.sync.get([videoId]).then((result) => {
                if(result[videoId]) {
                    const bookmarks = JSON.parse(result[videoId]);
                    const bookmarksContainer = document.getElementById("bookmarks-container");
                    for(let i = 0; i < bookmarks.length; i++) {
                        const bookmark = document.createElement("div");
                        bookmark.classList.add("bookmark");
                        bookmark.setAttribute("currentTime", bookmarks[i]);
                        bookmark.textContent = formatTime(Number(bookmarks[i]));
                        bookmark.addEventListener("click", movePlayer);
                        bookmarksContainer.append(bookmark);
                    }
                }
            });
        }
        else {
            // hid bookmark button
            bookmarkButton.style.display = "none";

            let text = document.createElement("p");
            text.textContent = "This is not a youtube video";
            document.body.appendChild(text);
        }
    });
});