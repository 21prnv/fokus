// Content script that runs on all web pages
interface FocusSession {
  domain: string;
  isActive: boolean;
  duration?: number;
  startTime?: number;
  theme?: string;
}

interface Theme {
  name: string;
  gradient: string;
  color: string;
  icon: string;
}

const themes: Theme[] = [
  {
    name: "Ocean",
    gradient: "linear-gradient(135deg, #60a5fa 0%, #22d3ee 100%)",
    color: "blue",
    icon: "🌊",
  },
  {
    name: "Forest",
    gradient: "linear-gradient(135deg, #4ade80 0%, #10b981 100%)",
    color: "green",
    icon: "🌲",
  },
  {
    name: "Sunset",
    gradient: "linear-gradient(135deg, #fb923c 0%, #f472b6 100%)",
    color: "orange",
    icon: "🌅",
  },
  {
    name: "Purple",
    gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    color: "purple",
    icon: "🔮",
  },
  {
    name: "Dark",
    gradient: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
    color: "gray",
    icon: "🌙",
  },
];

let focusOverlay: HTMLElement | null = null;
let timerInterval: NodeJS.Timeout | null = null;
let fontsLoaded = false;

// Function to load Rubik fonts
function loadRubikFonts() {
  if (fontsLoaded) return;

  const style = document.createElement("style");
  style.textContent = `
    @font-face {
      font-family: "Rubik-Regular";
      src: url("${chrome.runtime.getURL(
        "src/assets/fonts/Rubik-Regular.ttf"
      )}");
    }
    
    @font-face {
      font-family: "Rubik-Medium";
      src: url("${chrome.runtime.getURL("src/assets/fonts/Rubik-Medium.ttf")}");
    }
    
    @font-face {
      font-family: "Rubik-Bold";
      src: url("${chrome.runtime.getURL("src/assets/fonts/Rubik-Bold.ttf")}");
    }
    
    @font-face {
      font-family: "Rubik-Light";
      src: url("${chrome.runtime.getURL("src/assets/fonts/Rubik-Light.ttf")}");
    }
    
    @font-face {
      font-family: "Rubik-SemiBold";
      src: url("${chrome.runtime.getURL(
        "src/assets/fonts/Rubik-SemiBold.ttf"
      )}");
    }
    
    @font-face {
      font-family: "Rubik-Black";
      src: url("${chrome.runtime.getURL("src/assets/fonts/Rubik-Black.ttf")}");
    }
    
    @font-face {
      font-family: "Rubik-ExtraBold";
      src: url("${chrome.runtime.getURL(
        "src/assets/fonts/Rubik-ExtraBold.ttf"
      )}");
    }
  `;
  document.head.appendChild(style);
  fontsLoaded = true;
}

// Function to create the focus mode overlay
function createFocusOverlay(session: FocusSession): HTMLElement {
  // Load fonts first
  loadRubikFonts();

  const selectedTheme =
    themes.find((t) => t.name === session.theme) || themes[0];

  const overlay = document.createElement("div");
  overlay.id = "fokus-overlay";
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: ${selectedTheme.gradient};
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: "Rubik-Regular", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: white;
    animation: fokus-fade-in 0.3s ease-out;
  `;

  // Add CSS animations
  const style = document.createElement("style");
  style.textContent = `
    @keyframes fokus-fade-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes fokus-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .fokus-pulse { animation: fokus-pulse 2s infinite; }
  `;
  document.head.appendChild(style);

  const container = document.createElement("div");
  container.style.cssText = `
    text-align: center;
    padding: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 400px;
    width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  `;

  const icon = document.createElement("div");
  icon.style.cssText = `
    font-size: 60px;
    margin-bottom: 20px;
  `;
  icon.className = "fokus-pulse";
  icon.textContent = selectedTheme.icon;

  const title = document.createElement("h1");
  title.style.cssText = `
    font-size: 28px;
    font-family: "Rubik-Bold", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0 0 10px 0;
  `;
  title.textContent = "Focus Mode Active";

  const message = document.createElement("p");
  message.style.cssText = `
    font-size: 16px;
    font-family: "Rubik-Regular", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0 0 30px 0;
    opacity: 0.9;
    line-height: 1.5;
  `;
  message.textContent = "You're in focus mode. Stay on track with your goals.";

  container.appendChild(icon);
  container.appendChild(title);
  container.appendChild(message);

  // Timer display
  if (session.duration && session.startTime) {
    const timerContainer = document.createElement("div");
    timerContainer.style.cssText = `
      margin-bottom: 30px;
      padding: 20px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    `;

    const timerLabel = document.createElement("div");
    timerLabel.style.cssText = `
      font-size: 14px;
      font-family: "Rubik-Medium", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      opacity: 0.8;
      margin-bottom: 10px;
    `;
    timerLabel.textContent = "Time Remaining";

    const timerDisplay = document.createElement("div");
    timerDisplay.id = "fokus-timer";
    timerDisplay.style.cssText = `
      font-size: 36px;
      font-family: "Rubik-Bold", 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
      letter-spacing: 2px;
    `;

    timerContainer.appendChild(timerLabel);
    timerContainer.appendChild(timerDisplay);
    container.appendChild(timerContainer);

    updateTimer(session);
    timerInterval = setInterval(() => updateTimer(session), 1000);

    // Give up button
    const giveUpButton = document.createElement("button");
    giveUpButton.style.cssText = `
      background: rgba(239, 68, 68, 0.8);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-family: "Rubik-SemiBold", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      cursor: pointer;
      margin-bottom: 15px;
      margin-right:15px;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    `;
    giveUpButton.textContent = "Give Up";
    giveUpButton.onmouseover = () => {
      giveUpButton.style.background = "rgba(239, 68, 68, 1)";
      giveUpButton.style.transform = "scale(1.05)";
    };
    giveUpButton.onmouseout = () => {
      giveUpButton.style.background = "rgba(239, 68, 68, 0.8)";
      giveUpButton.style.transform = "scale(1)";
    };
    giveUpButton.onclick = () => stopFocusMode();

    container.appendChild(giveUpButton);
  }

  // Turn off button
  const turnOffButton = document.createElement("button");
  turnOffButton.style.cssText = `
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 14px;
    font-family: "Rubik-SemiBold", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    cursor: pointer;
    transition: all 0.2s;
    backdrop-filter: blur(10px);
  `;
  turnOffButton.textContent = "Turn Off Focus Mode";
  turnOffButton.onmouseover = () => {
    turnOffButton.style.background = "rgba(255, 255, 255, 0.3)";
    turnOffButton.style.transform = "scale(1.05)";
  };
  turnOffButton.onmouseout = () => {
    turnOffButton.style.background = "rgba(255, 255, 255, 0.2)";
    turnOffButton.style.transform = "scale(1)";
  };
  turnOffButton.onclick = () => stopFocusMode();

  container.appendChild(turnOffButton);
  overlay.appendChild(container);

  return overlay;
}

// Function to update timer display
function updateTimer(session: FocusSession) {
  if (!session.duration || !session.startTime) return;

  const timerElement = document.getElementById("fokus-timer");
  if (!timerElement) return;

  const elapsed = Date.now() - session.startTime;
  const remaining = Math.max(0, session.duration - elapsed);

  if (remaining <= 0) {
    stopFocusMode();
    return;
  }

  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// Function to stop focus mode
async function stopFocusMode() {
  const domain = window.location.hostname;

  await chrome.storage.local.remove([`focus_${domain}`]);
  await chrome.alarms.clear(`focus_${domain}`);

  if (focusOverlay) {
    focusOverlay.style.animation = "fokus-fade-in 0.3s ease-out reverse";
    setTimeout(() => {
      focusOverlay?.remove();
      focusOverlay = null;
    }, 300);
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

// Function to check if focus mode is active
async function checkFocusMode() {
  const domain = window.location.hostname;
  const result = await chrome.storage.local.get([`focus_${domain}`]);
  const session: FocusSession | undefined = result[`focus_${domain}`];

  if (session && session.isActive) {
    if (!focusOverlay) {
      focusOverlay = createFocusOverlay(session);
      document.body.appendChild(focusOverlay);
    }
  } else {
    if (focusOverlay) {
      focusOverlay.remove();
      focusOverlay = null;
    }
  }
}

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local") {
    const domain = window.location.hostname;
    if (changes[`focus_${domain}`]) {
      checkFocusMode();
    }
  }
});

// Check focus mode on page load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkFocusMode);
} else {
  checkFocusMode();
}
