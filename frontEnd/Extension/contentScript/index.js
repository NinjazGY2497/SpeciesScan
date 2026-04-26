let selectionOverlay = null;
let selectionBox = null;
let startX = 0;
let startY = 0;
let isSelecting = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'START_REGION_SELECTION') {
        startSelectionOverlay();
        sendResponse({ status: 'overlay-shown' });
    }
});

function startSelectionOverlay() {
    if (selectionOverlay) {
        return;
    }

    selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'region-selection-overlay';
    selectionOverlay.innerHTML = '<div class="selection-instructions">Drag to select a region, or press Esc to cancel</div>';

    selectionBox = document.createElement('div');
    selectionBox.className = 'selection-box';
    selectionOverlay.appendChild(selectionBox);

    document.body.appendChild(selectionOverlay);
    document.body.style.userSelect = 'none';

    selectionOverlay.addEventListener('mousedown', onMouseDown);
    selectionOverlay.addEventListener('mousemove', onMouseMove);
    selectionOverlay.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
}

function removeSelectionOverlay() {
    if (!selectionOverlay) {
        return;
    }
    selectionOverlay.removeEventListener('mousedown', onMouseDown);
    selectionOverlay.removeEventListener('mousemove', onMouseMove);
    selectionOverlay.removeEventListener('mouseup', onMouseUp);
    window.removeEventListener('keydown', onKeyDown);

    document.body.style.userSelect = '';
    selectionOverlay.remove();
    selectionOverlay = null;
    selectionBox = null;
    isSelecting = false;
}

function onMouseDown(event) {
    if (event.button !== 0) {
        return;
    }
    isSelecting = true;
    startX = event.clientX;
    startY = event.clientY;
    updateSelectionBox(startX, startY, 0, 0);
}

function onMouseMove(event) {
    if (!isSelecting) {
        return;
    }
    const currentX = event.clientX;
    const currentY = event.clientY;
    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    updateSelectionBox(left, top, width, height);
}

function onMouseUp(event) {
    if (!isSelecting) {
        return;
    }
    isSelecting = false;
    const endX = event.clientX;
    const endY = event.clientY;
    const left = Math.min(startX, endX);
    const top = Math.min(startY, endY);
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);

    if (width < 10 || height < 10) {
        removeSelectionOverlay();
        return;
    }

    chrome.runtime.sendMessage({
        action: 'region-selected',
        rect: { x: left, y: top, width, height },
        devicePixelRatio: window.devicePixelRatio || 1,
    }, async (response) => {
        removeSelectionOverlay();
        if (response?.status === 'captured' && response.dataUrl) {
            try {
                const cropped = await cropDataUrl(response.dataUrl, response.rect, response.devicePixelRatio);
                chrome.storage.local.set({ capturedRegion: cropped });
            } catch (error) {
                console.warn('Region capture failed:', error);
            }
        } else if (response?.status === 'error') {
            console.warn('Region capture failed:', response.error);
        }
    });
}

function onKeyDown(event) {
    if (event.key === 'Escape') {
        removeSelectionOverlay();
    }
}

function updateSelectionBox(left, top, width, height) {
    if (!selectionBox) {
        return;
    }
    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
}

async function cropDataUrl(dataUrl, rect, devicePixelRatio) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            try {
                const scale = devicePixelRatio || 1;
                const canvas = document.createElement('canvas');
                canvas.width = Math.round(rect.width * scale);
                canvas.height = Math.round(rect.height * scale);
                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    image,
                    Math.round(rect.x * scale),
                    Math.round(rect.y * scale),
                    Math.round(rect.width * scale),
                    Math.round(rect.height * scale),
                    0,
                    0,
                    Math.round(rect.width * scale),
                    Math.round(rect.height * scale)
                );
                resolve(canvas.toDataURL('image/png'));
            } catch (error) {
                reject(error);
            }
        };
        image.onerror = reject;
        image.src = dataUrl;
    });
}

function showPreviewOverlay(imageSrc) {
    const preview = document.createElement('div');
    preview.className = 'capture-preview-overlay';
    preview.innerHTML = `
        <div class="capture-preview-card">
            <button class="capture-preview-close" title="Close preview">×</button>
            <img src="${imageSrc}" alt="Captured region preview" />
            <div class="capture-preview-label">Region captured</div>
        </div>
    `;

    document.body.appendChild(preview);
    preview.querySelector('.capture-preview-close').addEventListener('click', () => {
        preview.remove();
    });
}
