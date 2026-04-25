import { sendImageForAnalysis } from './requestBackend.js';

document.addEventListener('DOMContentLoaded', () => {
    const captureBtn = document.getElementById('captureBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewImgEl = document.getElementById('preview-img');
    const placeholderEl = document.getElementById('placeholder');
    const STORAGE_KEY = 'capturedRegion';

    function showImage(dataUrl) {
        previewImgEl.src = dataUrl;
        previewImgEl.style.display = 'block';
        placeholderEl.style.display = 'none';
    };

    chrome.storage.local.get(STORAGE_KEY, (data) => {
        let imgData = data[STORAGE_KEY];
        if (imgData) {
            showImage(imgData);
        }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local' && changes[STORAGE_KEY]?.newValue) {
            showImage(changes[STORAGE_KEY].newValue);
        }
    });

    captureBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({action: 'START_REGION_SELECTION'}, (response) => {
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

    analyzeBtn.addEventListener('click', async () => {
        if (previewImgEl.style.display === 'none') {
            alert('Please capture an image first.');
            return;
        }

        const data = await sendImageForAnalysis(previewImgEl.src);
        
        data.forEach
    });
});