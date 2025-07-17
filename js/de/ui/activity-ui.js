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
    constructor() {
        this.activityListContainer = null;
        this.activityStatsContainer = null;
        this.currentFilter = 'all';
        this.currentSearchTerm = '';
        this.maxDisplayedActivities = 10;
        this.initialize();
    }
    
    initialize() {
        this.activityListContainer = document.getElementById('recentActivityList');
        this.activityStatsContainer = document.getElementById('activityStatsContainer');
        this.setupEventListeners();
        this.renderDashboardActivities();
        this.startPeriodicUpdate();
    }
    
    setupEventListeners() {
        if (window.activityLogger) {
            window.activityLogger.addEventListener('activity-added', (event) => {
                this.handleActivityAdded(event.detail);
            });
            
            window.activityLogger.addEventListener('activity-cleared', () => {
                this.handleActivityCleared();
            });
        }
        
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });
    }
    
    handleActivityAdded(activity) {
        this.renderDashboardActivities();
        this.updateActivityStats();
        this.showActivityToast(activity);
    }
    
    handleActivityCleared() {
        this.renderDashboardActivities();
        this.updateActivityStats();
    }
    
    renderDashboardActivities() {
        if (!this.activityListContainer) {
            return;
        }
        
        const activities = window.activityLogger ? window.activityLogger.getActivities() : [];
        
        if (activities.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        const recentActivities = activities.slice(0, this.maxDisplayedActivities);
        const html = recentActivities.map(activity => this.renderActivityItem(activity)).join('');
        
        this.activityListContainer.innerHTML = html;
        this.updateActivityStats();
    }
    
    renderEmptyState() {
        const emptyPlaceholder = `
            <div class="activity-item placeholder">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-main">
                        <span class="activity-description">Keine Aktivitäten vorhanden</span>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-time">-</span>
                    </div>
                </div>
            </div>
        `;
        
        this.updateActivityList(emptyPlaceholder);
        this.updateActivityStats(0, 0);
    }
    
    renderActivityItem(activity) {
        const icon = this.getActivityIcon(activity.type);
        const timeAgo = this.getTimeAgo(activity.timestamp);
        
        return `
            <div class="activity-item" data-activity-id="${activity.id}">
                <div class="activity-icon ${activity.type}">
                    <i class="${icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-main">
                        <span class="activity-description">${activity.description}</span>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-time">${timeAgo}</span>
                        <span class="activity-type">${this.getActivityTypeLabel(activity.type)}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    getActivityIcon(type) {
        const icons = {
            'shipment': 'fas fa-shipping-fast',
            'import': 'fas fa-file-import',
            'export': 'fas fa-file-export',
            'validation': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-triangle',
            'system': 'fas fa-cog',
            'user': 'fas fa-user',
            'default': 'fas fa-info-circle'
        };
        
        return icons[type] || icons['default'];
    }
    
    getActivityTypeLabel(type) {
        const labels = {
            'shipment': 'Sendung',
            'import': 'Import',
            'export': 'Export',
            'validation': 'Validierung',
            'error': 'Fehler',
            'system': 'System',
            'user': 'Benutzer'
        };
        
        return labels[type] || 'Allgemein';
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
        if (hours > 0) return `vor ${hours} Stunde${hours > 1 ? 'n' : ''}`;
        if (minutes > 0) return `vor ${minutes} Minute${minutes > 1 ? 'n' : ''}`;
        return 'gerade eben';
    }
    
    updateActivityList(html) {
        if (this.activityListContainer) {
            this.activityListContainer.innerHTML = html;
        }
    }
    
    updateActivityStats(todayCount, totalCount) {
        const activities = window.activityLogger ? window.activityLogger.getActivities() : [];
        
        if (typeof todayCount === 'undefined') {
            todayCount = this.getTodayActivityCount(activities);
        }
        
        if (typeof totalCount === 'undefined') {
            totalCount = activities.length;
        }
        
        const todayElement = document.getElementById('activitiesToday');
        const totalElement = document.getElementById('activitiesTotal');
        
        if (todayElement) todayElement.textContent = todayCount;
        if (totalElement) totalElement.textContent = totalCount;
    }
    
    getTodayActivityCount(activities) {
        const today = new Date().toDateString();
        return activities.filter(activity => {
            const activityDate = new Date(activity.timestamp).toDateString();
            return activityDate === today;
        }).length;
    }
    
    showActivityToast(activity) {
        if (window.toastSystem && activity.type !== 'system') {
            const message = activity.description;
            const type = activity.type === 'error' ? 'error' : 'info';
            
            window.toastSystem.showToast(message, type, {
                duration: 3000,
                position: 'top-right'
            });
        }
    }
    
    startPeriodicUpdate() {
        setInterval(() => {
            this.updateActivityStats();
        }, 30000);
    }
    
    showActivityDetails() {
        const modalId = 'activityModal';
        
        if (!window.modalSystem.modals.has(modalId)) {
            window.modalSystem.createModal(modalId, {
                title: 'Aktivitäten-Log',
                size: 'large',
                content: this.getActivityModalContent(),
                buttons: [
                    { 
                        text: 'Exportieren', 
                        class: 'btn-secondary', 
                        action: () => this.exportActivityLog()
                    },
                    { 
                        text: 'Alle löschen', 
                        class: 'btn-danger', 
                        action: () => this.clearActivityLog()
                    },
                    { 
                        text: 'Schließen', 
                        class: 'btn-secondary', 
                        action: () => window.modalSystem.hideModal(modalId)
                    }
                ]
            });
        }
        
        window.modalSystem.showModal(modalId);
    }
    
    getActivityModalContent() {
        return `
            <div class="activity-modal">
                <div class="activity-search">
                    <input type="text" id="activitySearchInput" class="search-input" 
                           placeholder="Aktivitäten durchsuchen..." />
                    <div class="activity-filters">
                        <button class="activity-filter active" data-filter="all">Alle</button>
                        <button class="activity-filter" data-filter="shipments">Sendungen</button>
                        <button class="activity-filter" data-filter="import_export">Import/Export</button>
                        <button class="activity-filter" data-filter="system">System</button>
                        <button class="activity-filter" data-filter="validation">Validierung</button>
                    </div>
                </div>
                <div class="activity-full-list" id="activityFullList">
                    ${this.renderFullActivityList()}
                </div>
                <div class="activity-export">
                    <div class="activity-export-stats">
                        <span>Gesamt: ${window.activityLogger ? window.activityLogger.activities.length : 0}</span>
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
    
    renderFullActivityList() {
        const activities = window.activityLogger ? window.activityLogger.getActivities() : [];
        
        if (activities.length === 0) {
            return `
                <div class="activity-empty">
                    <i class="fas fa-info-circle"></i>
                    <span>Keine Aktivitäten vorhanden</span>
                </div>
            `;
        }
        
        return activities.map(activity => this.renderActivityItem(activity)).join('');
    }
    
    exportActivityLog(format = 'json') {
        const activities = window.activityLogger ? window.activityLogger.getActivities() : [];
        
        if (activities.length === 0) {
            if (window.toastSystem) {
                window.toastSystem.showWarning('Keine Aktivitäten zum Exportieren vorhanden');
            }
            return;
        }
        
        try {
            let content, filename, mimeType;
            
            if (format === 'csv') {
                content = this.createCSVContent(activities);
                filename = `aktivitaeten-${new Date().toISOString().slice(0, 10)}.csv`;
                mimeType = 'text/csv;charset=utf-8';
            } else {
                content = JSON.stringify(activities, null, 2);
                filename = `aktivitaeten-${new Date().toISOString().slice(0, 10)}.json`;
                mimeType = 'application/json;charset=utf-8';
            }
            
            this.downloadFile(content, filename, mimeType);
            
            if (window.toastSystem) {
                window.toastSystem.showSuccess(`Aktivitäten erfolgreich als ${format.toUpperCase()} exportiert`);
            }
        } catch (error) {
            console.error('Export failed:', error);
            if (window.toastSystem) {
                window.toastSystem.showError('Export fehlgeschlagen');
            }
        }
    }
    
    createCSVContent(activities) {
        const headers = ['Zeitstempel', 'Typ', 'Beschreibung', 'Details'];
        const rows = activities.map(activity => [
            new Date(activity.timestamp).toLocaleString('de-DE'),
            this.getActivityTypeLabel(activity.type),
            activity.description,
            JSON.stringify(activity.details || {})
        ]);
        
        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        
        return csvContent;
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
    
    clearActivityLog() {
        if (window.activityLogger) {
            window.activityLogger.clearActivities();
            
            if (window.toastSystem) {
                window.toastSystem.showSuccess('Aktivitäten-Log gelöscht');
            }
        }
    }
}

// Globale Instanz erstellen
window.activityUI = new ActivityUI();

// Globale Funktionen für HTML-Callbacks
window.showActivityDetails = () => window.activityUI.showActivityDetails();
window.clearActivityLog = () => window.activityUI.clearActivityLog();