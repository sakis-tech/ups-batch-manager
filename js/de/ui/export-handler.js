// Export-Handler für deutsche UPS Batch Manager Oberfläche
class ExportHandlerDE {
    constructor() {
        this.exportFormats = {
            csv: 'Comma Separated Values (CSV)',
            ssv: 'Semicolon Separated Values (SSV)',
            txt: 'Tab-getrennte Werte (TXT)'
        };
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Export-Button
        const exportBtn = document.getElementById('exportBatchBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.showExportModal();
            });
        }

        // Schnell-Export Buttons
        const quickExportCSV = document.getElementById('quickExportCSV');
        const quickExportSSV = document.getElementById('quickExportSSV');
        
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
    }

    // Export-Modal anzeigen
    showExportModal() {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        
        if (shipments.length === 0) {
            window.toastSystem?.showWarning('Keine Sendungen zum Exportieren vorhanden');
            return;
        }

        if (validShipments.length === 0) {
            window.toastSystem?.showWarning('Keine gültigen Sendungen zum Exportieren vorhanden');
            return;
        }

        window.modalSystem?.createModal('exportModal', {
            title: 'Batch Export',
            size: 'large',
            content: this.getExportModalContent.bind(this),
            buttons: [
                { text: 'Abbrechen', class: 'btn-secondary', action: 'cancel' },
                { text: 'Exportieren', class: 'btn-primary', action: 'export' }
            ],
            export: this.performExport.bind(this)
        });

        window.modalSystem?.showModal('exportModal', { shipments, validShipments });
    }

    // Export-Modal Content
    getExportModalContent(data) {
        const { shipments, validShipments } = data;
        const invalidCount = shipments.length - validShipments.length;

        return `
            <div class="export-content">
                <div class="export-summary">
                    <div class="summary-stats">
                        <div class="stat-item">
                            <span class="stat-number">${shipments.length}</span>
                            <span class="stat-label">Gesamt Sendungen</span>
                        </div>
                        <div class="stat-item success">
                            <span class="stat-number">${validShipments.length}</span>
                            <span class="stat-label">Gültige Sendungen</span>
                        </div>
                        ${invalidCount > 0 ? `
                        <div class="stat-item error">
                            <span class="stat-number">${invalidCount}</span>
                            <span class="stat-label">Fehlerhafte Sendungen</span>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <div class="export-options">
                    <div class="form-section">
                        <h4>Export-Optionen</h4>
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Dateiformat *</label>
                                <select name="exportFormat" class="form-select" required>
                                    <option value="csv">CSV (Komma-getrennt)</option>
                                    <option value="ssv" selected>SSV (Semikolon-getrennt) - Empfohlen</option>
                                    <option value="txt">TXT (Tab-getrennt)</option>
                                </select>
                                <div class="form-help">SSV wird für deutsche UPS WorldShip empfohlen</div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Dateiname</label>
                                <input type="text" name="filename" class="form-input" 
                                       value="ups-batch-${new Date().toISOString().slice(0, 10)}" 
                                       placeholder="ups-batch">
                                <div class="form-help">Ohne Dateiendung (wird automatisch hinzugefügt)</div>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Sendungsauswahl</h4>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="radio" name="exportSelection" value="valid" checked>
                                <span class="radio-custom"></span>
                                Nur gültige Sendungen exportieren (${validShipments.length} Sendungen)
                            </label>
                            ${invalidCount > 0 ? `
                            <label class="checkbox-label">
                                <input type="radio" name="exportSelection" value="all">
                                <span class="radio-custom"></span>
                                Alle Sendungen exportieren (${shipments.length} Sendungen)
                            </label>
                            ` : ''}
                            <label class="checkbox-label">
                                <input type="radio" name="exportSelection" value="selected">
                                <span class="radio-custom"></span>
                                Nur ausgewählte Sendungen exportieren
                            </label>
                        </div>
                    </div>

                    <div class="form-section">
                        <h4>Erweiterte Optionen</h4>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" name="includeHeader" checked>
                                <span class="checkbox-custom"></span>
                                Kopfzeile mit Feldnamen einschließen
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="sortByCountry">
                                <span class="checkbox-custom"></span>
                                Nach Zielland sortieren
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="groupByService">
                                <span class="checkbox-custom"></span>
                                Nach Service-Typ gruppieren
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" name="addTimestamp" checked>
                                <span class="checkbox-custom"></span>
                                Zeitstempel zur Datei hinzufügen
                            </label>
                        </div>
                    </div>
                </div>

                ${this.renderFieldSelection()}
            </div>
        `;
    }

    // Feldauswahl für Export rendern
    renderFieldSelection() {
        const standardFields = [
            'Contact Name', 'Company or Name', 'Address 1', 'Address 2', 'Address 3',
            'City', 'State/Prov/Other', 'Postal Code', 'Country', 'Telephone', 'Ext',
            'Residential Ind', 'Consignee Email', 'Service', 'Packaging Type', 'Weight',
            'Unit of Measure', 'Length', 'Width', 'Height', 'Reference 1', 'Reference 2',
            'Reference 3', 'Delivery Confirm'
        ];

        const internationalFields = [
            'Description of Goods', 'Customs Value', 'Documents of No Commercial Value',
            'GNIFC', 'Pkg Decl Value'
        ];

        const specialFields = [
            'Saturday Deliver', 'Shipper Release', 'Carbon Neutral', 'Large Package',
            'Addl handling', 'Ret of Documents', 'UPS Premium Care',
            'Electronic Package Release Authentication', 'Lithium Ion Alone',
            'Lithium Ion In Equipment'
        ];

        return `
            <div class="form-section">
                <h4>Feldauswahl</h4>
                <div class="field-selection">
                    <div class="field-group">
                        <h5>Standard-Felder</h5>
                        <div class="checkbox-grid">
                            ${standardFields.map(fieldName => {
                                const field = window.UPS_FIELDS ? window.UPS_FIELDS[fieldName] : null;
                                return `
                                    <label class="checkbox-label field-checkbox">
                                        <input type="checkbox" name="selectedFields" value="${fieldName}" checked>
                                        <span class="checkbox-custom"></span>
                                        ${field?.label || fieldName}
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="field-group">
                        <h5>Internationale Felder</h5>
                        <div class="checkbox-grid">
                            ${internationalFields.map(fieldName => {
                                const field = window.UPS_FIELDS ? window.UPS_FIELDS[fieldName] : null;
                                return `
                                    <label class="checkbox-label field-checkbox">
                                        <input type="checkbox" name="selectedFields" value="${fieldName}">
                                        <span class="checkbox-custom"></span>
                                        ${field?.label || fieldName}
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <div class="field-group">
                        <h5>Spezial-Services</h5>
                        <div class="checkbox-grid">
                            ${specialFields.map(fieldName => {
                                const field = window.UPS_FIELDS ? window.UPS_FIELDS[fieldName] : null;
                                return `
                                    <label class="checkbox-label field-checkbox">
                                        <input type="checkbox" name="selectedFields" value="${fieldName}">
                                        <span class="checkbox-custom"></span>
                                        ${field?.label || fieldName}
                                    </label>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <div class="field-actions">
                    <button type="button" class="btn btn-ghost btn-sm" onclick="selectAllFields()">Alle auswählen</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="selectNoneFields()">Alle abwählen</button>
                    <button type="button" class="btn btn-ghost btn-sm" onclick="selectStandardFields()">Nur Standard</button>
                </div>
            </div>
        `;
    }

    // Export durchführen
    performExport(data) {
        const form = document.querySelector('#modalContainer form');
        if (!form) {
            const modalContent = document.querySelector('#modalContainer .modal-body');
            if (modalContent) {
                const formData = new FormData();
                
                // Formular-Daten sammeln
                const format = modalContent.querySelector('[name="exportFormat"]')?.value || 'ssv';
                const filename = modalContent.querySelector('[name="filename"]')?.value || 'ups-batch';
                const selection = modalContent.querySelector('[name="exportSelection"]:checked')?.value || 'valid';
                const includeHeader = modalContent.querySelector('[name="includeHeader"]')?.checked || false;
                const sortByCountry = modalContent.querySelector('[name="sortByCountry"]')?.checked || false;
                const groupByService = modalContent.querySelector('[name="groupByService"]')?.checked || false;
                const addTimestamp = modalContent.querySelector('[name="addTimestamp"]')?.checked || false;
                
                const selectedFields = Array.from(modalContent.querySelectorAll('[name="selectedFields"]:checked'))
                    .map(cb => cb.value);

                const options = {
                    format,
                    filename,
                    selection,
                    includeHeader,
                    sortByCountry,
                    groupByService,
                    addTimestamp,
                    selectedFields
                };

                return this.executeExport(options);
            }
        }
        return false;
    }

    // Schnell-Export durchführen
    performQuickExport(format) {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        
        if (validShipments.length === 0) {
            window.toastSystem?.showWarning('Keine gültigen Sendungen zum Exportieren vorhanden');
            return;
        }

        const options = {
            format: format,
            filename: `ups-batch-${new Date().toISOString().slice(0, 10)}`,
            selection: 'valid',
            includeHeader: true,
            sortByCountry: false,
            groupByService: false,
            addTimestamp: true,
            selectedFields: this.getStandardFields()
        };

        this.executeExport(options);
    }

    // Standard-Felder abrufen
    getStandardFields() {
        return [
            'Contact Name', 'Company or Name', 'Address 1', 'Address 2', 'Address 3',
            'City', 'State/Prov/Other', 'Postal Code', 'Country', 'Telephone', 'Ext',
            'Residential Ind', 'Consignee Email', 'Service', 'Packaging Type', 'Weight',
            'Unit of Measure', 'Length', 'Width', 'Height', 'Reference 1', 'Reference 2',
            'Reference 3', 'Delivery Confirm'
        ];
    }

    // Export ausführen
    executeExport(options) {
        try {
            const loadingToast = window.toastSystem?.showLoading('Erstelle Export-Datei...');

            // Sendungen abrufen und filtern
            let shipments = this.getShipmentsForExport(options.selection);
            
            if (shipments.length === 0) {
                window.toastSystem?.hideToast(loadingToast);
                window.toastSystem?.showWarning('Keine Sendungen zum Exportieren gefunden');
                return false;
            }

            // Sendungen sortieren/gruppieren
            shipments = this.processSortingAndGrouping(shipments, options);

            // Export-Daten erstellen
            const exportData = this.createExportData(shipments, options);

            // Datei erstellen und herunterladen
            this.downloadFile(exportData, options);

            // Aktivität protokollieren
            if (window.activityManager) {
                window.activityManager.addActivity({
                    type: 'export',
                    description: `${shipments.length} Sendungen als ${options.format.toUpperCase()} exportiert`,
                    details: {
                        format: options.format,
                        filename: options.filename,
                        count: shipments.length
                    }
                });
            }

            window.toastSystem?.hideToast(loadingToast);
            window.toastSystem?.showSuccess(
                `${shipments.length} Sendungen erfolgreich als ${options.format.toUpperCase()} exportiert`,
                { duration: 4000 }
            );

            return true;
        } catch (error) {
            console.error('Fehler beim Export:', error);
            window.toastSystem?.showError(`Fehler beim Export: ${error.message}`);
            return false;
        }
    }

    // Sendungen für Export abrufen
    getShipmentsForExport(selection) {
        const allShipments = window.shipmentManager?.getAllShipments() || [];
        
        switch (selection) {
            case 'valid':
                return allShipments.filter(s => s.isValid);
            case 'all':
                return allShipments;
            case 'selected':
                // Implementierung für ausgewählte Sendungen
                const selectedIds = this.getSelectedShipmentIds();
                return allShipments.filter(s => selectedIds.includes(s.id));
            default:
                return allShipments.filter(s => s.isValid);
        }
    }

    // Ausgewählte Sendungs-IDs abrufen
    getSelectedShipmentIds() {
        const checkboxes = document.querySelectorAll('.shipment-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.value, 10));
    }

    // Sortierung und Gruppierung verarbeiten
    processSortingAndGrouping(shipments, options) {
        let processed = [...shipments];

        if (options.sortByCountry) {
            processed.sort((a, b) => {
                const countryA = a.country || '';
                const countryB = b.country || '';
                return countryA.localeCompare(countryB);
            });
        }

        if (options.groupByService) {
            processed.sort((a, b) => {
                const serviceA = a.serviceType || '';
                const serviceB = b.serviceType || '';
                if (serviceA !== serviceB) {
                    return serviceA.localeCompare(serviceB);
                }
                // Sekundäre Sortierung nach Land
                const countryA = a.country || '';
                const countryB = b.country || '';
                return countryA.localeCompare(countryB);
            });
        }

        return processed;
    }

    // Export-Daten erstellen
    createExportData(shipments, options) {
        const delimiter = this.getDelimiter(options.format);
        const lines = [];

        // Header hinzufügen
        if (options.includeHeader) {
            const header = options.selectedFields.join(delimiter);
            lines.push(header);
        }

        // Sendungsdaten hinzufügen
        if (window.UPS_FIELDS) {
            shipments.forEach(shipment => {
                const row = options.selectedFields.map(fieldName => {
                    const field = window.UPS_FIELDS[fieldName];
                    const value = this.getFieldValue(shipment, field);
                    return this.formatFieldForExport(value, field, options.format);
                });
                lines.push(row.join(delimiter));
            });
        }

        // Zeitstempel hinzufügen
        if (options.addTimestamp) {
            lines.push('');
            lines.push(`# Exportiert am: ${new Date().toLocaleString('de-DE')}`);
            lines.push(`# Anzahl Sendungen: ${shipments.length}`);
            lines.push(`# Format: ${options.format.toUpperCase()}`);
        }

        return lines.join('\n');
    }

    // Delimiter für Format abrufen
    getDelimiter(format) {
        switch (format) {
            case 'csv': return ',';
            case 'ssv': return ';';
            case 'txt': return '\t';
            default: return ';';
        }
    }

    // Feldwert abrufen
    getFieldValue(shipment, field) {
        if (!field) return '';
        
        const value = shipment[field.key];
        
        if (value === null || value === undefined) {
            return '';
        }
        
        if (field.type === 'checkbox') {
            return value ? 'Y' : 'N';
        }
        
        return String(value);
    }

    // Feldwert für Export formatieren
    formatFieldForExport(value, field, format) {
        if (!value) return '';
        
        // Anführungszeichen hinzufügen wenn nötig
        if (format === 'csv' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        
        if (format === 'ssv' && (value.includes(';') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
        }
        
        return value;
    }

    // Datei herunterladen
    downloadFile(content, options) {
        const extension = options.format === 'txt' ? 'txt' : options.format;
        const filename = `${options.filename}.${extension}`;
        
        const blob = new Blob([content], { 
            type: this.getMimeType(options.format) 
        });
        
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

    // MIME-Type für Format abrufen
    getMimeType(format) {
        switch (format) {
            case 'csv': return 'text/csv;charset=utf-8';
            case 'ssv': return 'text/csv;charset=utf-8';
            case 'txt': return 'text/plain;charset=utf-8';
            default: return 'text/plain;charset=utf-8';
        }
    }

    // Statistiken für Export abrufen
    getExportStatistics() {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        
        // Nach Land gruppieren
        const byCountry = {};
        validShipments.forEach(shipment => {
            const country = shipment.country || 'Unbekannt';
            byCountry[country] = (byCountry[country] || 0) + 1;
        });
        
        // Nach Service gruppieren
        const byService = {};
        validShipments.forEach(shipment => {
            const service = shipment.serviceType || 'Unbekannt';
            const serviceLabel = window.UPS_FIELDS && window.UPS_FIELDS.Service 
                ? window.UPS_FIELDS.Service.options.find(opt => opt.value === service)?.label || service
                : service;
            byService[serviceLabel] = (byService[serviceLabel] || 0) + 1;
        });
        
        // Gesamtgewicht berechnen
        const totalWeight = validShipments.reduce((sum, shipment) => {
            const weight = parseFloat(shipment.weight) || 0;
            return sum + weight;
        }, 0);

        return {
            total: shipments.length,
            valid: validShipments.length,
            invalid: shipments.length - validShipments.length,
            byCountry,
            byService,
            totalWeight: totalWeight.toFixed(1)
        };
    }
}

// CSS für Export-Handler
const exportStyles = `
    .export-content {
        max-height: 70vh;
        overflow-y: auto;
    }

    .export-summary {
        margin-bottom: var(--space-6);
    }

    .summary-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--space-4);
        margin-bottom: var(--space-4);
    }

    .stat-item {
        text-align: center;
        padding: var(--space-4);
        border-radius: var(--radius-md);
        background-color: var(--bg-tertiary);
    }

    .stat-item.success {
        background-color: var(--success-light);
    }

    .stat-item.error {
        background-color: var(--error-light);
    }

    .stat-number {
        display: block;
        font-size: var(--font-size-2xl);
        font-weight: var(--font-weight-bold);
        color: var(--text-primary);
    }

    .stat-label {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
    }

    .export-options .form-section {
        margin-bottom: var(--space-4);
    }

    .field-selection {
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        padding: var(--space-4);
        background-color: var(--bg-secondary);
    }

    .field-group {
        margin-bottom: var(--space-4);
    }

    .field-group:last-child {
        margin-bottom: 0;
    }

    .field-group h5 {
        margin: 0 0 var(--space-3) 0;
        color: var(--primary);
        font-size: var(--font-size-base);
        font-weight: var(--font-weight-medium);
        border-bottom: 1px solid var(--border-light);
        padding-bottom: var(--space-2);
    }

    .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--space-2);
    }

    .field-checkbox {
        font-size: var(--font-size-sm);
        margin-bottom: var(--space-1);
    }

    .field-actions {
        display: flex;
        gap: var(--space-2);
        justify-content: flex-end;
        margin-top: var(--space-4);
        padding-top: var(--space-3);
        border-top: 1px solid var(--border-light);
    }

    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }

    @media (max-width: 768px) {
        .summary-stats {
            grid-template-columns: 1fr;
        }
        
        .checkbox-grid {
            grid-template-columns: 1fr;
        }
        
        .field-actions {
            flex-direction: column;
        }
    }
`;

// CSS hinzufügen
const exportStyleSheet = document.createElement('style');
exportStyleSheet.textContent = exportStyles;
document.head.appendChild(exportStyleSheet);

// Export Handler initialisieren
window.ExportHandlerDE = ExportHandlerDE;
window.exportHandler = new ExportHandlerDE();

// Globale Funktionen für HTML
window.selectAllFields = () => {
    const checkboxes = document.querySelectorAll('[name="selectedFields"]');
    checkboxes.forEach(cb => cb.checked = true);
};

window.selectNoneFields = () => {
    const checkboxes = document.querySelectorAll('[name="selectedFields"]');
    checkboxes.forEach(cb => cb.checked = false);
};

window.selectStandardFields = () => {
    const standardFields = [
        'Contact Name', 'Company or Name', 'Address 1', 'Address 2', 'Address 3',
        'City', 'State/Prov/Other', 'Postal Code', 'Country', 'Telephone', 'Ext',
        'Residential Ind', 'Consignee Email', 'Service', 'Packaging Type', 'Weight',
        'Unit of Measure', 'Length', 'Width', 'Height', 'Reference 1', 'Reference 2',
        'Reference 3', 'Delivery Confirm'
    ];
    
    const checkboxes = document.querySelectorAll('[name="selectedFields"]');
    checkboxes.forEach(cb => {
        cb.checked = standardFields.includes(cb.value);
    });
};