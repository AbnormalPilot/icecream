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
    whiteboardCanvas.width = window.innerWidth;
    whiteboardCanvas.height = window.innerHeight;

    if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 3;
        // Restore default or current style if needed, 
        // but for now simpler to reset to default/white unless tracking state
        ctx.strokeStyle = '#ffffff';
    }
}

function draw(e) {
    if (!isDrawing || !ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

export function initWhiteboard() {
    if (!whiteboardCanvas) return;

    ctx = whiteboardCanvas.getContext('2d');

    // Open
    whiteboardBtn.addEventListener('click', () => {
        whiteboardOverlay.classList.add('active');
        if (window.api && window.api.setFullscreen) {
            window.api.setFullscreen(true);
        }
        resizeCanvas();
        // Default pen
        if (ctx) ctx.strokeStyle = '#ffffff';
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
        [lastX, lastY] = [e.offsetX, e.offsetY];
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
