import { sendImageForAnalysis } from './requestBackend.js';

document.addEventListener('DOMContentLoaded', () => {
    const captureBtn = document.getElementById('captureBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewImgEl = document.getElementById('preview-img');
    const placeholderEl = document.getElementById('placeholder');
    const resultsEl = document.getElementById('results');
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

        resultsEl.innerHTML ='<p id="placeholder">Analyzing image...</p>';


        const data = await sendImageForAnalysis(previewImgEl.src);
        resultsEl.innerHTML = '';

        const organisms = data.response.organisms

        if (organisms.length === 0) {
            resultsEl.innerHTML = '<p id="placeholder">No organisms found.</p>';
            return;
        }

        organisms.forEach(org => {
            // Display Card
            const displayCard = document.createElement('div');
            displayCard.className = 'organism-displayCard';

            // Title
            const title = document.createElement('h3');
            title.className = 'organism-title';
            title.textContent = org.commonName + (org.scientificName ? ` (Scientifically: ${org.scientificName})` : '');
            displayCard.appendChild(title);

            // Traits
            if (org.traits && org.traits.length > 0) {
                const traitList = document.createElement('ul');
                traitList.className = 'trait-list';

                org.traits.forEach(trait => {
                    // List Items
                    const liEl = document.createElement('li');
                    liEl.innerHTML = `<strong>${trait.traitName}:</strong> ${trait.phenotype} (Genotype: ${trait.genotype} | ${trait.dominanceExpression})`;
                    traitList.appendChild(liEl);
                });

                displayCard.appendChild(traitList);
            }

            resultsEl.appendChild(displayCard);
        });
    });
});