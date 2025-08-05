const TRANSPARENT_CSS = `
  *:not(#video-overlay) {
    background-color: transparent !important;
  }
`;
const TRANSPARENT_CSS_NO_IMG = `
  *:not(#video-overlay) {
    background: none !important;
    background-color: transparent !important;
  }
`;

async function applyOrRemoveCss(tabId, CSS, isEnabled) {
  if (isEnabled) {
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      css: CSS,
    });
  } else {
    chrome.scripting.removeCSS({
      target: { tabId: tabId },
      css: CSS,
    });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get('isEnabled', (result) => {
      if (result.isEnabled) {
        chrome.storage.sync.get('img_isEnabled', (result_) => {
            if (result_.img_isEnabled) {
              console.log(`Page refreshed/loaded. Applying CSS to tab ${tabId}.`);
              applyOrRemoveCss(tabId, TRANSPARENT_CSS_NO_IMG, true);
            }
            else{
              console.log(`Page refreshed/loaded. Applying CSS to tab ${tabId}.`);
              applyOrRemoveCss(tabId, TRANSPARENT_CSS, true);
            }
      });
  }
});
  }
});


chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (changes.isEnabled) {
    const isEnabled = changes.isEnabled.newValue;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    
    chrome.storage.sync.get('img_isEnabled', (result_) => {
        let cur_css = null
        console.log(`Setting changed. isEnabled is now ${isEnabled},img_enabel:${result_.img_isEnabled}. Updating active tab.`);
        result_.img_isEnabled? cur_css = TRANSPARENT_CSS_NO_IMG: cur_css = TRANSPARENT_CSS
        console.log(`curcss${cur_css}`)
        isEnabled? applyOrRemoveCss(tab.id, cur_css, true): applyOrRemoveCss(tab.id, cur_css, false)
  })
  }
  else if (changes.img_isEnabled) {
    const img_isEnabled = changes.img_isEnabled.newValue;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return;
    chrome.storage.sync.get('isEnabled', (result_) => {
        let cur_css = null
        const isEnabled = result_.isEnabled
        console.log(`Setting changed. isEnabled is now ${isEnabled},img_enabel:${img_isEnabled}. Updating active tab.`);
        img_isEnabled? cur_css = TRANSPARENT_CSS_NO_IMG: cur_css = TRANSPARENT_CSS
        console.log(`curcss${cur_css}`)
        applyOrRemoveCss(tab.id, TRANSPARENT_CSS_NO_IMG, false)
        isEnabled? applyOrRemoveCss(tab.id, cur_css, true): applyOrRemoveCss(tab.id, cur_css, false)
  })
  }
});

