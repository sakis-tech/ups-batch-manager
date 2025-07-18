/**
 * Theme-Initialisierung vor DOM-Load
 * Verhindert FOUC (Flash of Unstyled Content) beim Dark Mode
 */
(function() {
    'use strict';
    
    // Theme sofort beim Script-Load setzen (vor DOM-Ready)
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        // Fallback auf System-Präferenz
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }
})();