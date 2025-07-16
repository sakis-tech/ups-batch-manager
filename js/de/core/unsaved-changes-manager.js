/**
 * Unsaved Changes Manager für UPS Batch Manager
 * 
 * Überwacht ungespeicherte Änderungen und warnt vor Datenverlust:
 * - Formular-Änderungen verfolgen
 * - Seite verlassen / Tab schließen
 * - Navigation zwischen Bereichen
 * - Benutzerfreundliche Warndialoge
 * 
 * @class UnsavedChangesManager
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class UnsavedChangesManager {
    /**
     * Initialisiert den Unsaved Changes Manager
     * 
     * @constructor
     */
    constructor() {
        /** @type {boolean} Ob es ungespeicherte Änderungen gibt */
        this.hasUnsavedChanges = false;
        
        /** @type {Object} Ursprüngliche Formulardaten */
        this.originalData = {};
        
        /** @type {Object} Aktuelle Formulardaten */
        this.currentData = {};
        
        /** @type {string} Aktuell bearbeitete Sendungs-ID */
        this.currentShipmentId = null;
        
        /** @type {HTMLElement} Aktuell überwachtes Formular */
        this.currentForm = null;
        
        /** @type {Function} Callback für Navigation */
        this.pendingNavigation = null;
        
        /** @type {Set} Registrierte Callbacks */
        this.changeCallbacks = new Set();
        
        /** @type {boolean} Ob Überwachung aktiv ist */
        this.isMonitoring = false;
        
        this.initialize();
    }
    
    /**
     * Initialisiert das System
     */
    initialize() {
        this.setupEventListeners();
        this.setupBeforeUnloadHandler();
        this.setupNavigationInterception();
    }
    
    /**
     * Event-Listener einrichten
     */
    setupEventListeners() {
        // Formular-Änderungen überwachen
        document.addEventListener('input', (e) => {
            if (this.isMonitoring && this.currentForm && this.currentForm.contains(e.target)) {
                this.handleFormChange(e);
            }
        });
        
        // Checkbox/Radio-Änderungen
        document.addEventListener('change', (e) => {
            if (this.isMonitoring && this.currentForm && this.currentForm.contains(e.target)) {
                this.handleFormChange(e);
            }
        });
        
        // Tastatur-Eingaben
        document.addEventListener('keydown', (e) => {
            if (this.isMonitoring && this.currentForm && this.currentForm.contains(e.target)) {
                // Verzögerung für Tastatureingaben
                setTimeout(() => this.checkForChanges(), 100);
            }
        });
        
        // Form-Submit abfangen
        document.addEventListener('submit', (e) => {
            if (this.currentForm && this.currentForm.contains(e.target)) {
                this.handleFormSubmit(e);
            }
        });
        
        // Modal-Close Events
        document.addEventListener('click', (e) => {
            if (e.target.matches('.modal-close, .modal-backdrop')) {
                this.handleModalClose(e);
            }
        });
    }
    
    /**
     * BeforeUnload Handler einrichten
     */
    setupBeforeUnloadHandler() {
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                const message = window.languageManager ? 
                    window.languageManager.t('forms.unsavedChanges.beforeUnload') :
                    'Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?';
                
                e.preventDefault();
                e.returnValue = message;
                return message;
            }
        });
    }
    
    /**
     * Navigation zwischen Bereichen abfangen
     */
    setupNavigationInterception() {
        // Sidebar-Navigation abfangen\n        document.addEventListener('click', (e) => {\n            if (e.target.matches('.nav-link, .nav-link *')) {\n                if (this.hasUnsavedChanges) {\n                    e.preventDefault();\n                    e.stopPropagation();\n                    \n                    const navLink = e.target.closest('.nav-link');\n                    const targetSection = navLink.dataset.section;\n                    \n                    this.showNavigationWarning(() => {\n                        // Navigation fortsetzen\n                        window.appDE?.switchToSection(targetSection);\n                    });\n                }\n            }\n        });\n        \n        // Header-Navigation abfangen\n        document.addEventListener('click', (e) => {\n            if (e.target.matches('.header-nav-item, .header-nav-item *')) {\n                if (this.hasUnsavedChanges) {\n                    e.preventDefault();\n                    e.stopPropagation();\n                    \n                    const action = e.target.closest('.header-nav-item').dataset.action;\n                    this.showNavigationWarning(() => {\n                        // Aktion fortsetzen\n                        this.executeHeaderAction(action);\n                    });\n                }\n            }\n        });\n    }\n    \n    /**\n     * Überwachung für Formular starten\n     * \n     * @param {HTMLElement} form - Das zu überwachende Formular\n     * @param {string} shipmentId - ID der Sendung (null für neue Sendung)\n     */\n    startMonitoring(form, shipmentId = null) {\n        this.currentForm = form;\n        this.currentShipmentId = shipmentId;\n        this.isMonitoring = true;\n        \n        // Ursprüngliche Daten erfassen\n        this.originalData = this.getFormData(form);\n        this.currentData = { ...this.originalData };\n        \n        // Unsaved-Status zurücksetzen\n        this.hasUnsavedChanges = false;\n        \n        // Visual indicator hinzufügen\n        this.addMonitoringIndicator(form);\n        \n        // Callbacks benachrichtigen\n        this.notifyCallbacks('monitoring:started', { form, shipmentId });\n    }\n    \n    /**\n     * Überwachung stoppen\n     */\n    stopMonitoring() {\n        this.isMonitoring = false;\n        this.currentForm = null;\n        this.currentShipmentId = null;\n        this.hasUnsavedChanges = false;\n        \n        // Visual indicator entfernen\n        this.removeMonitoringIndicator();\n        \n        // Callbacks benachrichtigen\n        this.notifyCallbacks('monitoring:stopped');\n    }\n    \n    /**\n     * Formular-Änderung behandeln\n     * \n     * @param {Event} event - Das Input-Event\n     */\n    handleFormChange(event) {\n        if (!this.isMonitoring || !this.currentForm) return;\n        \n        // Aktualisiere aktuelle Daten\n        setTimeout(() => {\n            this.currentData = this.getFormData(this.currentForm);\n            this.checkForChanges();\n        }, 50);\n    }\n    \n    /**\n     * Auf Änderungen prüfen\n     */\n    checkForChanges() {\n        if (!this.isMonitoring || !this.currentForm) return;\n        \n        const hasChanges = this.hasDataChanged();\n        \n        if (hasChanges !== this.hasUnsavedChanges) {\n            this.hasUnsavedChanges = hasChanges;\n            \n            // Visual indicators aktualisieren\n            this.updateChangeIndicators();\n            \n            // Callbacks benachrichtigen\n            this.notifyCallbacks('changes:detected', { hasChanges });\n        }\n    }\n    \n    /**\n     * Prüft ob Daten geändert wurden\n     * \n     * @returns {boolean} true wenn Änderungen vorhanden\n     */\n    hasDataChanged() {\n        const current = this.currentData;\n        const original = this.originalData;\n        \n        // Tiefenvergleich der Objekte\n        return JSON.stringify(current) !== JSON.stringify(original);\n    }\n    \n    /**\n     * Formulardaten extrahieren\n     * \n     * @param {HTMLElement} form - Das Formular\n     * @returns {Object} Die Formulardaten\n     */\n    getFormData(form) {\n        const data = {};\n        \n        // Alle Input-Elemente erfassen\n        const inputs = form.querySelectorAll('input, select, textarea');\n        \n        inputs.forEach(input => {\n            const name = input.name || input.id;\n            if (!name) return;\n            \n            if (input.type === 'checkbox') {\n                data[name] = input.checked;\n            } else if (input.type === 'radio') {\n                if (input.checked) {\n                    data[name] = input.value;\n                }\n            } else {\n                data[name] = input.value;\n            }\n        });\n        \n        return data;\n    }\n    \n    /**\n     * Formular-Submit behandeln\n     * \n     * @param {Event} event - Das Submit-Event\n     */\n    handleFormSubmit(event) {\n        // Nach erfolgreichem Submit sind keine Änderungen mehr ungespeichert\n        setTimeout(() => {\n            if (this.isMonitoring) {\n                this.originalData = this.getFormData(this.currentForm);\n                this.hasUnsavedChanges = false;\n                this.updateChangeIndicators();\n            }\n        }, 100);\n    }\n    \n    /**\n     * Modal-Close behandeln\n     * \n     * @param {Event} event - Das Close-Event\n     */\n    handleModalClose(event) {\n        if (this.hasUnsavedChanges) {\n            event.preventDefault();\n            event.stopPropagation();\n            \n            this.showModalCloseWarning(() => {\n                // Modal schließen\n                window.modalSystem?.closeModal();\n                this.stopMonitoring();\n            });\n        }\n    }\n    \n    /**\n     * Navigations-Warnung anzeigen\n     * \n     * @param {Function} continueAction - Aktion bei Fortsetzung\n     */\n    showNavigationWarning(continueAction) {\n        const message = window.languageManager ?\n            window.languageManager.t('forms.unsavedChanges.navigationWarning') :\n            'Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?';\n        \n        const saveText = window.languageManager ?\n            window.languageManager.t('forms.unsavedChanges.saveAndContinue') :\n            'Änderungen speichern';\n        \n        const discardText = window.languageManager ?\n            window.languageManager.t('forms.unsavedChanges.discardChanges') :\n            'Verwerfen';\n        \n        const cancelText = window.languageManager ?\n            window.languageManager.t('common.buttons.cancel') :\n            'Abbrechen';\n        \n        window.modalSystem?.createModal('unsavedChangesWarning', {\n            title: '⚠️ Ungespeicherte Änderungen',\n            content: `\n                <div class=\"unsaved-changes-warning\">\n                    <div class=\"warning-icon\">\n                        <i class=\"fas fa-exclamation-triangle\"></i>\n                    </div>\n                    <div class=\"warning-message\">\n                        <p>${message}</p>\n                    </div>\n                </div>\n            `,\n            size: 'medium',\n            closable: false,\n            buttons: [\n                {\n                    text: saveText,\n                    class: 'btn-primary',\n                    action: () => {\n                        this.saveChangesAndContinue(continueAction);\n                    }\n                },\n                {\n                    text: discardText,\n                    class: 'btn-warning',\n                    action: () => {\n                        this.discardChangesAndContinue(continueAction);\n                    }\n                },\n                {\n                    text: cancelText,\n                    class: 'btn-ghost',\n                    action: 'close'\n                }\n            ]\n        });\n        \n        window.modalSystem?.showModal('unsavedChangesWarning');\n    }\n    \n    /**\n     * Modal-Close-Warnung anzeigen\n     * \n     * @param {Function} continueAction - Aktion bei Fortsetzung\n     */\n    showModalCloseWarning(continueAction) {\n        this.showNavigationWarning(continueAction);\n    }\n    \n    /**\n     * Änderungen speichern und fortfahren\n     * \n     * @param {Function} continueAction - Aktion nach dem Speichern\n     */\n    saveChangesAndContinue(continueAction) {\n        if (!this.currentForm) {\n            continueAction();\n            return;\n        }\n        \n        // Speichern-Button finden und klicken\n        const saveButton = this.currentForm.querySelector('.btn-primary:not(.btn-ghost)');\n        if (saveButton) {\n            // Event-Handler für erfolgreiches Speichern\n            const handleSaveSuccess = () => {\n                this.stopMonitoring();\n                window.modalSystem?.closeModal();\n                continueAction();\n                \n                // Event-Listener entfernen\n                document.removeEventListener('shipmentSaved', handleSaveSuccess);\n            };\n            \n            const handleSaveError = () => {\n                window.modalSystem?.closeModal();\n                // Event-Listener entfernen\n                document.removeEventListener('shipmentSaveError', handleSaveError);\n            };\n            \n            // Events anhören\n            document.addEventListener('shipmentSaved', handleSaveSuccess);\n            document.addEventListener('shipmentSaveError', handleSaveError);\n            \n            // Speichern auslösen\n            saveButton.click();\n        } else {\n            // Fallback: Direkt fortfahren\n            continueAction();\n        }\n    }\n    \n    /**\n     * Änderungen verwerfen und fortfahren\n     * \n     * @param {Function} continueAction - Aktion nach dem Verwerfen\n     */\n    discardChangesAndContinue(continueAction) {\n        this.stopMonitoring();\n        window.modalSystem?.closeModal();\n        \n        // Toast-Benachrichtigung\n        if (window.toastSystem) {\n            const message = window.languageManager ?\n                window.languageManager.t('forms.unsavedChanges.discarded') :\n                'Änderungen verworfen';\n            \n            window.toastSystem.showInfo(message);\n        }\n        \n        continueAction();\n    }\n    \n    /**\n     * Monitoring-Indikator hinzufügen\n     * \n     * @param {HTMLElement} form - Das Formular\n     */\n    addMonitoringIndicator(form) {\n        // Indikator zum Formular hinzufügen\n        const indicator = document.createElement('div');\n        indicator.className = 'monitoring-indicator';\n        indicator.innerHTML = `\n            <div class=\"monitoring-status\">\n                <i class=\"fas fa-eye\"></i>\n                <span>Änderungen werden überwacht</span>\n            </div>\n        `;\n        \n        form.insertBefore(indicator, form.firstChild);\n    }\n    \n    /**\n     * Monitoring-Indikator entfernen\n     */\n    removeMonitoringIndicator() {\n        const indicators = document.querySelectorAll('.monitoring-indicator');\n        indicators.forEach(indicator => indicator.remove());\n    }\n    \n    /**\n     * Änderungs-Indikatoren aktualisieren\n     */\n    updateChangeIndicators() {\n        // Unsaved-Changes-Indikator\n        const existingIndicator = document.querySelector('.unsaved-changes-indicator');\n        \n        if (this.hasUnsavedChanges) {\n            if (!existingIndicator) {\n                this.addUnsavedChangesIndicator();\n            }\n        } else {\n            if (existingIndicator) {\n                existingIndicator.remove();\n            }\n        }\n        \n        // Titel-Indikator\n        this.updateTitleIndicator();\n        \n        // Form-Buttons aktualisieren\n        this.updateFormButtons();\n    }\n    \n    /**\n     * Unsaved-Changes-Indikator hinzufügen\n     */\n    addUnsavedChangesIndicator() {\n        if (!this.currentForm) return;\n        \n        const indicator = document.createElement('div');\n        indicator.className = 'unsaved-changes-indicator';\n        indicator.innerHTML = `\n            <div class=\"unsaved-status\">\n                <i class=\"fas fa-exclamation-circle\"></i>\n                <span>Ungespeicherte Änderungen</span>\n            </div>\n        `;\n        \n        this.currentForm.insertBefore(indicator, this.currentForm.firstChild);\n    }\n    \n    /**\n     * Titel-Indikator aktualisieren\n     */\n    updateTitleIndicator() {\n        const modalTitle = document.querySelector('.modal-title');\n        if (modalTitle) {\n            const originalTitle = modalTitle.textContent.replace(' *', '');\n            modalTitle.textContent = this.hasUnsavedChanges ? \n                `${originalTitle} *` : originalTitle;\n        }\n    }\n    \n    /**\n     * Form-Buttons aktualisieren\n     */\n    updateFormButtons() {\n        if (!this.currentForm) return;\n        \n        const saveButton = this.currentForm.querySelector('.btn-primary:not(.btn-ghost)');\n        if (saveButton) {\n            saveButton.disabled = !this.hasUnsavedChanges;\n            \n            if (this.hasUnsavedChanges) {\n                saveButton.classList.add('unsaved-changes');\n            } else {\n                saveButton.classList.remove('unsaved-changes');\n            }\n        }\n    }\n    \n    /**\n     * Header-Aktion ausführen\n     * \n     * @param {string} action - Die auszuführende Aktion\n     */\n    executeHeaderAction(action) {\n        switch (action) {\n            case 'dashboard':\n                window.appDE?.switchToSection('dashboard');\n                break;\n            case 'import':\n                window.appDE?.switchToSection('import');\n                break;\n            case 'export':\n                window.appDE?.switchToSection('export');\n                break;\n            default:\n                console.warn('Unbekannte Header-Aktion:', action);\n        }\n    }\n    \n    /**\n     * Callback für Änderungen registrieren\n     * \n     * @param {Function} callback - Callback-Funktion\n     */\n    onChange(callback) {\n        this.changeCallbacks.add(callback);\n    }\n    \n    /**\n     * Callback für Änderungen entfernen\n     * \n     * @param {Function} callback - Callback-Funktion\n     */\n    offChange(callback) {\n        this.changeCallbacks.delete(callback);\n    }\n    \n    /**\n     * Alle Callbacks benachrichtigen\n     * \n     * @param {string} event - Event-Name\n     * @param {Object} data - Event-Daten\n     */\n    notifyCallbacks(event, data = {}) {\n        this.changeCallbacks.forEach(callback => {\n            try {\n                callback(event, data);\n            } catch (error) {\n                console.error('Fehler in Unsaved-Changes-Callback:', error);\n            }\n        });\n    }\n    \n    /**\n     * Aktueller Status abrufen\n     * \n     * @returns {Object} Status-Informationen\n     */\n    getStatus() {\n        return {\n            hasUnsavedChanges: this.hasUnsavedChanges,\n            isMonitoring: this.isMonitoring,\n            currentShipmentId: this.currentShipmentId,\n            formData: this.currentData\n        };\n    }\n    \n    /**\n     * Überwachung forciert stoppen (für Debugging)\n     */\n    forceStop() {\n        this.hasUnsavedChanges = false;\n        this.stopMonitoring();\n        \n        if (window.toastSystem) {\n            window.toastSystem.showInfo('Überwachung gestoppt');\n        }\n    }\n}\n\n// Unsaved Changes Manager global verfügbar machen\nwindow.UnsavedChangesManager = UnsavedChangesManager;\nwindow.unsavedChangesManager = new UnsavedChangesManager();"