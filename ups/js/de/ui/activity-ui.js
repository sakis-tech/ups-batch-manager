/**
 * Activity UI Integration für deutsche UPS Batch Manager Oberfläche
 * 
 * Integriert das Activity Logger System mit der Benutzeroberfläche:
 * - Dashboard Activity List Updates
 * - Activity Detail Modal
 * - Real-time Activity Rendering
 * - Activity Export Funktionalität
 * 
 * @class ActivityUI
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class ActivityUI {
    /**
     * Initialisiert die Activity UI Integration
     * 
     * @constructor
     */
    constructor() {
        /** @type {HTMLElement} Activity List Container */
        this.activityListContainer = null;
        
        /** @type {HTMLElement} Activity Stats Container */
        this.activityStatsContainer = null;
        
        /** @type {string} Aktuelle Kategorie Filter */
        this.currentFilter = 'all';
        
        /** @type {string} Aktueller Suchbegriff */
        this.searchTerm = '';
        
        /** @type {number} Aktualisierungsintervall ID */
        this.updateInterval = null;
        
        this.initialize();
    }
    
    /**
     * Initialisiert die UI Integration
     */
    initialize() {
        this.setupContainers();
        this.setupEventListeners();
        this.setupActivityLogger();
        this.startPeriodicUpdate();
        this.renderInitialActivities();
    }
    
    /**
     * Container-Elemente einrichten
     */
    setupContainers() {
        this.activityListContainer = document.getElementById('recentActivityList');
        this.activityStatsContainer = document.querySelector('.activity-stats');
    }
    
    /**
     * Event-Listener einrichten
     */
    setupEventListeners() {
        // Activity Logger Callback
        if (window.activityLogger) {
            window.activityLogger.onActivityAdded = (activity) => {
                this.onNewActivity(activity);
            };
        }
        
        // Global Event Listener für Activity Actions
        document.addEventListener('DOMContentLoaded', () => {
            this.setupGlobalActivityActions();
        });
    }
    
    /**
     * Globale Activity Actions einrichten
     */
    setupGlobalActivityActions() {
        // Activity Details Modal
        window.showActivityDetails = () => {
            this.showActivityModal();
        };
        
        // Activity Log löschen
        window.clearActivityLog = () => {
            this.clearActivityLog();
        };
        
        // Activity Export
        window.exportActivityLog = (format) => {
            this.exportActivityLog(format);
        };
    }
    
    /**
     * Activity Logger Setup
     */
    setupActivityLogger() {
        // Log App Start
        if (window.activityLogger) {
            window.activityLogger.logAppStarted();
        }
    }
    
    /**
     * Periodische UI-Updates starten
     */
    startPeriodicUpdate() {
        // Alle 30 Sekunden relative Zeitangaben aktualisieren
        this.updateInterval = setInterval(() => {
            this.updateRelativeTimes();
        }, 30000);
    }
    
    /**
     * Initiale Aktivitäten rendern
     */
    renderInitialActivities() {
        if (!this.activityListContainer || !window.activityLogger) return;
        
        const activities = window.activityLogger.getActivities(5);
        this.renderActivities(activities);
        this.updateStats();
    }
    
    /**
     * Neue Aktivität behandeln
     * 
     * @param {Object} activity - Neue Aktivität
     */
    onNewActivity(activity) {
        this.renderActivities(window.activityLogger.getActivities(5));
        this.updateStats();
        
        // Toast Notification für wichtige Aktivitäten
        if (window.toastSystem) {
            const type = window.activityLogger.activityTypes.get(activity.type);
            if (type && ['shipment_created', 'csv_imported', 'csv_export'].includes(activity.type)) {
                window.toastSystem.showInfo(activity.description);
            }
        }
    }
    
    /**
     * Aktivitäten rendern
     * 
     * @param {Array<Object>} activities - Aktivitätenliste
     */
    renderActivities(activities) {
        if (!this.activityListContainer) return;
        
        if (activities.length === 0) {
            this.activityListContainer.innerHTML = `
                <div class="activity-item placeholder">
                    <i class="fas fa-info-circle"></i>
                    <div class="activity-content">
                        <span class="activity-description" data-lang-key="activities.empty">Keine Aktivitäten vorhanden</span>
                        <small class="activity-time">-</small>
                    </div>
                </div>
            `;
            return;
        }
        
        this.activityListContainer.innerHTML = activities
            .map(activity => this.renderActivityItem(activity))
            .join('');
        
        // Sprache aktualisieren
        if (window.languageManager) {
            window.languageManager.updatePageLanguage();
        }
    }
    
    /**
     * Einzelne Aktivität rendern
     * 
     * @param {Object} activity - Aktivität
     * @returns {string} HTML String
     */
    renderActivityItem(activity) {
        const formatted = window.activityLogger.formatActivityForUI(activity);
        if (!formatted) return '';
        
        // Undo-Button generieren falls möglich
        const undoButton = window.undoManager ? 
            window.undoManager.generateUndoButton(activity.id, activity.type) : '';
        
        return `
            <div class="activity-item" data-activity-id="${activity.id}">
                <i class="${formatted.icon}"></i>
                <div class="activity-content">
                    <div class="activity-main">
                        <span class="activity-description">${formatted.description}</span>
                        <small class="activity-time">${formatted.relativeTime}</small>
                    </div>
                    ${formatted.detailsHtml}
                    ${undoButton ? `<div class="activity-actions">${undoButton}</div>` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * Aktivitäts-Statistiken aktualisieren
     */
    updateStats() {
        if (!window.activityLogger) return;
        
        const stats = window.activityLogger.getActivityStats();
        
        const todayElement = document.getElementById('activitiesToday');
        const totalElement = document.getElementById('activitiesTotal');
        
        if (todayElement) todayElement.textContent = stats.today;
        if (totalElement) totalElement.textContent = stats.total;
    }
    
    /**
     * Relative Zeitangaben aktualisieren
     */
    updateRelativeTimes() {
        if (!this.activityListContainer || !window.activityLogger) return;
        
        const timeElements = this.activityListContainer.querySelectorAll('.activity-time');
        timeElements.forEach(element => {
            const activityItem = element.closest('.activity-item');
            const activityId = activityItem?.dataset.activityId;
            
            if (activityId) {
                const activity = window.activityLogger.activities.find(a => a.id === activityId);
                if (activity) {
                    element.textContent = window.activityLogger.getRelativeTime(activity.timestamp);
                }
            }
        });
    }
    
    /**
     * Activity Details Modal anzeigen
     */
    showActivityModal() {
        if (!window.modalSystem || !window.activityLogger) return;
        
        const modalId = 'activityModal';
        
        if (!window.modalSystem.modals.has(modalId)) {
            window.modalSystem.createModal(modalId, {
                title: window.languageManager ? window.languageManager.t('activities.title') : 'Aktivitäten-Log',
                size: 'large',
                content: this.getActivityModalContent,
                buttons: [
                    { 
                        text: window.languageManager ? window.languageManager.t('activities.export') : 'Exportieren', 
                        class: 'btn-secondary', 
                        action: 'export' 
                    },
                    { 
                        text: window.languageManager ? window.languageManager.t('activities.clearAll') : 'Alle löschen', 
                        class: 'btn-danger', 
                        action: 'clear' 
                    },
                    { 
                        text: window.languageManager ? window.languageManager.t('common.buttons.close') : 'Schließen', 
                        class: 'btn-secondary', 
                        action: 'close' 
                    }
                ],
                export: this.exportActivityLog.bind(this),
                clear: this.clearActivityLog.bind(this)
            });
        }
        
        window.modalSystem.showModal(modalId);
        
        // Modal-spezifische Event-Listener
        setTimeout(() => {
            this.setupModalEventListeners();
        }, 100);
    }
    
    /**
     * Activity Modal Content
     * 
     * @returns {string} HTML Content
     */
    getActivityModalContent() {
        return `
            <div class="activity-modal">
                <div class="activity-search">
                    <input type="text" id="activitySearchInput" class="search-input" 
                           placeholder="${window.languageManager ? window.languageManager.t('activities.search') : 'Aktivitäten durchsuchen...'}" />
                    <div class="activity-filters">
                        <button class="activity-filter active" data-filter="all">
                            ${window.languageManager ? window.languageManager.t('activities.categories.all') : 'Alle'}
                        </button>
                        <button class="activity-filter" data-filter="shipments">
                            ${window.languageManager ? window.languageManager.t('activities.categories.shipments') : 'Sendungen'}
                        </button>
                        <button class="activity-filter" data-filter="import_export">
                            ${window.languageManager ? window.languageManager.t('activities.categories.import_export') : 'Import/Export'}
                        </button>
                        <button class="activity-filter" data-filter="system">
                            ${window.languageManager ? window.languageManager.t('activities.categories.system') : 'System'}
                        </button>
                        <button class="activity-filter" data-filter="validation">
                            ${window.languageManager ? window.languageManager.t('activities.categories.validation') : 'Validierung'}
                        </button>
                    </div>
                </div>
                <div class="activity-full-list" id="activityFullList">
                    ${this.renderFullActivityList()}
                </div>
                <div class="activity-export">
                    <div class="activity-export-stats">
                        <span>${window.languageManager ? window.languageManager.t('activities.stats.total') : 'Gesamt'}: ${window.activityLogger.activities.length}</span>
                    </div>
                    <div class="activity-export-actions">
                        <button class="btn btn-info btn-sm" onclick="window.activityUI.exportActivityLog('json')">
                            <i class="fas fa-download"></i> JSON
                        </button>
                        <button class="btn btn-info btn-sm" onclick="window.activityUI.exportActivityLog('csv')">
                            <i class="fas fa-download"></i> CSV
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Vollständige Activity Liste rendern
     * 
     * @returns {string} HTML String
     */
    renderFullActivityList() {
        if (!window.activityLogger) return '';
        
        const activities = window.activityLogger.getActivities(50);
        
        if (activities.length === 0) {
            return `
                <div class="activity-loading">
                    <span>${window.languageManager ? window.languageManager.t('activities.empty') : 'Keine Aktivitäten vorhanden'}</span>
                </div>
            `;
        }
        
        return activities
            .map(activity => this.renderActivityItem(activity))
            .join('');
    }
    
    /**
     * Modal Event-Listener einrichten
     */
    setupModalEventListeners() {
        const modal = document.querySelector('.activity-modal');
        if (!modal) return;
        
        // Search Input
        const searchInput = modal.querySelector('#activitySearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterActivities();
            });
        }
        
        // Filter Buttons
        const filterButtons = modal.querySelectorAll('.activity-filter');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Active State
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filter
                this.currentFilter = button.dataset.filter;
                this.filterActivities();
            });
        });
    }
    
    /**
     * Aktivitäten filtern
     */
    filterActivities() {
        if (!window.activityLogger) return;
        
        let activities = window.activityLogger.getActivities(50, this.currentFilter === 'all' ? null : this.currentFilter);
        
        // Suche anwenden
        if (this.searchTerm) {
            activities = activities.filter(activity => {
                const searchText = [
                    activity.description,
                    activity.metadata.recipientName,
                    activity.metadata.fileName,
                    activity.metadata.country,
                    activity.metadata.city
                ].join(' ').toLowerCase();
                
                return searchText.includes(this.searchTerm);
            });
        }
        
        // Liste aktualisieren
        const fullList = document.getElementById('activityFullList');
        if (fullList) {
            fullList.innerHTML = activities
                .map(activity => this.renderActivityItem(activity))
                .join('');
        }
    }
    
    /**
     * Activity Log löschen
     */
    clearActivityLog() {
        if (!window.activityLogger) return;
        
        if (window.modalSystem) {
            window.modalSystem.showConfirmDialog(
                window.languageManager ? window.languageManager.t('activities.clearAll') : 'Alle Aktivitäten löschen',
                window.languageManager ? window.languageManager.t('activities.confirmClear') : 'Möchten Sie wirklich alle Aktivitäten löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
                () => {
                    window.activityLogger.clearAllActivities();
                    this.renderInitialActivities();
                    
                    if (window.toastSystem) {
                        window.toastSystem.showSuccess(
                            window.languageManager ? window.languageManager.t('activities.cleared') : 'Aktivitäten gelöscht'
                        );
                    }
                    
                    // Modal schließen
                    window.modalSystem.closeModal();
                }
            );
        } else {
            if (confirm(window.languageManager ? window.languageManager.t('activities.confirmClear') : 'Alle Aktivitäten löschen?')) {
                window.activityLogger.clearAllActivities();
                this.renderInitialActivities();
            }
        }
    }
    
    /**
     * Activity Log exportieren
     * 
     * @param {string} format - Export Format (json, csv)
     */
    exportActivityLog(format = 'json') {
        if (!window.activityLogger) return;
        
        const data = window.activityLogger.exportActivities(format);
        const filename = `ups-activity-log-${new Date().toISOString().split('T')[0]}.${format}`;
        
        const blob = new Blob([data], {
            type: format === 'json' ? 'application/json' : 'text/csv'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        if (window.toastSystem) {
            window.toastSystem.showSuccess(
                window.languageManager ? window.languageManager.t('activities.exported') : 'Aktivitäten exportiert'
            );
        }
    }
    
    /**
     * Cleanup beim Verlassen der Seite
     */
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// ActivityUI global verfügbar machen
window.ActivityUI = ActivityUI;

// Initialisierung nach DOM Load
document.addEventListener('DOMContentLoaded', () => {
    window.activityUI = new ActivityUI();
});

// Cleanup bei Page Unload
window.addEventListener('beforeunload', () => {
    if (window.activityUI) {
        window.activityUI.cleanup();
    }
});