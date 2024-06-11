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
    const bookmarkTime = this.textContent;
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        await chrome.tabs.sendMessage(
            currTab.id,
            {
                "tab": currTab,
                "text": "movePlayer",
                "bookmarkTime": bookmarkTime
            }
        );
    });
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
                        bookmark.textContent = bookmarks[i];
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