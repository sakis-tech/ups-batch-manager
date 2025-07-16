// Sendungsverwaltung für deutsche UPS Batch Manager Oberfläche
class ShipmentManager {
    constructor() {
        this.shipments = [];
        this.nextId = 1;
        this.storageKey = 'upsShipments';
        this.activityStorageKey = 'upsActivity';
        this.activities = [];
        this.initialize();
    }

    initialize() {
        this.loadFromStorage();
        this.setupEventListeners();
    }

    // Daten aus localStorage laden
    loadFromStorage() {
        try {
            // Prüfen ob localStorage verfügbar ist
            if (typeof(Storage) === 'undefined') {
                console.warn('localStorage nicht verfügbar');
                this.shipments = [];
                this.activities = [];
                return;
            }
            
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    // Validierung der geladenen Daten
                    if (data && typeof data === 'object') {
                        this.shipments = Array.isArray(data.shipments) ? data.shipments : [];
                        this.nextId = typeof data.nextId === 'number' ? data.nextId : 1;
                    } else {
                        console.warn('Ungültige Shipment-Daten in localStorage');
                        this.shipments = [];
                        this.nextId = 1;
                    }
                } catch (parseError) {
                    console.error('Fehler beim Parsen der Shipment-Daten:', parseError);
                    this.shipments = [];
                    this.nextId = 1;
                }
            }

            const storedActivities = localStorage.getItem(this.activityStorageKey);
            if (storedActivities) {
                try {
                    const activities = JSON.parse(storedActivities);
                    this.activities = Array.isArray(activities) ? activities : [];
                } catch (parseError) {
                    console.error('Fehler beim Parsen der Activity-Daten:', parseError);
                    this.activities = [];
                }
            }
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            this.shipments = [];
            this.activities = [];
        }
    }

    // Daten in localStorage speichern
    saveToStorage() {
        try {
            // Prüfen ob localStorage verfügbar ist
            if (typeof(Storage) === 'undefined') {
                console.warn('localStorage nicht verfügbar');
                if (window.toastSystem && typeof window.toastSystem.showWarning === 'function') {
                    window.toastSystem.showWarning('Daten können nicht gespeichert werden - localStorage nicht verfügbar');
                }
                return;
            }
            
            const data = {
                shipments: this.shipments,
                nextId: this.nextId
            };
            
            // Versuche zu speichern und prüfe auf Quota-Überschreitung
            try {
                const serializedData = JSON.stringify(data);
                const serializedActivities = JSON.stringify(this.activities);
                
                // Prüfe verfügbaren Speicherplatz
                const testKey = 'quota-test';
                const testData = 'test';
                localStorage.setItem(testKey, testData);
                localStorage.removeItem(testKey);
                
                localStorage.setItem(this.storageKey, serializedData);
                localStorage.setItem(this.activityStorageKey, serializedActivities);
                
            } catch (quotaError) {
                if (quotaError.name === 'QuotaExceededError' || quotaError.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.error('localStorage Quota überschritten:', quotaError);
                    
                    // Versuche alten Daten zu löschen
                    this.cleanupOldData();
                    
                    // Erneuter Versuch
                    try {
                        localStorage.setItem(this.storageKey, JSON.stringify(data));
                        localStorage.setItem(this.activityStorageKey, JSON.stringify(this.activities));
                    } catch (secondError) {
                        throw new Error('Speicher voll - auch nach Bereinigung');
                    }
                } else {
                    throw quotaError;
                }
            }
            
        } catch (error) {
            console.error('Fehler beim Speichern der Daten:', error);
            
            let errorMessage = 'Fehler beim Speichern der Daten.';
            if (error.message.includes('Speicher voll')) {
                errorMessage = 'Speicher voll. Bitte löschen Sie alte Daten oder leeren Sie den Browser-Cache.';
            }
            
            if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
                window.toastSystem.showError(errorMessage);
            }
        }
    }
    
    // Alte Daten bereinigen
    cleanupOldData() {
        try {
            // Behalte nur die letzten 25 Aktivitäten
            if (this.activities.length > 25) {
                this.activities = this.activities.slice(0, 25);
            }
            
            // Entferne sehr alte Sendungen (älter als 1 Jahr)
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            
            const originalCount = this.shipments.length;
            this.shipments = this.shipments.filter(shipment => {
                const createdAt = new Date(shipment.createdAt);
                return createdAt > oneYearAgo;
            });
            
            const removedCount = originalCount - this.shipments.length;
            if (removedCount > 0) {
                console.log(`${removedCount} alte Sendungen entfernt`);
                if (window.toastSystem && typeof window.toastSystem.showInfo === 'function') {
                    window.toastSystem.showInfo(`${removedCount} alte Sendungen automatisch entfernt`);
                }
            }
        } catch (error) {
            console.error('Fehler beim Bereinigen alter Daten:', error);
        }
    }

    // Event-Listener einrichten
    setupEventListeners() {
        // Automatisches Speichern bei Sichtbarkeitswechsel
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveToStorage();
            }
        });

        // Speichern vor Seitenwechsel
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    // Neue Sendung hinzufügen
    addShipment(shipmentData) {
        const shipment = this.createShipmentObject(shipmentData);
        shipment.id = this.nextId++;
        shipment.createdAt = new Date().toISOString();
        shipment.updatedAt = shipment.createdAt;
        
        // Validierung
        const validation = this.validateShipment(shipment);
        shipment.isValid = validation.isValid;
        shipment.errors = validation.errors;

        this.shipments.push(shipment);
        this.saveToStorage();

        // Aktivität hinzufügen
        this.addActivity('add', `Sendung "${shipment.companyName}" hinzugefügt`);

        // Toast-Benachrichtigung
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            if (shipment.isValid) {
                window.toastSystem.showSuccess('Sendung erfolgreich hinzugefügt');
            } else {
                window.toastSystem.showWarning(`Sendung hinzugefügt, aber ${shipment.errors.length} Fehler gefunden`);
            }
        }

        return shipment;
    }

    // Sendung aktualisieren
    updateShipment(id, shipmentData) {
        const index = this.shipments.findIndex(s => s.id === id);
        if (index === -1) return null;

        const oldShipment = { ...this.shipments[index] };
        const updatedShipment = { ...this.shipments[index], ...shipmentData };
        updatedShipment.updatedAt = new Date().toISOString();

        // Validierung
        const validation = this.validateShipment(updatedShipment);
        updatedShipment.isValid = validation.isValid;
        updatedShipment.errors = validation.errors;

        this.shipments[index] = updatedShipment;
        this.saveToStorage();

        // Aktivität hinzufügen
        this.addActivity('update', `Sendung "${updatedShipment.companyName}" bearbeitet`);

        // Toast-Benachrichtigung
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            if (updatedShipment.isValid) {
                window.toastSystem.showSuccess('Sendung erfolgreich aktualisiert');
            } else {
                window.toastSystem.showWarning(`Sendung aktualisiert, aber ${updatedShipment.errors.length} Fehler gefunden`);
            }
        }

        return updatedShipment;
    }

    // Sendung löschen
    deleteShipment(id) {
        const index = this.shipments.findIndex(s => s.id === id);
        if (index === -1) return false;

        const shipment = this.shipments[index];
        this.shipments.splice(index, 1);
        this.saveToStorage();

        // Aktivität hinzufügen
        this.addActivity('delete', `Sendung "${shipment.companyName}" gelöscht`);

        // Toast-Benachrichtigung
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Sendung erfolgreich gelöscht');
        }

        return true;
    }

    // Mehrere Sendungen löschen
    deleteShipments(ids) {
        const deletedCount = ids.filter(id => {
            const index = this.shipments.findIndex(s => s.id === id);
            if (index !== -1) {
                this.shipments.splice(index, 1);
                return true;
            }
            return false;
        }).length;

        if (deletedCount > 0) {
            this.saveToStorage();
            this.addActivity('delete', `${deletedCount} Sendungen gelöscht`);

            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess(`${deletedCount} Sendungen erfolgreich gelöscht`);
            }
        }

        return deletedCount;
    }

    // Sendung abrufen
    getShipment(id) {
        return this.shipments.find(s => s.id === id);
    }

    // Alle Sendungen abrufen
    getAllShipments() {
        return [...this.shipments];
    }

    // Gefilterte Sendungen abrufen
    getFilteredShipments(filters = {}) {
        let filtered = [...this.shipments];

        // Textsuche
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(shipment => 
                shipment.companyName?.toLowerCase().includes(searchLower) ||
                shipment.contactName?.toLowerCase().includes(searchLower) ||
                shipment.city?.toLowerCase().includes(searchLower) ||
                shipment.address1?.toLowerCase().includes(searchLower)
            );
        }

        // Service-Filter
        if (filters.serviceType) {
            filtered = filtered.filter(shipment => 
                shipment.serviceType === filters.serviceType
            );
        }

        // Land-Filter
        if (filters.country) {
            filtered = filtered.filter(shipment => 
                shipment.country === filters.country
            );
        }

        // Status-Filter
        if (filters.status) {
            if (filters.status === 'valid') {
                filtered = filtered.filter(shipment => shipment.isValid);
            } else if (filters.status === 'invalid') {
                filtered = filtered.filter(shipment => !shipment.isValid);
            }
        }

        // Sortierung
        if (filters.sortBy) {
            filtered.sort((a, b) => {
                const aVal = a[filters.sortBy] || '';
                const bVal = b[filters.sortBy] || '';
                
                if (filters.sortDirection === 'desc') {
                    return bVal.toString().localeCompare(aVal.toString(), 'de');
                } else {
                    return aVal.toString().localeCompare(bVal.toString(), 'de');
                }
            });
        }

        return filtered;
    }

    // Sendungsobjekt erstellen
    createShipmentObject(data) {
        return {
            // Empfänger-Informationen
            contactName: data.contactName || '',
            companyName: data.companyName || '',
            country: data.country || 'DE',
            address1: data.address1 || '',
            address2: data.address2 || '',
            address3: data.address3 || '',
            city: data.city || '',
            state: data.state || '',
            postalCode: data.postalCode || '',
            telephone: data.telephone || '',
            extension: data.extension || '',
            residential: Boolean(data.residential),
            email: data.email || '',

            // Paket-Informationen
            packagingType: data.packagingType || '02',
            customsValue: parseFloat(data.customsValue) || 0,
            weight: parseFloat(data.weight) || 1,
            length: parseInt(data.length, 10) || 0,
            width: parseInt(data.width, 10) || 0,
            height: parseInt(data.height, 10) || 0,
            unitOfMeasure: data.unitOfMeasure || 'KG',
            goodsDescription: data.goodsDescription || '',
            documentsNoCommercialValue: Boolean(data.documentsNoCommercialValue),
            gnifc: data.gnifc || '',
            packageDeclaredValue: parseFloat(data.packageDeclaredValue) || 0,

            // Service-Optionen
            serviceType: data.serviceType || '03',
            deliveryConfirm: data.deliveryConfirm || '',
            shipperRelease: Boolean(data.shipperRelease),
            returnOfDocuments: Boolean(data.returnOfDocuments),
            saturdayDelivery: Boolean(data.saturdayDelivery),
            carbonNeutral: Boolean(data.carbonNeutral),
            largePackage: Boolean(data.largePackage),
            additionalHandling: Boolean(data.additionalHandling),

            // Referenzen
            reference1: data.reference1 || '',
            reference2: data.reference2 || '',
            reference3: data.reference3 || '',

            // Zusätzliche Felder
            upsPremiumCare: Boolean(data.upsPremiumCare),
            electronicPackageRelease: Boolean(data.electronicPackageRelease),
            lithiumIonAlone: Boolean(data.lithiumIonAlone),
            lithiumIonInEquipment: Boolean(data.lithiumIonInEquipment),

            // Metadaten
            isValid: false,
            errors: []
        };
    }

    // Sendung validieren
    validateShipment(shipment) {
        const errors = [];

        // Pflichtfelder prüfen
        if (!shipment.companyName) {
            errors.push({ field: 'companyName', message: 'Firmenname ist erforderlich' });
        }
        if (!shipment.address1) {
            errors.push({ field: 'address1', message: 'Adresse ist erforderlich' });
        }
        if (!shipment.city) {
            errors.push({ field: 'city', message: 'Stadt ist erforderlich' });
        }
        if (!shipment.country) {
            errors.push({ field: 'country', message: 'Land ist erforderlich' });
        }
        if (!shipment.postalCode) {
            errors.push({ field: 'postalCode', message: 'Postleitzahl ist erforderlich' });
        }

        // Gewicht validieren
        if (!shipment.weight || shipment.weight <= 0) {
            errors.push({ field: 'weight', message: 'Gültiges Gewicht ist erforderlich' });
        } else if (shipment.unitOfMeasure === 'KG' && shipment.weight > 70) {
            errors.push({ field: 'weight', message: 'Gewicht darf nicht über 70 kg liegen' });
        } else if (shipment.unitOfMeasure === 'LB' && shipment.weight > 150) {
            errors.push({ field: 'weight', message: 'Gewicht darf nicht über 150 lbs liegen' });
        }

        // Postleitzahl nach Land validieren
        if (shipment.postalCode && window.FIELD_VALIDATORS && window.FIELD_VALIDATORS.validatePostalCode) {
            if (!window.FIELD_VALIDATORS.validatePostalCode(shipment.postalCode, shipment.country)) {
                errors.push({ field: 'postalCode', message: 'Ungültiges Postleitzahl-Format für das gewählte Land' });
            }
        }

        // E-Mail validieren
        if (shipment.email && window.FIELD_VALIDATORS && window.FIELD_VALIDATORS.validateEmail) {
            if (!window.FIELD_VALIDATORS.validateEmail(shipment.email)) {
                errors.push({ field: 'email', message: 'Ungültiges E-Mail-Format' });
            }
        }

        // Dimensionen validieren
        if ((shipment.length || shipment.width || shipment.height) && 
            window.FIELD_VALIDATORS && window.FIELD_VALIDATORS.validateDimensions) {
            if (!window.FIELD_VALIDATORS.validateDimensions(shipment.length, shipment.width, shipment.height)) {
                errors.push({ field: 'dimensions', message: 'Ungültige Paketdimensionen' });
            }
        }

        // Internationale Sendungen
        if (shipment.country !== 'DE') {
            if (!shipment.customsValue || shipment.customsValue <= 0) {
                errors.push({ field: 'customsValue', message: 'Zollwert ist für internationale Sendungen erforderlich' });
            }
            if (!shipment.goodsDescription) {
                errors.push({ field: 'goodsDescription', message: 'Warenbeschreibung ist für internationale Sendungen erforderlich' });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Statistiken berechnen
    getStatistics() {
        const total = this.shipments.length;
        const valid = this.shipments.filter(s => s.isValid).length;
        const invalid = total - valid;
        const totalWeight = this.shipments.reduce((sum, s) => {
            const weight = s.unitOfMeasure === 'LB' ? s.weight / 2.20462 : s.weight;
            return sum + (weight || 0);
        }, 0);

        return {
            total,
            valid,
            invalid,
            totalWeight: Math.round(totalWeight * 10) / 10,
            validPercentage: total > 0 ? Math.round((valid / total) * 100) : 0
        };
    }

    // CSV importieren
    importFromCSV(csvData, delimiter = ',') {
        try {
            const lines = csvData.trim().split('\n');
            if (lines.length < 2) {
                throw new Error('CSV-Datei enthält keine Daten');
            }

            // Header-Zeile parsen
            const headers = this.parseCSVLine(lines[0], delimiter);
            const fieldMapping = this.createFieldMapping(headers);

            const importedShipments = [];
            const errors = [];

            // Datenzeilen verarbeiten
            for (let i = 1; i < lines.length; i++) {
                try {
                    const values = this.parseCSVLine(lines[i], delimiter);
                    const shipmentData = this.mapCSVDataToShipment(values, fieldMapping);
                    
                    if (shipmentData.companyName || shipmentData.address1) {
                        const shipment = this.addShipment(shipmentData);
                        importedShipments.push(shipment);
                    }
                } catch (error) {
                    errors.push({ line: i + 1, error: error.message });
                }
            }

            // Aktivität hinzufügen
            this.addActivity('import', `${importedShipments.length} Sendungen aus CSV importiert`);

            return {
                success: true,
                imported: importedShipments.length,
                errors,
                shipments: importedShipments
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                imported: 0,
                errors: []
            };
        }
    }

    // CSV-Zeile parsen
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

    // Feld-Mapping erstellen
    createFieldMapping(headers) {
        const mapping = {};
        
        headers.forEach((header, index) => {
            const cleanHeader = header.replace(/['"]/g, '').toLowerCase().trim();
            
            // Mapping basierend auf UPS-Feldern
            if (window.UPS_FIELDS) {
                for (const [upsField, config] of Object.entries(window.UPS_FIELDS)) {
                    if (cleanHeader.includes(upsField.toLowerCase()) || 
                        cleanHeader.includes(config.label.toLowerCase())) {
                        mapping[index] = config.key;
                        break;
                    }
                }
            }
        });

        return mapping;
    }

    // CSV-Daten zu Sendung mappen
    mapCSVDataToShipment(values, fieldMapping) {
        const shipmentData = {};
        
        Object.entries(fieldMapping).forEach(([index, fieldKey]) => {
            if (values[index] !== undefined && values[index] !== '') {
                shipmentData[fieldKey] = values[index];
            }
        });

        return shipmentData;
    }

    // Aktivität hinzufügen
    addActivity(type, message) {
        const activity = {
            id: Date.now(),
            type,
            message,
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString('de-DE', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };

        this.activities.unshift(activity);
        
        // Nur die letzten 50 Aktivitäten behalten
        if (this.activities.length > 50) {
            this.activities = this.activities.slice(0, 50);
        }

        this.saveToStorage();
        
        // UI aktualisieren
        if (window.appDE && typeof window.appDE.updateRecentActivities === 'function') {
            window.appDE.updateRecentActivities();
        }
    }

    // Letzte Aktivitäten abrufen
    getRecentActivities(limit = 10) {
        return this.activities.slice(0, limit);
    }

    // Alle Daten löschen
    clearAllData() {
        this.shipments = [];
        this.activities = [];
        this.nextId = 1;
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.activityStorageKey);
        
        this.addActivity('clear', 'Alle Daten gelöscht');
        
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Alle Daten erfolgreich gelöscht');
        }
    }

    // Export für UPS-Format
    exportToUPSFormat(options = {}) {
        const shipments = options.onlyValid ? 
            this.shipments.filter(s => s.isValid) : 
            this.shipments;

        if (shipments.length === 0) {
            throw new Error('Keine Sendungen zum Exportieren vorhanden');
        }

        const delimiter = options.format === 'ssv' ? ';' : ',';
        const lines = [];

        // Header erstellen (falls gewünscht)
        if (options.includeHeaders && window.UPS_FIELDS) {
            const headers = Object.keys(window.UPS_FIELDS);
            lines.push(headers.join(delimiter));
        }

        // Sendungsdaten
        if (window.UPS_FIELDS) {
            shipments.forEach(shipment => {
                const values = Object.entries(window.UPS_FIELDS).map(([upsField, config]) => {
                    const value = shipment[config.key] || '';
                    return this.formatCSVValue(value, delimiter);
                });
                lines.push(values.join(delimiter));
            });
        }

        // Aktivität hinzufügen
        this.addActivity('export', `${shipments.length} Sendungen exportiert`);

        return lines.join('\n');
    }

    // CSV-Wert formatieren
    formatCSVValue(value, delimiter) {
        const stringValue = String(value);
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }
}

// ShipmentManager global verfügbar machen
window.ShipmentManager = ShipmentManager;
window.shipmentManager = new ShipmentManager();