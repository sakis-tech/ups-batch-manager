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
            
            if (format === 'xml') {
                exportData = this.exportToXML(exportShipments, options);
                filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.xml`;
            } else if (format === 'ssv') {
                exportData = this.exportToSSV(exportShipments, options);
                filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.ssv`;
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
        // Verwende Export-Handler für UPS-konforme CSV-Erstellung
        if (window.exportHandler && typeof window.exportHandler.exportToCSV === 'function') {
            return window.exportHandler.exportToCSV(shipments);
        }
        
        // Fallback wenn Export-Handler nicht verfügbar ist
        console.warn('Export-Handler nicht verfügbar, verwende vereinfachten CSV-Export');
        
        if (!window.UPS_FIELDS) {
            throw new Error('UPS-Feldkonfiguration nicht verfügbar');
        }

        const headers = Object.keys(window.UPS_FIELDS);
        let csvContent = '';
        
        if (options.includeHeaders) {
            csvContent += headers.join(',') + '\n';
        }
        
        shipments.forEach(shipment => {
            const row = Object.entries(window.UPS_FIELDS).map(([upsFieldName, fieldConfig]) => {
                let value = shipment[fieldConfig.key] || '';
                return this.escapeCSVField(String(value));
            });
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }

    exportToXML(shipments, options) {
        // Verwende Export-Handler für UPS-konforme XML-Erstellung
        if (window.exportHandler && typeof window.exportHandler.exportToXML === 'function') {
            return window.exportHandler.exportToXML(shipments);
        }
        
        // Fallback wenn Export-Handler nicht verfügbar ist
        console.warn('Export-Handler nicht verfügbar, verwende vereinfachten XML-Export');
        
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlContent += '<ups-batch>\n';
        xmlContent += `  <created-at>${new Date().toISOString()}</created-at>\n`;
        xmlContent += `  <shipment-count>${shipments.length}</shipment-count>\n`;
        xmlContent += '  <shipments>\n';
        
        shipments.forEach((shipment, index) => {
            xmlContent += `    <shipment id="${index + 1}">\n`;
            
            if (window.UPS_FIELDS) {
                Object.entries(window.UPS_FIELDS).forEach(([upsFieldName, fieldConfig]) => {
                    let value = shipment[fieldConfig.key] || '';
                    const xmlTagName = upsFieldName.toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    xmlContent += `      <${xmlTagName}>${this.escapeXMLField(String(value))}</${xmlTagName}>\n`;
                });
            }
            
            xmlContent += `    </shipment>\n`;
        });
        
        xmlContent += '  </shipments>\n';
        xmlContent += '</ups-batch>\n';
        
        return xmlContent;
    }

    exportToSSV(shipments, options) {
        // Verwende Export-Handler für UPS-konforme SSV-Erstellung
        if (window.exportHandler && typeof window.exportHandler.exportToSSV === 'function') {
            return window.exportHandler.exportToSSV(shipments);
        }
        
        // Fallback wenn Export-Handler nicht verfügbar ist
        console.warn('Export-Handler nicht verfügbar, verwende vereinfachten SSV-Export');
        
        if (!window.UPS_FIELDS) {
            throw new Error('UPS-Feldkonfiguration nicht verfügbar');
        }

        const headers = Object.keys(window.UPS_FIELDS);
        let ssvContent = '';
        
        if (options.includeHeaders) {
            ssvContent += headers.join(';') + '\n';
        }
        
        shipments.forEach(shipment => {
            const row = Object.entries(window.UPS_FIELDS).map(([upsFieldName, fieldConfig]) => {
                let value = shipment[fieldConfig.key] || '';
                return this.escapeSSVField(String(value));
            });
            ssvContent += row.join(';') + '\n';
        });
        
        return ssvContent;
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

    escapeXMLField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
    }

    escapeSSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
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
            case 'xml': return 'application/xml;charset=utf-8';
            case 'ssv': return 'text/plain;charset=utf-8';
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
        // Apply export format preference (CSV, XML, SSV supported)
        if (settings.defaultFormat && ['csv', 'xml', 'ssv'].includes(settings.defaultFormat)) {
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
        // Save export preferences (CSV, XML, SSV supported)
        const selectedFormat = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
        const settings = {
            defaultFormat: ['csv', 'xml', 'ssv'].includes(selectedFormat) ? selectedFormat : 'csv',
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