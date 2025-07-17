/**
 * Speicher-Management für deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet die lokale Datenspeicherung mit LocalStorage, einschließlich:
 * - Robuste Fehlerbehandlung und Wiederherstellung
 * - Automatische Bereinigung bei Speichermangel
 * - Backup- und Restore-Funktionalität
 * - Proaktive Speicher-Überwachung
 * 
 * @class StorageManagerDE
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class StorageManagerDE {
    /**
     * Initialisiert den StorageManager mit Standard-Konfiguration
     * 
     * @constructor
     */
    constructor() {
        /** @type {Object.<string, string>} Storage-Schlüssel für verschiedene Datentypen */
        this.storageKeys = {
            shipments: 'upsShipments',
            activities: 'upsActivity',
            settings: 'upsSettings',
            addressHistory: 'upsAddressHistory',
            templates: 'upsTemplates',
            backups: 'upsBackups'
        };
        
        /** @type {number} Maximale Speichergröße in Bytes (5MB) */
        this.maxStorageSize = 5 * 1024 * 1024;
        
        /** @type {number} Maximale Anzahl der Adressverlauf-Einträge */
        this.maxAddressHistory = 50;
        
        /** @type {number} Maximale Anzahl der Backup-Einträge */
        this.maxBackups = 5;
        
        this.initialize();
    }

    initialize() {
        this.checkStorageSupport();
        this.setupStorageMonitoring();
        this.performMaintenance();
    }

    // LocalStorage Unterstützung prüfen
    checkStorageSupport() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            this.storageSupported = true;
        } catch (error) {
            this.storageSupported = false;
            console.warn('LocalStorage wird nicht unterstützt:', error);
        }
    }

    /**
     * Speichert Daten sicher im LocalStorage mit Fehlerbehandlung
     * 
     * @param {string} key - Der Schlüssel für die Daten
     * @param {*} data - Die zu speichernden Daten
     * @returns {boolean} true bei Erfolg, false bei Fehler
     */
    setItem(key, data) {
        if (!this.storageSupported) {
            console.warn('LocalStorage nicht verfügbar');
            return false;
        }

        try {
            const serializedData = JSON.stringify(data);
            const dataSize = serializedData.length;
            const currentSize = this.getStorageSize();
            
            // Speicherplatz prüfen vor dem Speichern
            if (currentSize + dataSize > this.maxStorageSize) {
                console.warn(`Speicherplatz nicht ausreichend. Benötigt: ${this.formatBytes(dataSize)}, Verfügbar: ${this.formatBytes(this.maxStorageSize - currentSize)}`);
                
                // Versuche Cleanup
                const cleanupSuccess = this.performCleanup();
                if (!cleanupSuccess) {
                    throw new Error('Cleanup fehlgeschlagen');
                }
                
                // Nach Cleanup nochmals prüfen
                const newSize = this.getStorageSize();
                if (newSize + dataSize > this.maxStorageSize) {
                    // Versuche Datenkomprimierung
                    const compressedData = this.compressData(data);
                    const compressedSize = JSON.stringify(compressedData).length;
                    
                    if (newSize + compressedSize > this.maxStorageSize) {
                        throw new Error(`Nicht genügend Speicherplatz verfügbar. Benötigt: ${this.formatBytes(dataSize)}, Verfügbar: ${this.formatBytes(this.maxStorageSize - newSize)}`);
                    }
                    
                    localStorage.setItem(key, JSON.stringify(compressedData));
                    return true;
                }
            }

            // Backup der vorherigen Version erstellen (falls vorhanden)
            const existingData = localStorage.getItem(key);
            if (existingData && key === this.storageKeys.shipments) {
                this.createIncrementalBackup(key, existingData);
            }

            localStorage.setItem(key, serializedData);
            
            // Speicher-Info nach dem Speichern aktualisieren
            this.updateStorageMonitoring();
            
            return true;
        } catch (error) {
            console.error('Fehler beim Speichern:', error);
            
            if (error.name === 'QuotaExceededError') {
                this.handleStorageQuotaExceeded();
            } else {
                this.handleStorageError(error, key, data);
            }
            
            return false;
        }
    }

    // Daten komprimieren
    compressData(data) {
        if (typeof data === 'object' && data !== null) {
            // Entferne leere oder null Werte
            const compressed = this.removeEmptyValues(data);
            return compressed;
        }
        return data;
    }

    // Leere Werte entfernen
    removeEmptyValues(obj) {
        if (Array.isArray(obj)) {
            return obj.map(item => this.removeEmptyValues(item)).filter(item => item !== null && item !== undefined);
        } else if (typeof obj === 'object' && obj !== null) {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                if (value !== null && value !== undefined && value !== '') {
                    cleaned[key] = this.removeEmptyValues(value);
                }
            }
            return cleaned;
        }
        return obj;
    }

    // Inkrementelles Backup erstellen
    createIncrementalBackup(key, data) {
        try {
            const backupKey = `${key}_backup_${Date.now()}`;
            const backups = this.getItem('incrementalBackups', []);
            
            // Nur die letzten 3 Backups behalten
            if (backups.length >= 3) {
                const oldestBackup = backups.shift();
                localStorage.removeItem(oldestBackup.key);
            }
            
            localStorage.setItem(backupKey, data);
            backups.push({
                key: backupKey,
                originalKey: key,
                timestamp: Date.now(),
                size: data.length
            });
            
            this.setItem('incrementalBackups', backups);
        } catch (error) {
            console.warn('Fehler beim Erstellen des inkrementellen Backups:', error);
        }
    }

    // Speicher-Fehler behandeln
    handleStorageError(error, key, data) {
        const errorInfo = {
            error: error.message,
            key,
            dataSize: JSON.stringify(data).length,
            currentStorage: this.getStorageSize(),
            maxStorage: this.maxStorageSize,
            timestamp: new Date().toISOString()
        };

        console.error('Speicher-Fehler Details:', errorInfo);

        // Versuche verschiedene Wiederherstellungsstrategien
        if (this.attemptRecovery(key, data)) {
            return true;
        }

        if (window.toastSystem) {
            window.toastSystem.showError(
                `Speicherfehler: ${error.message}. Versuchen Sie ein Backup zu erstellen.`,
                {
                    persistent: true,
                    actions: [
                        { text: 'Backup erstellen', action: 'backup', class: 'btn-warning' },
                        { text: 'Speicher bereinigen', action: 'cleanup', class: 'btn-info' }
                    ],
                    onAction: (action) => {
                        if (action === 'backup') {
                            this.createBackup();
                        } else if (action === 'cleanup') {
                            this.performCleanup();
                        }
                    }
                }
            );
        }

        return false;
    }

    // Wiederherstellungsversuch
    attemptRecovery(key, data) {
        const strategies = [
            () => this.performCleanup() && this.setItem(key, this.compressData(data)),
            () => this.removeOldActivities() && this.setItem(key, data),
            () => this.clearTemporaryData() && this.setItem(key, data),
            () => this.compressAndRetry(key, data)
        ];

        for (const strategy of strategies) {
            try {
                if (strategy()) {
                    console.log('Wiederherstellung erfolgreich');
                    return true;
                }
            } catch (error) {
                console.warn('Wiederherstellungsstrategie fehlgeschlagen:', error);
            }
        }

        return false;
    }

    // Komprimierung und Wiederholung
    compressAndRetry(key, data) {
        if (key === this.storageKeys.shipments && data.shipments) {
            // Nur die wichtigsten Sendungsdaten behalten
            const essentialData = {
                shipments: data.shipments.map(shipment => ({
                    id: shipment.id,
                    companyName: shipment.companyName,
                    address1: shipment.address1,
                    city: shipment.city,
                    country: shipment.country,
                    postalCode: shipment.postalCode,
                    weight: shipment.weight,
                    serviceType: shipment.serviceType,
                    isValid: shipment.isValid
                })),
                nextId: data.nextId
            };
            
            return this.setItem(key, essentialData);
        }
        
        return false;
    }

    /**
     * Lädt Daten sicher aus dem LocalStorage
     * 
     * @param {string} key - Der Schlüssel für die Daten
     * @param {*} defaultValue - Standardwert falls Daten nicht vorhanden
     * @returns {*} Die geladenen Daten oder der Standardwert
     */
    getItem(key, defaultValue = null) {
        if (!this.storageSupported) {
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Fehler beim Laden:', error);
            return defaultValue;
        }
    }

    // Element entfernen
    removeItem(key) {
        if (!this.storageSupported) return false;

        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Fehler beim Löschen:', error);
            return false;
        }
    }

    // Aktuelle Speichergröße ermitteln
    getStorageSize() {
        if (!this.storageSupported) return 0;

        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    }

    // Speicher-Info abrufen
    getStorageInfo() {
        const used = this.getStorageSize();
        const available = this.maxStorageSize - used;
        const percentage = Math.round((used / this.maxStorageSize) * 100);

        return {
            used,
            available,
            total: this.maxStorageSize,
            percentage,
            formattedUsed: this.formatBytes(used),
            formattedAvailable: this.formatBytes(available),
            formattedTotal: this.formatBytes(this.maxStorageSize)
        };
    }

    // Bytes formatieren
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Speicher-Monitoring einrichten
    setupStorageMonitoring() {
        // Warnung bei niedrigem Speicherplatz
        setInterval(() => {
            const info = this.getStorageInfo();
            if (info.percentage > 90) {
                this.notifyLowStorage(info);
            }
        }, 60000); // Jede Minute prüfen
    }

    // Speicher-Monitoring aktualisieren
    updateStorageMonitoring() {
        const info = this.getStorageInfo();
        
        // UI-Anzeige aktualisieren falls vorhanden
        const storageUsageBar = document.getElementById('storageUsage');
        const storageText = document.getElementById('storageText');
        
        if (storageUsageBar) {
            storageUsageBar.style.width = `${info.percentage}%`;
            storageUsageBar.className = `storage-used ${this.getStorageStatusClass(info.percentage)}`;
        }
        
        if (storageText) {
            storageText.textContent = `${info.percentage}% verwendet (${info.formattedUsed} von ${info.formattedTotal})`;
        }

        // Warnung bei kritischem Speicherstand
        if (info.percentage > 95) {
            this.notifyLowStorage(info);
        }

        return info;
    }

    // Speicher-Status-Klasse ermitteln
    getStorageStatusClass(percentage) {
        if (percentage < 50) return 'storage-ok';
        if (percentage < 75) return 'storage-medium';
        if (percentage < 90) return 'storage-high';
        return 'storage-critical';
    }

    // Alte Aktivitäten entfernen
    removeOldActivities() {
        try {
            const activities = this.getItem(this.storageKeys.activities, []);
            if (activities.length > 20) {
                const recentActivities = activities.slice(0, 20);
                this.setItem(this.storageKeys.activities, recentActivities);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Fehler beim Entfernen alter Aktivitäten:', error);
            return false;
        }
    }

    // Warnung bei niedrigem Speicherplatz
    notifyLowStorage(info) {
        if (window.toastSystem) {
            window.toastSystem.showWarning(
                `Speicher zu ${info.percentage}% belegt. Führen Sie eine Bereinigung durch.`,
                {
                    persistent: true,
                    actions: [
                        { text: 'Bereinigen', action: 'cleanup', class: 'btn-warning' },
                        { text: 'Backup erstellen', action: 'backup', class: 'btn-info' }
                    ],
                    onAction: (action) => {
                        if (action === 'cleanup') {
                            this.performCleanup();
                        } else if (action === 'backup') {
                            this.createBackup();
                        }
                    }
                }
            );
        }
    }

    /**
     * Führt eine automatische Speicher-Bereinigung durch
     * Entfernt alte Aktivitäten, Adressverläufe und temporäre Daten
     * 
     * @returns {boolean} true bei erfolgreicher Bereinigung
     */
    performCleanup() {
        try {
            // Alte Aktivitäten löschen
            this.cleanupActivities();
            
            // Adressverlauf begrenzen
            this.cleanupAddressHistory();
            
            // Alte Backups löschen
            this.cleanupOldBackups();
            
            // Temporäre Daten löschen
            this.cleanupTemporaryData();

            if (window.toastSystem) {
                window.toastSystem.showSuccess('Speicher erfolgreich bereinigt');
            }

            return true;
        } catch (error) {
            console.error('Fehler bei der Bereinigung:', error);
            return false;
        }
    }

    // Aktivitäten bereinigen
    cleanupActivities() {
        const activities = this.getItem(this.storageKeys.activities, []);
        if (activities.length > 50) {
            const cleanedActivities = activities.slice(0, 50);
            this.setItem(this.storageKeys.activities, cleanedActivities);
        }
    }

    // Adressverlauf bereinigen
    cleanupAddressHistory() {
        const history = this.getItem(this.storageKeys.addressHistory, []);
        if (history.length > this.maxAddressHistory) {
            const cleanedHistory = history.slice(0, this.maxAddressHistory);
            this.setItem(this.storageKeys.addressHistory, cleanedHistory);
        }
    }

    // Alte Backups löschen
    cleanupOldBackups() {
        const backups = this.getItem(this.storageKeys.backups, []);
        if (backups.length > this.maxBackups) {
            // Älteste Backups löschen
            const sortedBackups = backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const keepBackups = sortedBackups.slice(0, this.maxBackups);
            this.setItem(this.storageKeys.backups, keepBackups);
        }
    }

    // Temporäre Daten löschen
    cleanupTemporaryData() {
        for (let key in localStorage) {
            if (key.startsWith('temp_') || key.startsWith('cache_')) {
                localStorage.removeItem(key);
            }
        }
    }

    // Speicher-Kontingent überschritten
    handleStorageQuotaExceeded() {
        if (window.modalSystem) {
            window.modalSystem.showAlertDialog(
                'Speicher voll',
                'Der verfügbare Speicherplatz ist aufgebraucht. Erstellen Sie ein Backup und löschen Sie alte Daten.',
                'warning'
            );
        }

        // Automatische Bereinigung
        this.performCleanup();
    }

    /**
     * Erstellt ein vollständiges Backup aller Anwendungsdaten
     * 
     * @returns {boolean} true bei Erfolg, false bei Fehler
     */
    createBackup() {
        try {
            const backupData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                data: {
                    shipments: this.getItem(this.storageKeys.shipments, { shipments: [], nextId: 1 }),
                    activities: this.getItem(this.storageKeys.activities, []),
                    settings: this.getItem(this.storageKeys.settings, {}),
                    addressHistory: this.getItem(this.storageKeys.addressHistory, [])
                }
            };

            // Backup als JSON-Datei herunterladen
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
                type: 'application/json' 
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ups-batch-backup-${new Date().toISOString().slice(0, 10)}.json`;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);

            // Backup-Info speichern
            this.addBackupRecord(backupData.timestamp);

            if (window.toastSystem) {
                window.toastSystem.showSuccess('Backup erfolgreich erstellt und heruntergeladen');
            }

            return true;
        } catch (error) {
            console.error('Fehler beim Erstellen des Backups:', error);
            
            if (window.toastSystem) {
                window.toastSystem.showError('Fehler beim Erstellen des Backups');
            }
            
            return false;
        }
    }

    // Backup-Record hinzufügen
    addBackupRecord(timestamp) {
        const backups = this.getItem(this.storageKeys.backups, []);
        backups.unshift({
            timestamp,
            type: 'manual',
            size: this.getStorageSize()
        });
        
        // Nur die letzten 10 Backup-Records behalten
        if (backups.length > 10) {
            backups.splice(10);
        }
        
        this.setItem(this.storageKeys.backups, backups);
    }

    // Backup wiederherstellen
    restoreBackup(backupFile) {
        return new Promise((resolve, reject) => {
            // Datei validieren
            if (!backupFile || !backupFile.type || !backupFile.name) {
                reject(new Error('Ungültige Backup-Datei'));
                return;
            }
            
            if (!backupFile.type.includes('json') && !backupFile.name.endsWith('.json')) {
                reject(new Error('Backup-Datei muss eine JSON-Datei sein'));
                return;
            }
            
            const reader = new FileReader();
            
            // Error handler für FileReader
            reader.onerror = (error) => {
                console.error('FileReader error:', error);
                reject(new Error('Fehler beim Lesen der Backup-Datei'));
            };
            
            // Timeout für FileReader
            const timeoutId = setTimeout(() => {
                reader.abort();
                reject(new Error('Timeout beim Lesen der Backup-Datei'));
            }, 30000); // 30 Sekunden Timeout
            
            reader.onload = (event) => {
                clearTimeout(timeoutId);
                
                try {
                    const result = event.target.result;
                    
                    if (!result || result.trim().length === 0) {
                        throw new Error('Backup-Datei ist leer');
                    }
                    
                    const backupData = JSON.parse(result);
                    
                    // Backup-Format validieren
                    if (!this.validateBackupFormat(backupData)) {
                        throw new Error('Ungültiges Backup-Format');
                    }

                    // Aktuelle Daten sichern
                    const currentData = this.createRestorePoint();

                    // Daten wiederherstellen
                    this.setItem(this.storageKeys.shipments, backupData.data.shipments);
                    this.setItem(this.storageKeys.activities, backupData.data.activities);
                    this.setItem(this.storageKeys.settings, backupData.data.settings);
                    this.setItem(this.storageKeys.addressHistory, backupData.data.addressHistory);

                    if (window.toastSystem) {
                        window.toastSystem.showSuccess('Backup erfolgreich wiederhergestellt');
                    }

                    resolve(backupData);
                } catch (error) {
                    console.error('Fehler beim Wiederherstellen des Backups:', error);
                    reject(error);
                }
            };

            reader.onerror = () => {
                reject(new Error('Fehler beim Lesen der Backup-Datei'));
            };

            reader.readAsText(backupFile);
        });
    }

    // Backup-Format validieren
    validateBackupFormat(backupData) {
        return backupData &&
               backupData.timestamp &&
               backupData.data &&
               backupData.data.shipments &&
               Array.isArray(backupData.data.activities);
    }

    // Wiederherstellungspunkt erstellen
    createRestorePoint() {
        const restoreData = {
            timestamp: new Date().toISOString(),
            data: {
                shipments: this.getItem(this.storageKeys.shipments),
                activities: this.getItem(this.storageKeys.activities),
                settings: this.getItem(this.storageKeys.settings),
                addressHistory: this.getItem(this.storageKeys.addressHistory)
            }
        };

        // Als temporärer Wiederherstellungspunkt speichern
        this.setItem('restorePoint', restoreData);
        
        return restoreData;
    }

    // Adresse zum Verlauf hinzufügen
    addToAddressHistory(addressData) {
        const history = this.getItem(this.storageKeys.addressHistory, []);
        
        // Duplikate vermeiden
        const existing = history.find(addr => 
            addr.companyName === addressData.companyName &&
            addr.address1 === addressData.address1 &&
            addr.city === addressData.city
        );

        if (!existing) {
            history.unshift({
                ...addressData,
                timestamp: new Date().toISOString(),
                useCount: 1
            });

            // Verlauf begrenzen
            if (history.length > this.maxAddressHistory) {
                history.splice(this.maxAddressHistory);
            }

            this.setItem(this.storageKeys.addressHistory, history);
        } else {
            // Verwendungszähler erhöhen
            existing.useCount++;
            existing.lastUsed = new Date().toISOString();
            this.setItem(this.storageKeys.addressHistory, history);
        }
    }

    // Adressverlauf abrufen
    getAddressHistory(searchTerm = '') {
        const history = this.getItem(this.storageKeys.addressHistory, []);
        
        if (!searchTerm) {
            return history.sort((a, b) => new Date(b.lastUsed || b.timestamp) - new Date(a.lastUsed || a.timestamp));
        }

        // Suche im Verlauf
        const searchLower = searchTerm.toLowerCase();
        return history.filter(addr =>
            addr.companyName?.toLowerCase().includes(searchLower) ||
            addr.contactName?.toLowerCase().includes(searchLower) ||
            addr.address1?.toLowerCase().includes(searchLower) ||
            addr.city?.toLowerCase().includes(searchLower)
        );
    }

    // Adressverlauf löschen
    clearAddressHistory() {
        this.removeItem(this.storageKeys.addressHistory);
        
        if (window.toastSystem) {
            window.toastSystem.showSuccess('Adressverlauf erfolgreich gelöscht');
        }
    }

    // Einstellungen speichern
    saveSettings(settings) {
        const currentSettings = this.getItem(this.storageKeys.settings, {});
        const updatedSettings = { ...currentSettings, ...settings };
        
        return this.setItem(this.storageKeys.settings, updatedSettings);
    }

    // Einstellungen laden
    getSettings() {
        return this.getItem(this.storageKeys.settings, {
            theme: 'auto',
            language: 'de',
            defaultCountry: 'DE',
            defaultService: '03',
            defaultUnit: 'KG',
            autoSave: true,
            addressHistory: true,
            notifications: true
        });
    }

    // Alle Daten löschen
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                this.removeItem(key);
            });

            // Auch temporäre Daten löschen
            this.cleanupTemporaryData();

            if (window.toastSystem) {
                window.toastSystem.showSuccess('Alle Daten erfolgreich gelöscht');
            }

            return true;
        } catch (error) {
            console.error('Fehler beim Löschen aller Daten:', error);
            return false;
        }
    }

    // Datenexport
    exportData() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                type: 'full_export',
                data: {
                    shipments: this.getItem(this.storageKeys.shipments),
                    activities: this.getItem(this.storageKeys.activities),
                    settings: this.getItem(this.storageKeys.settings),
                    addressHistory: this.getItem(this.storageKeys.addressHistory)
                },
                metadata: {
                    totalShipments: this.getItem(this.storageKeys.shipments, { shipments: [] }).shipments.length,
                    storageSize: this.getStorageSize(),
                    exportedBy: 'UPS Batch Manager DE'
                }
            };

            return exportData;
        } catch (error) {
            console.error('Fehler beim Exportieren der Daten:', error);
            return null;
        }
    }

    // Wartung durchführen
    performMaintenance() {
        // Beschädigte Daten reparieren
        this.repairCorruptedData();
        
        // Alte temporäre Daten löschen
        this.cleanupTemporaryData();
        
        // Migration falls nötig
        this.migrateData();
    }

    // Beschädigte Daten reparieren
    repairCorruptedData() {
        try {
            // Sendungen prüfen
            const shipments = this.getItem(this.storageKeys.shipments);
            if (shipments && !Array.isArray(shipments.shipments)) {
                console.warn('Beschädigte Sendungsdaten erkannt, repariere...');
                this.setItem(this.storageKeys.shipments, { shipments: [], nextId: 1 });
            }

            // Aktivitäten prüfen
            const activities = this.getItem(this.storageKeys.activities);
            if (activities && !Array.isArray(activities)) {
                console.warn('Beschädigte Aktivitätsdaten erkannt, repariere...');
                this.setItem(this.storageKeys.activities, []);
            }
        } catch (error) {
            console.error('Fehler bei der Datenreparatur:', error);
        }
    }

    // Daten-Migration
    migrateData() {
        const currentVersion = this.getItem('dataVersion', '1.0');
        
        // Hier können zukünftige Datenmigrationen implementiert werden
        if (currentVersion !== '1.0') {
            // Migration durchführen
            this.setItem('dataVersion', '1.0');
        }
    }

    // Storage Events überwachen
    setupStorageEvents() {
        window.addEventListener('storage', (event) => {
            // Reaktion auf Änderungen in anderen Tabs
            if (Object.values(this.storageKeys).includes(event.key)) {
                this.handleStorageChange(event);
            }
        });
    }

    // Storage-Änderung handhaben
    handleStorageChange(event) {
        if (window.toastSystem) {
            window.toastSystem.showInfo(
                'Daten wurden in einem anderen Tab geändert. Seite wird aktualisiert.',
                { 
                    duration: 3000,
                    onClose: () => {
                        window.location.reload();
                    }
                }
            );
        }
    }
}

// StorageManager global verfügbar machen
window.StorageManagerDE = StorageManagerDE;
window.storageManager = new StorageManagerDE();