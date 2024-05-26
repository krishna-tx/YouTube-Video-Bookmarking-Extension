chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log(message);
    // const container = document.getElementById("masthead-container");
    // container.style.display = "none";
    const youtubePlayer = document.getElementsByClassName('video-stream')[0];
    console.log(youtubePlayer.currentTime);
    return true;
});