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
  handle_change(tabId);
  }
});


chrome.storage.onChanged.addListener(async (changes, namespace) => {
  if (namespace !== 'sync') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) return;
  console.log(tab.id)
  for (let key of ['isEnabled','bg_isEnabled']) {
    if (changes[key]) {
      const { oldValue, newValue } = changes[key];
      console.log(`键 "${key}" 发生变化：`, { oldValue, newValue });
      // 根据不同 key 做不同处理
      handle_change(tab.id, newValue, oldValue);
      return
    }
  }
});

function handle_change(tab) {
    chrome.storage.sync.get(['isEnabled','bg_isEnabled'], (settings) => {
      console.log(settings)
      if (settings.isEnabled) {
        if (settings.bg_isEnabled){
          console.log(` 11111Applying CSS to tab ${tab}.！！！！${TRANSPARENT_CSS_NO_IMG}！！！`);
          applyOrRemoveCss(tab, TRANSPARENT_CSS_NO_IMG, true)
        }
        else {
          console.log('背景透明back')
            applyOrRemoveCss(tab, TRANSPARENT_CSS_NO_IMG, false)
        }


      } else {
        console.log(` 222222Applying CSS to tab ${tab}.`);
        applyOrRemoveCss(tab, TRANSPARENT_CSS_NO_IMG, false)
      }
    });
}