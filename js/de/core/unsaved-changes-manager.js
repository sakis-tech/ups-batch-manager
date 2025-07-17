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
                const message = 
                    :
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
        // Sidebar-Navigation abfangen
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link, .nav-link *')) {
                if (this.hasUnsavedChanges) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const navLink = e.target.closest('.nav-link');
                    const targetSection = navLink.dataset.section;
                    
                    this.showNavigationWarning(() => {
                        // Navigation fortsetzen
                        window.appDE?.switchToSection(targetSection);
                    });
                }
            }
        });
        
        // Header-Navigation abfangen
        document.addEventListener('click', (e) => {
            if (e.target.matches('.header-nav-item, .header-nav-item *')) {
                if (this.hasUnsavedChanges) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const action = e.target.closest('.header-nav-item').dataset.action;
                    this.showNavigationWarning(() => {
                        // Aktion fortsetzen
                        this.executeHeaderAction(action);
                    });
                }
            }
        });
    }
    
    /**
     * Überwachung für Formular starten
     * 
     * @param {HTMLElement} form - Das zu überwachende Formular
     * @param {string} shipmentId - ID der Sendung (null für neue Sendung)
     */
    startMonitoring(form, shipmentId = null) {
        this.currentForm = form;
        this.currentShipmentId = shipmentId;
        this.isMonitoring = true;
        
        // Ursprüngliche Daten erfassen
        this.originalData = this.getFormData(form);
        this.currentData = { ...this.originalData };
        
        // Unsaved-Status zurücksetzen
        this.hasUnsavedChanges = false;
        
        // Visual indicator hinzufügen
        this.addMonitoringIndicator(form);
        
        // Callbacks benachrichtigen
        this.notifyCallbacks('monitoring:started', { form, shipmentId });
    }
    
    /**
     * Überwachung stoppen
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.currentForm = null;
        this.currentShipmentId = null;
        this.hasUnsavedChanges = false;
        
        // Visual indicator entfernen
        this.removeMonitoringIndicator();
        
        // Callbacks benachrichtigen
        this.notifyCallbacks('monitoring:stopped');
    }
    
    /**
     * Formular-Änderung behandeln
     * 
     * @param {Event} event - Das Input-Event
     */
    handleFormChange(event) {
        if (!this.isMonitoring || !this.currentForm) return;
        
        // Aktualisiere aktuelle Daten
        setTimeout(() => {
            this.currentData = this.getFormData(this.currentForm);
            this.checkForChanges();
        }, 50);
    }
    
    /**
     * Auf Änderungen prüfen
     */
    checkForChanges() {
        if (!this.isMonitoring || !this.currentForm) return;
        
        const hasChanges = this.hasDataChanged();
        
        if (hasChanges !== this.hasUnsavedChanges) {
            this.hasUnsavedChanges = hasChanges;
            
            // Visual indicators aktualisieren
            this.updateChangeIndicators();
            
            // Callbacks benachrichtigen
            this.notifyCallbacks('changes:detected', { hasChanges });
        }
    }
    
    /**
     * Prüft ob Daten geändert wurden
     * 
     * @returns {boolean} true wenn Änderungen vorhanden
     */
    hasDataChanged() {
        const current = this.currentData;
        const original = this.originalData;
        
        // Tiefenvergleich der Objekte
        return JSON.stringify(current) !== JSON.stringify(original);
    }
    
    /**
     * Formulardaten extrahieren
     * 
     * @param {HTMLElement} form - Das Formular
     * @returns {Object} Die Formulardaten
     */
    getFormData(form) {
        const data = {};
        
        // Alle Input-Elemente erfassen
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const name = input.name || input.id;
            if (!name) return;
            
            if (input.type === 'checkbox') {
                data[name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    data[name] = input.value;
                }
            } else {
                data[name] = input.value;
            }
        });
        
        return data;
    }
    
    /**
     * Formular-Submit behandeln
     * 
     * @param {Event} event - Das Submit-Event
     */
    handleFormSubmit(event) {
        // Nach erfolgreichem Submit sind keine Änderungen mehr ungespeichert
        setTimeout(() => {
            if (this.isMonitoring) {
                this.originalData = this.getFormData(this.currentForm);
                this.hasUnsavedChanges = false;
                this.updateChangeIndicators();
            }
        }, 100);
    }
    
    /**
     * Modal-Close behandeln
     * 
     * @param {Event} event - Das Close-Event
     */
    handleModalClose(event) {
        if (this.hasUnsavedChanges) {
            event.preventDefault();
            event.stopPropagation();
            
            this.showModalCloseWarning(() => {
                // Modal schließen
                window.modalSystem?.closeModal();
                this.stopMonitoring();
            });
        }
    }
    
    /**
     * Navigations-Warnung anzeigen
     * 
     * @param {Function} continueAction - Aktion bei Fortsetzung
     */
    showNavigationWarning(continueAction) {
        const message = 
            :
            'Du hast ungespeicherte Änderungen. Möchtest du wirklich fortfahren?';
        
        const saveText = 
            :
            'Änderungen speichern';
        
        const discardText = 
            :
            'Verwerfen';
        
        const cancelText = 
            :
            'Abbrechen';
        
        window.modalSystem?.createModal('unsavedChangesWarning', {
            title: '⚠️ Ungespeicherte Änderungen',
            content: `
                <div class="unsaved-changes-warning">
                    <div class="warning-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="warning-message">
                        <p>${message}</p>
                    </div>
                </div>
            `,
            size: 'medium',
            closable: false,
            buttons: [
                {
                    text: saveText,
                    class: 'btn-primary',
                    action: () => {
                        this.saveChangesAndContinue(continueAction);
                    }
                },
                {
                    text: discardText,
                    class: 'btn-warning',
                    action: () => {
                        this.discardChangesAndContinue(continueAction);
                    }
                },
                {
                    text: cancelText,
                    class: 'btn-ghost',
                    action: 'close'
                }
            ]
        });
        
        window.modalSystem?.showModal('unsavedChangesWarning');
    }
    
    /**
     * Modal-Close-Warnung anzeigen
     * 
     * @param {Function} continueAction - Aktion bei Fortsetzung
     */
    showModalCloseWarning(continueAction) {
        this.showNavigationWarning(continueAction);
    }
    
    /**
     * Änderungen speichern und fortfahren
     * 
     * @param {Function} continueAction - Aktion nach dem Speichern
     */
    saveChangesAndContinue(continueAction) {
        if (!this.currentForm) {
            continueAction();
            return;
        }
        
        // Speichern-Button finden und klicken
        const saveButton = this.currentForm.querySelector('.btn-primary:not(.btn-ghost)');
        if (saveButton) {
            // Event-Handler für erfolgreiches Speichern
            const handleSaveSuccess = () => {
                this.stopMonitoring();
                window.modalSystem?.closeModal();
                continueAction();
                
                // Event-Listener entfernen
                document.removeEventListener('shipmentSaved', handleSaveSuccess);
            };
            
            const handleSaveError = () => {
                window.modalSystem?.closeModal();
                // Event-Listener entfernen
                document.removeEventListener('shipmentSaveError', handleSaveError);
            };
            
            // Events anhören
            document.addEventListener('shipmentSaved', handleSaveSuccess);
            document.addEventListener('shipmentSaveError', handleSaveError);
            
            // Speichern auslösen
            saveButton.click();
        } else {
            // Fallback: Direkt fortfahren
            continueAction();
        }
    }
    
    /**
     * Änderungen verwerfen und fortfahren
     * 
     * @param {Function} continueAction - Aktion nach dem Verwerfen
     */
    discardChangesAndContinue(continueAction) {
        this.stopMonitoring();
        window.modalSystem?.closeModal();
        
        // Toast-Benachrichtigung
        if (window.toastSystem) {
            const message = 
                :
                'Änderungen verworfen';
            
            window.toastSystem.showInfo(message);
        }
        
        continueAction();
    }
    
    /**
     * Monitoring-Indikator hinzufügen
     * 
     * @param {HTMLElement} form - Das Formular
     */
    addMonitoringIndicator(form) {
        // Indikator zum Formular hinzufügen
        const indicator = document.createElement('div');
        indicator.className = 'monitoring-indicator';
        indicator.innerHTML = `
            <div class="monitoring-status">
                <i class="fas fa-eye"></i>
                <span>Änderungen werden überwacht</span>
            </div>
        `;
        
        form.insertBefore(indicator, form.firstChild);
    }
    
    /**
     * Monitoring-Indikator entfernen
     */
    removeMonitoringIndicator() {
        const indicators = document.querySelectorAll('.monitoring-indicator');
        indicators.forEach(indicator => indicator.remove());
    }
    
    /**
     * Änderungs-Indikatoren aktualisieren
     */
    updateChangeIndicators() {
        // Unsaved-Changes-Indikator
        const existingIndicator = document.querySelector('.unsaved-changes-indicator');
        
        if (this.hasUnsavedChanges) {
            if (!existingIndicator) {
                this.addUnsavedChangesIndicator();
            }
        } else {
            if (existingIndicator) {
                existingIndicator.remove();
            }
        }
        
        // Titel-Indikator
        this.updateTitleIndicator();
        
        // Form-Buttons aktualisieren
        this.updateFormButtons();
    }
    
    /**
     * Unsaved-Changes-Indikator hinzufügen
     */
    addUnsavedChangesIndicator() {
        if (!this.currentForm) return;
        
        const indicator = document.createElement('div');
        indicator.className = 'unsaved-changes-indicator';
        indicator.innerHTML = `
            <div class="unsaved-status">
                <i class="fas fa-exclamation-circle"></i>
                <span>Ungespeicherte Änderungen</span>
            </div>
        `;
        
        this.currentForm.insertBefore(indicator, this.currentForm.firstChild);
    }
    
    /**
     * Titel-Indikator aktualisieren
     */
    updateTitleIndicator() {
        const modalTitle = document.querySelector('.modal-title');
        if (modalTitle) {
            const originalTitle = modalTitle.textContent.replace(' *', '');
            modalTitle.textContent = this.hasUnsavedChanges ? 
                `${originalTitle} *` : originalTitle;
        }
    }
    
    /**
     * Form-Buttons aktualisieren
     */
    updateFormButtons() {
        if (!this.currentForm) return;
        
        const saveButton = this.currentForm.querySelector('.btn-primary:not(.btn-ghost)');
        if (saveButton) {
            saveButton.disabled = !this.hasUnsavedChanges;
            
            if (this.hasUnsavedChanges) {
                saveButton.classList.add('unsaved-changes');
            } else {
                saveButton.classList.remove('unsaved-changes');
            }
        }
    }
    
    /**
     * Header-Aktion ausführen
     * 
     * @param {string} action - Die auszuführende Aktion
     */
    executeHeaderAction(action) {
        switch (action) {
            case 'dashboard':
                window.appDE?.switchToSection('dashboard');
                break;
            case 'import':
                window.appDE?.switchToSection('import');
                break;
            case 'export':
                window.appDE?.switchToSection('export');
                break;
            default:
                console.warn('Unbekannte Header-Aktion:', action);
        }
    }
    
    /**
     * Callback für Änderungen registrieren
     * 
     * @param {Function} callback - Callback-Funktion
     */
    onChange(callback) {
        this.changeCallbacks.add(callback);
    }
    
    /**
     * Callback für Änderungen entfernen
     * 
     * @param {Function} callback - Callback-Funktion
     */
    offChange(callback) {
        this.changeCallbacks.delete(callback);
    }
    
    /**
     * Alle Callbacks benachrichtigen
     * 
     * @param {string} event - Event-Name
     * @param {Object} data - Event-Daten
     */
    notifyCallbacks(event, data = {}) {
        this.changeCallbacks.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('Fehler in Unsaved-Changes-Callback:', error);
            }
        });
    }
    
    /**
     * Aktueller Status abrufen
     * 
     * @returns {Object} Status-Informationen
     */
    getStatus() {
        return {
            hasUnsavedChanges: this.hasUnsavedChanges,
            isMonitoring: this.isMonitoring,
            currentShipmentId: this.currentShipmentId,
            formData: this.currentData
        };
    }
    
    /**
     * Überwachung forciert stoppen (für Debugging)
     */
    forceStop() {
        this.hasUnsavedChanges = false;
        this.stopMonitoring();
        
        if (window.toastSystem) {
            window.toastSystem.showInfo('Überwachung gestoppt');
        }
    }
}

// Unsaved Changes Manager global verfügbar machen
window.UnsavedChangesManager = UnsavedChangesManager;
window.unsavedChangesManager = new UnsavedChangesManager();