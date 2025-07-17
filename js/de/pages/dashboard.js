// Dashboard page specific functionality
class DashboardPage {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStats();
        this.updateRecentActivities();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Activity actions
        const activityActions = document.querySelectorAll('.activity-actions button');
        activityActions.forEach(button => {
            button.addEventListener('click', (e) => {
                if (e.target.closest('button').onclick) {
                    // onclick handler defined in HTML
                    return;
                }
            });
        });

        // Update stats when shipment manager changes
        if (window.shipmentManager) {
            // Listen for storage changes
            window.addEventListener('storage', (e) => {
                if (e.key === 'upsShipments') {
                    this.updateStats();
                    this.updateRecentActivities();
                }
            });
        }
    }

    updateStats() {
        if (window.shipmentManager) {
            const stats = window.shipmentManager.getStatistics();
            
            // Dashboard cards
            const dashTotalShipments = document.getElementById('dashTotalShipments');
            const dashValidShipments = document.getElementById('dashValidShipments');
            const dashInvalidShipments = document.getElementById('dashInvalidShipments');
            const dashTotalWeight = document.getElementById('dashTotalWeight');
            
            if (dashTotalShipments) dashTotalShipments.textContent = stats.total;
            if (dashValidShipments) dashValidShipments.textContent = stats.valid;
            if (dashInvalidShipments) dashInvalidShipments.textContent = stats.invalid;
            if (dashTotalWeight) dashTotalWeight.textContent = `${stats.totalWeight} kg`;
        }
    }

    updateRecentActivities() {
        if (window.shipmentManager) {
            const activities = window.shipmentManager.getRecentActivities(5);
            const container = document.getElementById('recentActivityList');
            
            if (!container) return;

            if (activities.length === 0) {
                container.innerHTML = `
                    <div class="activity-item placeholder">
                        <i class="fas fa-info-circle"></i>
                        <div class="activity-content">
                            <span class="activity-description">Willkommen im UPS Batch-Manager!</span>
                            <small class="activity-time">Jetzt</small>
                        </div>
                    </div>
                `;
                return;
            }

            container.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                    <div class="activity-content">
                        <span class="activity-description">${activity.message}</span>
                        <small class="activity-time">${activity.time}</small>
                    </div>
                </div>
            `).join('');

            // Update activity stats
            this.updateActivityStats(activities);
        }
    }

    updateActivityStats(activities) {
        const today = new Date().toDateString();
        const todayActivities = activities.filter(a => 
            new Date(a.timestamp).toDateString() === today
        );

        const activitiesToday = document.getElementById('activitiesToday');
        const activitiesTotal = document.getElementById('activitiesTotal');

        if (activitiesToday) activitiesToday.textContent = todayActivities.length;
        if (activitiesTotal) activitiesTotal.textContent = activities.length;
    }

    getActivityIcon(type) {
        const icons = {
            add: 'plus',
            update: 'edit',
            delete: 'trash',
            import: 'file-import',
            export: 'file-export',
            clear: 'trash-alt'
        };
        return icons[type] || 'info-circle';
    }

    loadFromStorage() {
        // Load any dashboard-specific settings
        const dashboardSettings = localStorage.getItem('dashboardSettings');
        if (dashboardSettings) {
            try {
                const settings = JSON.parse(dashboardSettings);
                // Apply dashboard settings
                this.applyDashboardSettings(settings);
            } catch (error) {
                console.error('Error loading dashboard settings:', error);
            }
        }
    }

    applyDashboardSettings(settings) {
        // Apply any dashboard-specific settings
        if (settings.showQuickActions !== undefined) {
            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.style.display = settings.showQuickActions ? 'block' : 'none';
            }
        }

        if (settings.showRecentActivity !== undefined) {
            const recentActivity = document.querySelector('.recent-activity');
            if (recentActivity) {
                recentActivity.style.display = settings.showRecentActivity ? 'block' : 'none';
            }
        }
    }

    saveToStorage() {
        // Save dashboard-specific settings
        const settings = {
            showQuickActions: true,
            showRecentActivity: true,
            // Add other dashboard settings as needed
        };
        
        localStorage.setItem('dashboardSettings', JSON.stringify(settings));
    }

    refresh() {
        this.updateStats();
        this.updateRecentActivities();
    }
}

// Global functions for HTML onclick handlers
window.showActivityDetails = () => {
    if (window.modalSystem && typeof window.modalSystem.showActivityModal === 'function') {
        window.modalSystem.showActivityModal();
    } else {
        // Fallback: show activities in a simple modal
        if (window.shipmentManager) {
            const activities = window.shipmentManager.getRecentActivities(50);
            let content = '<div class="activity-list">';
            
            activities.forEach(activity => {
                content += `
                    <div class="activity-item">
                        <i class="fas fa-${window.dashboardPage.getActivityIcon(activity.type)}"></i>
                        <div class="activity-content">
                            <span class="activity-description">${activity.message}</span>
                            <small class="activity-time">${activity.time}</small>
                        </div>
                    </div>
                `;
            });
            
            content += '</div>';
            
            if (window.modalSystem && typeof window.modalSystem.createModal === 'function') {
                window.modalSystem.createModal('activityModal', {
                    title: 'Alle Aktivitäten',
                    content: content,
                    size: 'large'
                });
                window.modalSystem.showModal('activityModal');
            }
        }
    }
};

window.clearActivityLog = () => {
    if (!window.showConfirmDialog || typeof window.showConfirmDialog !== 'function') {
        console.error('Confirm dialog not available');
        return;
    }
    
    window.showConfirmDialog(
        'Aktivitäten löschen',
        'Möchten Sie wirklich alle Aktivitäten löschen?',
        () => {
            if (window.shipmentManager && window.shipmentManager.activities) {
                window.shipmentManager.activities = [];
                window.shipmentManager.saveToStorage();
                
                if (window.dashboardPage) {
                    window.dashboardPage.updateRecentActivities();
                }
                
                if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                    window.toastSystem.showSuccess('Aktivitäten erfolgreich gelöscht');
                }
            }
        }
    );
};

// Initialize dashboard page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardPage = new DashboardPage();
    window.pageManager = window.dashboardPage; // Set as global page manager
});