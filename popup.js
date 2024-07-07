const youtubeURL = "https://www.youtube.com/watch";
let videoId;

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

function playBookmark() {
    const currentTime = this.parentNode.getAttribute("currentTime");
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        await chrome.tabs.sendMessage(
            currTab.id,
            {
                "tab": currTab,
                "text": "playBookmark",
                "currentTime": currentTime
            }
        );
    });
}

function deleteBookmark() {
    const currentTime = this.parentNode.getAttribute("currentTime");
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        await chrome.tabs.sendMessage(
            currTab.id,
            {
                "tab": currTab,
                "text": "deleteBookmark",
                "currentTime": currentTime
            }
        );
    });
}

async function loadBookmarks() {
    await chrome.storage.sync.get([videoId]).then((result) => {
        if(result[videoId]) {
            const bookmarks = result[videoId];
            const bookmarksContainer = document.getElementById("bookmarks-container");
            bookmarksContainer.replaceChildren(); // remove all children of element
            for(const bookmarkTime in bookmarks) {
                const bookmark = document.createElement("div");
                bookmark.classList.add("bookmark");
                bookmark.setAttribute("currentTime", bookmarkTime);
                
                const textBox = document.createElement("input");
                textBox.value = bookmarks[bookmarkTime];

                textBox.addEventListener("keyup", async ({key}) => {
                    if(key == "Enter") {
                        let bookmarks = {};
    
                        await chrome.storage.sync.get([videoId]).then((result) => {
                            if(result[videoId]) {
                                bookmarks = result[videoId];
                            }
                        });
                        
                        bookmarks[bookmarkTime] = textBox.value;
    
                        jsonFile = {};
                        jsonFile[videoId] = bookmarks;
                        await chrome.storage.sync.set(jsonFile);
                    }
                });

                const playButton = document.createElement("img");
                playButton.src = "images/play.jpg";
                playButton.style.width = "25px";
                playButton.style.height = "25px";
                playButton.addEventListener("click", playBookmark);

                const deleteButton = document.createElement("img");
                deleteButton.src = "images/delete.webp";
                deleteButton.style.width = "25px";
                deleteButton.style.height = "25px";
                deleteButton.addEventListener("click", deleteBookmark);

                bookmark.appendChild(textBox);
                bookmark.appendChild(playButton);
                bookmark.appendChild(deleteButton);
                bookmarksContainer.append(bookmark);
            }
        }
    });
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if(message["text"] == "refreshBookmarks") {
        loadBookmarks();
    }
    return true;
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        const bookmarkButton = document.getElementById("bookmark-button");
        if(currTab.url.includes(youtubeURL)) { // send message to service worker
            await chrome.runtime.sendMessage(
                {
                    "tab": currTab,
                    "text": "injectContentScript"
                }
            );
            bookmarkButton.addEventListener("click", bookmarkButtonClicked);

            // load bookmarks
            const url = currTab.url.split("?")[1];
            videoId = url.split("&")[0];
            loadBookmarks();
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