// initialize global variables
const youtubeURL = "https://www.youtube.com/watch";
let videoId;

/**
 * function that handles the event when the "Add a Bookmark" button is clicked. It sends
 * a message to the content script that the button has been clicked.
 */
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

/**
 * function that handles the event when the play icon button is clicked. It sends a message
 * to the content script that the button has been clicked.
 */
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

/**
 * function that handles the event when the trash can icon button is clicked. It sends a message
 * to the content script that the button has been clicked.
 */
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

/**
 * function that loads the bookmarks onto the page when the chrome extension popup is clicked.
 */
async function loadBookmarks() {
    await chrome.storage.sync.get([videoId]).then((result) => {
        if(result[videoId]) {
            const bookmarks = result[videoId]; // get the bookmarks for the specific video
            const bookmarksContainer = document.getElementById("bookmarks-container");
            bookmarksContainer.replaceChildren(); // remove all children of element
            for(const bookmarkTime in bookmarks) {
                const bookmark = document.createElement("div"); // create bookmark element
                bookmark.classList.add("bookmark");
                bookmark.setAttribute("currentTime", bookmarkTime);
                
                const textBox = document.createElement("input");
                textBox.value = bookmarks[bookmarkTime];

                // check if the input box is has been modified
                textBox.addEventListener("keyup", async ({key}) => {
                    if(key == "Enter") {
                        let bookmarks = {};
    
                        await chrome.storage.sync.get([videoId]).then((result) => {
                            if(result[videoId]) {
                                bookmarks = result[videoId];
                            }
                        });
                        
                        bookmarks[bookmarkTime] = textBox.value; // modify storage
    
                        jsonFile = {};
                        jsonFile[videoId] = bookmarks;
                        await chrome.storage.sync.set(jsonFile);
                    }
                });

                // add the play button
                const playButton = document.createElement("img");
                playButton.src = "images/play.jpg";
                playButton.style.width = "25px";
                playButton.style.height = "25px";
                playButton.addEventListener("click", playBookmark);

                // add the delete button
                const deleteButton = document.createElement("img");
                deleteButton.src = "images/delete.webp";
                deleteButton.style.width = "25px";
                deleteButton.style.height = "25px";
                deleteButton.addEventListener("click", deleteBookmark);

                // add all children to the bookmark element
                bookmark.appendChild(textBox);
                bookmark.appendChild(playButton);
                bookmark.appendChild(deleteButton);
                bookmarksContainer.append(bookmark);
            }
        }
    });
}

/**
 * function that handles the event when the page is refreshed so the bookmarks need to be loaded.
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if(message["text"] == "refreshBookmarks") {
        loadBookmarks();
    }
    return true;
});

// ran when extension popup is clicked
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