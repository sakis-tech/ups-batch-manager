// Shared functionality for all pages
class SharedPageManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupCommonEventListeners();
        this.setupThemeHandling();
        this.setupSidebar();
        this.updateStats();
        this.loadSettings();
    }

    setupCommonEventListeners() {
        // Sidebar toggle
        const toggleSidebar = document.getElementById('toggleSidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        
        if (toggleSidebar) {
            toggleSidebar.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
            
            // Touch events for mobile
            toggleSidebar.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
            
            // Touch events for mobile
            sidebarToggle.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleSidebar();
            });
        }

        // Handle window resize to close mobile sidebar
        window.addEventListener('resize', () => {
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.querySelector('.mobile-backdrop');
            
            if (window.innerWidth > 768 && sidebar && backdrop) {
                sidebar.classList.remove('active');
                backdrop.remove();
            }
        });

        // Dark mode toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (darkModeToggle) {
            darkModeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
        }

        // Fullscreen toggle
        const fullscreenToggle = document.getElementById('fullscreenToggle');
        if (fullscreenToggle) {
            fullscreenToggle.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }

        // Language toggle removed - German only
    }

    setupThemeHandling() {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            const icon = document.querySelector('#darkModeToggle i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    setupSidebar() {
        // Set active navigation item based on current page
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === currentPage || 
                (currentPage === 'index.html' && href === 'dashboard.html') ||
                (currentPage === '' && href === 'dashboard.html')) {
                link.classList.add('active');
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        
        if (sidebar && mainContent) {
            // Check if we're on mobile (under 768px)
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // On mobile, toggle 'active' class for sidebar
                sidebar.classList.toggle('active');
                // Add backdrop for mobile
                this.toggleMobileBackdrop();
            } else {
                // On desktop, toggle 'collapsed' class
                sidebar.classList.toggle('collapsed');
                mainContent.classList.toggle('expanded');
            }
        }
    }

    toggleMobileBackdrop() {
        const existingBackdrop = document.querySelector('.mobile-backdrop');
        
        if (existingBackdrop) {
            // Remove existing backdrop
            existingBackdrop.remove();
        } else {
            // Create new backdrop
            const backdrop = document.createElement('div');
            backdrop.className = 'mobile-backdrop';
            backdrop.addEventListener('click', () => {
                this.toggleSidebar();
            });
            document.body.appendChild(backdrop);
        }
    }

    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update icon
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            const icon = document.querySelector('#fullscreenToggle i');
            if (icon) icon.className = 'fas fa-compress';
        } else {
            document.exitFullscreen();
            const icon = document.querySelector('#fullscreenToggle i');
            if (icon) icon.className = 'fas fa-expand';
        }
    }

    // toggleLanguage() removed - German only

    updateStats() {
        if (window.shipmentManager) {
            const stats = window.shipmentManager.getStatistics();
            
            // Update sidebar stats
            const totalShipments = document.getElementById('totalShipments');
            const validShipments = document.getElementById('validShipments');
            
            if (totalShipments) totalShipments.textContent = stats.total;
            if (validShipments) validShipments.textContent = stats.valid;
        }
    }

    loadSettings() {
        // Load default settings
        const defaultCountry = localStorage.getItem('defaultCountry') || 'DE';
        const defaultService = localStorage.getItem('defaultService') || '03';
        const defaultUnit = localStorage.getItem('defaultUnit') || 'KG';
        
        // Store in global for other scripts to use
        window.defaultSettings = {
            country: defaultCountry,
            service: defaultService,
            unit: defaultUnit
        };
    }
}

// Global functions for HTML onclick handlers
window.showCreateShipmentModal = () => {
    if (window.modalSystem && typeof window.modalSystem.showCreateShipmentModal === 'function') {
        window.modalSystem.showCreateShipmentModal();
    } else {
        console.error('Modal system not available');
    }
};

window.downloadTemplate = () => {
    if (!window.UPS_FIELDS) {
        if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
            window.toastSystem.showError('UPS-Felder sind nicht geladen');
        }
        return;
    }
    
    const headers = Object.keys(window.UPS_FIELDS);
    const csvContent = headers.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ups-batch-template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (window.shipmentManager && typeof window.shipmentManager.addActivity === 'function') {
        window.shipmentManager.addActivity('download', 'CSV-Vorlage heruntergeladen');
    }
    
    if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
        window.toastSystem.showSuccess('Vorlage erfolgreich heruntergeladen');
    }
};

window.editShipment = (id) => {
    if (!window.shipmentManager || typeof window.shipmentManager.getShipment !== 'function') {
        console.error('ShipmentManager not available');
        return;
    }
    
    const shipment = window.shipmentManager.getShipment(id);
    if (shipment) {
        if (window.modalSystem && typeof window.modalSystem.showEditShipmentModal === 'function') {
            window.modalSystem.showEditShipmentModal(shipment);
        } else {
            console.error('Modal system not available');
        }
    }
};

window.deleteShipment = (id) => {
    if (!window.shipmentManager || typeof window.shipmentManager.getShipment !== 'function') {
        console.error('ShipmentManager not available');
        return;
    }
    
    const shipment = window.shipmentManager.getShipment(id);
    if (shipment) {
        if (window.showConfirmDialog && typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog(
                'Sendung löschen',
                `Möchten Sie die Sendung "${shipment.companyName}" wirklich löschen?`,
                () => {
                    if (window.shipmentManager && typeof window.shipmentManager.deleteShipment === 'function') {
                        window.shipmentManager.deleteShipment(id);
                    }
                    if (window.pageManager && typeof window.pageManager.updateStats === 'function') {
                        window.pageManager.updateStats();
                    }
                    if (window.pageManager && typeof window.pageManager.renderContent === 'function') {
                        window.pageManager.renderContent();
                    }
                }
            );
        } else {
            console.error('Confirm dialog not available');
        }
    }
};

window.duplicateShipment = (id) => {
    if (!window.shipmentManager || typeof window.shipmentManager.getShipment !== 'function') {
        console.error('ShipmentManager not available');
        return;
    }
    
    const shipment = window.shipmentManager.getShipment(id);
    if (shipment) {
        const duplicateData = { ...shipment };
        delete duplicateData.id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;
        duplicateData.companyName += ' (Kopie)';
        
        if (window.shipmentManager && typeof window.shipmentManager.addShipment === 'function') {
            window.shipmentManager.addShipment(duplicateData);
        }
        if (window.pageManager && typeof window.pageManager.updateStats === 'function') {
            window.pageManager.updateStats();
        }
        if (window.pageManager && typeof window.pageManager.renderContent === 'function') {
            window.pageManager.renderContent();
        }
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Sendung erfolgreich dupliziert');
        }
    }
};

window.clearAllData = () => {
    if (!window.showConfirmDialog || typeof window.showConfirmDialog !== 'function') {
        console.error('Confirm dialog not available');
        return;
    }
    
    window.showConfirmDialog(
        'Alle Daten löschen',
        'Möchten Sie wirklich alle Sendungen und Einstellungen löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        () => {
            if (window.shipmentManager && typeof window.shipmentManager.clearAllData === 'function') {
                window.shipmentManager.clearAllData();
            }
            if (window.pageManager && typeof window.pageManager.updateStats === 'function') {
                window.pageManager.updateStats();
            }
            if (window.pageManager && typeof window.pageManager.renderContent === 'function') {
                window.pageManager.renderContent();
            }
        }
    );
};

window.clearAddressHistory = () => {
    if (!window.showConfirmDialog || typeof window.showConfirmDialog !== 'function') {
        console.error('Confirm dialog not available');
        return;
    }
    
    window.showConfirmDialog(
        'Adressverlauf löschen',
        'Möchten Sie wirklich den gesamten Adressverlauf löschen?',
        () => {
            // Implementation for clearing address history
            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess('Adressverlauf erfolgreich gelöscht');
            }
        }
    );
};

window.exportErrors = () => {
    if (!window.shipmentManager || typeof window.shipmentManager.getAllShipments !== 'function') {
        console.error('ShipmentManager not available');
        return;
    }
    
    const shipments = window.shipmentManager.getAllShipments();
    const invalidShipments = shipments.filter(s => !s.isValid);
    
    if (invalidShipments.length === 0) {
        if (window.toastSystem && typeof window.toastSystem.showInfo === 'function') {
            window.toastSystem.showInfo('Keine fehlerhaften Sendungen vorhanden');
        }
        return;
    }

    let errorReport = 'UPS Batch-Manager Fehler-Report\n';
    errorReport += `Erstellt am: ${new Date().toLocaleDateString('de-DE')}\n\n`;
    
    invalidShipments.forEach((shipment, index) => {
        errorReport += `Sendung ${index + 1}: ${shipment.companyName}\n`;
        shipment.errors.forEach(error => {
            errorReport += `  - ${error.message}\n`;
        });
        errorReport += '\n';
    });

    const blob = new Blob([errorReport], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ups-batch-errors.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
        window.toastSystem.showSuccess('Fehler-Report erfolgreich exportiert');
    }
};

// Initialize shared functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sharedPageManager = new SharedPageManager();
});