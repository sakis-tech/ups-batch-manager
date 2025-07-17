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

    // Export zu CSV
    exportToCSV(shipments) {
        const headers = [
            'Firmenname', 'Kontakt', 'Adresse1', 'Adresse2', 'Stadt', 'PLZ', 'Land',
            'Telefon', 'Email', 'Service', 'Gewicht', 'Paket-Typ', 'Beschreibung',
            'Referenz', 'Wert', 'Währung'
        ];
        
        let csvContent = headers.join(',') + '\n';
        
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

    // Export zu XLSX - Verbesserte Excel-Datei erstellen
    exportToXLSX(shipments) {
        const headers = [
            'Firmenname', 'Kontakt', 'Adresse1', 'Adresse2', 'Stadt', 'PLZ', 'Land',
            'Telefon', 'Email', 'Service', 'Gewicht', 'Paket-Typ', 'Beschreibung',
            'Referenz', 'Wert', 'Währung'
        ];
        
        // Erstelle CSV-Inhalt mit Tab-Trennzeichen für Excel
        let xlsxContent = headers.join('\t') + '\n';
        
        shipments.forEach(shipment => {
            const row = [
                shipment.companyName || '',
                shipment.contactName || '',
                shipment.address1 || '',
                shipment.address2 || '',
                shipment.city || '',
                shipment.postalCode || '',
                shipment.country || '',
                shipment.phone || '',
                shipment.email || '',
                shipment.service || '',
                shipment.weight || '',
                shipment.packageType || '',
                shipment.description || '',
                shipment.reference || '',
                shipment.value || '',
                shipment.currency || ''
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
