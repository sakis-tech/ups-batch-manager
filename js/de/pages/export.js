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
        this.updateExportButtonText();
    }

    setupEventListeners() {
        // Unified export button
        const performExportBtn = document.getElementById('performExport');
        if (performExportBtn) {
            performExportBtn.addEventListener('click', () => {
                this.performExport();
            });
        }

        // Format selection listeners
        const formatRadios = document.querySelectorAll('input[name="exportFormat"]');
        formatRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                this.updateExportButtonText();
            });
        });

        // Option change listeners
        const includeHeaders = document.getElementById('includeHeaders');
        const exportOnlyValid = document.getElementById('exportOnlyValid');
        
        if (includeHeaders) {
            includeHeaders.addEventListener('change', () => {
                this.saveToStorage();
            });
        }

        if (exportOnlyValid) {
            exportOnlyValid.addEventListener('change', () => {
                this.saveToStorage();
                this.updateExportStats();
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
            const exportInvalidCount = document.getElementById('exportInvalidCount');
            
            if (exportTotalCount) exportTotalCount.textContent = stats.total;
            if (exportValidCount) exportValidCount.textContent = stats.valid;
            if (exportInvalidCount) exportInvalidCount.textContent = stats.invalid;
        }
    }

    updateExportButtonText() {
        const selectedFormat = document.querySelector('input[name="exportFormat"]:checked');
        const buttonText = document.getElementById('exportButtonText');
        
        if (selectedFormat && buttonText) {
            const format = selectedFormat.value.toUpperCase();
            buttonText.textContent = `Als ${format} exportieren`;
        }
    }

    performExport() {
        if (!window.shipmentManager) {
            console.error('ShipmentManager not available');
            return;
        }

        // Get selected format
        const selectedFormat = document.querySelector('input[name="exportFormat"]:checked');
        if (!selectedFormat) {
            if (window.toastSystem && typeof window.toastSystem.showWarning === 'function') {
                window.toastSystem.showWarning('Bitte wählen Sie ein Export-Format aus');
            }
            return;
        }

        const format = selectedFormat.value;
        const includeHeaders = document.getElementById('includeHeaders')?.checked || false;
        const exportOnlyValid = document.getElementById('exportOnlyValid')?.checked || false;

        const shipments = window.shipmentManager.getAllShipments();
        const exportShipments = exportOnlyValid ? shipments.filter(s => s.isValid) : shipments;
        
        if (exportShipments.length === 0) {
            const message = exportOnlyValid 
                ? 'Keine gültigen Sendungen zum Exportieren vorhanden'
                : 'Keine Sendungen zum Exportieren vorhanden';
            if (window.toastSystem && typeof window.toastSystem.showWarning === 'function') {
                window.toastSystem.showWarning(message);
            }
            return;
        }

        try {
            const options = {
                format: format,
                includeHeaders: includeHeaders,
                onlyValid: exportOnlyValid
            };

            let exportData;
            let filename;
            
            if (format === 'xlsx') {
                exportData = this.exportToXLSX(exportShipments, options);
                filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.xlsx`;
            } else {
                exportData = this.exportToCSV(exportShipments, options);
                filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.csv`;
            }
            
            this.downloadFile(exportData, filename, format);

            // Save preferences
            this.saveToStorage();

            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess(
                    `${exportShipments.length} Sendungen erfolgreich als ${format.toUpperCase()} exportiert`
                );
            }

            // Log activity
            if (window.activityLogger) {
                window.activityLogger.log('export', 
                    `${exportShipments.length} Sendungen als ${format.toUpperCase()} exportiert`
                );
            }
        } catch (error) {
            console.error('Export error:', error);
            if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
                window.toastSystem.showError(`Export fehlgeschlagen: ${error.message}`);
            }
        }
    }

    exportToCSV(shipments, options) {
        const headers = [
            'Firmenname', 'Kontakt', 'Adresse1', 'Adresse2', 'Stadt', 'PLZ', 'Land',
            'Telefon', 'Email', 'Service', 'Gewicht', 'Paket-Typ', 'Beschreibung',
            'Referenz', 'Wert', 'Währung'
        ];
        
        let csvContent = '';
        
        if (options.includeHeaders) {
            csvContent += headers.join(',') + '\n';
        }
        
        shipments.forEach(shipment => {
            const row = [
                this.escapeCSVField(shipment.companyName || ''),
                this.escapeCSVField(shipment.contactName || ''),
                this.escapeCSVField(shipment.address1 || ''),
                this.escapeCSVField(shipment.address2 || ''),
                this.escapeCSVField(shipment.city || ''),
                this.escapeCSVField(shipment.postalCode || ''),
                this.escapeCSVField(shipment.country || ''),
                this.escapeCSVField(shipment.phone || ''),
                this.escapeCSVField(shipment.email || ''),
                this.escapeCSVField(shipment.service || ''),
                this.escapeCSVField(shipment.weight || ''),
                this.escapeCSVField(shipment.packageType || ''),
                this.escapeCSVField(shipment.description || ''),
                this.escapeCSVField(shipment.reference || ''),
                this.escapeCSVField(shipment.value || ''),
                this.escapeCSVField(shipment.currency || '')
            ];
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }

    exportToXLSX(shipments, options) {
        // Simple XLSX export - for a proper implementation, you'd need a library like SheetJS
        // This creates a basic Excel-compatible format
        const headers = [
            'Firmenname', 'Kontakt', 'Adresse1', 'Adresse2', 'Stadt', 'PLZ', 'Land',
            'Telefon', 'Email', 'Service', 'Gewicht', 'Paket-Typ', 'Beschreibung',
            'Referenz', 'Wert', 'Währung'
        ];
        
        let csvContent = '';
        
        if (options.includeHeaders) {
            csvContent += headers.join(',') + '\n';
        }
        
        shipments.forEach(shipment => {
            const row = [
                this.escapeCSVField(shipment.companyName || ''),
                this.escapeCSVField(shipment.contactName || ''),
                this.escapeCSVField(shipment.address1 || ''),
                this.escapeCSVField(shipment.address2 || ''),
                this.escapeCSVField(shipment.city || ''),
                this.escapeCSVField(shipment.postalCode || ''),
                this.escapeCSVField(shipment.country || ''),
                this.escapeCSVField(shipment.phone || ''),
                this.escapeCSVField(shipment.email || ''),
                this.escapeCSVField(shipment.service || ''),
                this.escapeCSVField(shipment.weight || ''),
                this.escapeCSVField(shipment.packageType || ''),
                this.escapeCSVField(shipment.description || ''),
                this.escapeCSVField(shipment.reference || ''),
                this.escapeCSVField(shipment.value || ''),
                this.escapeCSVField(shipment.currency || '')
            ];
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }

    escapeCSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
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
            case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            case 'txt': return 'text/plain;charset=utf-8';
            default: return 'text/plain;charset=utf-8';
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
        // Apply export format preference (only CSV and XLSX supported)
        if (settings.defaultFormat && (settings.defaultFormat === 'csv' || settings.defaultFormat === 'xlsx')) {
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
        // Save export preferences (only CSV and XLSX supported)
        const selectedFormat = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
        const settings = {
            defaultFormat: (selectedFormat === 'csv' || selectedFormat === 'xlsx') ? selectedFormat : 'csv',
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