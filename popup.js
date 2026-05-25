const STORAGE_KEY = 'enabled';

const toggle = document.getElementById('toggle');
const status = document.getElementById('status');

function renderStatus(enabled) {
  status.textContent = enabled
    ? 'ON: Safari user-agent is applied on youtube.com'
    : 'OFF: Default browser user-agent is used';
}

async function initialize() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const enabled = typeof stored[STORAGE_KEY] === 'boolean' ? stored[STORAGE_KEY] : true;

  toggle.checked = enabled;
  renderStatus(enabled);
}

toggle.addEventListener('change', async () => {
  const enabled = toggle.checked;
  renderStatus(enabled);

  await new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: 'setEnabled', enabled }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
        renderStatus(!enabled);
        toggle.checked = !enabled;
      }
      resolve();
    });
  });
});

void initialize();
