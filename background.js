let activeTabId = null;
let activeTabStartTime = null;
let siteTimes = {};

// Function to track time on the active tab
function trackTimeOnActiveTab() {
  if (activeTabId !== null && activeTabStartTime !== null) {
    const timeSpent = (Date.now() - activeTabStartTime) / 1000; // Calculate time spent in seconds
    chrome.tabs.get(activeTabId, (tab) => {
      if (tab && tab.url) {
        const domain = new URL(tab.url).hostname;
        siteTimes[domain] = (siteTimes[domain] || 0) + timeSpent; // Update time for the site
        chrome.storage.local.set({ siteTimes }); // Store the time in local storage
        activeTabStartTime = Date.now(); // Reset the start time for the new tab
      }
    });
  }
}

// When a tab becomes active, start tracking the new tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  trackTimeOnActiveTab(); // Record time spent on the previous tab
  activeTabId = activeInfo.tabId; // Set new tab as active
  activeTabStartTime = Date.now(); // Set start time for new tab
});

// When the active tab is updated (e.g., navigated), reset the tracking
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.status === 'complete') {
    trackTimeOnActiveTab(); // Record time spent on the previous tab
    activeTabId = tabId;
    activeTabStartTime = Date.now();
  }
});

// When the browser window is focused or blurred
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Window is unfocused, stop tracking time
    trackTimeOnActiveTab();
    activeTabId = null;
    activeTabStartTime = null;
  } else {
    // Window is refocused
    chrome.tabs.query({ active: true, windowId: windowId }, (tabs) => {
      if (tabs.length > 0) {
        activeTabId = tabs[0].id;
        activeTabStartTime = Date.now();
      }
    });
  }
});

// When the window is minimized or unfocused, track the time and reset
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  if (tabId === activeTabId) {
    trackTimeOnActiveTab(); // Record time spent when the tab is closed or removed
    activeTabId = null;
    activeTabStartTime = null;
  }
});

// Periodically update the time spent on the current tab every second
setInterval(() => {
  if (activeTabId !== null) {
    trackTimeOnActiveTab();
  }
}, 1000);

// Store data when the extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  chrome.storage.local.set({ siteTimes });
});

