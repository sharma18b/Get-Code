// Global id to ensure tabs are uniquely identified.
var id = 1;

// Set up a listener to handle when the icon is clicked.
chrome.browserAction.onClicked.addListener(function() {
  chrome.tabs.captureVisibleTab(function(screenshot) {
    viewCaptureTabUrl = chrome.extension.getURL('/content/editor.html?id=' + id++);
    targetId = null;

    // Add a listener so we know when the tab has finished loading.
    chrome.tabs.onUpdated.addListener( function loadingListener(tabId, changedProps) {
      
      // Not done loading content.
      if (tabId != targetId || changedProps.status != "complete") {
        return;
      }

      // We need to pass the screenshot to the appropriate tab for viewing.
      var views = chrome.extension.getViews();
      for (var i = 0; i < views.length; i++) {
        var view = views[i];
        if (view.location.href == viewCaptureTabUrl) {
          view.setScreenshot(screenshot);
          break;
        }
      }

      // Listener is not needed anymore since loading has finished.
      chrome.tabs.onUpdated.removeListener(loadingListener);
    });

    // Set the id to indicate that the tab has been created.
    chrome.tabs.create({url: viewCaptureTabUrl}, function(tab) {
      targetId = tab.id;
    });

  });
});