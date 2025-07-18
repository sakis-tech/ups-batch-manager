// Template Download Funktionalität für UPS Batch-Dateien
class TemplateDownloadManager {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Download-Buttons für Templates
        const downloadCsvBtn = document.getElementById('downloadCsvTemplate');
        const downloadXlsxBtn = document.getElementById('downloadXlsxTemplate');

        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', () => this.downloadTemplate('csv'));
        }

        if (downloadXlsxBtn) {
            downloadXlsxBtn.addEventListener('click', () => this.downloadTemplate('xlsx'));
        }
    }

    // UPS Batch-Datei Felder basierend auf der offiziellen JSON-Spezifikation
    getUPSBatchFields() {
        return [
            'Contact Name',
            'Company or Name',
            'Country',
            'Address 1',
            'Address 2',
            'Address 3',
            'City',
            'State/Province/Other',
            'Postal Code',
            'Telephone',
            'Extension',
            'Residential Indicator',
            'E-mail Address',
            'Packaging Type',
            'Customs Value',
            'Weight',
            'Length',
            'Width',
            'Height',
            'Unit of Measure',
            'Description of Goods',
            'Documents of No Commercial Value',
            'GNIFC (Goods not in Free Circulation)',
            'Declared Value',
            'Service',
            'Delivery Confirmation',
            'Shipper Release/Deliver Wthout Signature',
            'Return of Document',
            'Deliver on Saturday',
            'UPS carbon neutral',
            'Large Package',
            'Additional Handling',
            'Reference 1',
            'Reference 2',
            'Reference 3',
            'E-mail Notification 1 - Address',
            'E-mail Notification 1 - Ship',
            'E-mail Notification 1 - Exception',
            'E-mail Notification 1 - Delivery',
            'E-mail Notification 2 - Address',
            'E-mail Notification 2 - Ship',
            'E-mail Notification 2 - Exception',
            'E-mail Notification 2 - Delivery',
            'E-mail Notification 3 - Address',
            'E-mail Notification 3 - Ship',
            'E-mail Notification 3 - Exception',
            'E-mail Notification 3 - Delivery',
            'E-mail Notification 4 - Address',
            'E-mail Notification 4 - Ship',
            'E-mail Notification 4 - Exception',
            'E-mail Notification 4 - Delivery',
            'E-mail Notification 5 - Address',
            'E-mail Notification 5 - Ship',
            'E-mail Notification 5 - Exception',
            'E-mail Notification 5 - Delivery',
            'E-mail Message',
            'E-mail Failure Address',
            'UPS Premium Care',
            'Location ID',
            'Notification Media Type',
            'Notification Language',
            'Notification Address',
            'ADL COD Value',
            'ADL Deliver to Addressee',
            'ADL Shipper Media Type',
            'ADL Shipper Language',
            'ADL Shipper Notification',
            'ADL Direct Delivery Only',
            'Electronic Package Release Authentication',
            'Lithium Ion Alone',
            'Lithium Ion In Equipment',
            'Lithium Ion With_Equipment',
            'Lithium Metal Alone',
            'Lithium Metal In Equipment',
            'Lithium Metal With Equipment',
            'Weekend Commercial Delivery',
            'Dry Ice Weight',
            'Merchandise Description',
            'UPS SurePost®Limited Quantity/Lithium Battery'
        ];
    }

    // Template mit Beispieldaten erstellen
    getSampleData() {
        const fields = this.getUPSBatchFields();
        const sampleData = {};
        
        // Beispieldaten für die wichtigsten Felder
        const examples = {
            'Contact Name': 'Max Mustermann',
            'Company or Name': 'Mustermann GmbH',
            'Country': 'DE',
            'Address 1': 'Musterstraße 123',
            'Address 2': '',
            'Address 3': '',
            'City': 'Berlin',
            'State/Province/Other': '',
            'Postal Code': '10115',
            'Telephone': '+49301234567',
            'Extension': '',
            'Residential Indicator': '0',
            'E-mail Address': 'max.mustermann@example.com',
            'Packaging Type': '2',
            'Customs Value': '',
            'Weight': '1.5',
            'Length': '20',
            'Width': '15',
            'Height': '10',
            'Unit of Measure': 'KG',
            'Description of Goods': 'Elektronik',
            'Documents of No Commercial Value': '',
            'GNIFC (Goods not in Free Circulation)': '',
            'Declared Value': '',
            'Service': '11',
            'Delivery Confirmation': '',
            'Shipper Release/Deliver Wthout Signature': '',
            'Return of Document': '',
            'Deliver on Saturday': '',
            'UPS carbon neutral': '',
            'Large Package': '',
            'Additional Handling': '',
            'Reference 1': 'Bestellung-12345',
            'Reference 2': '',
            'Reference 3': ''
        };

        // Alle Felder mit Beispieldaten oder leeren Werten füllen
        fields.forEach(field => {
            sampleData[field] = examples[field] || '';
        });

        return sampleData;
    }

    downloadTemplate(format) {
        try {
            const fields = this.getUPSBatchFields();
            const sampleData = this.getSampleData();

            if (format === 'csv') {
                this.downloadCSV(fields, sampleData);
            } else if (format === 'xlsx') {
                this.downloadXLSX(fields, sampleData);
            }

            // Aktivität loggen
            if (window.activityLogger) {
                window.activityLogger.log('download', `UPS-Batch-Template (${format.toUpperCase()}) heruntergeladen`);
            }

            // Erfolgs-Toast anzeigen
            if (window.toastSystem) {
                window.toastSystem.showSuccess(`Template erfolgreich als ${format.toUpperCase()} heruntergeladen!`);
            }

        } catch (error) {
            console.error('Fehler beim Download der Vorlage:', error);
            if (window.toastSystem) {
                window.toastSystem.showError('Fehler beim Download der Vorlage');
            }
        }
    }

    downloadCSV(fields, sampleData) {
        // Header-Zeile erstellen
        const headerRow = fields.join(',');
        
        // Beispieldaten-Zeile erstellen
        const dataRow = fields.map(field => {
            const value = sampleData[field] || '';
            // Werte mit Kommas in Anführungszeichen setzen
            return value.includes(',') ? `"${value}"` : value;
        }).join(',');

        // CSV-Inhalt zusammensetzen
        const csvContent = headerRow + '\n' + dataRow;

        // Blob erstellen und Download auslösen
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        this.triggerDownload(blob, 'ups-batch-template.csv');
    }

    async downloadXLSX(fields, sampleData) {
        try {
            // SheetJS dynamisch laden für XLSX-Export
            if (!window.XLSX) {
                await this.loadSheetJS();
            }

            // Arbeitsblatt erstellen
            const worksheet = window.XLSX.utils.json_to_sheet([sampleData]);
            
            // Arbeitsmappe erstellen
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'UPS Batch Template');

            // Spaltenbreiten anpassen
            const colWidths = fields.map(field => ({
                wch: Math.max(field.length, 15)
            }));
            worksheet['!cols'] = colWidths;

            // XLSX-Datei erstellen und herunterladen
            const xlsxBuffer = window.XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([xlsxBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            this.triggerDownload(blob, 'ups-batch-template.xlsx');

        } catch (error) {
            console.error('Fehler beim XLSX-Export:', error);
            // Fallback auf CSV
            this.downloadCSV(fields, sampleData);
            if (window.toastSystem) {
                window.toastSystem.showWarning('XLSX-Export nicht verfügbar, CSV-Download wurde verwendet');
            }
        }
    }

    async loadSheetJS() {
        return new Promise((resolve, reject) => {
            if (window.XLSX) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Fehler beim Laden der XLSX-Bibliothek'));
            document.head.appendChild(script);
        });
    }

    triggerDownload(blob, filename) {
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // URL freigeben
        URL.revokeObjectURL(url);
    }

    // Utility-Methode für andere Module
    getTemplateInfo() {
        return {
            fields: this.getUPSBatchFields(),
            fieldCount: this.getUPSBatchFields().length,
            requiredFields: [
                'Company or Name',
                'Country',
                'Address 1',
                'City',
                'Packaging Type',
                'Service'
            ]
        };
    }
}

// Instanz erstellen und global verfügbar machen
document.addEventListener('DOMContentLoaded', () => {
    window.templateDownloadManager = new TemplateDownloadManager();
});

// Export für Module-System
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TemplateDownloadManager;
}