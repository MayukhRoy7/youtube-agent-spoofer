const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Safari/605.1.15';
const RULE_ID = 1;
const STORAGE_KEY = 'enabled';

const youtubeRule = {
  id: RULE_ID,
  priority: 1,
  action: {
    type: 'modifyHeaders',
    requestHeaders: [
      {
        header: 'User-Agent',
        operation: 'set',
        value: USER_AGENT
      }
    ]
  },
  condition: {
    regexFilter: '^https?://([a-zA-Z0-9-]+\\.)?youtube\\.com/',
    resourceTypes: [
      'main_frame',
      'sub_frame',
      'xmlhttprequest',
      'script',
      'image',
      'font',
      'stylesheet',
      'media',
      'ping',
      'other'
    ]
  }
};

async function applyRule(enabled) {
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [RULE_ID],
    addRules: enabled ? [youtubeRule] : []
  });
}

async function initializeState() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  let enabled = stored[STORAGE_KEY];

  if (typeof enabled !== 'boolean') {
    enabled = true;
    await chrome.storage.local.set({ [STORAGE_KEY]: enabled });
  }

  await applyRule(enabled);
}

chrome.runtime.onInstalled.addListener(() => {
  void initializeState();
});

chrome.runtime.onStartup.addListener(() => {
  void initializeState();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'setEnabled') {
    return;
  }

  const enabled = Boolean(message.enabled);

  void chrome.storage.local
    .set({ [STORAGE_KEY]: enabled })
    .then(() => applyRule(enabled))
    .then(() => sendResponse({ ok: true }))
    .catch((error) => sendResponse({ ok: false, error: error?.message || String(error) }));

  return true;
});
