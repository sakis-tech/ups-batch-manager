/**
 * Tastenkürzel-System für deutsche UPS Batch Manager Oberfläche
 * 
 * Implementiert globale Keyboard-Shortcuts für:
 * - Neue Sendung erstellen (Strg+N)
 * - Sendung speichern (Strg+S)
 * - Import öffnen (Strg+I)
 * - Export starten (Strg+E)
 * - Suche fokussieren (Strg+F)
 * - Vorlage herunterladen (Strg+D)
 * - Hilfe öffnen (F1)
 * - Dark Mode umschalten (Strg+Shift+D)
 * 
 * @class KeyboardShortcuts
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class KeyboardShortcuts {
    /**
     * Initialisiert das Tastenkürzel-System
     * 
     * @constructor
     */
    constructor() {
        /** @type {Map<string, Object>} Registrierte Shortcuts */
        this.shortcuts = new Map();
        
        /** @type {boolean} Ob Shortcuts aktiviert sind */
        this.enabled = true;
        
        /** @type {Set<string>} Aktive Modifier-Keys */
        this.activeModifiers = new Set();
        
        this.initialize();
    }
    
    /**
     * Initialisiert das System und registriert Standard-Shortcuts
     */
    initialize() {
        this.setupEventListeners();
        this.registerDefaultShortcuts();
        this.createShortcutIndicator();
    }
    
    /**
     * Event-Listener für Tasteneingaben einrichten
     */
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.handleKeyUp(e);
        });
        
        // Context menu für Shortcuts
        document.addEventListener('contextmenu', (e) => {
            if (e.ctrlKey && e.shiftKey) {
                e.preventDefault();
                this.showShortcutMenu(e);
            }
        });
    }
    
    /**
     * Keydown-Event behandeln
     * 
     * @param {KeyboardEvent} event - Das Keyboard-Event
     */
    handleKeyDown(event) {
        if (!this.enabled) return;
        
        // Modifier-Keys verfolgen
        this.updateModifiers(event);
        
        // Nicht in Input-Feldern triggern (außer bei speziellen Shortcuts)
        if (this.shouldIgnoreEvent(event)) return;
        
        // Shortcut-String erstellen
        const shortcutKey = this.createShortcutKey(event);
        
        // Shortcut ausführen falls registriert
        if (this.shortcuts.has(shortcutKey)) {
            event.preventDefault();
            const shortcut = this.shortcuts.get(shortcutKey);
            this.executeShortcut(shortcut, event);
        }
    }
    
    /**
     * Keyup-Event behandeln
     * 
     * @param {KeyboardEvent} event - Das Keyboard-Event
     */
    handleKeyUp(event) {
        this.updateModifiers(event, false);
    }
    
    /**
     * Modifier-Keys Status aktualisieren
     * 
     * @param {KeyboardEvent} event - Das Keyboard-Event
     * @param {boolean} isDown - Ob die Taste gedrückt ist
     */
    updateModifiers(event, isDown = true) {
        const modifiers = ['ctrl', 'shift', 'alt', 'meta'];
        
        modifiers.forEach(mod => {
            const key = `${mod}Key`;
            if (event[key]) {
                if (isDown) {
                    this.activeModifiers.add(mod);
                } else {
                    this.activeModifiers.delete(mod);
                }
            }
        });
    }
    
    /**
     * Prüft ob Event ignoriert werden soll
     * 
     * @param {KeyboardEvent} event - Das Keyboard-Event
     * @returns {boolean} true wenn ignoriert werden soll
     */
    shouldIgnoreEvent(event) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        
        // In Input-Feldern nur spezielle Shortcuts erlauben
        if (['input', 'textarea', 'select'].includes(tagName)) {
            const allowedKeys = ['F1', 'Escape'];
            const allowedCombos = ['ctrl+s', 'ctrl+n', 'ctrl+e', 'ctrl+i'];
            const currentCombo = this.createShortcutKey(event);
            
            return !allowedKeys.includes(event.key) && !allowedCombos.includes(currentCombo);
        }
        
        // In Content-Editable Elementen
        if (target.contentEditable === 'true') {
            return true;
        }
        
        return false;
    }
    
    /**
     * Erstellt einen Shortcut-Key String aus Event
     * 
     * @param {KeyboardEvent} event - Das Keyboard-Event
     * @returns {string} Der Shortcut-Key String
     */
    createShortcutKey(event) {
        const parts = [];
        
        if (event.ctrlKey || event.metaKey) parts.push('ctrl');
        if (event.altKey) parts.push('alt');
        if (event.shiftKey) parts.push('shift');
        
        let key = event.key.toLowerCase();
        
        // Spezielle Keys normalisieren
        switch (key) {
            case ' ':
                key = 'space';
                break;
            case 'arrowup':
                key = 'up';
                break;
            case 'arrowdown':
                key = 'down';
                break;
            case 'arrowleft':
                key = 'left';
                break;
            case 'arrowright':
                key = 'right';
                break;
        }
        
        parts.push(key);
        
        return parts.join('+');
    }
    
    /**
     * Standard-Shortcuts registrieren
     */
    registerDefaultShortcuts() {
        // Neue Sendung
        this.register('ctrl+n', {
            description: 'Neue Sendung erstellen',
            category: 'Sendungen',
            action: () => {
                window.modalSystem?.createShipmentModal();
                window.toastSystem?.showInfo('Neues Sendungsformular geöffnet');
            }
        });
        
        // Speichern
        this.register('ctrl+s', {
            description: 'Aktuelle Sendung speichern',
            category: 'Sendungen',
            action: (event) => {
                // Formular in Modal speichern
                const modal = document.querySelector('.modal-container.active');
                if (modal) {
                    const saveButton = modal.querySelector('.btn-primary:not(.btn-ghost)');
                    if (saveButton && !saveButton.disabled) {
                        saveButton.click();
                        window.toastSystem?.showSuccess('Sendung gespeichert (Strg+S)');
                    }
                }
            }
        });
        
        // Unsaved Changes - Escape zum Zurücksetzen
        this.register('ctrl+z', {
            description: 'Änderungen verwerfen',
            category: 'Sendungen',
            action: (event) => {
                if (window.unsavedChangesManager?.hasUnsavedChanges) {
                    const modal = document.querySelector('.modal-container.active');
                    if (modal) {
                        window.unsavedChangesManager.discardChangesAndContinue(() => {
                            window.modalSystem?.closeModal();
                        });
                    }
                }
            }
        });
        
        // Import
        this.register('ctrl+i', {
            description: 'CSV-Import öffnen',
            category: 'Import/Export',
            action: () => {
                window.appDE?.switchToSection('import');
                window.toastSystem?.showInfo('Import-Bereich geöffnet');
            }
        });
        
        // Export
        this.register('ctrl+e', {
            description: 'Batch-Export starten',
            category: 'Import/Export',
            action: () => {
                if (window.exportHandler) {
                    window.exportHandler.showExportModal();
                    window.toastSystem?.showInfo('Export-Dialog geöffnet');
                } else {
                    window.appDE?.switchToSection('export');
                }
            }
        });
        
        // Suche fokussieren
        this.register('ctrl+f', {
            description: 'Suche fokussieren',
            category: 'Navigation',
            action: () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                    window.toastSystem?.showInfo('Suchfeld aktiviert');
                }
            }
        });
        
        // Vorlage herunterladen
        this.register('ctrl+d', {
            description: 'Vorlage herunterladen',
            category: 'Import/Export',
            action: () => {
                if (window.templateHandler) {
                    window.templateHandler.downloadTemplate();
                    window.toastSystem?.showSuccess('Vorlage wird heruntergeladen');
                }
            }
        });
        
        // Hilfe
        this.register('f1', {
            description: 'Hilfe öffnen',
            category: 'Navigation',
            action: () => {
                if (window.helpSystem) {
                    window.helpSystem.showHelpModal();
                } else {
                    window.toastSystem?.showInfo('Hilfe-System wird geladen...');
                }
            }
        });
        
        // Dark Mode umschalten
        this.register('ctrl+shift+d', {
            description: 'Dark Mode umschalten',
            category: 'Darstellung',
            action: () => {
                window.appDE?.toggleDarkMode();
                const currentTheme = document.documentElement.getAttribute('data-theme');
                window.toastSystem?.showInfo(`Theme: ${currentTheme === 'dark' ? 'Dunkel' : 'Hell'}`);
            }
        });
        
        // Dashboard
        this.register('ctrl+1', {
            description: 'Dashboard anzeigen',
            category: 'Navigation',
            action: () => {
                window.appDE?.switchToSection('dashboard');
            }
        });
        
        // Sendungen
        this.register('ctrl+2', {
            description: 'Sendungen anzeigen',
            category: 'Navigation',
            action: () => {
                window.appDE?.switchToSection('sendungen');
            }
        });
        
        // Einstellungen
        this.register('ctrl+comma', {
            description: 'Einstellungen öffnen',
            category: 'Navigation',
            action: () => {
                window.appDE?.switchToSection('einstellungen');
            }
        });
        
        // Modal schließen
        this.register('escape', {
            description: 'Modal/Dialog schließen',
            category: 'Navigation',
            action: () => {
                window.modalSystem?.closeModal();
            }
        });
        
        // Vollbild umschalten
        this.register('f11', {
            description: 'Vollbild umschalten',
            category: 'Darstellung',
            action: () => {
                window.appDE?.toggleFullscreen();
            }
        });
    }
    
    /**
     * Neuen Shortcut registrieren
     * 
     * @param {string} key - Der Shortcut-Key (z.B. 'ctrl+s')
     * @param {Object} config - Konfiguration des Shortcuts
     * @param {string} config.description - Beschreibung des Shortcuts
     * @param {string} config.category - Kategorie für Gruppierung
     * @param {Function} config.action - Auszuführende Funktion
     */
    register(key, config) {
        this.shortcuts.set(key.toLowerCase(), {
            key,
            description: config.description,
            category: config.category || 'Allgemein',
            action: config.action,
            enabled: config.enabled !== false
        });
    }
    
    /**
     * Shortcut entfernen
     * 
     * @param {string} key - Der zu entfernende Shortcut-Key
     */
    unregister(key) {
        this.shortcuts.delete(key.toLowerCase());
    }
    
    /**
     * Shortcut ausführen
     * 
     * @param {Object} shortcut - Der Shortcut-Objekts
     * @param {KeyboardEvent} event - Das ursprüngliche Event
     */
    executeShortcut(shortcut, event) {
        if (!shortcut.enabled) return;
        
        try {
            shortcut.action(event);
            
            // Shortcut-Indikator anzeigen
            this.showShortcutFeedback(shortcut);
        } catch (error) {
            console.error('Fehler bei Shortcut-Ausführung:', error);
            window.toastSystem?.showError(`Shortcut-Fehler: ${shortcut.description}`);
        }
    }
    
    /**
     * Visual Feedback für ausgeführten Shortcut
     * 
     * @param {Object} shortcut - Der ausgeführte Shortcut
     */
    showShortcutFeedback(shortcut) {
        const indicator = document.getElementById('shortcutIndicator');
        if (!indicator) return;
        
        indicator.textContent = this.formatShortcutKey(shortcut.key);
        indicator.classList.add('active');
        
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 1000);
    }
    
    /**
     * Shortcut-Key für Anzeige formatieren
     * 
     * @param {string} key - Der Shortcut-Key
     * @returns {string} Formatierter Key
     */
    formatShortcutKey(key) {
        return key
            .replace('ctrl', 'Strg')
            .replace('shift', 'Shift')
            .replace('alt', 'Alt')
            .replace('+', ' + ')
            .toUpperCase();
    }
    
    /**
     * Shortcut-Indikator erstellen
     */
    createShortcutIndicator() {
        if (document.getElementById('shortcutIndicator')) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'shortcutIndicator';
        indicator.className = 'shortcut-indicator';
        
        document.body.appendChild(indicator);
    }
    
    /**
     * Shortcut-Menü anzeigen (Rechtsklick + Strg+Shift)
     * 
     * @param {MouseEvent} event - Das Mouse-Event
     */
    showShortcutMenu(event) {
        const menu = this.createShortcutMenu();
        
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;
        
        document.body.appendChild(menu);
        
        // Menu nach 5 Sekunden entfernen
        setTimeout(() => {
            if (menu.parentNode) {
                menu.parentNode.removeChild(menu);
            }
        }, 5000);
        
        // Bei Klick außerhalb entfernen
        const closeMenu = (e) => {
            if (!menu.contains(e.target)) {
                if (menu.parentNode) {
                    menu.parentNode.removeChild(menu);
                }
                document.removeEventListener('click', closeMenu);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeMenu);
        }, 100);
    }
    
    /**
     * Shortcut-Menü HTML erstellen
     * 
     * @returns {HTMLElement} Das Menü-Element
     */
    createShortcutMenu() {
        const menu = document.createElement('div');
        menu.className = 'shortcut-menu';
        
        const categories = this.groupShortcutsByCategory();
        
        let html = '<div class="shortcut-menu-header">Verfügbare Tastenkürzel</div>';
        
        Object.entries(categories).forEach(([category, shortcuts]) => {
            html += `<div class="shortcut-category">
                <div class="shortcut-category-title">${category}</div>
                <div class="shortcut-list">`;
            
            shortcuts.forEach(shortcut => {
                html += `<div class="shortcut-item">
                    <span class="shortcut-key">${this.formatShortcutKey(shortcut.key)}</span>
                    <span class="shortcut-desc">${shortcut.description}</span>
                </div>`;
            });
            
            html += '</div></div>';
        });
        
        menu.innerHTML = html;
        return menu;
    }
    
    /**
     * Shortcuts nach Kategorien gruppieren
     * 
     * @returns {Object} Gruppierte Shortcuts
     */
    groupShortcutsByCategory() {
        const categories = {};
        
        this.shortcuts.forEach(shortcut => {
            if (!shortcut.enabled) return;
            
            if (!categories[shortcut.category]) {
                categories[shortcut.category] = [];
            }
            
            categories[shortcut.category].push(shortcut);
        });
        
        return categories;
    }
    
    /**
     * Alle registrierten Shortcuts abrufen
     * 
     * @returns {Array} Array aller Shortcuts
     */
    getAllShortcuts() {
        return Array.from(this.shortcuts.values());
    }
    
    /**
     * Shortcuts aktivieren/deaktivieren
     * 
     * @param {boolean} enabled - Ob Shortcuts aktiviert sein sollen
     */
    setEnabled(enabled) {
        this.enabled = enabled;
        
        if (enabled) {
            window.toastSystem?.showSuccess('Tastenkürzel aktiviert');
        } else {
            window.toastSystem?.showInfo('Tastenkürzel deaktiviert');
        }
    }
    
    /**
     * Status der Shortcuts abrufen
     * 
     * @returns {boolean} Ob Shortcuts aktiviert sind
     */
    isEnabled() {
        return this.enabled;
    }
}

// Keyboard-Shortcuts global verfügbar machen
window.KeyboardShortcuts = KeyboardShortcuts;
window.keyboardShortcuts = new KeyboardShortcuts();