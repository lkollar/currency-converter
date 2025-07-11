import "./styles/main.css";
import "./components/currency-app.js";
import { registerSW } from "virtual:pwa-register";

// Register service worker for PWA functionality
const updateSW = registerSW({
  onNeedRefresh() {
    // Show update available notification
    const showUpdate = confirm(
      "New content available. Reload to update the app?",
    );
    if (showUpdate) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("App ready to work offline");
    // Optional: Show offline ready notification
    const event = new CustomEvent("app-offline-ready", {
      detail: { message: "App is ready to work offline" },
    });
    window.dispatchEvent(event);
  },
  onRegistered(r) {
    console.log("SW Registered: " + r);
  },
  onRegisterError(error) {
    console.log("SW registration error", error);
  },
});

// Add install prompt handling
let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;

  // Dispatch custom event for components to listen to
  const event = new CustomEvent("pwa-installable", {
    detail: { prompt: deferredPrompt },
  });
  window.dispatchEvent(event);
});

window.addEventListener("appinstalled", (evt) => {
  console.log("PWA was installed");
  deferredPrompt = null;
});

// Handle online/offline status
function updateOnlineStatus() {
  const event = new CustomEvent("app-online-status-changed", {
    detail: { isOnline: navigator.onLine },
  });
  window.dispatchEvent(event);
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

// Initial check
updateOnlineStatus();

// Export for components to use
window.installPWA = async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
  }
};
