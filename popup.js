function bookmarkButtonClicked() {
    console.log("button clicked!");
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        await chrome.runtime.sendMessage(
            currTab
        );
    });
}

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({currentWindow: true, active: true}, async function(tabs) {
        const currTab = tabs[0];
        const bookmarkButton = document.getElementById("bookmark-button");
        if(currTab.url.includes("youtube.com/watch")) {
            // await chrome.runtime.sendMessage(
            //     currTab
            // );
            bookmarkButton.addEventListener("click", bookmarkButtonClicked);
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