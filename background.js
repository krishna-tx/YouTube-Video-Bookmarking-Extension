chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const tab = message;
    await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["contentScript.js"]
    });
    return true;
});