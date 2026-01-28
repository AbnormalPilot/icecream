import { state } from './state.js';

// DOM Elements
const whiteboardBtn = document.getElementById('whiteboard-btn');
const whiteboardOverlay = document.getElementById('whiteboard-overlay');
const whiteboardCloseBtn = document.getElementById('whiteboard-close-btn');
const whiteboardCanvas = document.getElementById('whiteboard-canvas');
const whiteboardColors = document.querySelectorAll('.color-dot');

let isDrawing = false;
let ctx = null;
let lastX = 0;
let lastY = 0;

function resizeCanvas() {
    if (!whiteboardCanvas) return;

    // Check if resize is actually needed to avoid unnecessary clearing
    if (whiteboardCanvas.width === window.innerWidth && whiteboardCanvas.height === window.innerHeight) {
        return;
    }

    // Save existing content
    let imageData = null;
    if (ctx && whiteboardCanvas.width > 0 && whiteboardCanvas.height > 0) {
        try {
            imageData = ctx.getImageData(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
        } catch (e) {
            console.warn('Could not save canvas content:', e);
        }
    }

    whiteboardCanvas.width = window.innerWidth;
    whiteboardCanvas.height = window.innerHeight;

    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        // Restore default or current style
        // If we had content, we want to match the previous style, 
        // but for now we default to white and let the color picker override if active
        ctx.strokeStyle = '#ffffff';

        // Restore content
        if (imageData) {
            ctx.putImageData(imageData, 0, 0);
        }
    }
}

function getPoint(e) {
    const rect = whiteboardCanvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function draw(e) {
    if (!isDrawing || !ctx) return;

    const point = getPoint(e);

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    [lastX, lastY] = [point.x, point.y];
}

export function initWhiteboard() {
    if (!whiteboardCanvas) return;

    ctx = whiteboardCanvas.getContext('2d', { willReadFrequently: true });

    // Initial size
    resizeCanvas();

    // Handle specific resize events
    window.addEventListener('resize', resizeCanvas);

    // Open
    whiteboardBtn.addEventListener('click', () => {
        whiteboardOverlay.classList.add('active');
        if (window.api && window.api.setFullscreen) {
            window.api.setFullscreen(true);
        }

        // Ensure size is correct but try to preserve data via our smart resize
        resizeCanvas();

        // Restore current color if needed, or default
        const activeColor = document.querySelector('.color-dot.active')?.dataset.color || '#ffffff';
        if (ctx) ctx.strokeStyle = activeColor === '#ffffff' ? '#ffffff' : activeColor;
    });

    // Close
    whiteboardCloseBtn.addEventListener('click', () => {
        whiteboardOverlay.classList.remove('active');
        if (window.api && window.api.setFullscreen) {
            window.api.setFullscreen(false);
        }
    });

    // Drawing Events
    whiteboardCanvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const point = getPoint(e);
        [lastX, lastY] = [point.x, point.y];
    });
    whiteboardCanvas.addEventListener('mousemove', draw);
    whiteboardCanvas.addEventListener('mouseup', () => isDrawing = false);
    whiteboardCanvas.addEventListener('mouseout', () => isDrawing = false);

    // Color Logic
    whiteboardColors.forEach(dot => {
        dot.addEventListener('click', () => {
            document.querySelector('.color-dot.active')?.classList.remove('active');
            dot.classList.add('active');

            const color = dot.dataset.color;
            whiteboardCanvas.style.background = color;

            // Contrast check
            const lightColors = ['#ffffff', '#50fa7b', '#f1fa8c', '#88c0d0'];
            if (lightColors.includes(color)) {
                ctx.strokeStyle = '#282a36'; // Dark pen
                whiteboardCloseBtn.style.color = '#282a36';
            } else {
                ctx.strokeStyle = '#f8f8f2'; // White pen
                whiteboardCloseBtn.style.color = '#ffffff';
            }
        });
    });
}
