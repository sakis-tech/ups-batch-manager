/**
 * Language Manager für UPS Batch Manager
 * 
 * Verwaltet die Sprachumschaltung zwischen Deutsch und Englisch:
 * - Laden von Sprachdateien
 * - Dynamische Textaktualisierung
 * - LocalStorage-Persistierung
 * - Event-basierte Benachrichtigungen
 * 
 * @class LanguageManager
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class LanguageManager {
    /**
     * Initialisiert den Language Manager
     * 
     * @constructor
     */
    constructor() {
        /** @type {Object} Aktuelle Sprachdaten */
        this.currentLanguage = 'de';
        
        /** @type {Object} Geladene Übersetzungen */
        this.translations = {};
        
        /** @type {Array} Verfügbare Sprachen */
        this.availableLanguages = [
            { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
            { code: 'en', name: 'English', flag: '🇬🇧' }
        ];
        
        /** @type {string} Schlüssel für localStorage */
        this.storageKey = 'upsLanguage';
        
        /** @type {Set} Registrierte Callbacks */
        this.callbacks = new Set();
        
        this.initialize();
    }
    
    /**
     * Initialisiert das Language System
     */
    async initialize() {
        // Gespeicherte Sprache laden
        const savedLanguage = localStorage.getItem(this.storageKey);
        if (savedLanguage && this.isValidLanguage(savedLanguage)) {
            this.currentLanguage = savedLanguage;
        }
        
        // Sprachdateien laden
        await this.loadLanguages();
        
        // UI aktualisieren
        this.updateUI();
        
        // Event-Listener einrichten
        this.setupEventListeners();
    }
    
    /**
     * Lädt alle verfügbaren Sprachen
     */
    async loadLanguages() {
        for (const lang of this.availableLanguages) {
            try {
                const response = await fetch(`../lang/${lang.code}.json`);
                if (response.ok) {
                    this.translations[lang.code] = await response.json();
                } else {
                    console.warn(`Sprachdatei für ${lang.code} konnte nicht geladen werden`);
                }
            } catch (error) {
                console.error(`Fehler beim Laden der Sprache ${lang.code}:`, error);
                
                // Fallback für Deutsch - inline Definitionen
                if (lang.code === 'de') {
                    this.translations['de'] = this.getGermanFallback();
                }
            }
        }
    }
    
    /**
     * Event-Listener einrichten
     */
    setupEventListeners() {
        // Language-Select im Header
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
        
        // Language-Toggle Button
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            langToggle.addEventListener('click', () => {
                this.toggleLanguage();
            });
        }
        
        // Settings Language Select
        const settingsLangSelect = document.getElementById('settingsLanguageSelect');
        if (settingsLangSelect) {
            settingsLangSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
    
    /**
     * Sprache umschalten
     * 
     * @param {string} languageCode - Sprachcode (de/en)
     */
    async setLanguage(languageCode) {
        if (!this.isValidLanguage(languageCode)) {
            console.warn(`Ungültige Sprache: ${languageCode}`);
            return;
        }
        
        if (this.currentLanguage === languageCode) {
            return; // Bereits aktive Sprache
        }
        
        // Vorherige Sprache für Logging speichern
        const previousLang = this.currentLanguage;
        
        // Sprache umschalten
        this.currentLanguage = languageCode;
        
        // In localStorage speichern
        localStorage.setItem(this.storageKey, languageCode);
        
        // UI aktualisieren
        this.updateUI();
        
        // Callbacks benachrichtigen
        this.notifyCallbacks(languageCode);
        
        // Activity Logger
        if (window.activityLogger) {
            window.activityLogger.logLanguageChanged(previousLang, this.currentLanguage);
        }
        
        // Toast-Benachrichtigung
        const langName = this.getCurrentLanguageName();
        if (window.toastSystem) {
            window.toastSystem.showSuccess(`${this.t('toast.messages.saved')}: ${langName}`);
        }
    }
    
    /**
     * Zwischen Deutsch und Englisch umschalten
     */
    toggleLanguage() {
        const newLang = this.currentLanguage === 'de' ? 'en' : 'de';
        this.setLanguage(newLang);
    }
    
    /**
     * Übersetzung abrufen
     * 
     * @param {string} key - Übersetzungsschlüssel (z.B. 'nav.dashboard')
     * @param {Object} params - Parameter für Platzhalter
     * @returns {string} Übersetzter Text
     */
    t(key, params = {}) {
        const translation = this.getTranslation(key, this.currentLanguage);
        return this.interpolate(translation, params);
    }
    
    /**
     * Übersetzung aus Sprachdaten abrufen
     * 
     * @param {string} key - Übersetzungsschlüssel
     * @param {string} lang - Sprachcode
     * @returns {string} Übersetzung oder Schlüssel als Fallback
     */
    getTranslation(key, lang) {
        const langData = this.translations[lang];
        if (!langData) {
            return key;
        }
        
        const keys = key.split('.');
        let value = langData;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // Schlüssel nicht gefunden
            }
        }
        
        return typeof value === 'string' ? value : key;
    }
    
    /**
     * Platzhalter in Übersetzungen ersetzen
     * 
     * @param {string} text - Text mit Platzhaltern
     * @param {Object} params - Parameter für Ersetzung
     * @returns {string} Text mit ersetzten Platzhaltern
     */
    interpolate(text, params) {
        if (typeof text !== 'string') return text;
        
        return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
            return params[key] || match;
        });
    }
    
    /**
     * Gesamte UI aktualisieren
     */
    updateUI() {
        // Alle Elemente mit data-lang-key aktualisieren
        const elements = document.querySelectorAll('[data-lang-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-lang-key');
            const translation = this.t(key);
            
            // Text-Inhalt aktualisieren
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                } else {
                    element.placeholder = translation;
                }
            } else {
                element.textContent = translation;
            }
        });
        
        // Spezielle UI-Elemente aktualisieren
        this.updateSpecialElements();
        
        // Select-Elemente aktualisieren
        this.updateSelectElements();
        
        // Language-Selectors aktualisieren
        this.updateLanguageSelectors();
    }
    
    /**
     * Spezielle UI-Elemente aktualisieren
     */
    updateSpecialElements() {
        // Titel aktualisieren
        document.title = this.t('app.title');
        
        // Meta-Tags aktualisieren
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.content = this.t('app.subtitle');
        }
        
        // Navigation aktualisieren
        this.updateNavigation();
        
        // Footer aktualisieren
        this.updateFooter();
    }
    
    /**
     * Navigation aktualisieren
     */
    updateNavigation() {
        const navItems = {
            'dashboard': 'nav.dashboard',
            'sendungen': 'nav.sendungen',
            'import': 'nav.import',
            'export': 'nav.export',
            'einstellungen': 'nav.einstellungen',
            'hilfe': 'nav.hilfe'
        };
        
        Object.entries(navItems).forEach(([section, key]) => {
            const element = document.querySelector(`[data-section="${section}"]`);
            if (element) {
                element.textContent = this.t(key);
            }
        });
    }
    
    /**
     * Footer aktualisieren
     */
    updateFooter() {
        const footerElements = {
            '.footer-text': 'footer.version',
            '.footer-version': 'footer.version',
            '#appVersion': 'app.version'
        };
        
        Object.entries(footerElements).forEach(([selector, key]) => {
            const element = document.querySelector(selector);
            if (element && key !== 'app.version') {
                element.textContent = this.t(key);
            }
        });
    }
    
    /**
     * Select-Elemente aktualisieren
     */
    updateSelectElements() {
        // Theme-Select
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            const options = themeSelect.querySelectorAll('option');
            options.forEach(option => {
                const value = option.value;
                if (value === 'auto') option.textContent = this.t('settings.appearance.themes.auto');
                if (value === 'light') option.textContent = this.t('settings.appearance.themes.light');
                if (value === 'dark') option.textContent = this.t('settings.appearance.themes.dark');
            });
        }
        
        // Service-Select
        const serviceSelects = document.querySelectorAll('select[name="serviceType"]');
        serviceSelects.forEach(select => {
            this.updateServiceOptions(select);
        });
    }
    
    /**
     * Service-Optionen aktualisieren
     */
    updateServiceOptions(selectElement) {
        const serviceOptions = {
            '03': this.currentLanguage === 'de' ? 'UPS Standard' : 'UPS Ground',
            '02': this.currentLanguage === 'de' ? 'UPS Express' : 'UPS 2nd Day Air',
            '01': this.currentLanguage === 'de' ? 'UPS Express Plus' : 'UPS Next Day Air',
            '12': this.currentLanguage === 'de' ? 'UPS Express Saver' : 'UPS 3 Day Select',
            '65': this.currentLanguage === 'de' ? 'UPS Worldwide Express Saver' : 'UPS Worldwide Express Saver'
        };
        
        const options = selectElement.querySelectorAll('option');
        options.forEach(option => {
            const value = option.value;
            if (serviceOptions[value]) {
                option.textContent = serviceOptions[value];
            }
        });
    }
    
    /**
     * Language-Selectors aktualisieren
     */
    updateLanguageSelectors() {
        const selectors = ['#languageSelect', '#settingsLanguageSelect'];
        
        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.value = this.currentLanguage;
            }
        });
        
        // Language-Toggle Button
        const langToggle = document.getElementById('languageToggle');
        if (langToggle) {
            const currentLang = this.availableLanguages.find(l => l.code === this.currentLanguage);
            langToggle.innerHTML = `${currentLang.flag} ${currentLang.name}`;
        }
    }
    
    /**
     * Callback für Sprachänderungen registrieren
     * 
     * @param {Function} callback - Callback-Funktion
     */
    onLanguageChange(callback) {
        this.callbacks.add(callback);
    }
    
    /**
     * Callback für Sprachänderungen entfernen
     * 
     * @param {Function} callback - Callback-Funktion
     */
    offLanguageChange(callback) {
        this.callbacks.delete(callback);
    }
    
    /**
     * Alle Callbacks benachrichtigen
     * 
     * @param {string} newLanguage - Neue Sprache
     */
    notifyCallbacks(newLanguage) {
        this.callbacks.forEach(callback => {
            try {
                callback(newLanguage, this.currentLanguage);
            } catch (error) {
                console.error('Fehler in Language-Callback:', error);
            }
        });
    }
    
    /**
     * Prüft ob Sprachcode gültig ist
     * 
     * @param {string} languageCode - Zu prüfender Sprachcode
     * @returns {boolean} true wenn gültig
     */
    isValidLanguage(languageCode) {
        return this.availableLanguages.some(lang => lang.code === languageCode);
    }
    
    /**
     * Aktuellen Sprachcode abrufen
     * 
     * @returns {string} Aktueller Sprachcode
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    /**
     * Aktuellen Sprachnamen abrufen
     * 
     * @returns {string} Aktueller Sprachname
     */
    getCurrentLanguageName() {
        const lang = this.availableLanguages.find(l => l.code === this.currentLanguage);
        return lang ? lang.name : 'Unknown';
    }
    
    /**
     * Verfügbare Sprachen abrufen
     * 
     * @returns {Array} Array der verfügbaren Sprachen
     */
    getAvailableLanguages() {
        return this.availableLanguages;
    }
    
    /**
     * Fallback-Übersetzungen für Deutsch
     * 
     * @returns {Object} Deutsche Fallback-Übersetzungen
     */
    getGermanFallback() {
        return {
            app: {
                title: 'UPS Batch-Manager',
                subtitle: 'Deutsche Version'
            },
            nav: {
                dashboard: 'Dashboard',
                sendungen: 'Sendungen',
                import: 'Import',
                export: 'Export',
                einstellungen: 'Einstellungen',
                hilfe: 'Hilfe'
            },
            toast: {
                messages: {
                    saved: 'Gespeichert'
                }
            },
            footer: {
                version: 'Deutsche Version'
            }
        };
    }
}

// Language Manager global verfügbar machen
window.LanguageManager = LanguageManager;
window.languageManager = new LanguageManager();