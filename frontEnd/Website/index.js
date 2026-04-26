import { sendImageForAnalysis } from './requestBackend.js';

document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadInput = document.getElementById('uploadInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const previewImgEl = document.getElementById('preview-img');
    const placeholderEl = document.getElementById('placeholder');
    const resultsEl = document.getElementById('results');
    const BASE64_STORAGE_KEY = 'CAPTURED_IMAGE';
    const FILENAME_STORAGE_KEY = 'CAPTURED_IMAGE_FILENAME';

    function showImage(dataUrl, filename) {
        previewImgEl.src = dataUrl;
        previewImgEl.style.display = 'block';
        placeholderEl.textContent = filename;
    };

    function saveImageData() {
        const dataUrl = previewImgEl.src;
        const filename = placeholderEl.textContent;
        if (dataUrl) {
            localStorage.setItem(BASE64_STORAGE_KEY, dataUrl);
        }
        if (filename) {
            localStorage.setItem(FILENAME_STORAGE_KEY, filename);
        }
    }

    function loadImgData() {
        let imgData = localStorage.getItem(BASE64_STORAGE_KEY);
        let filename = localStorage.getItem(FILENAME_STORAGE_KEY);
        if (imgData) {
            showImage(imgData, filename);
        }
    }

    loadImgData();

    uploadBtn.addEventListener('click', () => {
        uploadInput.click();
    });

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            const reader = new FileReader(); // Reads Base64 data
            
            reader.onload = (event) => {
                showImage(event.target.result, file.name);
                saveImageData();
            };
            reader.readAsDataURL(file);
        }
    });

    analyzeBtn.addEventListener('click', async () => {
        if (placeholderEl.textContent === 'No Image Uploaded Yet') {
            alert('Please capture an image first.');
            return;
        }

        resultsEl.style.display = 'flex';
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
                    liEl.innerHTML = `<strong>${trait.traitName}:</strong> ${trait.phenotype} (Genotype: ${trait.genotype} | ${trait.dominanceExpression}, which is ${trait.dominanceType})`;
                    traitList.appendChild(liEl);
                });

                displayCard.appendChild(traitList);
            }

            resultsEl.appendChild(displayCard);
        });
    });
});