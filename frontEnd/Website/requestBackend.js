const BACKEND_URL = "http://localhost:2497/ai-response"
const compressionCheckbox = document.querySelector('#compressionCheckbox');

let compressionEnabled = true;

export async function sendImageForAnalysis(imageDataUrl) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({img: imageDataUrl})
    });

    return response.json();
}

compressionCheckbox.addEventListener('change', () => {
    compressionEnabled = compressionCheckbox.checked;
});