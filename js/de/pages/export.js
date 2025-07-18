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
        // UPS-konforme Feldnamen gemäß UPS Batch File Spezifikation
        const headers = [
            'Contact Name', 'Company or Name', 'Country', 'Address 1', 'Address 2', 'Address 3',
            'City', 'State/Province/Other', 'Postal Code', 'Telephone', 'Extension',
            'Residential Indicator', 'E-mail Address', 'Packaging Type', 'Customs Value',
            'Weight', 'Length', 'Width', 'Height', 'Unit of Measure', 'Description of Goods',
            'Documents of No Commercial Value', 'GNIFC (Goods not in Free Circulation)',
            'Declared Value', 'Service', 'Delivery Confirmation',
            'Shipper Release/Deliver Wthout Signature', 'Return of Document',
            'Deliver on Saturday', 'UPS carbon neutral', 'Large Package', 'Additional Handling',
            'Reference 1', 'Reference 2', 'Reference 3', 'E-mail Notification 1 - Address',
            'E-mail Notification 1 - Ship', 'E-mail Notification 1 - Exception',
            'E-mail Notification 1 - Delivery', 'E-mail Notification 2 - Address',
            'E-mail Notification 2 - Ship', 'E-mail Notification 2 - Exception',
            'E-mail Notification 2 - Delivery', 'E-mail Notification 3 - Address',
            'E-mail Notification 3 - Ship', 'E-mail Notification 3 - Exception',
            'E-mail Notification 3 - Delivery', 'E-mail Notification 4 - Address',
            'E-mail Notification 4 - Ship', 'E-mail Notification 4 - Exception',
            'E-mail Notification 4 - Delivery', 'E-mail Notification 5 - Address',
            'E-mail Notification 5 - Ship', 'E-mail Notification 5 - Exception',
            'E-mail Notification 5 - Delivery', 'E-mail Message', 'E-mail Failure Address',
            'UPS Premium Care', 'Location ID', 'Notification Media Type',
            'Notification Language', 'Notification Address', 'ADL COD Value',
            'ADL Deliver to Addressee', 'ADL Shipper Media Type', 'ADL Shipper Language',
            'ADL Shipper Notification', 'ADL Direct Delivery Only',
            'Electronic Package Release Authentication', 'Lithium Ion Alone',
            'Lithium Ion In Equipment', 'Lithium Ion With_Equipment', 'Lithium Metal Alone',
            'Lithium Metal In Equipment', 'Lithium Metal With Equipment',
            'Weekend Commercial Delivery', 'Dry Ice Weight', 'Merchandise Description',
            'UPS SurePost®Limited Quantity/Lithium Battery'
        ];
        
        let csvContent = '';
        
        if (options.includeHeaders) {
            csvContent += headers.join(',') + '\n';
        }
        
        shipments.forEach(shipment => {
            const row = [
                this.escapeCSVField(shipment.contactName || ''),
                this.escapeCSVField(shipment.companyName || ''),
                this.escapeCSVField(shipment.country || ''),
                this.escapeCSVField(shipment.address1 || ''),
                this.escapeCSVField(shipment.address2 || ''),
                this.escapeCSVField(''), // Address 3
                this.escapeCSVField(shipment.city || ''),
                this.escapeCSVField(''), // State/Province/Other
                this.escapeCSVField(shipment.postalCode || ''),
                this.escapeCSVField(shipment.phone || ''),
                this.escapeCSVField(''), // Extension
                this.escapeCSVField(''), // Residential Indicator
                this.escapeCSVField(shipment.email || ''),
                this.escapeCSVField(shipment.packageType || ''),
                this.escapeCSVField(''), // Customs Value
                this.escapeCSVField(shipment.weight || ''),
                this.escapeCSVField(''), // Length
                this.escapeCSVField(''), // Width
                this.escapeCSVField(''), // Height
                this.escapeCSVField(''), // Unit of Measure
                this.escapeCSVField(shipment.description || ''),
                this.escapeCSVField(''), // Documents of No Commercial Value
                this.escapeCSVField(''), // GNIFC
                this.escapeCSVField(shipment.value || ''),
                this.escapeCSVField(shipment.service || ''),
                this.escapeCSVField(''), // Delivery Confirmation
                this.escapeCSVField(''), // Shipper Release
                this.escapeCSVField(''), // Return of Document
                this.escapeCSVField(''), // Deliver on Saturday
                this.escapeCSVField(''), // UPS carbon neutral
                this.escapeCSVField(''), // Large Package
                this.escapeCSVField(''), // Additional Handling
                this.escapeCSVField(shipment.reference || ''),
                this.escapeCSVField(''), // Reference 2
                this.escapeCSVField(''), // Reference 3
                this.escapeCSVField(''), // E-mail Notification 1 - Address
                this.escapeCSVField(''), // E-mail Notification 1 - Ship
                this.escapeCSVField(''), // E-mail Notification 1 - Exception
                this.escapeCSVField(''), // E-mail Notification 1 - Delivery
                this.escapeCSVField(''), // E-mail Notification 2 - Address
                this.escapeCSVField(''), // E-mail Notification 2 - Ship
                this.escapeCSVField(''), // E-mail Notification 2 - Exception
                this.escapeCSVField(''), // E-mail Notification 2 - Delivery
                this.escapeCSVField(''), // E-mail Notification 3 - Address
                this.escapeCSVField(''), // E-mail Notification 3 - Ship
                this.escapeCSVField(''), // E-mail Notification 3 - Exception
                this.escapeCSVField(''), // E-mail Notification 3 - Delivery
                this.escapeCSVField(''), // E-mail Notification 4 - Address
                this.escapeCSVField(''), // E-mail Notification 4 - Ship
                this.escapeCSVField(''), // E-mail Notification 4 - Exception
                this.escapeCSVField(''), // E-mail Notification 4 - Delivery
                this.escapeCSVField(''), // E-mail Notification 5 - Address
                this.escapeCSVField(''), // E-mail Notification 5 - Ship
                this.escapeCSVField(''), // E-mail Notification 5 - Exception
                this.escapeCSVField(''), // E-mail Notification 5 - Delivery
                this.escapeCSVField(''), // E-mail Message
                this.escapeCSVField(''), // E-mail Failure Address
                this.escapeCSVField(''), // UPS Premium Care
                this.escapeCSVField(''), // Location ID
                this.escapeCSVField(''), // Notification Media Type
                this.escapeCSVField(''), // Notification Language
                this.escapeCSVField(''), // Notification Address
                this.escapeCSVField(''), // ADL COD Value
                this.escapeCSVField(''), // ADL Deliver to Addressee
                this.escapeCSVField(''), // ADL Shipper Media Type
                this.escapeCSVField(''), // ADL Shipper Language
                this.escapeCSVField(''), // ADL Shipper Notification
                this.escapeCSVField(''), // ADL Direct Delivery Only
                this.escapeCSVField(''), // Electronic Package Release Authentication
                this.escapeCSVField(''), // Lithium Ion Alone
                this.escapeCSVField(''), // Lithium Ion In Equipment
                this.escapeCSVField(''), // Lithium Ion With_Equipment
                this.escapeCSVField(''), // Lithium Metal Alone
                this.escapeCSVField(''), // Lithium Metal In Equipment
                this.escapeCSVField(''), // Lithium Metal With Equipment
                this.escapeCSVField(''), // Weekend Commercial Delivery
                this.escapeCSVField(''), // Dry Ice Weight
                this.escapeCSVField(''), // Merchandise Description
                this.escapeCSVField('') // UPS SurePost®Limited Quantity/Lithium Battery
            ];
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }

    exportToXLSX(shipments, options) {
        // UPS-konforme XLSX-Export mit Tab-Trennzeichen
        const headers = [
            'Contact Name', 'Company or Name', 'Country', 'Address 1', 'Address 2', 'Address 3',
            'City', 'State/Province/Other', 'Postal Code', 'Telephone', 'Extension',
            'Residential Indicator', 'E-mail Address', 'Packaging Type', 'Customs Value',
            'Weight', 'Length', 'Width', 'Height', 'Unit of Measure', 'Description of Goods',
            'Documents of No Commercial Value', 'GNIFC (Goods not in Free Circulation)',
            'Declared Value', 'Service', 'Delivery Confirmation',
            'Shipper Release/Deliver Wthout Signature', 'Return of Document',
            'Deliver on Saturday', 'UPS carbon neutral', 'Large Package', 'Additional Handling',
            'Reference 1', 'Reference 2', 'Reference 3', 'E-mail Notification 1 - Address',
            'E-mail Notification 1 - Ship', 'E-mail Notification 1 - Exception',
            'E-mail Notification 1 - Delivery', 'E-mail Notification 2 - Address',
            'E-mail Notification 2 - Ship', 'E-mail Notification 2 - Exception',
            'E-mail Notification 2 - Delivery', 'E-mail Notification 3 - Address',
            'E-mail Notification 3 - Ship', 'E-mail Notification 3 - Exception',
            'E-mail Notification 3 - Delivery', 'E-mail Notification 4 - Address',
            'E-mail Notification 4 - Ship', 'E-mail Notification 4 - Exception',
            'E-mail Notification 4 - Delivery', 'E-mail Notification 5 - Address',
            'E-mail Notification 5 - Ship', 'E-mail Notification 5 - Exception',
            'E-mail Notification 5 - Delivery', 'E-mail Message', 'E-mail Failure Address',
            'UPS Premium Care', 'Location ID', 'Notification Media Type',
            'Notification Language', 'Notification Address', 'ADL COD Value',
            'ADL Deliver to Addressee', 'ADL Shipper Media Type', 'ADL Shipper Language',
            'ADL Shipper Notification', 'ADL Direct Delivery Only',
            'Electronic Package Release Authentication', 'Lithium Ion Alone',
            'Lithium Ion In Equipment', 'Lithium Ion With_Equipment', 'Lithium Metal Alone',
            'Lithium Metal In Equipment', 'Lithium Metal With Equipment',
            'Weekend Commercial Delivery', 'Dry Ice Weight', 'Merchandise Description',
            'UPS SurePost®Limited Quantity/Lithium Battery'
        ];
        
        let csvContent = '';
        
        if (options.includeHeaders) {
            csvContent += headers.join(',') + '\n';
        }
        
        shipments.forEach(shipment => {
            const row = [
                this.escapeCSVField(shipment.contactName || ''),
                this.escapeCSVField(shipment.companyName || ''),
                this.escapeCSVField(shipment.country || ''),
                this.escapeCSVField(shipment.address1 || ''),
                this.escapeCSVField(shipment.address2 || ''),
                this.escapeCSVField(''), // Address 3
                this.escapeCSVField(shipment.city || ''),
                this.escapeCSVField(''), // State/Province/Other
                this.escapeCSVField(shipment.postalCode || ''),
                this.escapeCSVField(shipment.phone || ''),
                this.escapeCSVField(''), // Extension
                this.escapeCSVField(''), // Residential Indicator
                this.escapeCSVField(shipment.email || ''),
                this.escapeCSVField(shipment.packageType || ''),
                this.escapeCSVField(''), // Customs Value
                this.escapeCSVField(shipment.weight || ''),
                this.escapeCSVField(''), // Length
                this.escapeCSVField(''), // Width
                this.escapeCSVField(''), // Height
                this.escapeCSVField(''), // Unit of Measure
                this.escapeCSVField(shipment.description || ''),
                this.escapeCSVField(''), // Documents of No Commercial Value
                this.escapeCSVField(''), // GNIFC
                this.escapeCSVField(shipment.value || ''),
                this.escapeCSVField(shipment.service || ''),
                this.escapeCSVField(''), // Delivery Confirmation
                this.escapeCSVField(''), // Shipper Release
                this.escapeCSVField(''), // Return of Document
                this.escapeCSVField(''), // Deliver on Saturday
                this.escapeCSVField(''), // UPS carbon neutral
                this.escapeCSVField(''), // Large Package
                this.escapeCSVField(''), // Additional Handling
                this.escapeCSVField(shipment.reference || ''),
                this.escapeCSVField(''), // Reference 2
                this.escapeCSVField(''), // Reference 3
                this.escapeCSVField(''), // E-mail Notification 1 - Address
                this.escapeCSVField(''), // E-mail Notification 1 - Ship
                this.escapeCSVField(''), // E-mail Notification 1 - Exception
                this.escapeCSVField(''), // E-mail Notification 1 - Delivery
                this.escapeCSVField(''), // E-mail Notification 2 - Address
                this.escapeCSVField(''), // E-mail Notification 2 - Ship
                this.escapeCSVField(''), // E-mail Notification 2 - Exception
                this.escapeCSVField(''), // E-mail Notification 2 - Delivery
                this.escapeCSVField(''), // E-mail Notification 3 - Address
                this.escapeCSVField(''), // E-mail Notification 3 - Ship
                this.escapeCSVField(''), // E-mail Notification 3 - Exception
                this.escapeCSVField(''), // E-mail Notification 3 - Delivery
                this.escapeCSVField(''), // E-mail Notification 4 - Address
                this.escapeCSVField(''), // E-mail Notification 4 - Ship
                this.escapeCSVField(''), // E-mail Notification 4 - Exception
                this.escapeCSVField(''), // E-mail Notification 4 - Delivery
                this.escapeCSVField(''), // E-mail Notification 5 - Address
                this.escapeCSVField(''), // E-mail Notification 5 - Ship
                this.escapeCSVField(''), // E-mail Notification 5 - Exception
                this.escapeCSVField(''), // E-mail Notification 5 - Delivery
                this.escapeCSVField(''), // E-mail Message
                this.escapeCSVField(''), // E-mail Failure Address
                this.escapeCSVField(''), // UPS Premium Care
                this.escapeCSVField(''), // Location ID
                this.escapeCSVField(''), // Notification Media Type
                this.escapeCSVField(''), // Notification Language
                this.escapeCSVField(''), // Notification Address
                this.escapeCSVField(''), // ADL COD Value
                this.escapeCSVField(''), // ADL Deliver to Addressee
                this.escapeCSVField(''), // ADL Shipper Media Type
                this.escapeCSVField(''), // ADL Shipper Language
                this.escapeCSVField(''), // ADL Shipper Notification
                this.escapeCSVField(''), // ADL Direct Delivery Only
                this.escapeCSVField(''), // Electronic Package Release Authentication
                this.escapeCSVField(''), // Lithium Ion Alone
                this.escapeCSVField(''), // Lithium Ion In Equipment
                this.escapeCSVField(''), // Lithium Ion With_Equipment
                this.escapeCSVField(''), // Lithium Metal Alone
                this.escapeCSVField(''), // Lithium Metal In Equipment
                this.escapeCSVField(''), // Lithium Metal With Equipment
                this.escapeCSVField(''), // Weekend Commercial Delivery
                this.escapeCSVField(''), // Dry Ice Weight
                this.escapeCSVField(''), // Merchandise Description
                this.escapeCSVField('') // UPS SurePost®Limited Quantity/Lithium Battery
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