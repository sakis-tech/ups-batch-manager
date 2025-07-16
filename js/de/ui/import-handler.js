// Import-Handler für deutsche UPS Batch Manager Oberfläche
class ImportHandlerDE {
    constructor() {
        this.currentStep = 1;
        this.importData = null;
        this.previewData = null;
        this.mappedData = null;
        this.validationResults = null;
        this.currentFileName = null;
        this.currentFileSize = null;
        this.importStartTime = null;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStepIndicators();
    }

    setupEventListeners() {
        // File Input
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }

        // Upload Area
        const uploadArea = document.getElementById('fileUploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                fileInput?.click();
            });

            // Drag & Drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileSelect(files[0]);
                }
            });
        }
    }

    // Datei-Auswahl handhaben
    handleFileSelect(file) {
        if (!file) return;

        // Dateityp prüfen
        const allowedTypes = ['.csv', '.ssv', '.txt'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(fileExtension)) {
            window.toastSystem.showError('Ungültiger Dateityp. Nur CSV, SSV und TXT-Dateien sind erlaubt.');
            return;
        }

        // Dateigröße prüfen (10MB)
        if (file.size > 10 * 1024 * 1024) {
            window.toastSystem.showError('Datei ist zu groß. Maximum: 10MB');
            return;
        }

        // Tracking-Variablen setzen
        this.currentFileName = file.name;
        this.currentFileSize = file.size;
        this.importStartTime = Date.now();

        this.readFile(file);
    }

    // Datei lesen
    readFile(file) {
        const loadingToast = window.toastSystem.showLoading(`Lese "${file.name}"...`);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.importData = {
                    filename: file.name,
                    content: e.target.result,
                    delimiter: this.detectDelimiter(e.target.result, file.name)
                };

                window.toastSystem.hideToast(loadingToast);
                this.processImportData();
                this.goToStep(2);

            } catch (error) {
                window.toastSystem.hideToast(loadingToast);
                window.toastSystem.showError(`Fehler beim Lesen der Datei: ${error.message}`);
            }
        };

        reader.onerror = () => {
            window.toastSystem.hideToast(loadingToast);
            window.toastSystem.showError('Fehler beim Lesen der Datei');
        };

        reader.readAsText(file, 'UTF-8');
    }

    // Trennzeichen erkennen
    detectDelimiter(content, filename) {
        if (filename.toLowerCase().endsWith('.ssv')) {
            return ';';
        }

        // Ersten paar Zeilen analysieren
        const lines = content.split('\n').slice(0, 5);
        const delimiters = [',', ';', '\t'];
        let bestDelimiter = ',';
        let maxCount = 0;

        delimiters.forEach(delimiter => {
            const counts = lines.map(line => (line.split(delimiter).length - 1));
            const avgCount = counts.reduce((a, b) => a + b, 0) / counts.length;
            
            if (avgCount > maxCount && avgCount > 1) {
                maxCount = avgCount;
                bestDelimiter = delimiter;
            }
        });

        return bestDelimiter;
    }

    // Import-Daten verarbeiten
    processImportData() {
        const lines = this.importData.content.trim().split('\n');
        if (lines.length < 1) {
            throw new Error('Datei ist leer');
        }

        // Header und Datenzeilen trennen
        const headers = this.parseCSVLine(lines[0], this.importData.delimiter);
        const dataRows = lines.slice(1).map(line => 
            this.parseCSVLine(line, this.importData.delimiter)
        ).filter(row => row.some(cell => cell.trim() !== ''));

        // Feld-Mapping erstellen
        const fieldMapping = this.createFieldMapping(headers);

        this.previewData = {
            headers,
            dataRows: dataRows.slice(0, 10), // Nur erste 10 Zeilen für Vorschau
            totalRows: dataRows.length,
            fieldMapping
        };

        // Vorschau rendern
        this.renderPreview();
    }

    // CSV-Zeile parsen
    parseCSVLine(line, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++; // Skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current.trim());
        return result;
    }

    // Feld-Mapping erstellen
    createFieldMapping(headers) {
        const mapping = {};
        
        headers.forEach((header, index) => {
            const cleanHeader = header.replace(/['"]/g, '').toLowerCase().trim();
            
            // Direkte Übereinstimmungen
            for (const [upsField, config] of Object.entries(UPS_FIELDS)) {
                const upsFieldLower = upsField.toLowerCase();
                const labelLower = config.label.toLowerCase();
                
                if (cleanHeader === upsFieldLower || 
                    cleanHeader === labelLower ||
                    cleanHeader.includes(upsFieldLower) ||
                    cleanHeader.includes(labelLower)) {
                    mapping[index] = config.key;
                    break;
                }
            }

            // Spezielle Mappings für häufige Varianten
            if (!mapping[index]) {
                const specialMappings = {
                    'firma': 'companyName',
                    'company': 'companyName',
                    'name': 'companyName',
                    'empfänger': 'companyName',
                    'kontakt': 'contactName',
                    'ansprechpartner': 'contactName',
                    'straße': 'address1',
                    'adresse': 'address1',
                    'street': 'address1',
                    'ort': 'city',
                    'stadt': 'city',
                    'plz': 'postalCode',
                    'postleitzahl': 'postalCode',
                    'zip': 'postalCode',
                    'land': 'country',
                    'country': 'country',
                    'telefon': 'telephone',
                    'phone': 'telephone',
                    'tel': 'telephone',
                    'email': 'email',
                    'mail': 'email',
                    'gewicht': 'weight',
                    'weight': 'weight',
                    'service': 'serviceType',
                    'versandart': 'serviceType',
                    'referenz': 'reference1',
                    'reference': 'reference1'
                };

                for (const [key, field] of Object.entries(specialMappings)) {
                    if (cleanHeader.includes(key)) {
                        mapping[index] = field;
                        break;
                    }
                }
            }
        });

        return mapping;
    }

    // Vorschau rendern
    renderPreview() {
        const container = document.getElementById('previewTable');
        if (!container) return;

        const { headers, dataRows, totalRows, fieldMapping } = this.previewData;

        let html = `
            <div class="preview-info">
                <p><strong>Datei:</strong> ${this.importData.filename}</p>
                <p><strong>Zeilen:</strong> ${totalRows} (Vorschau: ${dataRows.length})</p>
                <p><strong>Trennzeichen:</strong> "${this.importData.delimiter}"</p>
            </div>
            <div class="preview-mapping">
                <h4>Feld-Zuordnung</h4>
                <div class="mapping-grid">
        `;

        headers.forEach((header, index) => {
            const mappedField = fieldMapping[index];
            const mappedLabel = mappedField ? this.getFieldLabel(mappedField) : 'Nicht zugeordnet';
            const statusClass = mappedField ? 'mapped' : 'unmapped';

            html += `
                <div class="mapping-item ${statusClass}">
                    <div class="original-header">${header}</div>
                    <div class="mapping-arrow">→</div>
                    <div class="mapped-field">${mappedLabel}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
            <div class="preview-table-container">
                <table class="preview-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${dataRows.map(row => `
                            <tr>
                                ${row.map(cell => `<td>${cell}</td>`).join('')}
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    // Feld-Label ermitteln
    getFieldLabel(fieldKey) {
        for (const [upsField, config] of Object.entries(UPS_FIELDS)) {
            if (config.key === fieldKey) {
                return config.label;
            }
        }
        return fieldKey;
    }

    // Daten validieren
    validateImportData() {
        const { dataRows, fieldMapping } = this.previewData;
        const validationResults = {
            validRows: [],
            invalidRows: [],
            errors: [],
            warnings: [],
            skippedRows: []
        };

        dataRows.forEach((row, rowIndex) => {
            try {
                const shipmentData = {};
                const rowErrors = [];
                const rowWarnings = [];

                // Prüfen ob Zeile vollständig leer ist
                if (this.isRowEmpty(row)) {
                    validationResults.skippedRows.push({
                        rowIndex,
                        reason: 'Leere Zeile übersprungen'
                    });
                    return;
                }

                // Daten mappen mit Fehlerbehandlung
                Object.entries(fieldMapping).forEach(([columnIndex, fieldKey]) => {
                    if (row[columnIndex] !== undefined) {
                        let value = row[columnIndex].trim();
                        
                        // Datentyp-Konvertierung mit Validierung
                        try {
                            value = this.convertFieldValue(fieldKey, value);
                            shipmentData[fieldKey] = value;
                        } catch (conversionError) {
                            rowErrors.push(`Spalte "${fieldKey}": ${conversionError.message}`);
                        }
                    }
                });

                // Minimale Pflichtfeld-Prüfung vor detaillierter Validierung
                const missingRequired = this.checkMinimumRequiredFields(shipmentData);
                if (missingRequired.length > 0) {
                    validationResults.invalidRows.push({
                        rowIndex,
                        data: shipmentData,
                        errors: missingRequired,
                        severity: 'critical'
                    });
                    
                    missingRequired.forEach(error => {
                        validationResults.errors.push(`Zeile ${rowIndex + 2}: ${error}`);
                    });
                    return;
                }

                // Detaillierte Validierung
                const validation = window.fieldValidators?.validateShipment(shipmentData) || { isValid: true, errors: [] };
                
                // Warnungen für problematische aber nicht kritische Felder
                const warnings = this.checkDataWarnings(shipmentData, rowIndex);
                if (warnings.length > 0) {
                    rowWarnings.push(...warnings);
                    validationResults.warnings.push(...warnings);
                }
                
                if (validation.isValid && rowErrors.length === 0) {
                    validationResults.validRows.push({
                        rowIndex,
                        data: shipmentData,
                        warnings: rowWarnings
                    });
                } else {
                    const allErrors = [...rowErrors];
                    if (validation.errors) {
                        validation.errors.forEach(error => {
                            const errorMsg = error.messages ? error.messages.join(', ') : 
                                           error.message || 'Unbekannter Validierungsfehler';
                            allErrors.push(errorMsg);
                        });
                    }

                    validationResults.invalidRows.push({
                        rowIndex,
                        data: shipmentData,
                        errors: allErrors,
                        warnings: rowWarnings,
                        severity: this.determineSeverity(allErrors)
                    });
                    
                    allErrors.forEach(error => {
                        validationResults.errors.push(`Zeile ${rowIndex + 2}: ${error}`);
                    });
                }

            } catch (error) {
                // Unerwarteter Fehler beim Verarbeiten der Zeile
                console.error(`Fehler beim Verarbeiten von Zeile ${rowIndex + 2}:`, error);
                validationResults.invalidRows.push({
                    rowIndex,
                    data: {},
                    errors: [`Unerwarteter Fehler beim Verarbeiten: ${error.message}`],
                    severity: 'critical'
                });
                validationResults.errors.push(`Zeile ${rowIndex + 2}: Kritischer Fehler - ${error.message}`);
            }
        });

        this.validationResults = validationResults;
        this.renderValidationSummary();
    }

    // Prüfen ob Zeile leer ist
    isRowEmpty(row) {
        return row.every(cell => !cell || cell.trim() === '');
    }

    // Feldwert konvertieren
    convertFieldValue(fieldKey, value) {
        if (!value) return value;

        const field = Object.values(UPS_FIELDS).find(f => f.key === fieldKey);
        if (!field) return value;

        switch (field.type) {
            case 'number':
                const numValue = parseFloat(value);
                if (isNaN(numValue)) {
                    throw new Error(`"${value}" ist keine gültige Zahl`);
                }
                return numValue;
                
            case 'checkbox':
                const lowerValue = value.toLowerCase();
                if (['true', 'yes', 'ja', 'y', '1', 'x'].includes(lowerValue)) {
                    return true;
                } else if (['false', 'no', 'nein', 'n', '0', ''].includes(lowerValue)) {
                    return false;
                } else {
                    throw new Error(`"${value}" ist kein gültiger Ja/Nein-Wert`);
                }
                
            case 'email':
                if (value && !value.includes('@')) {
                    throw new Error(`"${value}" ist keine gültige E-Mail-Adresse`);
                }
                return value;
                
            default:
                return value;
        }
    }

    // Minimale Pflichtfelder prüfen
    checkMinimumRequiredFields(shipmentData) {
        const errors = [];
        const required = ['companyName', 'address1', 'city', 'country', 'postalCode'];
        
        required.forEach(field => {
            if (!shipmentData[field] || shipmentData[field].toString().trim() === '') {
                const fieldConfig = Object.values(UPS_FIELDS).find(f => f.key === field);
                errors.push(`Pflichtfeld "${fieldConfig?.label || field}" fehlt`);
            }
        });

        return errors;
    }

    // Daten-Warnungen prüfen
    checkDataWarnings(shipmentData, rowIndex) {
        const warnings = [];

        // Gewicht prüfen
        if (shipmentData.weight) {
            const weight = parseFloat(shipmentData.weight);
            if (weight > 30) {
                warnings.push(`Zeile ${rowIndex + 2}: Hohes Gewicht (${weight} kg) - zusätzliche Behandlung könnte erforderlich sein`);
            }
        }

        // Fehlende E-Mail für Benachrichtigungen
        if (!shipmentData.email) {
            warnings.push(`Zeile ${rowIndex + 2}: Keine E-Mail-Adresse - Empfänger erhält keine Tracking-Benachrichtigungen`);
        }

        // Fehlende Telefonnummer
        if (!shipmentData.telephone) {
            warnings.push(`Zeile ${rowIndex + 2}: Keine Telefonnummer - Zustellung könnte verzögert werden`);
        }

        // Internationale Sendung ohne Zollwert
        if (shipmentData.country && shipmentData.country !== 'DE' && !shipmentData.customsValue) {
            warnings.push(`Zeile ${rowIndex + 2}: Internationale Sendung ohne Zollwert - könnte zu Verzögerungen führen`);
        }

        return warnings;
    }

    // Fehlerschwere bestimmen
    determineSeverity(errors) {
        const criticalKeywords = ['pflichtfeld', 'erforderlich', 'fehlt', 'ungültig'];
        const hasCritical = errors.some(error => 
            criticalKeywords.some(keyword => error.toLowerCase().includes(keyword))
        );
        return hasCritical ? 'critical' : 'warning';
    }

    // Validierungs-Zusammenfassung rendern
    renderValidationSummary() {
        const container = document.getElementById('importSummary');
        if (!container) return;

        const { validRows, invalidRows, errors, warnings, skippedRows } = this.validationResults;
        const total = validRows.length + invalidRows.length + (skippedRows?.length || 0);

        let html = `
            <div class="validation-summary">
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-number">${total}</span>
                        <span class="stat-label">Verarbeitete Zeilen</span>
                    </div>
                    <div class="stat-item success">
                        <span class="stat-number">${validRows.length}</span>
                        <span class="stat-label">Gültige Zeilen</span>
                    </div>
                    <div class="stat-item error">
                        <span class="stat-number">${invalidRows.length}</span>
                        <span class="stat-label">Fehlerhafte Zeilen</span>
                    </div>
                    ${skippedRows && skippedRows.length > 0 ? `
                    <div class="stat-item info">
                        <span class="stat-number">${skippedRows.length}</span>
                        <span class="stat-label">Übersprungene Zeilen</span>
                    </div>
                    ` : ''}
                    ${warnings && warnings.length > 0 ? `
                    <div class="stat-item warning">
                        <span class="stat-number">${warnings.length}</span>
                        <span class="stat-label">Warnungen</span>
                    </div>
                    ` : ''}
                </div>
        `;

        // Kritische Fehler anzeigen
        const criticalErrors = errors.filter(error => error.includes('Kritischer Fehler') || error.includes('Pflichtfeld'));
        if (criticalErrors.length > 0) {
            html += `
                <div class="validation-errors critical">
                    <h5><i class="fas fa-exclamation-triangle"></i> Kritische Fehler:</h5>
                    <div class="error-list">
                        ${criticalErrors.slice(0, 5).map(error => `<div class="error-item critical">${error}</div>`).join('')}
                        ${criticalErrors.length > 5 ? `<div class="error-more">... und ${criticalErrors.length - 5} weitere kritische Fehler</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Standard-Fehler anzeigen
        const standardErrors = errors.filter(error => !error.includes('Kritischer Fehler') && !error.includes('Pflichtfeld'));
        if (standardErrors.length > 0) {
            html += `
                <div class="validation-errors">
                    <h5><i class="fas fa-exclamation-circle"></i> Validierungsfehler:</h5>
                    <div class="error-list">
                        ${standardErrors.slice(0, 8).map(error => `<div class="error-item">${error}</div>`).join('')}
                        ${standardErrors.length > 8 ? `<div class="error-more">... und ${standardErrors.length - 8} weitere Fehler</div>` : ''}
                    </div>
                </div>
            `;
        }

        // Warnungen anzeigen (zusammengefasst)
        if (warnings && warnings.length > 0) {
            const uniqueWarnings = [...new Set(warnings)]; // Duplikate entfernen
            html += `
                <div class="validation-warnings">
                    <h5><i class="fas fa-info-circle"></i> Warnungen:</h5>
                    <div class="warning-list">
                        ${uniqueWarnings.slice(0, 5).map(warning => `<div class="warning-item">${warning}</div>`).join('')}
                        ${uniqueWarnings.length > 5 ? `<div class="warning-more">... und ${uniqueWarnings.length - 5} weitere Warnungen</div>` : ''}
                    </div>
                    <div class="warning-note">
                        <small><i class="fas fa-lightbulb"></i> Warnungen blockieren den Import nicht, aber die Datenqualität könnte verbessert werden.</small>
                    </div>
                </div>
            `;
        }

        html += `
            </div>
            <div class="import-options">
                <label class="checkbox-label">
                    <input type="checkbox" id="importOnlyValid" ${invalidRows.length > 0 ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    Nur gültige Zeilen importieren (${validRows.length} Zeilen)
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="skipDuplicates" checked>
                    <span class="checkbox-custom"></span>
                    Duplikate überspringen (basierend auf Adresse)
                </label>
                <label class="checkbox-label">
                    <input type="checkbox" id="continueOnErrors" ${validRows.length > 0 ? 'checked' : ''}>
                    <span class="checkbox-custom"></span>
                    Import trotz Fehlern fortsetzen (${validRows.length} von ${total} Zeilen)
                </label>
            </div>
        `;

        // Import-Empfehlung
        if (invalidRows.length > 0 || (warnings && warnings.length > 0)) {
            html += this.generateImportRecommendation();
        }

        container.innerHTML = html;
    }

    // Import-Empfehlung generieren
    generateImportRecommendation() {
        const { validRows, invalidRows, errors, warnings } = this.validationResults;
        const errorRate = invalidRows.length / (validRows.length + invalidRows.length) * 100;
        
        let recommendation = '';
        let recommendationClass = '';
        let icon = '';

        if (errorRate === 0 && (!warnings || warnings.length === 0)) {
            recommendation = 'Alle Daten sind gültig. Sie können sicher importieren.';
            recommendationClass = 'success';
            icon = 'fa-check-circle';
        } else if (errorRate < 10) {
            recommendation = 'Wenige Fehler gefunden. Empfehlung: Nur gültige Zeilen importieren.';
            recommendationClass = 'info';
            icon = 'fa-info-circle';
        } else if (errorRate < 25) {
            recommendation = 'Mäßige Anzahl von Fehlern. Prüfen Sie die Datenqualität und importieren Sie nur gültige Zeilen.';
            recommendationClass = 'warning';
            icon = 'fa-exclamation-triangle';
        } else {
            recommendation = 'Viele Fehler gefunden. Überprüfen Sie das Dateiformat und korrigieren Sie die Fehler vor dem Import.';
            recommendationClass = 'error';
            icon = 'fa-times-circle';
        }

        return `
            <div class="import-recommendation ${recommendationClass}">
                <div class="recommendation-content">
                    <i class="fas ${icon}"></i>
                    <div class="recommendation-text">
                        <strong>Empfehlung:</strong> ${recommendation}
                    </div>
                </div>
                <div class="recommendation-stats">
                    <span>Erfolgsrate: ${Math.round((validRows.length / (validRows.length + invalidRows.length)) * 100)}%</span>
                </div>
            </div>
        `;
    }

    // Import bestätigen
    confirmImport() {
        if (!this.validationResults) {
            this.validateImportData();
        }

        const importOnlyValid = document.getElementById('importOnlyValid')?.checked || false;
        const skipDuplicates = document.getElementById('skipDuplicates')?.checked || false;

        let rowsToImport = importOnlyValid ? 
            this.validationResults.validRows : 
            [...this.validationResults.validRows, ...this.validationResults.invalidRows];

        // Duplikate entfernen
        if (skipDuplicates) {
            rowsToImport = this.removeDuplicates(rowsToImport);
        }

        const loadingToast = window.toastSystem.showLoading(`Importiere ${rowsToImport.length} Sendungen...`);

        // Import durchführen
        let importedCount = 0;
        let errorCount = 0;
        const importedShipmentIds = [];

        rowsToImport.forEach(row => {
            try {
                const shipment = window.shipmentManager.addShipment(row.data);
                if (shipment && shipment.id) {
                    importedShipmentIds.push(shipment.id);
                }
                importedCount++;
            } catch (error) {
                errorCount++;
                console.error('Fehler beim Importieren der Zeile:', error);
            }
        });

        window.toastSystem.hideToast(loadingToast);

        // Ergebnis anzeigen
        if (importedCount > 0) {
            window.toastSystem.showSuccess(
                `${importedCount} Sendungen erfolgreich importiert${errorCount > 0 ? `, ${errorCount} Fehler` : ''}`,
                { duration: 5000 }
            );

            // Activity Logger
            if (window.activityLogger) {
                window.activityLogger.logCsvImported({
                    fileName: this.currentFileName,
                    totalRows: this.validationResults.totalRows,
                    validRows: this.validationResults.validRows.length,
                    invalidRows: this.validationResults.invalidRows.length,
                    importedCount: importedCount,
                    errorCount: errorCount,
                    fileSize: this.currentFileSize,
                    duration: Date.now() - this.importStartTime,
                    importedShipmentIds: importedShipmentIds
                });
            }

            // UI aktualisieren
            if (window.appDE) {
                window.appDE.updateStats();
                window.appDE.renderShipmentsTable();
                window.appDE.switchToSection('shipments');
            }

            // Import zurücksetzen
            this.resetImport();
        } else {
            window.toastSystem.showError('Keine Sendungen konnten importiert werden');
        }
    }

    // Duplikate entfernen
    removeDuplicates(rows) {
        const seen = new Set();
        return rows.filter(row => {
            const key = `${row.data.companyName}-${row.data.address1}-${row.data.city}`.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Schritt wechseln
    goToStep(step) {
        // Schritt-Validierung
        if (step === 3 && !this.previewData) {
            window.toastSystem.showWarning('Bitte wählen Sie zuerst eine Datei aus');
            return;
        }

        if (step === 3 && !this.validationResults) {
            this.validateImportData();
        }

        this.currentStep = step;
        this.updateStepIndicators();
        this.showCurrentStep();
    }

    // Schritt-Indikatoren aktualisieren
    updateStepIndicators() {
        document.querySelectorAll('.step').forEach((stepElement, index) => {
            const stepNumber = index + 1;
            if (stepNumber === this.currentStep) {
                stepElement.classList.add('active');
            } else if (stepNumber < this.currentStep) {
                stepElement.classList.add('completed');
                stepElement.classList.remove('active');
            } else {
                stepElement.classList.remove('active', 'completed');
            }
        });
    }

    // Aktuellen Schritt anzeigen
    showCurrentStep() {
        document.querySelectorAll('.import-step').forEach((stepElement, index) => {
            if (index + 1 === this.currentStep) {
                stepElement.classList.add('active');
            } else {
                stepElement.classList.remove('active');
            }
        });
    }

    // Import zurücksetzen
    resetImport() {
        this.currentStep = 1;
        this.importData = null;
        this.previewData = null;
        this.validationResults = null;
        
        // UI zurücksetzen
        this.updateStepIndicators();
        this.showCurrentStep();
        
        // File Input zurücksetzen
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = '';
        }

        // Container leeren
        document.getElementById('previewTable').innerHTML = '';
        document.getElementById('importSummary').innerHTML = '';
    }
}

// CSS für Import-Handler
const importStyles = `
    .preview-info {
        background-color: var(--bg-tertiary);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-4);
    }

    .preview-mapping {
        margin-bottom: var(--space-4);
    }

    .mapping-grid {
        display: grid;
        gap: var(--space-2);
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        padding: var(--space-3);
    }

    .mapping-item {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        gap: var(--space-2);
        align-items: center;
        padding: var(--space-2);
        border-radius: var(--radius-sm);
    }

    .mapping-item.mapped {
        background-color: var(--success-light);
    }

    .mapping-item.unmapped {
        background-color: var(--warning-light);
    }

    .original-header {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    .mapping-arrow {
        color: var(--text-tertiary);
        font-weight: bold;
    }

    .mapped-field {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
    }

    .preview-table-container {
        max-height: 300px;
        overflow: auto;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
    }

    .preview-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--font-size-sm);
    }

    .preview-table th,
    .preview-table td {
        padding: var(--space-2);
        border-bottom: 1px solid var(--border-light);
        text-align: left;
    }

    .preview-table th {
        background-color: var(--bg-tertiary);
        font-weight: var(--font-weight-medium);
        position: sticky;
        top: 0;
    }

    .validation-summary {
        margin-bottom: var(--space-4);
    }

    .summary-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
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

    .validation-errors {
        background-color: var(--error-light);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-4);
    }

    .error-list {
        max-height: 200px;
        overflow-y: auto;
    }

    .error-item {
        padding: var(--space-1) 0;
        font-size: var(--font-size-sm);
        color: var(--error-dark);
    }

    .error-more {
        padding: var(--space-1) 0;
        font-style: italic;
        color: var(--text-secondary);
    }

    .import-options {
        padding: var(--space-4);
        background-color: var(--bg-secondary);
        border-radius: var(--radius-md);
    }

    .file-upload-area.dragover {
        border-color: var(--primary);
        background-color: var(--primary-light);
    }

    .step.completed .step-number {
        background-color: var(--success);
        color: var(--white);
    }

    .step.completed:not(:last-child)::after {
        background-color: var(--success);
    }

    /* Enhanced validation styles */
    .stat-item.info {
        background-color: var(--info-light);
    }

    .stat-item.warning {
        background-color: var(--warning-light);
    }

    .validation-errors.critical {
        background-color: var(--error-light);
        border-left: 4px solid var(--error);
        margin-bottom: var(--space-4);
    }

    .validation-errors.critical h5 {
        color: var(--error-dark);
        font-weight: var(--font-weight-semibold);
    }

    .error-item.critical {
        color: var(--error-dark);
        font-weight: var(--font-weight-medium);
        background-color: var(--error-light);
        padding: var(--space-2);
        border-radius: var(--radius-sm);
        margin-bottom: var(--space-1);
    }

    .validation-warnings {
        background-color: var(--warning-light);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        margin-bottom: var(--space-4);
        border-left: 4px solid var(--warning);
    }

    .validation-warnings h5 {
        color: var(--warning-dark);
        margin-bottom: var(--space-3);
    }

    .warning-list {
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: var(--space-3);
    }

    .warning-item {
        padding: var(--space-1) 0;
        font-size: var(--font-size-sm);
        color: var(--warning-dark);
        border-bottom: 1px solid var(--warning);
    }

    .warning-item:last-child {
        border-bottom: none;
    }

    .warning-more {
        padding: var(--space-1) 0;
        font-style: italic;
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }

    .warning-note {
        padding: var(--space-2);
        background-color: var(--warning);
        border-radius: var(--radius-sm);
        color: var(--warning-dark);
    }

    .import-recommendation {
        margin-top: var(--space-4);
        padding: var(--space-4);
        border-radius: var(--radius-md);
        border: 1px solid;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .import-recommendation.success {
        background-color: var(--success-light);
        border-color: var(--success);
        color: var(--success-dark);
    }

    .import-recommendation.info {
        background-color: var(--info-light);
        border-color: var(--info);
        color: var(--info-dark);
    }

    .import-recommendation.warning {
        background-color: var(--warning-light);
        border-color: var(--warning);
        color: var(--warning-dark);
    }

    .import-recommendation.error {
        background-color: var(--error-light);
        border-color: var(--error);
        color: var(--error-dark);
    }

    .recommendation-content {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        flex: 1;
    }

    .recommendation-content i {
        font-size: var(--font-size-lg);
    }

    .recommendation-text {
        font-size: var(--font-size-sm);
    }

    .recommendation-stats {
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
        opacity: 0.8;
    }
`;

// CSS hinzufügen
const importStyleSheet = document.createElement('style');
importStyleSheet.textContent = importStyles;
document.head.appendChild(importStyleSheet);

// Import Handler initialisieren
window.ImportHandlerDE = ImportHandlerDE;
window.importHandler = new ImportHandlerDE();

// Globale Funktionen für HTML
window.backToStep = (step) => window.importHandler.goToStep(step);
window.nextStep = (step) => window.importHandler.goToStep(step);
window.confirmImport = () => window.importHandler.confirmImport();
window.updateCountryDependentFields = (country) => {
    // Service-Optionen basierend auf Land aktualisieren
    const serviceSelect = document.querySelector('[name="serviceType"]');
    if (serviceSelect) {
        const availableServices = FIELD_HELPERS.calculateServiceOptions(country, false);
        serviceSelect.innerHTML = availableServices.map(option => 
            `<option value="${option.value}">${option.label}</option>`
        ).join('');
    }
};