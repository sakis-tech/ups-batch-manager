// Template-Handler für deutsche UPS Batch Manager Oberfläche
class TemplateHandlerDE {
    constructor() {
        this.templateTypes = {
            basic: 'Basis-Vorlage',
            advanced: 'Erweiterte Vorlage',
            international: 'Internationale Vorlage',
            example: 'Beispiel mit Daten'
        };
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Template download button from dashboard
        const templateBtn = document.querySelector('button[onclick="downloadTemplate()"]');
        if (templateBtn) {
            templateBtn.onclick = () => this.showTemplateModal();
        }
    }

    // Template-Modal anzeigen
    showTemplateModal() {
        window.modalSystem?.createModal('templateModal', {
            title: 'Vorlage herunterladen',
            size: 'medium',
            content: this.getTemplateModalContent.bind(this),
            buttons: [
                { text: 'Abbrechen', class: 'btn-secondary', action: 'cancel' },
                { text: 'Herunterladen', class: 'btn-primary', action: 'download' }
            ],
            download: this.downloadSelectedTemplate.bind(this)
        });

        window.modalSystem?.showModal('templateModal');
    }

    // Template-Modal Content
    getTemplateModalContent() {
        return `
            <div class="template-content">
                <div class="template-description">
                    <p>Wählen Sie eine Vorlage aus, um den Import zu vereinfachen. Alle Vorlagen enthalten die korrekten UPS-Feldnamen und Formate.</p>
                </div>

                <div class="template-options">
                    <div class="form-group">
                        <label class="form-label">Vorlagen-Typ *</label>
                        <div class="template-selection">
                            <label class="radio-label template-option">
                                <input type="radio" name="templateType" value="basic" checked>
                                <span class="radio-custom"></span>
                                <div class="option-content">
                                    <strong>Basis-Vorlage</strong>
                                    <p>Nur die wichtigsten Felder für Standard-Sendungen</p>
                                    <small>Empfänger, Adresse, Gewicht, Service</small>
                                </div>
                            </label>
                            
                            <label class="radio-label template-option">
                                <input type="radio" name="templateType" value="advanced">
                                <span class="radio-custom"></span>
                                <div class="option-content">
                                    <strong>Erweiterte Vorlage</strong>
                                    <p>Alle verfügbaren Felder für komplexe Sendungen</p>
                                    <small>Alle UPS-Felder inklusive Spezial-Services</small>
                                </div>
                            </label>
                            
                            <label class="radio-label template-option">
                                <input type="radio" name="templateType" value="international">
                                <span class="radio-custom"></span>
                                <div class="option-content">
                                    <strong>Internationale Vorlage</strong>
                                    <p>Felder für internationale Sendungen</p>
                                    <small>Inklusive Zoll- und Warenbeschreibung</small>
                                </div>
                            </label>
                            
                            <label class="radio-label template-option">
                                <input type="radio" name="templateType" value="example">
                                <span class="radio-custom"></span>
                                <div class="option-content">
                                    <strong>Beispiel mit Daten</strong>
                                    <p>Vorlage mit Beispieldaten zum Testen</p>
                                    <small>3 Beispiel-Sendungen verschiedener Typen</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Dateiformat *</label>
                        <select name="templateFormat" class="form-select">
                            <option value="csv">CSV (Komma-getrennt)</option>
                            <option value="ssv" selected>SSV (Semikolon-getrennt) - Empfohlen</option>
                            <option value="xml">XML (Strukturiert)</option>
                        </select>
                        <div class="form-help">SSV wird für deutsche Excel-Versionen empfohlen</div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Dateiname</label>
                        <input type="text" name="templateFilename" class="form-input" 
                               value="ups-batch-vorlage" placeholder="ups-batch-vorlage">
                        <div class="form-help">Ohne Dateiendung (wird automatisch hinzugefügt)</div>
                    </div>
                </div>

                <div class="template-preview">
                    <h4>Vorschau der Felder</h4>
                    <div id="templateFieldPreview" class="field-preview">
                        ${this.getFieldPreview('basic')}
                    </div>
                </div>
            </div>
        `;
    }

    // Feldvorschau basierend auf Template-Typ
    getFieldPreview(templateType) {
        const fields = this.getTemplateFields(templateType);
        return `
            <div class="preview-fields">
                <span class="field-count">${fields.length} Felder:</span>
                <div class="field-tags">
                    ${fields.slice(0, 8).map(field => 
                        `<span class="field-tag">${window.UPS_FIELDS[field]?.label || field}</span>`
                    ).join('')}
                    ${fields.length > 8 ? `<span class="field-tag more">+${fields.length - 8} weitere</span>` : ''}
                </div>
            </div>
        `;
    }

    // Template-Felder basierend auf Typ abrufen - UPS-konform
    getTemplateFields(templateType) {
        if (!window.UPS_FIELDS) {
            return [];
        }
        
        const allFields = Object.keys(window.UPS_FIELDS);
        
        const basicFields = [
            'Company or Name', 'Address 1', 'City', 'State/Province/Other', 
            'Postal Code', 'Country', 'Telephone', 'E-mail Address',
            'Service', 'Packaging Type', 'Weight', 'Unit of Measure'
        ];

        const internationalFields = [
            ...basicFields,
            'Description of Goods', 'Customs Value', 'Documents of No Commercial Value'
        ];

        switch (templateType) {
            case 'basic': return basicFields.filter(field => allFields.includes(field));
            case 'international': return internationalFields.filter(field => allFields.includes(field));
            case 'advanced': return allFields; // Alle UPS-Felder
            case 'example': return basicFields.filter(field => allFields.includes(field));
            default: return basicFields.filter(field => allFields.includes(field));
        }
    }

    // Ausgewählte Vorlage herunterladen
    downloadSelectedTemplate() {
        const form = document.querySelector('#modalContainer .template-content');
        if (!form) return false;

        const templateType = form.querySelector('[name="templateType"]:checked')?.value || 'basic';
        const format = form.querySelector('[name="templateFormat"]')?.value || 'ssv';
        const filename = form.querySelector('[name="templateFilename"]')?.value || 'ups-batch-vorlage';

        this.downloadTemplate(templateType, format, filename);
        return true;
    }

    // Template herunterladen
    downloadTemplate(templateType = 'basic', format = 'ssv', filename = 'ups-batch-vorlage') {
        try {
            const loadingToast = window.toastSystem?.showLoading('Erstelle Vorlage...');

            // Template-Daten erstellen
            const templateData = this.createTemplateData(templateType, format);
            
            // Datei erstellen und herunterladen
            this.downloadFile(templateData, format, filename);

            // Aktivität protokollieren
            if (window.activityManager) {
                window.activityManager.addActivity({
                    type: 'template',
                    description: `${this.templateTypes[templateType]} als ${format.toUpperCase()} heruntergeladen`,
                    details: { templateType, format, filename }
                });
            }

            window.toastSystem?.hideToast(loadingToast);
            window.toastSystem?.showSuccess(
                `Vorlage "${filename}.${format}" erfolgreich heruntergeladen`,
                { duration: 3000 }
            );

        } catch (error) {
            console.error('Fehler beim Erstellen der Vorlage:', error);
            window.toastSystem?.showError(`Fehler beim Erstellen der Vorlage: ${error.message}`);
        }
    }

    // Template-Daten erstellen - UPS-konform
    createTemplateData(templateType, format) {
        if (!window.UPS_FIELD_ORDER || !window.UPS_FIELDS) {
            throw new Error('UPS-Feldkonfiguration nicht verfügbar');
        }

        if (format === 'xml') {
            return this.createXMLTemplate(templateType);
        }

        // Alle UPS-Felder in korrekter Reihenfolge verwenden
        const fields = window.UPS_FIELD_ORDER;
        const delimiter = this.getDelimiter(format);
        const lines = [];

        // Header mit UPS-Feldnamen
        lines.push(fields.join(delimiter));

        // Beispieldaten für Example-Template
        if (templateType === 'example') {
            const exampleData = this.getExampleData();
            exampleData.forEach(row => {
                const values = window.UPS_FIELD_ORDER.map(upsFieldName => {
                    const fieldConfig = window.UPS_FIELDS[upsFieldName];
                    if (!fieldConfig) {
                        console.warn(`Feldkonfiguration für ${upsFieldName} nicht gefunden`);
                        return '';
                    }
                    let value = row[fieldConfig.key] || '';
                    
                    // Spezielle Behandlung für bestimmte Felder
                    switch (fieldConfig.key) {
                        case 'telephone':
                            value = row.phone || row.telephone || '';
                            break;
                        case 'packagingType':
                            value = row.packageType || row.packagingType || '';
                            break;
                        case 'service':
                            value = row.serviceType || row.service || '';
                            break;
                        case 'goodsDescription':
                            value = row.description || row.goodsDescription || '';
                            break;
                        case 'residential':
                            if (row.residential === true) {
                                value = '1';
                            } else if (row.residential === false) {
                                value = '0';
                            } else {
                                value = '';
                            }
                            break;
                    }
                    
                    return this.formatFieldForTemplate(value, format);
                });
                lines.push(values.join(delimiter));
            });
        } else {
            // Leere Datenzeile für andere Templates
            const emptyRow = window.UPS_FIELD_ORDER.map(() => '').join(delimiter);
            lines.push(emptyRow);
        }

        // Kommentare hinzufügen
        lines.push('');
        lines.push('# UPS Batch-Manager Vorlage');
        lines.push(`# Template-Typ: ${this.templateTypes[templateType]}`);
        lines.push(`# Erstellt am: ${new Date().toLocaleDateString('de-DE')}`);
        lines.push('# Hinweise:');
        lines.push('# - Alle 79 UPS-Felder in korrekter Reihenfolge enthalten');
        lines.push('# - Pflichtfelder sind: Company or Name, Address 1, City, Country, Service, Packaging Type');
        lines.push('# - Gewicht in kg oder lbs (siehe Unit of Measure)');
        lines.push('# - Service-Codes: 01=Next Day Air, 03=Ground, 07=International Express, 11=International Standard');
        lines.push('# - Land-Codes: DE=Deutschland, US=USA, GB=Großbritannien, etc.');
        lines.push('# - Boolean-Werte: 0=Nein, 1=Ja');

        return lines.join('\n');
    }

    // Beispieldaten abrufen
    getExampleData() {
        return [
            {
                companyName: 'Musterfirma GmbH',
                address1: 'Musterstraße 123',
                city: 'Berlin',
                state: '',
                postalCode: '10115',
                country: 'DE',
                telephone: '+49 30 12345678',
                email: 'info@musterfirma.de',
                serviceType: '03',
                packagingType: '02',
                weight: '2.5',
                unitOfMeasure: 'KG',
                reference1: 'BESTELLUNG-001'
            },
            {
                companyName: 'Example Corp',
                address1: '123 Main Street',
                city: 'New York',
                state: 'NY',
                postalCode: '10001',
                country: 'US',
                telephone: '+1 212 555 0123',
                email: 'shipping@example.com',
                serviceType: '01',
                packagingType: '02',
                weight: '5.0',
                unitOfMeasure: 'LB',
                goodsDescription: 'Electronics',
                customsValue: '150.00',
                reference1: 'ORDER-002'
            },
            {
                companyName: 'Société Exemple',
                address1: '45 Rue de la Paix',
                city: 'Paris',
                state: '',
                postalCode: '75001',
                country: 'FR',
                telephone: '+33 1 42 86 87 88',
                email: 'contact@exemple.fr',
                serviceType: '07',
                packagingType: '02',
                weight: '1.2',
                unitOfMeasure: 'KG',
                goodsDescription: 'Documents',
                customsValue: '25.00',
                reference1: 'ENVOI-003'
            }
        ];
    }

    // Delimiter für Format abrufen
    getDelimiter(format) {
        switch (format) {
            case 'csv': return ',';
            case 'ssv': return ';';
            case 'xml': return ''; // XML verwendet keine Delimiter
            default: return ';';
        }
    }

    // Feldwert für Template formatieren
    formatFieldForTemplate(value, format) {
        if (!value) return '';
        
        const stringValue = String(value);
        const delimiter = this.getDelimiter(format);
        
        // Anführungszeichen hinzufügen wenn nötig
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
    }

    // XML-Template erstellen
    createXMLTemplate(templateType) {
        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlContent += '<ups-batch-template>\n';
        xmlContent += `  <template-type>${templateType}</template-type>\n`;
        xmlContent += `  <created-at>${new Date().toISOString()}</created-at>\n`;
        xmlContent += `  <description>UPS Batch-Manager Vorlage mit allen 79 UPS-Feldern</description>\n`;
        xmlContent += '  <shipments>\n';
        
        if (templateType === 'example') {
            const exampleData = this.getExampleData();
            exampleData.forEach((row, index) => {
                xmlContent += `    <shipment id="${index + 1}">\n`;
                
                window.UPS_FIELD_ORDER.forEach(upsFieldName => {
                    const fieldConfig = window.UPS_FIELDS[upsFieldName];
                    if (!fieldConfig) {
                        console.warn(`Feldkonfiguration für ${upsFieldName} nicht gefunden`);
                        return;
                    }
                    let value = row[fieldConfig.key] || '';
                    
                    // Spezielle Behandlung für bestimmte Felder
                    switch (fieldConfig.key) {
                        case 'telephone':
                            value = row.phone || row.telephone || '';
                            break;
                        case 'packagingType':
                            value = row.packageType || row.packagingType || '';
                            break;
                        case 'service':
                            value = row.serviceType || row.service || '';
                            break;
                        case 'goodsDescription':
                            value = row.description || row.goodsDescription || '';
                            break;
                        case 'residential':
                            if (row.residential === true) {
                                value = '1';
                            } else if (row.residential === false) {
                                value = '0';
                            } else {
                                value = '';
                            }
                            break;
                    }
                    
                    const xmlTagName = upsFieldName.toLowerCase()
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/^-+|-+$/g, '');
                    
                    xmlContent += `      <${xmlTagName}>${this.escapeXMLField(String(value))}</${xmlTagName}>\n`;
                });
                
                xmlContent += `    </shipment>\n`;
            });
        } else {
            // Leere Vorlage
            xmlContent += `    <shipment id="1">\n`;
            
            window.UPS_FIELD_ORDER.forEach(upsFieldName => {
                const fieldConfig = window.UPS_FIELDS[upsFieldName];
                if (!fieldConfig) {
                    console.warn(`Feldkonfiguration für ${upsFieldName} nicht gefunden`);
                    return;
                }
                const xmlTagName = upsFieldName.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/^-+|-+$/g, '');
                
                xmlContent += `      <${xmlTagName}></${xmlTagName}>\n`;
            });
            
            xmlContent += `    </shipment>\n`;
        }
        
        xmlContent += '  </shipments>\n';
        xmlContent += '</ups-batch-template>\n';
        
        return xmlContent;
    }

    // XML-Feld escapen
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

    // Datei herunterladen
    downloadFile(content, format, filename) {
        const finalFilename = `${filename}.${format}`;
        
        const mimeType = this.getMimeType(format);
        const blob = new Blob([content], { type: mimeType });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalFilename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // MIME-Type für Format abrufen
    getMimeType(format) {
        switch (format) {
            case 'csv': return 'text/csv;charset=utf-8';
            case 'ssv': return 'text/csv;charset=utf-8';
            case 'xml': return 'application/xml;charset=utf-8';
            default: return 'text/plain;charset=utf-8';
        }
    }

    // Template-Typen abrufen
    getAvailableTemplates() {
        return Object.entries(this.templateTypes).map(([key, label]) => ({
            key,
            label,
            fields: this.getTemplateFields(key),
            description: this.getTemplateDescription(key)
        }));
    }

    // Template-Beschreibung abrufen
    getTemplateDescription(templateType) {
        const descriptions = {
            basic: 'Enthält die wichtigsten Felder für Standard-Sendungen innerhalb Deutschlands',
            advanced: 'Vollständige Vorlage mit allen verfügbaren UPS-Feldern und Spezial-Services',
            international: 'Optimiert für internationale Sendungen mit Zoll- und Warenfeldern',
            example: 'Vorlage mit 3 Beispiel-Sendungen zum Testen und als Referenz'
        };
        
        return descriptions[templateType] || '';
    }
}

// CSS für Template-Handler
const templateStyles = `
    .template-content {
        max-height: 70vh;
        overflow-y: auto;
    }

    .template-description {
        margin-bottom: var(--space-6);
        padding: var(--space-4);
        background-color: var(--info-light);
        border-radius: var(--radius-md);
        border-left: 4px solid var(--info);
    }

    .template-description p {
        margin: 0;
        color: var(--info-dark);
    }

    .template-selection {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .template-option {
        display: flex;
        align-items: flex-start;
        gap: var(--space-3);
        padding: var(--space-4);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        background-color: var(--bg-secondary);
        cursor: pointer;
        transition: var(--transition-fast);
    }

    .template-option:hover {
        border-color: var(--primary);
        background-color: var(--primary-light);
    }

    .template-option input[type="radio"]:checked + .radio-custom + .option-content {
        color: var(--primary-dark);
    }

    .option-content {
        flex: 1;
    }

    .option-content strong {
        display: block;
        margin-bottom: var(--space-1);
        color: var(--text-primary);
        font-weight: var(--font-weight-semibold);
    }

    .option-content p {
        margin: 0 0 var(--space-1) 0;
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }

    .option-content small {
        color: var(--text-tertiary);
        font-size: var(--font-size-xs);
    }

    .template-preview {
        margin-top: var(--space-6);
        padding: var(--space-4);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        background-color: var(--bg-secondary);
    }

    .template-preview h4 {
        margin: 0 0 var(--space-3) 0;
        color: var(--primary);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
    }

    .field-preview {
        font-size: var(--font-size-sm);
    }

    .field-count {
        font-weight: var(--font-weight-medium);
        color: var(--text-primary);
        margin-bottom: var(--space-2);
        display: block;
    }

    .field-tags {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-1);
    }

    .field-tag {
        padding: var(--space-1) var(--space-2);
        background-color: var(--primary-light);
        color: var(--primary-dark);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        white-space: nowrap;
    }

    .field-tag.more {
        background-color: var(--secondary-light);
        color: var(--secondary-dark);
        font-weight: var(--font-weight-medium);
    }

    @media (max-width: 768px) {
        .template-option {
            flex-direction: column;
            align-items: flex-start;
        }

        .field-tags {
            justify-content: flex-start;
        }
    }
`;

// CSS hinzufügen
const templateStyleSheet = document.createElement('style');
templateStyleSheet.textContent = templateStyles;
document.head.appendChild(templateStyleSheet);

// Template Handler initialisieren
window.TemplateHandlerDE = TemplateHandlerDE;
window.templateHandler = new TemplateHandlerDE();

// Globale Funktionen für HTML
window.downloadTemplate = () => {
    if (window.templateHandler) {
        window.templateHandler.showTemplateModal();
    }
};

// Template-Vorschau aktualisieren wenn Typ geändert wird
document.addEventListener('change', (e) => {
    if (e.target.name === 'templateType') {
        const preview = document.getElementById('templateFieldPreview');
        if (preview && window.templateHandler) {
            preview.innerHTML = window.templateHandler.getFieldPreview(e.target.value);
        }
    }
});