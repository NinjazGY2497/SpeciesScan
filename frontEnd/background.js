chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'start-region-selection') {
        handleRegionSelection().then(sendResponse).catch((err) => {
            sendResponse({ status: 'error', error: err.message });
        });
        return true; 
    }

    if (message.action === 'region-selected') {
        const { rect, devicePixelRatio } = message;
        if (!rect || rect.width <= 0 || rect.height <= 0) {
            sendResponse({ status: 'error', error: 'Invalid selection.' });
            return true;
        }

        chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
            if (chrome.runtime.lastError || !dataUrl) {
                sendResponse({ status: 'error', error: chrome.runtime.lastError?.message || 'Capture failed.' });
                return;
            }
            sendResponse({ status: 'captured', dataUrl, rect, devicePixelRatio: devicePixelRatio || 1 });
        });

        return true; 
    }
});

async function handleRegionSelection() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs && tabs[0];
    if (!activeTab || !activeTab.id) {
        throw new Error('No active tab available.');
    }

    const tabId = activeTab.id;

   
    const alreadyReady = await sendMessageToTab(tabId, { action: 'start-region-selection' });
    if (alreadyReady?.status === 'overlay-shown') {
        return { status: 'started' };
    }

   
    await chrome.scripting.executeScript({ target: { tabId }, files: ['contentScript/index.js'] });
    await chrome.scripting.insertCSS({ target: { tabId }, files: ['contentScript/style.css'] });

    
    await sleep(100);

    const response = await sendMessageToTab(tabId, { action: 'start-region-selection' });
    if (response?.status === 'overlay-shown') {
        return { status: 'started' };
    }

    throw new Error(response?.error || 'Selection overlay failed.');
}

function sendMessageToTab(tabId, message) {
    return new Promise((resolve) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                resolve(null); 
            } else {
                resolve(response);
            }
        });
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}