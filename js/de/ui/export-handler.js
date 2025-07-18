// Export-Handler für deutsche UPS Batch Manager Oberfläche
class ExportHandlerDE {
    constructor() {
        this.exportFormats = {
            csv: 'Comma Separated Values (CSV)',
            xlsx: 'Microsoft Excel (XLSX)'
        };
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Schnell-Export Buttons
        const quickExportCSV = document.getElementById('quickExportCSV');
        const quickExportXLSX = document.getElementById('quickExportXLSX');
        
        if (quickExportCSV) {
            quickExportCSV.addEventListener('click', () => {
                this.performQuickExport('csv');
            });
        }
        
        if (quickExportXLSX) {
            quickExportXLSX.addEventListener('click', () => {
                this.performQuickExport('xlsx');
            });
        }
    }

    // Schnell-Export ohne Modal
    performQuickExport(format) {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        
        if (validShipments.length === 0) {
            window.toastSystem?.showWarning('Keine gültigen Sendungen zum Exportieren vorhanden');
            return;
        }

        try {
            let exportData;
            let filename = `ups-batch-${new Date().toISOString().slice(0, 10)}`;
            
            if (format === 'xlsx') {
                exportData = this.exportToXLSX(validShipments);
                filename += '.xlsx';
            } else {
                exportData = this.exportToCSV(validShipments);
                filename += '.csv';
            }
            
            this.downloadFile(exportData, filename, format);
            
            window.toastSystem?.showSuccess(
                `${validShipments.length} Sendungen erfolgreich als ${format.toUpperCase()} exportiert`
            );
        } catch (error) {
            console.error('Export error:', error);
            window.toastSystem?.showError(`Export fehlgeschlagen: ${error.message}`);
        }
    }

    // Export zu CSV mit UPS-konformen Feldnamen
    exportToCSV(shipments) {
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
        
        let csvContent = headers.join(',') + '\n';
        
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

    // Export zu XLSX - UPS-konforme Excel-Datei erstellen
    exportToXLSX(shipments) {
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
        
        // Erstelle CSV-Inhalt mit Tab-Trennzeichen für Excel
        let xlsxContent = headers.join('\t') + '\n';
        
        shipments.forEach(shipment => {
            const row = [
                shipment.contactName || '',
                shipment.companyName || '',
                shipment.country || '',
                shipment.address1 || '',
                shipment.address2 || '',
                '', // Address 3
                shipment.city || '',
                '', // State/Province/Other
                shipment.postalCode || '',
                shipment.phone || '',
                '', // Extension
                '', // Residential Indicator
                shipment.email || '',
                shipment.packageType || '',
                '', // Customs Value
                shipment.weight || '',
                '', // Length
                '', // Width
                '', // Height
                '', // Unit of Measure
                shipment.description || '',
                '', // Documents of No Commercial Value
                '', // GNIFC
                shipment.value || '',
                shipment.service || '',
                '', // Delivery Confirmation
                '', // Shipper Release
                '', // Return of Document
                '', // Deliver on Saturday
                '', // UPS carbon neutral
                '', // Large Package
                '', // Additional Handling
                shipment.reference || '',
                '', // Reference 2
                '', // Reference 3
                '', // E-mail Notification 1 - Address
                '', // E-mail Notification 1 - Ship
                '', // E-mail Notification 1 - Exception
                '', // E-mail Notification 1 - Delivery
                '', // E-mail Notification 2 - Address
                '', // E-mail Notification 2 - Ship
                '', // E-mail Notification 2 - Exception
                '', // E-mail Notification 2 - Delivery
                '', // E-mail Notification 3 - Address
                '', // E-mail Notification 3 - Ship
                '', // E-mail Notification 3 - Exception
                '', // E-mail Notification 3 - Delivery
                '', // E-mail Notification 4 - Address
                '', // E-mail Notification 4 - Ship
                '', // E-mail Notification 4 - Exception
                '', // E-mail Notification 4 - Delivery
                '', // E-mail Notification 5 - Address
                '', // E-mail Notification 5 - Ship
                '', // E-mail Notification 5 - Exception
                '', // E-mail Notification 5 - Delivery
                '', // E-mail Message
                '', // E-mail Failure Address
                '', // UPS Premium Care
                '', // Location ID
                '', // Notification Media Type
                '', // Notification Language
                '', // Notification Address
                '', // ADL COD Value
                '', // ADL Deliver to Addressee
                '', // ADL Shipper Media Type
                '', // ADL Shipper Language
                '', // ADL Shipper Notification
                '', // ADL Direct Delivery Only
                '', // Electronic Package Release Authentication
                '', // Lithium Ion Alone
                '', // Lithium Ion In Equipment
                '', // Lithium Ion With_Equipment
                '', // Lithium Metal Alone
                '', // Lithium Metal In Equipment
                '', // Lithium Metal With Equipment
                '', // Weekend Commercial Delivery
                '', // Dry Ice Weight
                '', // Merchandise Description
                '' // UPS SurePost®Limited Quantity/Lithium Battery
            ];
            xlsxContent += row.map(cell => this.escapeExcelField(cell)).join('\t') + '\n';
        });
        
        return xlsxContent;
    }

    // Excel-Feld escapen
    escapeExcelField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        // Für Excel: Tabs und Zeilenumbrüche entfernen
        return str.replace(/\t/g, ' ').replace(/\n/g, ' ').replace(/\r/g, '');
    }

    // CSV-Feld escapen
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

    // MIME-Type ermitteln
    getMimeType(format) {
        switch (format) {
            case 'csv': 
                return 'text/csv;charset=utf-8';
            case 'xlsx': 
                return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8';
            default: 
                return 'text/plain;charset=utf-8';
        }
    }

    // Datei herunterladen
    downloadFile(content, filename, format) {
        const mimeType = this.getMimeType(format);
        
        // Für XLSX: BOM hinzufügen für bessere Excel-Kompatibilität
        let fileContent = content;
        if (format === 'xlsx') {
            // BOM (Byte Order Mark) für UTF-8
            fileContent = '\uFEFF' + content;
        }
        
        const blob = new Blob([fileContent], { type: mimeType });
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

    // Export-Statistiken für Debugging
    getExportStatistics() {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        const invalidShipments = shipments.filter(s => !s.isValid);
        
        return {
            total: shipments.length,
            valid: validShipments.length,
            invalid: invalidShipments.length,
            validPercentage: shipments.length > 0 ? Math.round((validShipments.length / shipments.length) * 100) : 0,
            totalWeight: validShipments.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0),
            countries: [...new Set(validShipments.map(s => s.country).filter(Boolean))],
            services: [...new Set(validShipments.map(s => s.service).filter(Boolean))]
        };
    }
}

// Globale Instanz für Rückwärtskompatibilität
window.exportHandler = new ExportHandlerDE();
