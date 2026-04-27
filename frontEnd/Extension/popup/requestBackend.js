const BACKEND_URL = "https://legacyhackathoncrewraag.pythonanywhere.com/speciesscan/ai-response"

export async function sendImageForAnalysis(imageDataUrl) {
    const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({img: imageDataUrl})
    });

    return response.json();
}