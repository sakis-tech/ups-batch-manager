// Export page specific functionality
class ExportPage {
    constructor() {
        this.selectedShipments = new Set();
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStats();
        this.updateExportStats();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Export buttons
        const exportBatchBtn = document.getElementById('exportBatchBtn');
        const quickExportCSV = document.getElementById('quickExportCSV');
        const quickExportSSV = document.getElementById('quickExportSSV');

        if (exportBatchBtn) {
            exportBatchBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }

        if (quickExportCSV) {
            quickExportCSV.addEventListener('click', () => {
                this.performQuickExport('csv');
            });
        }

        if (quickExportSSV) {
            quickExportSSV.addEventListener('click', () => {
                this.performQuickExport('ssv');
            });
        }

        // Update stats when shipment manager changes
        if (window.shipmentManager) {
            window.addEventListener('storage', (e) => {
                if (e.key === 'upsShipments') {
                    this.updateStats();
                    this.updateExportStats();
                }
            });
        }
    }

    updateStats() {
        if (window.sharedPageManager) {
            window.sharedPageManager.updateStats();
        }
    }

    updateExportStats() {
        if (window.shipmentManager) {
            const stats = window.shipmentManager.getStatistics();
            
            const exportTotalCount = document.getElementById('exportTotalCount');
            const exportValidCount = document.getElementById('exportValidCount');
            const exportSelectedCount = document.getElementById('exportSelectedCount');
            
            if (exportTotalCount) exportTotalCount.textContent = stats.total;
            if (exportValidCount) exportValidCount.textContent = stats.valid;
            if (exportSelectedCount) exportSelectedCount.textContent = this.selectedShipments.size;
        }
    }

    showExportModal() {
        if (window.exportHandler && typeof window.exportHandler.showExportModal === 'function') {
            window.exportHandler.showExportModal();
        } else {
            // Fallback export implementation
            this.performBasicExport();
        }
    }

    performBasicExport() {
        if (!window.shipmentManager) {
            console.error('ShipmentManager not available');
            return;
        }

        try {
            const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
            const includeHeaders = document.getElementById('includeHeaders')?.checked || false;
            const onlyValid = document.getElementById('exportOnlyValid')?.checked || false;

            const csvData = window.shipmentManager.exportToUPSFormat({
                format,
                includeHeaders,
                onlyValid
            });

            const filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.${format}`;
            this.downloadFile(csvData, filename, format);

            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess(`Batch-Datei "${filename}" erfolgreich exportiert`);
            }
        } catch (error) {
            console.error('Export error:', error);
            if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
                window.toastSystem.showError(`Export fehlgeschlagen: ${error.message}`);
            }
        }
    }

    performQuickExport(format) {
        if (!window.shipmentManager) {
            console.error('ShipmentManager not available');
            return;
        }

        const shipments = window.shipmentManager.getAllShipments();
        const validShipments = shipments.filter(s => s.isValid);
        
        if (validShipments.length === 0) {
            if (window.toastSystem && typeof window.toastSystem.showWarning === 'function') {
                window.toastSystem.showWarning('Keine gültigen Sendungen zum Exportieren vorhanden');
            }
            return;
        }

        try {
            const options = {
                format: format,
                includeHeaders: true,
                onlyValid: true
            };

            const csvData = window.shipmentManager.exportToUPSFormat(options);
            const filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.${format}`;
            
            this.downloadFile(csvData, filename, format);

            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess(
                    `${validShipments.length} Sendungen erfolgreich als ${format.toUpperCase()} exportiert`
                );
            }
        } catch (error) {
            console.error('Quick export error:', error);
            if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
                window.toastSystem.showError(`Export fehlgeschlagen: ${error.message}`);
            }
        }
    }

    downloadFile(content, filename, format) {
        const mimeType = this.getMimeType(format);
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

    getMimeType(format) {
        switch (format) {
            case 'csv': return 'text/csv;charset=utf-8';
            case 'ssv': return 'text/csv;charset=utf-8';
            case 'txt': return 'text/plain;charset=utf-8';
            default: return 'text/plain;charset=utf-8';
        }
    }

    exportSummary() {
        if (!window.shipmentManager) {
            console.error('ShipmentManager not available');
            return;
        }

        const stats = window.shipmentManager.getStatistics();
        const summary = `UPS Batch-Manager Zusammenfassung
Erstellt am: ${new Date().toLocaleDateString('de-DE')}

Statistiken:
- Gesamt Sendungen: ${stats.total}
- Gültige Sendungen: ${stats.valid}
- Fehlerhafte Sendungen: ${stats.invalid}
- Gesamtgewicht: ${stats.totalWeight} kg
- Gültigkeitsrate: ${stats.validPercentage}%
`;

        this.downloadFile(summary, 'ups-batch-summary.txt', 'txt');
        
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Zusammenfassung erfolgreich exportiert');
        }
    }

    loadFromStorage() {
        // Load any export-specific settings
        const exportSettings = localStorage.getItem('exportSettings');
        if (exportSettings) {
            try {
                const settings = JSON.parse(exportSettings);
                this.applyExportSettings(settings);
            } catch (error) {
                console.error('Error loading export settings:', error);
            }
        }
    }

    applyExportSettings(settings) {
        // Apply export format preference
        if (settings.defaultFormat) {
            const formatRadio = document.querySelector(`input[name="exportFormat"][value="${settings.defaultFormat}"]`);
            if (formatRadio) {
                formatRadio.checked = true;
            }
        }

        // Apply other export preferences
        if (settings.includeHeaders !== undefined) {
            const includeHeadersCheckbox = document.getElementById('includeHeaders');
            if (includeHeadersCheckbox) {
                includeHeadersCheckbox.checked = settings.includeHeaders;
            }
        }

        if (settings.exportOnlyValid !== undefined) {
            const exportOnlyValidCheckbox = document.getElementById('exportOnlyValid');
            if (exportOnlyValidCheckbox) {
                exportOnlyValidCheckbox.checked = settings.exportOnlyValid;
            }
        }
    }

    saveToStorage() {
        // Save export preferences
        const settings = {
            defaultFormat: document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv',
            includeHeaders: document.getElementById('includeHeaders')?.checked || false,
            exportOnlyValid: document.getElementById('exportOnlyValid')?.checked || false
        };
        
        localStorage.setItem('exportSettings', JSON.stringify(settings));
    }

    renderContent() {
        this.updateExportStats();
    }
}

// Global functions for HTML onclick handlers
window.exportSummary = () => {
    if (window.exportPage) {
        window.exportPage.exportSummary();
    }
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
        URL.revokeObjectURL(url);
    }

    if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
        window.toastSystem.showSuccess('Fehler-Report erfolgreich exportiert');
    }
};

// Initialize export page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.exportPage = new ExportPage();
    window.pageManager = window.exportPage; // Set as global page manager
});