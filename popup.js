const toggleButton = document.getElementById('toggleMode');
const siteList = document.getElementById('site-list');

// Load site times from local storage and display them
function loadSiteTimes() {
  chrome.storage.local.get(['siteTimes'], (result) => {
    const siteTimes = result.siteTimes || {};
    siteList.innerHTML = ''; // Clear the list

    for (const [site, timeSpent] of Object.entries(siteTimes)) {
      const siteDiv = document.createElement('div');
      siteDiv.className = 'site';

      const siteNameDiv = document.createElement('div');
      siteNameDiv.className = 'site-name';
      siteNameDiv.textContent = site;

      const timeSpentDiv = document.createElement('div');
      timeSpentDiv.className = 'time-spent';
      timeSpentDiv.textContent = formatTime(timeSpent);

      siteDiv.appendChild(siteNameDiv);
      siteDiv.appendChild(timeSpentDiv);
      siteList.appendChild(siteDiv);
    }
  });
}

// Format time in hours, minutes, and seconds
function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

// Load the stored theme and apply it
chrome.storage.local.get('theme', (result) => {
  const currentTheme = result.theme || 'light'; // Default to light theme
  document.body.setAttribute('data-theme', currentTheme);
  toggleButton.textContent = currentTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
});

// Toggle the theme when the button is clicked
toggleButton.addEventListener('click', () => {
  const currentTheme = document.body.getAttribute('data-theme');
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
  chrome.storage.local.set({ theme: newTheme });
  toggleButton.textContent = newTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
});

// Load site times on page load
loadSiteTimes();

// Reload site times every second for real-time updates
setInterval(() => {
  loadSiteTimes();
}, 1000);
