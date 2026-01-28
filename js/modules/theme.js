import { saveState } from './state.js';

// DOM Elements
const themeSelect = document.getElementById('theme-select');

// Exported for editor.js to use if needed, though editor handles its own theme option
export function applyTheme(theme) {
    if (!theme) return;

    // Update global CSS variable
    document.documentElement.setAttribute('data-theme', theme);

    // Update dropdown if not already set (e.g. on load)
    if (themeSelect.value !== theme) {
        themeSelect.value = theme;
    }

    saveState();

    // Dispatch event for other components (like editor) to react
    window.dispatchEvent(new CustomEvent('theme-changed', { detail: { theme } }));
}

export function initTheme() {
    themeSelect.onchange = () => applyTheme(themeSelect.value);
}
