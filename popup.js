document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
        const currTab = tabs[0];
        if(currTab.url.includes("youtube.com/watch")) { console.log("This is a youtube video"); }
        else { console.log("This is not a youtube video"); }
    });
});