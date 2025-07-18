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
        const downloadXmlBtn = document.getElementById('downloadXmlTemplate');
        const downloadSsvBtn = document.getElementById('downloadSsvTemplate');

        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', () => this.downloadTemplate('csv'));
        }

        if (downloadXmlBtn) {
            downloadXmlBtn.addEventListener('click', () => this.downloadTemplate('xml'));
        }
        
        if (downloadSsvBtn) {
            downloadSsvBtn.addEventListener('click', () => this.downloadTemplate('ssv'));
        }
    }

    // UPS Batch-Datei Felder basierend auf der offiziellen JSON-Spezifikation
    getUPSBatchFields() {
        // Verwende die offizielle UPS_FIELD_ORDER-Konfiguration wenn verfügbar
        if (window.UPS_FIELD_ORDER) {
            return window.UPS_FIELD_ORDER;
        }
        
        // Fallback: Komplette UPS-Feldliste (79 Felder)
        return [
            'Contact Name',
            'Company or Name',
            'Country',
            'Address 1',
            'Address 2',
            'Address 3',
            'City',
            'State/Prov/Other',
            'Postal Code',
            'Telephone',
            'Ext',
            'Residential Ind',
            'Consignee Email',
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
            'Pkg Decl Value',
            'Service',
            'Delivery Confirmation',
            'Shipper Release/Deliver Wthout Signature',
            'Return of Document',
            'Deliver on Saturday',
            'UPS carbon neutral',
            'Large Package',
            'Addl handling',
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
            'State/Prov/Other': '',
            'Postal Code': '10115',
            'Telephone': '+49301234567',
            'Ext': '',
            'Residential Ind': '0',
            'Consignee Email': 'max.mustermann@example.com',
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
            'Pkg Decl Value': '',
            'Service': '11',
            'Delivery Confirmation': '',
            'Shipper Release/Deliver Wthout Signature': '',
            'Return of Document': '',
            'Deliver on Saturday': '',
            'UPS carbon neutral': '',
            'Large Package': '',
            'Addl handling': '',
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
            } else if (format === 'xml') {
                this.downloadXML(fields, sampleData);
            } else if (format === 'ssv') {
                this.downloadSSV(fields, sampleData);
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

    downloadXML(fields, sampleData) {
        // XML-Template erstellen
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlContent += '<ups-batch-template>\n';
        xmlContent += '  <template-info>\n';
        xmlContent += `    <created-at>${new Date().toISOString()}</created-at>\n`;
        xmlContent += '    <description>UPS Batch-Manager Template mit allen 79 UPS-Feldern</description>\n';
        xmlContent += `    <field-count>${fields.length}</field-count>\n`;
        xmlContent += '  </template-info>\n';
        xmlContent += '  <shipments>\n';
        xmlContent += '    <shipment id="1">\n';
        
        // Alle Felder mit Beispieldaten oder leeren Werten
        fields.forEach(field => {
            const value = sampleData[field] || '';
            const xmlTagName = field.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .replace(/^-+|-+$/g, '');
            
            xmlContent += `      <${xmlTagName}>${this.escapeXML(value)}</${xmlTagName}>\n`;
        });
        
        xmlContent += '    </shipment>\n';
        xmlContent += '  </shipments>\n';
        xmlContent += '  <notes>\n';
        xmlContent += '    <note>Alle 79 UPS-Felder in korrekter Reihenfolge enthalten</note>\n';
        xmlContent += '    <note>Pflichtfelder: Company or Name, Address 1, City, Country, Service, Packaging Type</note>\n';
        xmlContent += '    <note>Boolean-Werte: 0=Nein, 1=Ja</note>\n';
        xmlContent += '  </notes>\n';
        xmlContent += '</ups-batch-template>\n';
        
        // XML-Datei erstellen und herunterladen
        const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
        this.triggerDownload(blob, 'ups-batch-template.xml');
    }

    downloadSSV(fields, sampleData) {
        // SSV-Template erstellen (Semikolon-getrennte Werte)
        const headerRow = fields.join(';');
        
        // Beispieldaten-Zeile erstellen
        const dataRow = fields.map(field => {
            const value = sampleData[field] || '';
            // Werte mit Semikolons in Anführungszeichen setzen
            return value.includes(';') ? `"${value}"` : value;
        }).join(';');

        // SSV-Inhalt zusammensetzen
        let ssvContent = '\uFEFF'; // BOM für bessere Excel-Kompatibilität
        ssvContent += headerRow + '\n';
        ssvContent += dataRow + '\n';
        ssvContent += '\n';
        ssvContent += '# UPS Batch-Manager SSV-Vorlage\n';
        ssvContent += '# Alle 79 UPS-Felder in korrekter Reihenfolge\n';
        ssvContent += `# Erstellt am: ${new Date().toLocaleDateString('de-DE')}\n`;
        ssvContent += '# Empfohlen für deutsche Excel-Versionen\n';

        // SSV-Datei erstellen und herunterladen
        const blob = new Blob([ssvContent], { type: 'text/csv;charset=utf-8' });
        this.triggerDownload(blob, 'ups-batch-template.ssv');
    }

    // XML-Text escapen
    escapeXML(text) {
        if (!text) return '';
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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