chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    const tab = message;
    await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        files: ["contentScript.js"]
    });
    setTimeout(async () => {
        await chrome.tabs.sendMessage(
            tab.id,
            "sending message to content script"
        )
    }, 500);
    return true;
});