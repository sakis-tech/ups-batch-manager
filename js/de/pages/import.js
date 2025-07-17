// Import page specific functionality
class ImportPage {
    constructor() {
        this.currentStep = 1;
        this.importData = null;
        this.previewData = null;
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateStats();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // File input
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }

        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });
        }

        // Update stats when shipment manager changes
        if (window.shipmentManager) {
            window.addEventListener('storage', (e) => {
                if (e.key === 'upsShipments') {
                    this.updateStats();
                }
            });
        }
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('fileUploadArea');
        if (!uploadArea) return;

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
                this.handleFileUpload(files[0]);
            }
        });
    }

    handleFileUpload(file) {
        if (!file) return;

        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        const loadingToast = window.toastSystem && window.toastSystem.showLoading 
            ? window.toastSystem.showLoading(`Lade "${file.name}"...`)
            : null;

        const reader = new FileReader();
        
        // Error handler for FileReader
        reader.onerror = (error) => {
            if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                window.toastSystem.hideToast(loadingToast);
            }
            
            console.error('FileReader error:', error);
            
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.');
            }
        };
        
        // Timeout for FileReader
        const timeoutId = setTimeout(() => {
            reader.abort();
            if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                window.toastSystem.hideToast(loadingToast);
            }
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Timeout beim Lesen der Datei. Datei möglicherweise zu groß.');
            }
        }, 30000); // 30 seconds timeout
        
        reader.onload = (e) => {
            clearTimeout(timeoutId);
            
            try {
                const csvData = e.target.result;
                
                if (!csvData || csvData.trim().length === 0) {
                    throw new Error('Datei ist leer oder ungültig');
                }
                
                this.importData = {
                    file: file,
                    data: csvData,
                    delimiter: file.name.endsWith('.ssv') ? ';' : ','
                };
                
                this.processImportData();
                
                if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                    window.toastSystem.hideToast(loadingToast);
                }
                
                this.nextStep(2);
                
            } catch (error) {
                if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                    window.toastSystem.hideToast(loadingToast);
                }
                
                console.error('Error processing file:', error);
                
                if (window.toastSystem && window.toastSystem.showError) {
                    window.toastSystem.showError(`Fehler beim Verarbeiten der Datei: ${error.message}`);
                }
            }
        };

        reader.readAsText(file);
    }

    validateFile(file) {
        // File size check (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Datei ist zu groß. Maximale Größe: 10MB');
            }
            return false;
        }
        
        // File type check
        const allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
        const allowedExtensions = ['.csv', '.ssv', '.txt'];
        
        const hasValidType = allowedTypes.includes(file.type);
        const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!hasValidType && !hasValidExtension) {
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Ungültiger Dateityp. Nur CSV, SSV und TXT Dateien sind erlaubt.');
            }
            return false;
        }
        
        return true;
    }

    processImportData() {
        if (!this.importData) return;

        try {
            const lines = this.importData.data.trim().split('\n');
            if (lines.length < 2) {
                throw new Error('CSV-Datei enthält keine Daten');
            }

            // Parse header line
            const headers = this.parseCSVLine(lines[0], this.importData.delimiter);
            const fieldMapping = this.createFieldMapping(headers);

            const previewRows = [];
            const errors = [];

            // Process first 10 rows for preview
            const maxPreviewRows = Math.min(10, lines.length - 1);
            for (let i = 1; i <= maxPreviewRows; i++) {
                try {
                    const values = this.parseCSVLine(lines[i], this.importData.delimiter);
                    const shipmentData = this.mapCSVDataToShipment(values, fieldMapping);
                    previewRows.push({
                        rowNumber: i,
                        data: shipmentData,
                        values: values
                    });
                } catch (error) {
                    errors.push({ line: i + 1, error: error.message });
                }
            }

            this.previewData = {
                headers: headers,
                fieldMapping: fieldMapping,
                previewRows: previewRows,
                totalRows: lines.length - 1,
                errors: errors
            };

        } catch (error) {
            console.error('Error processing import data:', error);
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError(`Fehler beim Verarbeiten der Daten: ${error.message}`);
            }
        }
    }

    parseCSVLine(line, delimiter) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
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

    createFieldMapping(headers) {
        const mapping = {};
        
        if (!window.UPS_FIELDS) {
            console.warn('UPS_FIELDS not available');
            return mapping;
        }
        
        headers.forEach((header, index) => {
            const cleanHeader = header.replace(/['"]/g, '').toLowerCase().trim();
            
            // Mapping based on UPS fields
            for (const [upsField, config] of Object.entries(window.UPS_FIELDS)) {
                if (cleanHeader.includes(upsField.toLowerCase()) || 
                    cleanHeader.includes(config.label.toLowerCase())) {
                    mapping[index] = config.key;
                    break;
                }
            }
        });

        return mapping;
    }

    mapCSVDataToShipment(values, fieldMapping) {
        const shipmentData = {};
        
        Object.entries(fieldMapping).forEach(([index, fieldKey]) => {
            if (values[index] !== undefined && values[index] !== '') {
                shipmentData[fieldKey] = values[index];
            }
        });

        return shipmentData;
    }

    nextStep(step) {
        this.currentStep = step;
        this.updateStepIndicator();
        this.showStep(step);
        
        if (step === 2) {
            this.renderPreview();
        } else if (step === 3) {
            this.renderSummary();
        }
    }

    updateStepIndicator() {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });
    }

    showStep(step) {
        document.querySelectorAll('.import-step').forEach((stepElement, index) => {
            stepElement.classList.toggle('active', index + 1 === step);
        });
    }

    renderPreview() {
        const previewTable = document.getElementById('previewTable');
        if (!previewTable || !this.previewData) return;

        let html = '<table class="preview-table-content">';
        
        // Header
        html += '<thead><tr>';
        this.previewData.headers.forEach(header => {
            html += `<th>${header}</th>`;
        });
        html += '</tr></thead>';
        
        // Preview rows
        html += '<tbody>';
        this.previewData.previewRows.forEach(row => {
            html += '<tr>';
            row.values.forEach(value => {
                html += `<td>${value}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody>';
        
        html += '</table>';
        
        if (this.previewData.totalRows > 10) {
            html += `<p class="preview-note">Zeige 10 von ${this.previewData.totalRows} Zeilen</p>`;
        }
        
        previewTable.innerHTML = html;
    }

    renderSummary() {
        const importSummary = document.getElementById('importSummary');
        if (!importSummary || !this.previewData) return;

        const validRows = this.previewData.previewRows.filter(row => 
            row.data.companyName || row.data.address1
        ).length;

        let html = `
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">Gesamt Zeilen:</span>
                    <span class="stat-value">${this.previewData.totalRows}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Gültige Zeilen:</span>
                    <span class="stat-value">${validRows}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Fehler:</span>
                    <span class="stat-value">${this.previewData.errors.length}</span>
                </div>
            </div>
        `;

        if (this.previewData.errors.length > 0) {
            html += '<div class="summary-errors">';
            html += '<h4>Fehler:</h4>';
            html += '<ul>';
            this.previewData.errors.forEach(error => {
                html += `<li>Zeile ${error.line}: ${error.error}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }

        importSummary.innerHTML = html;
    }

    updateStats() {
        if (window.sharedPageManager) {
            window.sharedPageManager.updateStats();
        }
    }

    loadFromStorage() {
        // Load any import-specific settings
        const importSettings = localStorage.getItem('importSettings');
        if (importSettings) {
            try {
                const settings = JSON.parse(importSettings);
                this.applyImportSettings(settings);
            } catch (error) {
                console.error('Error loading import settings:', error);
            }
        }
    }

    applyImportSettings(settings) {
        // Apply any import-specific settings
        if (settings.autoProcessAfterUpload !== undefined) {
            this.autoProcessAfterUpload = settings.autoProcessAfterUpload;
        }
    }

    renderContent() {
        // Refresh current step
        this.showStep(this.currentStep);
        if (this.currentStep === 2 && this.previewData) {
            this.renderPreview();
        } else if (this.currentStep === 3 && this.previewData) {
            this.renderSummary();
        }
    }
}

// Global functions for HTML onclick handlers
window.backToStep = (step) => {
    if (window.importPage) {
        window.importPage.nextStep(step);
    }
};

window.nextStep = (step) => {
    if (window.importPage) {
        window.importPage.nextStep(step);
    }
};

window.confirmImport = () => {
    if (window.importPage && window.importPage.importData && window.shipmentManager) {
        const loadingToast = window.toastSystem && window.toastSystem.showLoading 
            ? window.toastSystem.showLoading('Importiere Daten...')
            : null;

        try {
            const result = window.shipmentManager.importFromCSV(
                window.importPage.importData.data, 
                window.importPage.importData.delimiter
            );

            if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                window.toastSystem.hideToast(loadingToast);
            }

            if (result.success) {
                if (window.toastSystem && window.toastSystem.showSuccess) {
                    window.toastSystem.showSuccess(
                        `${result.imported} Sendungen erfolgreich importiert`,
                        { 
                            duration: 5000,
                            actions: result.errors.length > 0 ? [
                                { text: 'Fehler anzeigen', action: 'showErrors', class: 'btn-warning' }
                            ] : []
                        }
                    );
                }
                
                // Redirect to sendungen page
                setTimeout(() => {
                    window.location.href = 'sendungen.html';
                }, 1500);
            } else {
                if (window.toastSystem && window.toastSystem.showError) {
                    window.toastSystem.showError(`Import fehlgeschlagen: ${result.error}`);
                }
            }
        } catch (error) {
            if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                window.toastSystem.hideToast(loadingToast);
            }
            
            console.error('Error during import:', error);
            
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError(`Fehler beim Import: ${error.message}`);
            }
        }
    }
};

// Initialize import page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.importPage = new ImportPage();
    window.pageManager = window.importPage; // Set as global page manager
});