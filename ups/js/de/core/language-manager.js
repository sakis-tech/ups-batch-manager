/**
 * Language Manager für UPS Batch Manager
 * 
 * Vereinfachter German-only Language Manager:
 * - Stellt deutsche Übersetzungen bereit
 * - Bietet t() Methode für Übersetzungen
 * - Keine Sprachumschaltung
 * 
 * @class LanguageManager
 * @version 3.0.0
 * @author UPS Batch Manager Team
 */
class LanguageManager {
    /**
     * Initialisiert den Language Manager
     * 
     * @constructor
     */
    constructor() {
        /** @type {Object} Deutsche Übersetzungen */
        this.translations = {};
        
        this.initialize();
    }
    
    /**
     * Initialisiert das Language System
     */
    initialize() {
        // Deutsche Übersetzungen laden
        this.loadGermanTranslations();
        
        // UI aktualisieren
        this.updateUI();
    }
    
    /**
     * Lädt die deutschen Übersetzungen
     */
    loadGermanTranslations() {
        // Deutsche Übersetzungen
        this.translations = {
            "app": {
                "title": "UPS Batch-Manager",
                "subtitle": "Deutsche Version",
                "version": "Version"
            },
            "nav": {
                "dashboard": "Dashboard",
                "sendungen": "Sendungen",
                "import": "Import",
                "export": "Export",
                "einstellungen": "Einstellungen",
                "hilfe": "Hilfe"
            },
            "dashboard": {
                "title": "Dashboard",
                "welcome": "Willkommen im UPS Batch-Manager!",
                "stats": {
                    "total": "Gesamt",
                    "valid": "Gültig",
                    "invalid": "Fehlerhaft",
                    "weight": "Gesamtgewicht"
                },
                "quickActions": {
                    "title": "Schnellaktionen",
                    "newShipment": "Neue Sendung",
                    "importCsv": "CSV importieren",
                    "exportBatch": "Batch exportieren",
                    "downloadTemplate": "Vorlage herunterladen"
                },
                "recentActivity": {
                    "title": "Letzte Aktivitäten",
                    "empty": "Willkommen im UPS Batch-Manager!"
                }
            },
            "shipments": {
                "title": "Sendungen verwalten",
                "search": "Sendungen suchen...",
                "filters": {
                    "all": "Alle",
                    "service": "Service",
                    "country": "Land",
                    "status": "Status"
                },
                "table": {
                    "select": "Auswählen",
                    "recipient": "Empfänger",
                    "address": "Adresse",
                    "service": "Service",
                    "weight": "Gewicht",
                    "status": "Status",
                    "actions": "Aktionen",
                    "edit": "Bearbeiten",
                    "delete": "Löschen",
                    "duplicate": "Duplizieren"
                },
                "status": {
                    "valid": "Gültig",
                    "invalid": "Fehlerhaft",
                    "warning": "Warnung"
                },
                "actions": {
                    "selectAll": "Alle auswählen",
                    "deselectAll": "Alle abwählen",
                    "deleteSelected": "Ausgewählte löschen",
                    "exportSelected": "Ausgewählte exportieren"
                }
            },
            "import": {
                "title": "CSV-Import",
                "subtitle": "Importieren Sie Sendungsdaten aus CSV-Dateien",
                "dropzone": {
                    "title": "Datei hier ablegen",
                    "subtitle": "oder klicken Sie hier zum Auswählen",
                    "formats": "Unterstützte Formate: CSV, SSV, TXT",
                    "maxSize": "Maximale Dateigröße: 10 MB"
                },
                "steps": {
                    "upload": "1. Datei hochladen",
                    "preview": "2. Vorschau & Zuordnung",
                    "import": "3. Import starten"
                },
                "preview": {
                    "title": "Import-Vorschau",
                    "mapping": "Feld-Zuordnung",
                    "validation": "Validierung",
                    "results": "Ergebnisse"
                },
                "validation": {
                    "valid": "Gültige Zeilen",
                    "invalid": "Fehlerhafte Zeilen",
                    "warnings": "Warnungen",
                    "errors": "Fehler"
                },
                "buttons": {
                    "selectFile": "Datei auswählen",
                    "startImport": "Import starten",
                    "cancel": "Abbrechen",
                    "finish": "Abschließen"
                }
            },
            "export": {
                "title": "Batch-Export",
                "subtitle": "Exportieren Sie Sendungen im UPS-kompatiblen Format",
                "options": {
                    "title": "Export-Optionen",
                    "format": "Format",
                    "fields": "Felder",
                    "sorting": "Sortierung",
                    "filter": "Filter"
                },
                "formats": {
                    "csv": "CSV (Comma-separated)",
                    "ssv": "SSV (Semicolon-separated)",
                    "txt": "TXT (Tab-separated)"
                },
                "fieldSets": {
                    "basic": "Basis-Felder",
                    "extended": "Erweiterte Felder",
                    "international": "Internationale Felder",
                    "all": "Alle Felder"
                },
                "sorting": {
                    "none": "Keine Sortierung",
                    "country": "Nach Land",
                    "service": "Nach Service",
                    "recipient": "Nach Empfänger"
                },
                "filters": {
                    "all": "Alle Sendungen",
                    "valid": "Nur gültige",
                    "selected": "Nur ausgewählte"
                },
                "buttons": {
                    "export": "Exportieren",
                    "preview": "Vorschau",
                    "cancel": "Abbrechen"
                }
            },
            "settings": {
                "title": "Einstellungen",
                "sections": {
                    "appearance": "Darstellung",
                    "defaults": "Standardwerte",
                    "data": "Datenverwaltung",
                    "about": "Über"
                },
                "appearance": {
                    "theme": "Theme",
                    "language": "Sprache",
                    "themes": {
                        "auto": "System",
                        "light": "Hell",
                        "dark": "Dunkel"
                    },
                    "languages": {
                        "de": "Deutsch",
                        "en": "English"
                    }
                },
                "defaults": {
                    "country": "Standard-Land",
                    "service": "Standard-Service",
                    "unit": "Standard-Einheit"
                },
                "data": {
                    "storage": "Speichernutzung",
                    "backup": "Backup erstellen",
                    "restore": "Wiederherstellen",
                    "clear": "Alle Daten löschen"
                },
                "user": {
                    "title": "Benutzer-Einstellungen",
                    "name": "Name",
                    "namePlaceholder": "Ihr Name",
                    "nameHelp": "Dieser Name wird für alle Ihre Aktivitäten verwendet.",
                    "created": "Erstellt am",
                    "lastLogin": "Letzter Login",
                    "loginCount": "Anzahl Logins",
                    "logout": "Abmelden"
                },
                "nameUpdated": "Name wurde aktualisiert",
                "buttons": {
                    "save": "Speichern",
                    "reset": "Zurücksetzen",
                    "backup": "Backup erstellen",
                    "restore": "Wiederherstellen",
                    "clear": "Löschen"
                }
            },
            "forms": {
                "shipment": {
                    "title": "Sendung bearbeiten",
                    "newTitle": "Neue Sendung erstellen",
                    "sections": {
                        "recipient": "Empfänger-Informationen",
                        "package": "Paket-Informationen",
                        "service": "Service-Optionen",
                        "special": "Spezial-Optionen"
                    },
                    "fields": {
                        "companyName": "Firma oder Name",
                        "contactName": "Kontaktperson",
                        "address1": "Adresse 1",
                        "address2": "Adresse 2",
                        "address3": "Adresse 3",
                        "city": "Stadt",
                        "state": "Bundesland",
                        "postalCode": "Postleitzahl",
                        "country": "Land",
                        "phone": "Telefon",
                        "email": "E-Mail",
                        "weight": "Gewicht",
                        "length": "Länge",
                        "width": "Breite",
                        "height": "Höhe",
                        "serviceType": "Service-Typ",
                        "description": "Beschreibung",
                        "value": "Wert",
                        "reference1": "Referenz 1",
                        "reference2": "Referenz 2",
                        "reference3": "Referenz 3"
                    },
                    "placeholders": {
                        "companyName": "Firmenname oder Vollständiger Name",
                        "contactName": "Ansprechpartner",
                        "address1": "Straße und Hausnummer",
                        "address2": "Zusätzliche Adresszeile",
                        "city": "Stadt",
                        "postalCode": "PLZ",
                        "phone": "Telefonnummer",
                        "email": "E-Mail-Adresse",
                        "description": "Warenbeschreibung",
                        "reference1": "Referenznummer 1"
                    },
                    "buttons": {
                        "save": "Speichern",
                        "cancel": "Abbrechen",
                        "delete": "Löschen",
                        "duplicate": "Duplizieren"
                    }
                },
                "validation": {
                    "required": "Dieses Feld ist erforderlich",
                    "email": "Gültige E-Mail-Adresse erforderlich",
                    "phone": "Gültige Telefonnummer erforderlich",
                    "postalCode": "Gültige Postleitzahl erforderlich",
                    "number": "Gültige Zahl erforderlich",
                    "positive": "Wert muss positiv sein",
                    "maxLength": "Maximale Länge überschritten"
                },
                "unsavedChanges": {
                    "beforeUnload": "Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?",
                    "navigationWarning": "Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?",
                    "modalTitle": "Ungespeicherte Änderungen",
                    "saveAndContinue": "Änderungen speichern",
                    "discardChanges": "Verwerfen",
                    "discarded": "Änderungen verworfen",
                    "monitoring": "Änderungen werden überwacht",
                    "unsavedIndicator": "Ungespeicherte Änderungen"
                }
            },
            "activities": {
                "title": "Aktivitäten-Log",
                "subtitle": "Detaillierte Protokollierung aller Aktionen",
                "empty": "Keine Aktivitäten vorhanden",
                "viewAll": "Alle anzeigen",
                "clearAll": "Alle löschen",
                "export": "Exportieren",
                "filter": "Filtern",
                "search": "Aktivitäten durchsuchen...",
                "categories": {
                    "all": "Alle",
                    "shipments": "Sendungen",
                    "import_export": "Import/Export",
                    "system": "System",
                    "validation": "Validierung"
                },
                "actions": {
                    "shipment_created": "Neue Sendung erstellt",
                    "shipment_updated": "Sendung aktualisiert",
                    "shipment_deleted": "Sendung gelöscht",
                    "shipment_duplicated": "Sendung dupliziert",
                    "csv_imported": "CSV-Datei importiert",
                    "csv_exported": "CSV-Datei exportiert",
                    "template_downloaded": "Vorlage heruntergeladen",
                    "app_started": "Anwendung gestartet",
                    "theme_changed": "Theme geändert",
                    "data_cleared": "Daten gelöscht",
                    "validation_failed": "Validierung fehlgeschlagen",
                    "validation_passed": "Validierung erfolgreich",
                    "undo_performed": "Aktion rückgängig gemacht",
                    "user_created": "Nutzer erstellt",
                    "user_login": "Nutzer angemeldet",
                    "user_logout": "Nutzer abgemeldet",
                    "user_name_changed": "Name geändert"
                },
                "details": {
                    "recipient": "Empfänger",
                    "shipmentId": "Sendungs-ID",
                    "country": "Land",
                    "city": "Stadt",
                    "weight": "Gewicht",
                    "fileName": "Dateiname",
                    "totalRows": "Gesamt Zeilen",
                    "validRows": "Gültige Zeilen",
                    "invalidRows": "Fehlerhafte Zeilen",
                    "fileSize": "Dateigröße",
                    "from": "Von",
                    "to": "Nach",
                    "errors": "Fehler",
                    "warnings": "Warnungen",
                    "user": "Nutzer",
                    "loginCount": "Login-Anzahl"
                },
                "time": {
                    "justNow": "Gerade eben",
                    "minutesAgo": "vor {minutes} Minuten",
                    "hoursAgo": "vor {hours} Stunden",
                    "daysAgo": "vor {days} Tagen"
                },
                "stats": {
                    "total": "Gesamt",
                    "today": "Heute",
                    "thisWeek": "Diese Woche",
                    "categories": "Kategorien"
                },
                "confirmClear": "Möchten Sie wirklich alle Aktivitäten löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
                "cleared": "Aktivitäten wurden gelöscht",
                "exported": "Aktivitäten wurden exportiert",
                "performedBy": "Aktion durchgeführt von"
            },
            "login": {
                "welcome": "Willkommen im UPS Batch-Manager",
                "subtitle": "Bitte geben Sie Ihren Namen ein, um fortzufahren.",
                "namePlaceholder": "Ihr Name",
                "button": "Anmelden",
                "nameRequired": "Name ist erforderlich",
                "welcomeMessage": "Willkommen",
                "loginSuccess": "Erfolgreich angemeldet",
                "nameHelp": "Dieser Name wird für alle Ihre Aktivitäten verwendet.",
                "privacy": "Alle Daten werden nur lokal gespeichert"
            },
            "undo": {
                "button": "Rückgängig",
                "success": "Aktion rückgängig gemacht",
                "error": "Fehler beim Rückgängigmachen",
                "shipment": {
                    "created": "Sendung löschen (Erstellung rückgängig)",
                    "updated": "Sendung zurücksetzen (Änderung rückgängig)",
                    "deleted": "Sendung wiederherstellen",
                    "duplicated": "Duplikat entfernen"
                },
                "import": {
                    "csv": "Import rückgängig machen"
                },
                "system": {
                    "dataCleared": "Daten wiederherstellen"
                },
                "messages": {
                    "shipmentRestored": "Sendung wiederhergestellt",
                    "shipmentDeleted": "Sendung entfernt (Erstellung rückgängig)",
                    "shipmentReverted": "Sendung zurückgesetzt",
                    "duplicateRemoved": "Duplikat entfernt",
                    "importReverted": "Import rückgängig gemacht",
                    "dataRestored": "Daten wiederhergestellt"
                }
            },
            "templates": {
                "title": "Vorlagen",
                "types": {
                    "basic": "Basis-Vorlage",
                    "extended": "Erweiterte Vorlage",
                    "international": "Internationale Vorlage",
                    "examples": "Beispieldaten"
                },
                "descriptions": {
                    "basic": "Grundlegende Felder für einfache Sendungen",
                    "extended": "Erweiterte Felder für komplexe Sendungen",
                    "international": "Alle Felder für internationale Sendungen",
                    "examples": "Vorlage mit Beispieldaten zum Testen"
                },
                "buttons": {
                    "download": "Herunterladen",
                    "preview": "Vorschau"
                }
            },
            "help": {
                "title": "Hilfe",
                "sections": {
                    "overview": "Übersicht",
                    "sendungen": "Sendungen verwalten",
                    "import": "CSV-Import",
                    "export": "Batch-Export",
                    "validation": "Validierung verstehen",
                    "templates": "Vorlagen nutzen",
                    "offline": "Offline-Nutzung",
                    "troubleshooting": "Problemlösung",
                    "shortcuts": "Tastaturkürzel"
                }
            },
            "shortcuts": {
                "title": "Tastaturkürzel",
                "categories": {
                    "general": "Allgemein",
                    "navigation": "Navigation",
                    "shipments": "Sendungen",
                    "import": "Import/Export",
                    "display": "Darstellung"
                },
                "actions": {
                    "newShipment": "Neue Sendung erstellen",
                    "save": "Speichern",
                    "import": "Import öffnen",
                    "export": "Export starten",
                    "search": "Suche fokussieren",
                    "help": "Hilfe öffnen",
                    "toggleTheme": "Theme umschalten",
                    "dashboard": "Dashboard",
                    "settings": "Einstellungen",
                    "closeModal": "Dialog schließen",
                    "fullscreen": "Vollbild"
                }
            },
            "toast": {
                "titles": {
                    "success": "Erfolgreich",
                    "error": "Fehler",
                    "warning": "Warnung",
                    "info": "Information",
                    "loading": "Lädt..."
                },
                "messages": {
                    "saved": "Änderungen gespeichert",
                    "deleted": "Erfolgreich gelöscht",
                    "imported": "Import abgeschlossen",
                    "exported": "Export abgeschlossen",
                    "error": "Ein Fehler ist aufgetreten",
                    "loading": "Wird geladen..."
                }
            },
            "footer": {
                "copyright": "© 2024 UPS Batch-Manager",
                "version": "Deutsche Version",
                "offline": "Offline-fähig",
                "privacy": "Datenschutz: 100% lokal"
            },
            "common": {
                "buttons": {
                    "ok": "OK",
                    "cancel": "Abbrechen",
                    "close": "Schließen",
                    "save": "Speichern",
                    "delete": "Löschen",
                    "edit": "Bearbeiten",
                    "add": "Hinzufügen",
                    "remove": "Entfernen",
                    "select": "Auswählen",
                    "back": "Zurück",
                    "next": "Weiter",
                    "finish": "Abschließen",
                    "retry": "Wiederholen",
                    "continue": "Fortfahren"
                },
                "status": {
                    "loading": "Wird geladen...",
                    "saving": "Wird gespeichert...",
                    "success": "Erfolgreich",
                    "error": "Fehler",
                    "warning": "Warnung",
                    "info": "Information"
                },
                "units": {
                    "kg": "kg",
                    "lb": "lb",
                    "cm": "cm",
                    "in": "in"
                }
            }
        };
    }
    
    
    /**
     * Deutsche Übersetzung abrufen
     * 
     * @param {string} key - Übersetzungsschlüssel (z.B. 'nav.dashboard')
     * @param {Object} params - Parameter für Platzhalter
     * @returns {string} Übersetzter Text
     */
    t(key, params = {}) {
        const translation = this.getTranslation(key);
        return this.interpolate(translation, params);
    }
    
    /**
     * Übersetzung aus deutschen Sprachdaten abrufen
     * 
     * @param {string} key - Übersetzungsschlüssel
     * @returns {string} Übersetzung oder Schlüssel als Fallback
     */
    getTranslation(key) {
        const keys = key.split('.');
        let value = this.translations;
        
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
     * UI mit deutschen Übersetzungen aktualisieren
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
     * Service-Optionen aktualisieren (deutsche Labels)
     */
    updateServiceOptions(selectElement) {
        const serviceOptions = {
            '03': 'UPS Standard',
            '02': 'UPS Express',
            '01': 'UPS Express Plus',
            '12': 'UPS Express Saver',
            '65': 'UPS Worldwide Express Saver'
        };
        
        const options = selectElement.querySelectorAll('option');
        options.forEach(option => {
            const value = option.value;
            if (serviceOptions[value]) {
                option.textContent = serviceOptions[value];
            }
        });
    }
    
}

// Language Manager global verfügbar machen
window.LanguageManager = LanguageManager;
window.languageManager = new LanguageManager();