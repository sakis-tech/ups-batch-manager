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
                const response = await fetch(`lang/${lang.code}.json`);
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
        
        return text.replace(/\\{\\{(.*?)\\}\\}/g, (match, key) => {
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
        const navItems = {\n            'dashboard': 'nav.dashboard',\n            'sendungen': 'nav.sendungen',\n            'import': 'nav.import',\n            'export': 'nav.export',\n            'einstellungen': 'nav.einstellungen',\n            'hilfe': 'nav.hilfe'\n        };\n        \n        Object.entries(navItems).forEach(([section, key]) => {\n            const element = document.querySelector(`[data-section=\"${section}\"]`);\n            if (element) {\n                element.textContent = this.t(key);\n            }\n        });\n    }\n    \n    /**\n     * Footer aktualisieren\n     */\n    updateFooter() {\n        const footerElements = {\n            '.footer-text': 'footer.version',\n            '.footer-version': 'footer.version',\n            '#appVersion': 'app.version'\n        };\n        \n        Object.entries(footerElements).forEach(([selector, key]) => {\n            const element = document.querySelector(selector);\n            if (element && key !== 'app.version') {\n                element.textContent = this.t(key);\n            }\n        });\n    }\n    \n    /**\n     * Select-Elemente aktualisieren\n     */\n    updateSelectElements() {\n        // Theme-Select\n        const themeSelect = document.getElementById('themeSelect');\n        if (themeSelect) {\n            const options = themeSelect.querySelectorAll('option');\n            options.forEach(option => {\n                const value = option.value;\n                if (value === 'auto') option.textContent = this.t('settings.appearance.themes.auto');\n                if (value === 'light') option.textContent = this.t('settings.appearance.themes.light');\n                if (value === 'dark') option.textContent = this.t('settings.appearance.themes.dark');\n            });\n        }\n        \n        // Service-Select\n        const serviceSelects = document.querySelectorAll('select[name=\"serviceType\"]');\n        serviceSelects.forEach(select => {\n            this.updateServiceOptions(select);\n        });\n    }\n    \n    /**\n     * Service-Optionen aktualisieren\n     */\n    updateServiceOptions(selectElement) {\n        const serviceOptions = {\n            '03': this.currentLanguage === 'de' ? 'UPS Standard' : 'UPS Ground',\n            '02': this.currentLanguage === 'de' ? 'UPS Express' : 'UPS 2nd Day Air',\n            '01': this.currentLanguage === 'de' ? 'UPS Express Plus' : 'UPS Next Day Air',\n            '12': this.currentLanguage === 'de' ? 'UPS Express Saver' : 'UPS 3 Day Select',\n            '65': this.currentLanguage === 'de' ? 'UPS Worldwide Express Saver' : 'UPS Worldwide Express Saver'\n        };\n        \n        const options = selectElement.querySelectorAll('option');\n        options.forEach(option => {\n            const value = option.value;\n            if (serviceOptions[value]) {\n                option.textContent = serviceOptions[value];\n            }\n        });\n    }\n    \n    /**\n     * Language-Selectors aktualisieren\n     */\n    updateLanguageSelectors() {\n        const selectors = ['#languageSelect', '#settingsLanguageSelect'];\n        \n        selectors.forEach(selector => {\n            const element = document.querySelector(selector);\n            if (element) {\n                element.value = this.currentLanguage;\n            }\n        });\n        \n        // Language-Toggle Button\n        const langToggle = document.getElementById('languageToggle');\n        if (langToggle) {\n            const currentLang = this.availableLanguages.find(l => l.code === this.currentLanguage);\n            langToggle.innerHTML = `${currentLang.flag} ${currentLang.name}`;\n        }\n    }\n    \n    /**\n     * Callback für Sprachänderungen registrieren\n     * \n     * @param {Function} callback - Callback-Funktion\n     */\n    onLanguageChange(callback) {\n        this.callbacks.add(callback);\n    }\n    \n    /**\n     * Callback für Sprachänderungen entfernen\n     * \n     * @param {Function} callback - Callback-Funktion\n     */\n    offLanguageChange(callback) {\n        this.callbacks.delete(callback);\n    }\n    \n    /**\n     * Alle Callbacks benachrichtigen\n     * \n     * @param {string} newLanguage - Neue Sprache\n     */\n    notifyCallbacks(newLanguage) {\n        this.callbacks.forEach(callback => {\n            try {\n                callback(newLanguage, this.currentLanguage);\n            } catch (error) {\n                console.error('Fehler in Language-Callback:', error);\n            }\n        });\n    }\n    \n    /**\n     * Prüft ob Sprachcode gültig ist\n     * \n     * @param {string} languageCode - Zu prüfender Sprachcode\n     * @returns {boolean} true wenn gültig\n     */\n    isValidLanguage(languageCode) {\n        return this.availableLanguages.some(lang => lang.code === languageCode);\n    }\n    \n    /**\n     * Aktuellen Sprachcode abrufen\n     * \n     * @returns {string} Aktueller Sprachcode\n     */\n    getCurrentLanguage() {\n        return this.currentLanguage;\n    }\n    \n    /**\n     * Aktuellen Sprachnamen abrufen\n     * \n     * @returns {string} Aktueller Sprachname\n     */\n    getCurrentLanguageName() {\n        const lang = this.availableLanguages.find(l => l.code === this.currentLanguage);\n        return lang ? lang.name : 'Unknown';\n    }\n    \n    /**\n     * Verfügbare Sprachen abrufen\n     * \n     * @returns {Array} Array der verfügbaren Sprachen\n     */\n    getAvailableLanguages() {\n        return this.availableLanguages;\n    }\n    \n    /**\n     * Fallback-Übersetzungen für Deutsch\n     * \n     * @returns {Object} Deutsche Fallback-Übersetzungen\n     */\n    getGermanFallback() {\n        return {\n            app: {\n                title: 'UPS Batch-Manager',\n                subtitle: 'Deutsche Version'\n            },\n            nav: {\n                dashboard: 'Dashboard',\n                sendungen: 'Sendungen',\n                import: 'Import',\n                export: 'Export',\n                einstellungen: 'Einstellungen',\n                hilfe: 'Hilfe'\n            },\n            toast: {\n                messages: {\n                    saved: 'Gespeichert'\n                }\n            },\n            footer: {\n                version: 'Deutsche Version'\n            }\n        };\n    }\n}\n\n// Language Manager global verfügbar machen\nwindow.LanguageManager = LanguageManager;\nwindow.languageManager = new LanguageManager();"