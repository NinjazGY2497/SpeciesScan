const BACKEND_URL = "http://localhost:2497/ai-response"

export async function sendImageForAnalysis(imageDataUrl) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({img: imageDataUrl})
    });

    return response.json();
}