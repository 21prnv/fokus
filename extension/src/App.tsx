import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Play,
  Square,
  Settings,
  Palette,
  ExternalLink,
  Clock,
  Zap,
} from "lucide-react";
import "./App.css";

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
    gradient: "from-blue-400 to-cyan-400",
    color: "blue",
    icon: "🌊",
  },
  {
    name: "Forest",
    gradient: "from-green-400 to-emerald-400",
    color: "green",
    icon: "🌲",
  },
  {
    name: "Sunset",
    gradient: "from-orange-400 to-pink-400",
    color: "orange",
    icon: "🌅",
  },
  {
    name: "Purple",
    gradient: "from-purple-400 to-indigo-400",
    color: "purple",
    icon: "🔮",
  },
  {
    name: "Dark",
    gradient: "from-gray-800 to-gray-900",
    color: "gray",
    icon: "🌙",
  },
];

function App() {
  const [currentDomain, setCurrentDomain] = useState<string>("");
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(25);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(themes[0]);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const durations = [15, 25, 30, 45, 60, 90];

  useEffect(() => {
    getCurrentTab();
  }, []);

  const getCurrentTab = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.url) {
        const domain = new URL(tab.url).hostname;
        setCurrentDomain(domain);

        const result = await chrome.storage.local.get([
          `focus_${domain}`,
          "user_theme",
        ]);
        if (result[`focus_${domain}`]) {
          setFocusSession(result[`focus_${domain}`]);
        }
        if (result.user_theme) {
          const theme =
            themes.find((t) => t.name === result.user_theme) || themes[0];
          setSelectedTheme(theme);
        }
      }
    } catch (error) {
      console.error("Error getting current tab:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const startFocusMode = async (withTimer: boolean) => {
    if (!currentDomain) return;

    const session: FocusSession = {
      domain: currentDomain,
      isActive: true,
      theme: selectedTheme.name,
      ...(withTimer && {
        duration: selectedDuration * 60 * 1000,
        startTime: Date.now(),
      }),
    };

    await chrome.storage.local.set({
      [`focus_${currentDomain}`]: session,
      user_theme: selectedTheme.name,
    });

    if (withTimer) {
      await chrome.alarms.create(`focus_${currentDomain}`, {
        delayInMinutes: selectedDuration,
      });
    }

    setFocusSession(session);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      await chrome.tabs.reload(tab.id);
    }
  };

  const stopFocusMode = async () => {
    if (!currentDomain) return;

    await chrome.storage.local.remove([`focus_${currentDomain}`]);
    await chrome.alarms.clear(`focus_${currentDomain}`);
    setFocusSession(null);

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      await chrome.tabs.reload(tab.id);
    }
  };

  const handleThemeChange = async (theme: Theme) => {
    setSelectedTheme(theme);

    // Persist theme selection immediately
    await chrome.storage.local.set({
      user_theme: theme.name,
    });
  };

  if (isLoading) {
    return (
      <div className="w-auto h-96 bg-white flex items-center justify-center">
        <motion.div>
          <Target className="w-6 h-6 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`w-auto bg-gradient-to-br ${selectedTheme.gradient}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        className="p-4 border-b border-white/20 backdrop-blur-sm bg-white/10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
          className="flex items-center justify-between"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <img src="/icons/icon48.png" alt="Fokus" width={20} height={20} />
            <h1
              className={`font-rubik-semi-bold ${
                selectedTheme.name === "Dark" ? "text-white" : "text-white"
              }`}
            >
              Fokus
            </h1>
          </motion.div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm cursor-pointer"
          >
            <Settings
              className={`w-4 h-4 ${
                selectedTheme.name === "Dark" ? "text-white" : "text-white"
              }`}
            />
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
          className={`text-xs mt-1 truncate font-rubik ${
            selectedTheme.name === "Dark" ? "text-white/70" : "text-white/80"
          }`}
        >
          {currentDomain}
        </motion.p>
      </motion.div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="border-b border-white/20 overflow-hidden backdrop-blur-sm bg-white/10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
              className="p-4 space-y-4"
            >
              {/* Theme Selection */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Palette
                    className={`w-4 h-4 ${
                      selectedTheme.name === "Dark"
                        ? "text-white"
                        : "text-white"
                    }`}
                  />
                  <span
                    className={`text-sm font-rubik-medium ${
                      selectedTheme.name === "Dark"
                        ? "text-white"
                        : "text-white"
                    }`}
                  >
                    Theme
                  </span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.3 }}
                  className="flex gap-2 flex-wrap"
                >
                  {themes.map((theme, index) => (
                    <motion.button
                      key={theme.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                        delay: 0.4 + index * 0.1,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleThemeChange(theme)}
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${
                        theme.gradient
                      } flex items-center justify-center text-xs cursor-pointer ${
                        selectedTheme.name === theme.name
                          ? "ring-2 ring-offset-1 ring-gray-400"
                          : ""
                      }`}
                    >
                      {theme.icon}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>

              {/* Duration Selection */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock
                    className={`w-4 h-4 ${
                      selectedTheme.name === "Dark"
                        ? "text-white"
                        : "text-white"
                    }`}
                  />
                  <span
                    className={`text-sm font-rubik-medium ${
                      selectedTheme.name === "Dark"
                        ? "text-white"
                        : "text-white"
                    }`}
                  >
                    Duration
                  </span>
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.6 }}
                  className="grid grid-cols-3 gap-2"
                >
                  {durations.map((duration, index) => (
                    <motion.button
                      key={duration}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: "easeOut",
                        delay: 0.7 + index * 0.05,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDuration(duration)}
                      className={`py-2 px-3 rounded-lg text-sm font-rubik-medium transition-colors cursor-pointer ${
                        selectedDuration === duration
                          ? "bg-white/30 backdrop-blur-sm text-white border border-white/30"
                          : "bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      {duration}m
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
        className="p-4"
      >
        <AnimatePresence mode="wait">
          {focusSession?.isActive ? (
            <motion.div
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Active Status */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                className={`p-4 rounded-xl bg-gradient-to-r ${selectedTheme.gradient} text-white`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5" />
                  <span className="font-rubik-medium">Focus Mode Active</span>
                </div>
                {focusSession.duration && (
                  <p className="text-sm opacity-90 font-rubik">
                    Timer: {Math.floor(focusSession.duration / 60000)} minutes
                  </p>
                )}
              </motion.div>

              {/* Stop Button */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopFocusMode}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500 text-white rounded-xl font-rubik-medium hover:bg-red-600 transition-colors cursor-pointer"
              >
                <Square className="w-4 h-4" />
                Turn Off Focus Mode
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Quick Focus */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startFocusMode(false)}
                className={`w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r ${selectedTheme.gradient} text-white rounded-xl font-rubik-medium shadow-lg cursor-pointer`}
              >
                <Target className="w-5 h-5" />
                Start Focus Mode
              </motion.button>

              {/* Timed Focus */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startFocusMode(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-rubik-medium hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                Start {selectedDuration}min Timer
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5, ease: "easeOut" }}
        className="p-4 border-t border-white/20 backdrop-blur-sm bg-white/10"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.4, ease: "easeOut" }}
          className="text-center"
        >
          <p
            className={`text-xs mb-2 font-rubik ${
              selectedTheme.name === "Dark" ? "text-white/70" : "text-white/80"
            }`}
          >
            For detailed analytics and insights
          </p>
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.3, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              chrome.tabs.create({ url: "https://fokus.com/dashboard" })
            }
            className="flex items-center justify-center gap-1 mx-auto px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs rounded-lg font-rubik-medium hover:bg-white/30 transition-colors border border-white/30 cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            Login on fokus.com
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default App;
