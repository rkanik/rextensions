// Background script for Extension Manager
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Manager installed");
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getExtensions") {
    chrome.management.getAll((extensions) => {
      sendResponse({ extensions });
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === "toggleExtension") {
    chrome.management.setEnabled(request.extensionId, request.enabled, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "uninstallExtension") {
    chrome.management.uninstall(request.extensionId, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "installExtension") {
    chrome.webstore.install(
      request.webstoreUrl,
      () => {
        sendResponse({ success: true });
      },
      (error) => {
        sendResponse({ success: false, error });
      }
    );
    return true;
  }
});
