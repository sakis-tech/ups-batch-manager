/**
 * Aktivitäten-Log System für deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet detaillierte Aktivitätsprotokolle mit Features wie:
 * - Automatische Speicherung aller Benutzeraktionen
 * - Detaillierte Metadaten (Zeitstempel, Aktionstyp, Details)
 * - localStorage-basierte Persistierung
 * - Automatische Bereinigung alter Einträge
 * - Mehrsprachige Unterstützung
 * 
 * @class ActivityLogger
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class ActivityLogger {
    /**
     * Initialisiert das Aktivitäten-Log System
     * 
     * @constructor
     */
    constructor() {
        /** @type {string} Speicherschlüssel für localStorage */
        this.storageKey = 'ups_batch_activity_log';
        
        /** @type {number} Maximale Anzahl der Einträge */
        this.maxEntries = 50;
        
        /** @type {Array<Object>} Zwischenspeicher für Aktivitäten */
        this.activities = [];
        
        /** @type {Map<string, Object>} Aktivitätstypen und deren Konfiguration */
        this.activityTypes = new Map();
        
        /** @type {Function|null} Callback für UI-Updates */
        this.onActivityAdded = null;
        
        this.initialize();
    }
    
    /**
     * Initialisiert das System und lädt gespeicherte Aktivitäten
     */
    initialize() {
        this.loadActivities();
        this.registerActivityTypes();
        this.startPeriodicCleanup();
    }
    
    /**
     * Registriert verfügbare Aktivitätstypen
     */
    registerActivityTypes() {
        // Sendungen
        this.activityTypes.set('shipment_created', {
            icon: 'fas fa-plus-circle',
            color: 'success',
            category: 'shipments',
            template: 'shipment_action'
        });
        
        this.activityTypes.set('shipment_updated', {
            icon: 'fas fa-edit',
            color: 'info',
            category: 'shipments',
            template: 'shipment_action'
        });
        
        this.activityTypes.set('shipment_deleted', {
            icon: 'fas fa-trash',
            color: 'danger',
            category: 'shipments',
            template: 'shipment_action'
        });
        
        this.activityTypes.set('shipment_duplicated', {
            icon: 'fas fa-copy',
            color: 'info',
            category: 'shipments',
            template: 'shipment_action'
        });
        
        // Import/Export
        this.activityTypes.set('csv_imported', {
            icon: 'fas fa-file-import',
            color: 'success',
            category: 'import_export',
            template: 'file_action'
        });
        
        this.activityTypes.set('csv_export', {
            icon: 'fas fa-file-export',
            color: 'success',
            category: 'import_export',
            template: 'file_action'
        });
        
        this.activityTypes.set('template_downloaded', {
            icon: 'fas fa-download',
            color: 'info',
            category: 'import_export',
            template: 'file_action'
        });
        
        // System
        this.activityTypes.set('app_started', {
            icon: 'fas fa-power-off',
            color: 'info',
            category: 'system',
            template: 'simple_action'
        });
        
        // language_changed activity type removed - German only
        
        this.activityTypes.set('theme_changed', {
            icon: 'fas fa-paint-brush',
            color: 'info',
            category: 'system',
            template: 'theme_action'
        });
        
        this.activityTypes.set('data_cleared', {
            icon: 'fas fa-trash-alt',
            color: 'warning',
            category: 'system',
            template: 'simple_action'
        });
        
        // Validierung
        this.activityTypes.set('validation_failed', {
            icon: 'fas fa-exclamation-triangle',
            color: 'warning',
            category: 'validation',
            template: 'validation_action'
        });
        
        this.activityTypes.set('validation_passed', {
            icon: 'fas fa-check-circle',
            color: 'success',
            category: 'validation',
            template: 'validation_action'
        });
        
        // Undo
        this.activityTypes.set('undo_performed', {
            icon: 'fas fa-undo',
            color: 'warning',
            category: 'system',
            template: 'simple_action'
        });
        
        // User
        this.activityTypes.set('user_created', {
            icon: 'fas fa-user-plus',
            color: 'success',
            category: 'system',
            template: 'user_action'
        });
        
        this.activityTypes.set('user_login', {
            icon: 'fas fa-sign-in-alt',
            color: 'info',
            category: 'system',
            template: 'user_action'
        });
        
        this.activityTypes.set('user_logout', {
            icon: 'fas fa-sign-out-alt',
            color: 'info',
            category: 'system',
            template: 'user_action'
        });
        
        this.activityTypes.set('user_name_changed', {
            icon: 'fas fa-user-edit',
            color: 'info',
            category: 'system',
            template: 'user_name_action'
        });
    }
    
    /**
     * Neue Aktivität protokollieren
     * 
     * @param {string} type - Aktivitätstyp
     * @param {Object} details - Details der Aktivität
     * @param {string} details.description - Beschreibung der Aktivität
     * @param {Object} details.metadata - Zusätzliche Metadaten
     * @returns {Object} Die erstellte Aktivität
     */
    log(type, details = {}) {
        const activity = {
            id: this.generateActivityId(),
            type,
            timestamp: new Date().toISOString(),
            description: details.description || '',
            metadata: details.metadata || {},
            userId: window.userManager?.getUserId() || 'local_user',
            userName: window.userManager?.getUserName() || 'Unbekannt',
            sessionId: this.getSessionId()
        };
        
        // Aktivität zur Liste hinzufügen
        this.activities.unshift(activity);
        
        // Speicher bereinigen wenn nötig
        if (this.activities.length > this.maxEntries) {
            this.activities = this.activities.slice(0, this.maxEntries);
        }
        
        // Speichern
        this.saveActivities();
        
        // UI-Update callback
        if (this.onActivityAdded) {
            this.onActivityAdded(activity);
        }
        
        return activity;
    }
    
    /**
     * Aktivität für neue Sendung
     * 
     * @param {Object} shipment - Sendungsdaten
     */
    logShipmentCreated(shipment) {
        const activity = this.log('shipment_created', {
            description: this.getLocalizedText('activities.shipment_created'),
            metadata: {
                shipmentId: shipment.id,
                recipientName: shipment.companyName || shipment.contactName,
                country: shipment.country,
                city: shipment.city,
                serviceType: shipment.serviceType,
                weight: shipment.weight,
                unitOfMeasure: shipment.unitOfMeasure
            }
        });
        
        // Undo-Operation registrieren
        if (window.undoManager) {
            window.undoManager.registerUndo(activity.id, 'shipment_created', {
                type: 'shipment_created',
                description: window.languageManager?.t('undo.messages.shipmentDeleted') || 'Sendung entfernt (Erstellung rückgängig)',
                payload: {
                    shipmentId: shipment.id
                }
            });
        }
        
        return activity;
    }
    
    /**
     * Aktivität für aktualisierte Sendung
     * 
     * @param {Object} shipment - Sendungsdaten
     * @param {Array<string>} changedFields - Geänderte Felder
     */
    logShipmentUpdated(shipment, changedFields = [], previousState = null) {
        const activity = this.log('shipment_updated', {
            description: this.getLocalizedText('activities.shipment_updated'),
            metadata: {
                shipmentId: shipment.id,
                recipientName: shipment.companyName || shipment.contactName,
                changedFields,
                country: shipment.country,
                city: shipment.city
            }
        });
        
        // Undo-Operation registrieren (nur wenn previousState verfügbar)
        if (window.undoManager && previousState) {
            window.undoManager.registerUndo(activity.id, 'shipment_updated', {
                type: 'shipment_updated',
                description: window.languageManager?.t('undo.messages.shipmentReverted') || 'Sendung zurückgesetzt',
                payload: {
                    shipmentId: shipment.id,
                    previousState: previousState
                }
            });
        }
        
        return activity;
    }
    
    /**
     * Aktivität für gelöschte Sendung
     * 
     * @param {Object} shipment - Sendungsdaten
     */
    logShipmentDeleted(shipment) {
        const activity = this.log('shipment_deleted', {
            description: this.getLocalizedText('activities.shipment_deleted'),
            metadata: {
                shipmentId: shipment.id,
                recipientName: shipment.companyName || shipment.contactName,
                country: shipment.country,
                city: shipment.city
            }
        });
        
        // Undo-Operation registrieren
        if (window.undoManager) {
            window.undoManager.registerUndo(activity.id, 'shipment_deleted', {
                type: 'shipment_deleted',
                description: window.languageManager?.t('undo.messages.shipmentRestored') || 'Sendung wiederhergestellt',
                payload: {
                    shipmentData: { ...shipment } // Vollständige Sendungsdaten für Wiederherstellung
                }
            });
        }
        
        return activity;
    }
    
    /**
     * Aktivität für duplizierten Sendung
     * 
     * @param {Object} originalShipment - Original Sendung
     * @param {Object} newShipment - Neue Sendung
     */
    logShipmentDuplicated(originalShipment, newShipment) {
        const activity = this.log('shipment_duplicated', {
            description: this.getLocalizedText('activities.shipment_duplicated'),
            metadata: {
                originalShipmentId: originalShipment.id,
                newShipmentId: newShipment.id,
                recipientName: newShipment.companyName || newShipment.contactName,
                country: newShipment.country
            }
        });
        
        // Undo-Operation registrieren
        if (window.undoManager) {
            window.undoManager.registerUndo(activity.id, 'shipment_duplicated', {
                type: 'shipment_duplicated',
                description: window.languageManager?.t('undo.messages.duplicateRemoved') || 'Duplikat entfernt',
                payload: {
                    newShipmentId: newShipment.id
                }
            });
        }
        
        return activity;
    }
    
    /**
     * Aktivität für CSV-Import
     * 
     * @param {Object} importResult - Import-Ergebnis
     */
    logCsvImported(importResult) {
        const activity = this.log('csv_imported', {
            description: this.getLocalizedText('activities.csv_imported'),
            metadata: {
                fileName: importResult.fileName,
                totalRows: importResult.totalRows,
                validRows: importResult.validRows,
                invalidRows: importResult.invalidRows,
                fileSize: importResult.fileSize,
                importDuration: importResult.duration
            }
        });
        
        // Undo-Operation registrieren (falls importierte Sendungs-IDs verfügbar)
        if (window.undoManager && importResult.importedShipmentIds) {
            window.undoManager.registerUndo(activity.id, 'csv_imported', {
                type: 'csv_imported',
                description: window.languageManager?.t('undo.messages.importReverted') || 'Import rückgängig gemacht',
                payload: {
                    importedShipmentIds: importResult.importedShipmentIds
                }
            });
        }
        
        return activity;
    }
    
    /**
     * Aktivität für CSV-Export
     * 
     * @param {Object} exportResult - Export-Ergebnis
     */
    logCsvExported(exportResult) {
        return this.log('csv_export', {
            description: this.getLocalizedText('activities.csv_exported'),
            metadata: {
                fileName: exportResult.fileName,
                format: exportResult.format,
                totalShipments: exportResult.totalShipments,
                exportedShipments: exportResult.exportedShipments,
                fileSize: exportResult.fileSize
            }
        });
    }
    
    /**
     * Aktivität für Vorlagen-Download
     * 
     * @param {string} templateType - Vorlagentyp
     * @param {string} fileName - Dateiname
     */
    logTemplateDownloaded(templateType, fileName) {
        return this.log('template_downloaded', {
            description: this.getLocalizedText('activities.template_downloaded'),
            metadata: {
                templateType,
                fileName,
                downloadTime: new Date().toISOString()
            }
        });
    }
    
    /**
     * Aktivität für Sprachenwechsel
     * 
     * @param {string} fromLang - Vorherige Sprache
     * @param {string} toLang - Neue Sprache
     */
    // logLanguageChanged() removed - German only
    
    /**
     * Aktivität für Theme-Wechsel
     * 
     * @param {string} fromTheme - Vorheriges Theme
     * @param {string} toTheme - Neues Theme
     */
    logThemeChanged(fromTheme, toTheme) {
        return this.log('theme_changed', {
            description: this.getLocalizedText('activities.theme_changed'),
            metadata: {
                fromTheme,
                toTheme
            }
        });
    }
    
    /**
     * Aktivität für App-Start
     */
    logAppStarted() {
        return this.log('app_started', {
            description: this.getLocalizedText('activities.app_started'),
            metadata: {
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                language: navigator.language
            }
        });
    }
    
    /**
     * Aktivität für Datenlöschung
     * 
     * @param {string} dataType - Art der gelöschten Daten
     * @param {number} itemCount - Anzahl gelöschter Einträge
     */
    logDataCleared(dataType, itemCount) {
        return this.log('data_cleared', {
            description: this.getLocalizedText('activities.data_cleared'),
            metadata: {
                dataType,
                itemCount,
                clearedAt: new Date().toISOString()
            }
        });
    }
    
    /**
     * Aktivität für Validierungsfehler
     * 
     * @param {Object} validationResult - Validierungsergebnis
     */
    logValidationFailed(validationResult) {
        return this.log('validation_failed', {
            description: this.getLocalizedText('activities.validation_failed'),
            metadata: {
                errors: validationResult.errors,
                warnings: validationResult.warnings,
                fieldCount: validationResult.fieldCount,
                shipmentId: validationResult.shipmentId
            }
        });
    }
    
    /**
     * Alle Aktivitäten abrufen
     * 
     * @param {number} limit - Maximale Anzahl der Einträge
     * @param {string} category - Kategorie-Filter
     * @returns {Array<Object>} Aktivitätsliste
     */
    getActivities(limit = 10, category = null) {
        let activities = [...this.activities];
        
        if (category) {
            activities = activities.filter(activity => {
                const type = this.activityTypes.get(activity.type);
                return type && type.category === category;
            });
        }
        
        return activities.slice(0, limit);
    }
    
    /**
     * Aktivitäten nach Datum abrufen
     * 
     * @param {Date} startDate - Startdatum
     * @param {Date} endDate - Enddatum
     * @returns {Array<Object>} Gefilterte Aktivitätsliste
     */
    getActivitiesByDate(startDate, endDate) {
        return this.activities.filter(activity => {
            const activityDate = new Date(activity.timestamp);
            return activityDate >= startDate && activityDate <= endDate;
        });
    }
    
    /**
     * Aktivitäten-Statistiken abrufen
     * 
     * @returns {Object} Statistiken
     */
    getActivityStats() {
        const stats = {
            total: this.activities.length,
            today: 0,
            thisWeek: 0,
            categories: {}
        };
        
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        this.activities.forEach(activity => {
            const activityDate = new Date(activity.timestamp);
            
            if (activityDate >= startOfToday) {
                stats.today++;
            }
            
            if (activityDate >= startOfWeek) {
                stats.thisWeek++;
            }
            
            const type = this.activityTypes.get(activity.type);
            if (type) {
                if (!stats.categories[type.category]) {
                    stats.categories[type.category] = 0;
                }
                stats.categories[type.category]++;
            }
        });
        
        return stats;
    }
    
    /**
     * Aktivitäten aus localStorage laden
     */
    loadActivities() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                this.activities = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Fehler beim Laden der Aktivitäten:', error);
            this.activities = [];
        }
    }
    
    /**
     * Aktivitäten in localStorage speichern
     */
    saveActivities() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.activities));
        } catch (error) {
            console.error('Fehler beim Speichern der Aktivitäten:', error);
        }
    }
    
    /**
     * Alte Aktivitäten bereinigen
     */
    cleanupOldActivities() {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 Tage behalten
        
        const initialCount = this.activities.length;
        this.activities = this.activities.filter(activity => {
            return new Date(activity.timestamp) > cutoffDate;
        });
        
        // Zusätzlich auf maxEntries begrenzen
        if (this.activities.length > this.maxEntries) {
            this.activities = this.activities.slice(0, this.maxEntries);
        }
        
        const removedCount = initialCount - this.activities.length;
        if (removedCount > 0) {
            this.saveActivities();
            console.log(`${removedCount} alte Aktivitäten entfernt`);
        }
    }
    
    /**
     * Periodische Bereinigung starten
     */
    startPeriodicCleanup() {
        // Alle 24 Stunden bereinigen
        setInterval(() => {
            this.cleanupOldActivities();
        }, 24 * 60 * 60 * 1000);
        
        // Einmalige Bereinigung beim Start
        this.cleanupOldActivities();
    }
    
    /**
     * Alle Aktivitäten löschen
     */
    clearAllActivities() {
        this.activities = [];
        this.saveActivities();
    }
    
    /**
     * Eindeutige Aktivitäts-ID generieren
     * 
     * @returns {string} Eindeutige ID
     */
    generateActivityId() {
        return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Session-ID abrufen oder erstellen
     * 
     * @returns {string} Session-ID
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('ups_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('ups_session_id', sessionId);
        }
        return sessionId;
    }
    
    /**
     * Lokalisierten Text abrufen
     * 
     * @param {string} key - Übersetzungsschlüssel
     * @returns {string} Lokalisierter Text
     */
    getLocalizedText(key) {
        if (window.languageManager) {
            return window.languageManager.t(key);
        }
        return key;
    }
    
    /**
     * Aktivität für UI formatieren
     * 
     * @param {Object} activity - Aktivität
     * @returns {Object} Formatierte Aktivität
     */
    formatActivityForUI(activity) {
        const type = this.activityTypes.get(activity.type);
        if (!type) {
            return null;
        }
        
        const formatted = {
            id: activity.id,
            type: activity.type,
            icon: type.icon,
            color: type.color,
            category: type.category,
            timestamp: activity.timestamp,
            description: activity.description,
            metadata: activity.metadata,
            relativeTime: this.getRelativeTime(activity.timestamp),
            detailsHtml: this.generateDetailsHtml(activity, type)
        };
        
        return formatted;
    }
    
    /**
     * Relative Zeitangabe erstellen
     * 
     * @param {string} timestamp - ISO-Zeitstempel
     * @returns {string} Relative Zeitangabe
     */
    getRelativeTime(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffMs = now - activityTime;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 1) {
            return this.getLocalizedText('activities.time.justNow');
        } else if (diffMins < 60) {
            return this.getLocalizedText('activities.time.minutesAgo').replace('{minutes}', diffMins);
        } else if (diffHours < 24) {
            return this.getLocalizedText('activities.time.hoursAgo').replace('{hours}', diffHours);
        } else if (diffDays < 7) {
            return this.getLocalizedText('activities.time.daysAgo').replace('{days}', diffDays);
        } else {
            return activityTime.toLocaleDateString();
        }
    }
    
    /**
     * Details-HTML für Aktivität generieren
     * 
     * @param {Object} activity - Aktivität
     * @param {Object} type - Aktivitätstyp
     * @returns {string} HTML-String
     */
    generateDetailsHtml(activity, type) {
        const meta = activity.metadata;
        let html = '';
        
        switch (type.template) {
            case 'shipment_action':
                html = `
                    <div class="activity-details">
                        ${meta.recipientName ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.recipient')}:</strong> ${meta.recipientName}</span>` : ''}
                        ${meta.shipmentId ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.shipmentId')}:</strong> ${meta.shipmentId}</span>` : ''}
                        ${meta.country ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.country')}:</strong> ${meta.country}</span>` : ''}
                        ${meta.city ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.city')}:</strong> ${meta.city}</span>` : ''}
                        ${meta.weight ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.weight')}:</strong> ${meta.weight} ${meta.unitOfMeasure || 'kg'}</span>` : ''}
                    </div>
                `;
                break;
                
            case 'file_action':
                html = `
                    <div class="activity-details">
                        ${meta.fileName ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.fileName')}:</strong> ${meta.fileName}</span>` : ''}
                        ${meta.totalRows ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.totalRows')}:</strong> ${meta.totalRows}</span>` : ''}
                        ${meta.validRows ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.validRows')}:</strong> ${meta.validRows}</span>` : ''}
                        ${meta.invalidRows ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.invalidRows')}:</strong> ${meta.invalidRows}</span>` : ''}
                        ${meta.fileSize ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.fileSize')}:</strong> ${this.formatFileSize(meta.fileSize)}</span>` : ''}
                    </div>
                `;
                break;
                
            case 'language_action':
                html = `
                    <div class="activity-details">
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.from')}:</strong> ${meta.fromLanguage || 'N/A'}</span>
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.to')}:</strong> ${meta.toLanguage || 'N/A'}</span>
                    </div>
                `;
                break;
                
            case 'theme_action':
                html = `
                    <div class="activity-details">
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.from')}:</strong> ${meta.fromTheme || 'N/A'}</span>
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.to')}:</strong> ${meta.toTheme || 'N/A'}</span>
                    </div>
                `;
                break;
                
            case 'validation_action':
                html = `
                    <div class="activity-details">
                        ${meta.errors ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.errors')}:</strong> ${meta.errors.length}</span>` : ''}
                        ${meta.warnings ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.warnings')}:</strong> ${meta.warnings.length}</span>` : ''}
                        ${meta.shipmentId ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.shipmentId')}:</strong> ${meta.shipmentId}</span>` : ''}
                    </div>
                `;
                break;
                
            case 'user_action':
                html = `
                    <div class="activity-details">
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.user')}:</strong> ${activity.userName}</span>
                        ${meta.loginCount ? `<span class="detail-item"><strong>${this.getLocalizedText('activities.loginCount')}:</strong> ${meta.loginCount}</span>` : ''}
                    </div>
                `;
                break;
                
            case 'user_name_action':
                html = `
                    <div class="activity-details">
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.from')}:</strong> ${meta.oldName}</span>
                        <span class="detail-item"><strong>${this.getLocalizedText('activities.to')}:</strong> ${meta.newName}</span>
                    </div>
                `;
                break;
                
            default:
                html = `<div class="activity-details">${activity.description}</div>`;
        }
        
        // User-Tag hinzufügen (außer für user_* Aktionen)
        if (activity.userName && activity.userName !== 'Unbekannt' && !activity.type.startsWith('user_')) {
            html += `
                <div class="activity-user-tag">
                    <i class="fas fa-user"></i>
                    <span>${this.getLocalizedText('activities.performedBy')}: ${activity.userName}</span>
                </div>
            `;
        }
        
        return html;
    }
    
    /**
     * Dateigröße formatieren
     * 
     * @param {number} bytes - Bytes
     * @returns {string} Formatierte Größe
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    /**
     * Aktivitäten exportieren
     * 
     * @param {string} format - Exportformat (json, csv)
     * @returns {string} Exportierte Daten
     */
    exportActivities(format = 'json') {
        if (format === 'json') {
            return JSON.stringify(this.activities, null, 2);
        } else if (format === 'csv') {
            const headers = ['ID', 'Type', 'Timestamp', 'Description', 'Metadata'];
            const rows = [headers.join(',')];
            
            this.activities.forEach(activity => {
                const row = [
                    activity.id,
                    activity.type,
                    activity.timestamp,
                    '"' + activity.description.replace(/"/g, '""') + '"',
                    '"' + JSON.stringify(activity.metadata).replace(/"/g, '""') + '"'
                ];
                rows.push(row.join(','));
            });
            
            return rows.join('\n');
        }
        
        return '';
    }
    
    /**
     * Aktivität für Nutzer-Erstellung
     * 
     * @param {Object} user - Nutzer-Daten
     */
    logUserCreated(user) {
        return this.log('user_created', {
            description: this.getLocalizedText('activities.user_created') || 'Nutzer erstellt',
            metadata: {
                userId: user.id,
                userName: user.name,
                createdAt: user.createdAt
            }
        });
    }
    
    /**
     * Aktivität für Nutzer-Login
     * 
     * @param {Object} user - Nutzer-Daten
     */
    logUserLogin(user) {
        return this.log('user_login', {
            description: this.getLocalizedText('activities.user_login') || 'Nutzer angemeldet',
            metadata: {
                userId: user.id,
                userName: user.name,
                loginTime: new Date().toISOString(),
                loginCount: user.loginCount
            }
        });
    }
    
    /**
     * Aktivität für Nutzer-Logout
     * 
     * @param {Object} user - Nutzer-Daten
     */
    logUserLogout(user) {
        return this.log('user_logout', {
            description: this.getLocalizedText('activities.user_logout') || 'Nutzer abgemeldet',
            metadata: {
                userId: user.id,
                userName: user.name,
                logoutTime: new Date().toISOString()
            }
        });
    }
    
    /**
     * Aktivität für Nutzer-Name-Änderung
     * 
     * @param {string} oldName - Alter Name
     * @param {string} newName - Neuer Name
     */
    logUserNameChanged(oldName, newName) {
        return this.log('user_name_changed', {
            description: this.getLocalizedText('activities.user_name_changed') || 'Name geändert',
            metadata: {
                oldName: oldName,
                newName: newName,
                changedAt: new Date().toISOString()
            }
        });
    }
}

// ActivityLogger global verfügbar machen
window.ActivityLogger = ActivityLogger;
window.activityLogger = new ActivityLogger();