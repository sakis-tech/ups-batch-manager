/**
 * Undo Manager für deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet Undo-Operationen für alle Aktivitäten:
 * - Speichert vorherige Zustände im localStorage
 * - Stellt gelöschte/geänderte Sendungen wieder her
 * - Macht Import-Operationen rückgängig
 * - Unterstützt mehrfaches Undo hintereinander
 * 
 * @class UndoManager
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class UndoManager {
    /**
     * Initialisiert den Undo Manager
     * 
     * @constructor
     */
    constructor() {
        /** @type {string} Speicherschlüssel für localStorage */
        this.storageKey = 'ups_batch_undo_stack';
        
        /** @type {number} Maximale Anzahl der Undo-Operationen */
        this.maxUndoOperations = 50;
        
        /** @type {Array<Object>} Undo-Stack */
        this.undoStack = [];
        
        /** @type {Map<string, Function>} Registrierte Undo-Handler */
        this.undoHandlers = new Map();
        
        this.initialize();
    }
    
    /**
     * Initialisiert das Undo-System
     */
    initialize() {
        this.loadUndoStack();
        this.registerUndoHandlers();
        this.startPeriodicCleanup();
    }
    
    /**
     * Undo-Handler für verschiedene Aktionstypen registrieren
     */
    registerUndoHandlers() {
        // Sendungen
        this.undoHandlers.set('shipment_created', this.undoShipmentCreated.bind(this));
        this.undoHandlers.set('shipment_updated', this.undoShipmentUpdated.bind(this));
        this.undoHandlers.set('shipment_deleted', this.undoShipmentDeleted.bind(this));
        this.undoHandlers.set('shipment_duplicated', this.undoShipmentDuplicated.bind(this));
        
        // Import/Export
        this.undoHandlers.set('csv_imported', this.undoCsvImported.bind(this));
        
        // System (meist nicht rückgängig machbar)
        this.undoHandlers.set('data_cleared', this.undoDataCleared.bind(this));
    }
    
    /**
     * Undo-Operation registrieren
     * 
     * @param {string} activityId - ID der Aktivität
     * @param {string} actionType - Art der Aktion
     * @param {Object} undoData - Daten für Undo-Operation
     * @param {string} undoData.type - Undo-Typ
     * @param {Object} undoData.payload - Undo-Payload
     * @param {string} undoData.description - Beschreibung der Undo-Operation
     */
    registerUndo(activityId, actionType, undoData) {
        if (!this.isUndoable(actionType)) {
            return;
        }
        
        const undoOperation = {
            id: this.generateUndoId(),
            activityId,
            actionType,
            timestamp: new Date().toISOString(),
            undoData,
            used: false
        };
        
        // Zur Undo-Stack hinzufügen
        this.undoStack.unshift(undoOperation);
        
        // Stack-Größe begrenzen
        if (this.undoStack.length > this.maxUndoOperations) {
            this.undoStack = this.undoStack.slice(0, this.maxUndoOperations);
        }
        
        // Speichern
        this.saveUndoStack();
        
        return undoOperation;
    }
    
    /**
     * Prüft ob eine Aktion rückgängig gemacht werden kann
     * 
     * @param {string} actionType - Art der Aktion
     * @returns {boolean} true wenn rückgängig machbar
     */
    isUndoable(actionType) {
        const undoableActions = [
            'shipment_created',
            'shipment_updated', 
            'shipment_deleted',
            'shipment_duplicated',
            'csv_imported',
            'data_cleared'
        ];
        
        return undoableActions.includes(actionType);
    }
    
    /**
     * Undo-Operation ausführen
     * 
     * @param {string} activityId - ID der Aktivität
     * @returns {Promise<boolean>} true wenn erfolgreich
     */
    async performUndo(activityId) {
        const undoOperation = this.undoStack.find(op => 
            op.activityId === activityId && !op.used
        );
        
        if (!undoOperation) {
            console.warn('Undo-Operation nicht gefunden:', activityId);
            return false;
        }
        
        const handler = this.undoHandlers.get(undoOperation.actionType);
        if (!handler) {
            console.warn('Undo-Handler nicht gefunden:', undoOperation.actionType);
            return false;
        }
        
        try {
            // Undo-Operation ausführen
            const result = await handler(undoOperation.undoData);
            
            if (result) {
                // Als verwendet markieren
                undoOperation.used = true;
                this.saveUndoStack();
                
                // Success-Toast
                if (window.toastSystem) {
                    window.toastSystem.showSuccess(
                        undoOperation.undoData.description || 
                        
                        'Aktion rückgängig gemacht'
                    );
                }
                
                // Activity Logger - Undo-Aktion protokollieren
                if (window.activityLogger) {
                    window.activityLogger.log('undo_performed', {
                        description: `${undoOperation.undoData.description}`,
                        metadata: {
                            originalActionType: undoOperation.actionType,
                            originalActivityId: activityId,
                            undoType: undoOperation.undoData.type
                        }
                    });
                }
                
                // Activity UI aktualisieren
                if (window.activityUI) {
                    window.activityUI.renderInitialActivities();
                }
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Fehler beim Undo:', error);
            
            if (window.toastSystem) {
                window.toastSystem.showError(
                    
                    'Fehler beim Rückgängigmachen'
                );
            }
            
            return false;
        }
    }
    
    /**
     * Sendung-Erstellen rückgängig machen
     * 
     * @param {Object} undoData - Undo-Daten
     * @returns {boolean} Erfolgsstatus
     */
    undoShipmentCreated(undoData) {
        const { shipmentId } = undoData.payload;
        
        if (!shipmentId || !window.shipmentManager) {
            return false;
        }
        
        // Sendung löschen
        const deleted = window.shipmentManager.deleteShipment(shipmentId);
        
        if (deleted) {
            // UI aktualisieren
            this.updateUI();
            return true;
        }
        
        return false;
    }
    
    /**
     * Sendung-Aktualisierung rückgängig machen
     * 
     * @param {Object} undoData - Undo-Daten
     * @returns {boolean} Erfolgsstatus
     */
    undoShipmentUpdated(undoData) {
        const { shipmentId, previousState } = undoData.payload;
        
        if (!shipmentId || !previousState || !window.shipmentManager) {
            return false;
        }
        
        // Vorherigen Zustand wiederherstellen
        const restored = window.shipmentManager.updateShipment(shipmentId, previousState);
        
        if (restored) {
            // UI aktualisieren
            this.updateUI();
            return true;
        }
        
        return false;
    }
    
    /**
     * Sendung-Löschung rückgängig machen
     * 
     * @param {Object} undoData - Undo-Daten
     * @returns {boolean} Erfolgsstatus
     */
    undoShipmentDeleted(undoData) {
        const { shipmentData } = undoData.payload;
        
        if (!shipmentData || !window.shipmentManager) {
            return false;
        }
        
        // Sendung wiederherstellen
        const restored = window.shipmentManager.addShipment(shipmentData);
        
        if (restored) {
            // UI aktualisieren
            this.updateUI();
            return true;
        }
        
        return false;
    }
    
    /**
     * Sendung-Duplizierung rückgängig machen
     * 
     * @param {Object} undoData - Undo-Daten
     * @returns {boolean} Erfolgsstatus
     */
    undoShipmentDuplicated(undoData) {
        const { newShipmentId } = undoData.payload;
        
        if (!newShipmentId || !window.shipmentManager) {
            return false;
        }
        
        // Duplizierte Sendung löschen
        const deleted = window.shipmentManager.deleteShipment(newShipmentId);
        
        if (deleted) {
            // UI aktualisieren
            this.updateUI();
            return true;
        }
        
        return false;
    }
    
    /**
     * CSV-Import rückgängig machen
     * 
     * @param {Object} undoData - Undo-Daten
     * @returns {boolean} Erfolgsstatus
     */
    undoCsvImported(undoData) {
        const { importedShipmentIds } = undoData.payload;
        
        if (!importedShipmentIds || !window.shipmentManager) {
            return false;
        }
        
        let deletedCount = 0;
        
        // Alle importierten Sendungen löschen
        importedShipmentIds.forEach(shipmentId => {
            if (window.shipmentManager.deleteShipment(shipmentId)) {
                deletedCount++;
            }
        });
        
        if (deletedCount > 0) {
            // UI aktualisieren
            this.updateUI();
            
            // Spezifische Toast-Nachricht
            if (window.toastSystem) {
                window.toastSystem.showSuccess(
                    `${deletedCount} importierte Sendungen entfernt`
                );
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Daten-Löschung rückgängig machen
     * 
     * @param {Object} undoData - Undo-Daten
     * @returns {boolean} Erfolgsstatus
     */
    undoDataCleared(undoData) {
        const { clearedData, dataType } = undoData.payload;
        
        if (!clearedData || !window.shipmentManager) {
            return false;
        }
        
        let restoredCount = 0;
        
        // Gelöschte Daten wiederherstellen
        if (dataType === 'shipments' && Array.isArray(clearedData)) {
            clearedData.forEach(shipmentData => {
                if (window.shipmentManager.addShipment(shipmentData)) {
                    restoredCount++;
                }
            });
        }
        
        if (restoredCount > 0) {
            // UI aktualisieren
            this.updateUI();
            
            // Spezifische Toast-Nachricht
            if (window.toastSystem) {
                window.toastSystem.showSuccess(
                    `${restoredCount} Sendungen wiederhergestellt`
                );
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Prüft ob eine Aktivität rückgängig gemacht werden kann
     * 
     * @param {string} activityId - ID der Aktivität
     * @returns {boolean} true wenn Undo möglich
     */
    canUndo(activityId) {
        const undoOperation = this.undoStack.find(op => 
            op.activityId === activityId && !op.used
        );
        
        return !!undoOperation;
    }
    
    /**
     * Undo-Button HTML generieren
     * 
     * @param {string} activityId - ID der Aktivität
     * @param {string} actionType - Art der Aktion
     * @returns {string} HTML für Undo-Button
     */
    generateUndoButton(activityId, actionType) {
        if (!this.canUndo(activityId)) {
            return '';
        }
        
        const undoText = 
        
        return `
            <button class="undo-button" 
                    onclick="window.undoManager.performUndo('${activityId}')"
                    title="${undoText}">
                <i class="fas fa-undo"></i>
                ${undoText}
            </button>
        `;
    }
    
    /**
     * UI aktualisieren nach Undo-Operation
     */
    updateUI() {
        // Statistiken aktualisieren
        if (window.appDE) {
            window.appDE.updateStats();
            window.appDE.renderShipmentsTable();
        }
        
        // Activity UI aktualisieren
        if (window.activityUI) {
            window.activityUI.renderInitialActivities();
        }
    }
    
    /**
     * Undo-Stack aus localStorage laden
     */
    loadUndoStack() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.undoStack = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Fehler beim Laden des Undo-Stacks:', error);
            this.undoStack = [];
        }
    }
    
    /**
     * Undo-Stack in localStorage speichern
     */
    saveUndoStack() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.undoStack));
        } catch (error) {
            console.error('Fehler beim Speichern des Undo-Stacks:', error);
        }
    }
    
    /**
     * Alte Undo-Operationen bereinigen
     */
    cleanupOldOperations() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 Tage behalten
        
        const initialCount = this.undoStack.length;
        this.undoStack = this.undoStack.filter(operation => {
            return new Date(operation.timestamp) > cutoffDate;
        });
        
        const removedCount = initialCount - this.undoStack.length;
        if (removedCount > 0) {
            this.saveUndoStack();
            console.log(`${removedCount} alte Undo-Operationen entfernt`);
        }
    }
    
    /**
     * Periodische Bereinigung starten
     */
    startPeriodicCleanup() {
        // Alle 24 Stunden bereinigen
        setInterval(() => {
            this.cleanupOldOperations();
        }, 24 * 60 * 60 * 1000);
        
        // Einmalige Bereinigung beim Start
        this.cleanupOldOperations();
    }
    
    /**
     * Alle Undo-Operationen löschen
     */
    clearAllUndoOperations() {
        this.undoStack = [];
        this.saveUndoStack();
    }
    
    /**
     * Eindeutige Undo-ID generieren
     * 
     * @returns {string} Eindeutige ID
     */
    generateUndoId() {
        return 'undo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Undo-Stack Statistiken abrufen
     * 
     * @returns {Object} Statistiken
     */
    getUndoStats() {
        const stats = {
            total: this.undoStack.length,
            available: this.undoStack.filter(op => !op.used).length,
            used: this.undoStack.filter(op => op.used).length,
            byType: {}
        };
        
        this.undoStack.forEach(operation => {
            if (!stats.byType[operation.actionType]) {
                stats.byType[operation.actionType] = {
                    total: 0,
                    available: 0,
                    used: 0
                };
            }
            
            stats.byType[operation.actionType].total++;
            if (operation.used) {
                stats.byType[operation.actionType].used++;
            } else {
                stats.byType[operation.actionType].available++;
            }
        });
        
        return stats;
    }
    
    /**
     * Undo-Stack exportieren
     * 
     * @returns {string} JSON-String des Undo-Stacks
     */
    exportUndoStack() {
        return JSON.stringify(this.undoStack, null, 2);
    }
}

// UndoManager global verfügbar machen
window.UndoManager = UndoManager;
window.undoManager = new UndoManager();