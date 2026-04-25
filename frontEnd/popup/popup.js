document.addEventListener('DOMContentLoaded', () => {
    const captureBtn = document.getElementById('captureBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewImg = document.getElementById('preview-img');
    const placeholder = document.getElementById('placeholder');
    const storageKey = 'capturedRegion';

    const showImage = (dataUrl) => {
        previewImg.src = dataUrl;
        previewImg.style.display = 'block';
        placeholder.style.display = 'none';
    };

    chrome.storage.local.get(storageKey, (data) => {
        if (data[storageKey]) {
            showImage(data[storageKey]);
        }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[storageKey]?.newValue) {
            showImage(changes[storageKey].newValue);
        }
    });

    captureBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({ action: 'start-region-selection' }, (response) => {
            if (chrome.runtime.lastError) {
                alert('Unable to start region selection: ' + chrome.runtime.lastError.message);
                return;
            }
            if (response?.status !== 'started') {
                const error = response?.error || '';
                if (error.includes('Cannot access a chrome://')) {
                    alert('SpeciesScan cannot run on Chrome system pages.\nPlease navigate to a normal website first.');
                } else {
                    alert('Selection could not start: ' + (error || JSON.stringify(response)));
                }
                return;
            }
            window.close();
        });
    });

    analyzeBtn.addEventListener('click', () => {
        if (previewImg.style.display === 'none') {
            alert('Please capture an image first.');
            return;
        }
        alert('Analysis feature not implemented yet.');
    });
});