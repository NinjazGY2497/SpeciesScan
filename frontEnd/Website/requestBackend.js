const BACKEND_URL = "http://localhost:2497/ai-response"
const compressionCheckbox = document.querySelector('#compressionCheckbox');

let compressionEnabled = true;

export async function sendImageForAnalysis(imageDataUrl) {
    let dataUrl = compressionEnabled ? await compressImage(imageDataUrl) : imageDataUrl;

    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({img: dataUrl})
    });

    return response.json();
}

// Compression function generated with Gemini
async function compressImage(dataUrl, maxWidth=500, quality=0.7) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Scale down if the image is wider than maxWidth
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw the resized image to the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            console.log(`Compressed image to ${width}x${height}`);

            // Export as JPEG with compression
            const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(compressedDataUrl);
        };
        img.src = dataUrl;
    });
}

compressionCheckbox.addEventListener('change', () => {
    compressionEnabled = compressionCheckbox.checked;
});