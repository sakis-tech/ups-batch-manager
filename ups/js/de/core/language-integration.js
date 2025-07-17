/**
 * Language Integration für bestehende Systeme
 * 
 * Erweitert bestehende Klassen um Sprachunterstützung
 * 
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */

// Language Manager erweitern für bestehende Systeme
document.addEventListener('DOMContentLoaded', () => {
    // Warten bis Language Manager initialisiert ist
    setTimeout(() => {
        if (window.languageManager) {
            initializeLanguageIntegration();
        }
    }, 100);
});

function initializeLanguageIntegration() {
    // Toast-System erweitern
    if (window.toastSystem) {
        const originalShow = window.toastSystem.showToast;
        window.toastSystem.showToast = function(message, type = 'info', options = {}) {
            // Übersetze Titel falls nicht explizit angegeben
            if (!options.title && window.languageManager) {
                options.title = window.languageManager.t(`toast.titles.${type}`);
            }
            
            return originalShow.call(this, message, type, options);
        };
    }
    
    // Modal-System erweitern
    if (window.modalSystem) {
        const originalCreate = window.modalSystem.createModal;
        window.modalSystem.createModal = function(id, config) {
            // Übersetze Standard-Texte
            if (window.languageManager) {
                if (!config.title && config.type === 'shipment') {
                    config.title = window.languageManager.t('forms.shipment.title');
                }
                
                // Übersetze Button-Texte
                if (config.buttons) {
                    config.buttons = config.buttons.map(btn => {
                        if (btn.text === 'Speichern') {
                            btn.text = window.languageManager.t('common.buttons.save');
                        } else if (btn.text === 'Abbrechen') {
                            btn.text = window.languageManager.t('common.buttons.cancel');
                        }
                        return btn;
                    });
                }
            }
            
            return originalCreate.call(this, id, config);
        };
    }
    
    // Language toggle shortcut removed - German only
    
    // Language-Change Events removed - German only
    
    // Set HTML lang attribute to German
    document.documentElement.lang = 'de';
}

function updateKeyboardShortcuts() {
    if (!window.keyboardShortcuts || !window.languageManager) return;
    
    // Shortcuts mit neuen Beschreibungen aktualisieren
    const shortcuts = [
        { key: 'ctrl+n', desc: 'shortcuts.actions.newShipment', category: 'shortcuts.categories.shipments' },
        { key: 'ctrl+s', desc: 'shortcuts.actions.save', category: 'shortcuts.categories.general' },
        { key: 'ctrl+i', desc: 'shortcuts.actions.import', category: 'shortcuts.categories.import' },
        { key: 'ctrl+e', desc: 'shortcuts.actions.export', category: 'shortcuts.categories.import' },
        { key: 'ctrl+f', desc: 'shortcuts.actions.search', category: 'shortcuts.categories.general' },
        { key: 'f1', desc: 'shortcuts.actions.help', category: 'shortcuts.categories.general' },
        { key: 'ctrl+shift+d', desc: 'shortcuts.actions.toggleTheme', category: 'shortcuts.categories.display' }
    ];
    
    shortcuts.forEach(shortcut => {
        const existingShortcut = window.keyboardShortcuts.shortcuts.get(shortcut.key);
        if (existingShortcut) {
            existingShortcut.description = window.languageManager.t(shortcut.desc);
            existingShortcut.category = window.languageManager.t(shortcut.category);
        }
    });
}

// Export für andere Module
window.languageIntegration = {
    initializeLanguageIntegration,
    updateKeyboardShortcuts
};