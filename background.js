chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if(message["text"] == "injectContentScript") {
        const tab = message["tab"];
        await chrome.scripting.executeScript({
            target: {tabId: tab.id},
            files: ["contentScript.js"]
        });
    }
    return true;
});