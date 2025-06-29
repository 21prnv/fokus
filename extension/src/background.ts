// Background service worker for handling alarms and notifications

// Handle alarm events (when timer expires)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  const alarmName = alarm.name;

  if (alarmName.startsWith("focus_")) {
    const domain = alarmName.replace("focus_", "");

    // Remove the focus session from storage
    await chrome.storage.local.remove([`focus_${domain}`]);

    // Show notification that focus time is complete
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon48.png",
      title: "Focus Session Complete! 🎉",
      message: `Great job staying focused on ${domain}!`,
    });
  }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Fokus extension installed!");
});

// Clean up expired sessions on startup
chrome.runtime.onStartup.addListener(async () => {
  // Get all storage items
  const allItems = await chrome.storage.local.get();

  // Check each focus session
  for (const key in allItems) {
    if (key.startsWith("focus_")) {
      const session = allItems[key];

      // If session has a timer and it's expired, remove it
      if (session.duration && session.startTime) {
        const elapsed = Date.now() - session.startTime;
        if (elapsed >= session.duration) {
          await chrome.storage.local.remove([key]);
          const domain = key.replace("focus_", "");
          await chrome.alarms.clear(`focus_${domain}`);
        }
      }
    }
  }
});
