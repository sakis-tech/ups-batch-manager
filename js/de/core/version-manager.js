// Version Manager für UPS Batch Manager - Versionsverwaltung und Datenmigration
class VersionManager {
    constructor() {
        this.currentAppVersion = '2.2.0';
        this.currentDataVersion = '2.2';
        this.minimumDataVersion = '1.0';
        
        this.storageManager = window.storageManager;
        this.activityLogger = window.activityLogger;
        this.modalSystem = window.modalSystem;
        
        this.migrationStrategies = new Map();
        this.migrationHistory = [];
        
        this.initialize();
    }

    // Initialisierung des Version Managers
    initialize() {
        this.setupMigrationStrategies();
        this.loadMigrationHistory();
    }

    // Migration-Strategien definieren
    setupMigrationStrategies() {
        // Migration von 1.0 zu 2.0
        this.migrationStrategies.set('1.0->2.0', {
            description: 'Neue Felder für erweiterte Adressdaten und Service-Optionen',
            changes: [
                'Neue Felder: address3, extension, residential',
                'Erweiterte Service-Optionen',
                'Verbesserte Validierungsregeln'
            ],
            migrate: (data) => this.migrateV1ToV2(data)
        });

        // Migration von 2.0 zu 2.1
        this.migrationStrategies.set('2.0->2.1', {
            description: 'Multi-Page Application Architektur und CORS-freie Implementierung',
            changes: [
                'Umstellung auf Multi-Page Application',
                'Eingebettete Sprachdateien',
                'Verbesserte Offline-Funktionalität'
            ],
            migrate: (data) => this.migrateV2ToV21(data)
        });

        // Migration von 2.1 zu 2.2
        this.migrationStrategies.set('2.1->2.2', {
            description: 'Erweiterte Fehleranzeige und Tooltips',
            changes: [
                'Umfassendes Fehleranzeige-System',
                'Detaillierte Validierungs-Tooltips',
                'Verbesserte Benutzerführung'
            ],
            migrate: (data) => this.migrateV21ToV22(data)
        });
    }

    // Version beim App-Start prüfen
    async checkVersionOnStartup() {
        try {
            const storedDataVersion = await this.getStoredDataVersion();
            const appVersionChanged = await this.hasAppVersionChanged();
            
            // Logs für Debugging
            console.log(`Stored data version: ${storedDataVersion}`);
            console.log(`Current data version: ${this.currentDataVersion}`);
            console.log(`App version changed: ${appVersionChanged}`);

            // Wenn keine Daten vorhanden sind, initialisiere mit aktueller Version
            if (!storedDataVersion) {
                await this.setDataVersion(this.currentDataVersion);
                await this.setAppVersion(this.currentAppVersion);
                this.logActivity('version_initialized', {
                    dataVersion: this.currentDataVersion,
                    appVersion: this.currentAppVersion
                });
                return true;
            }

            // Version vergleichen
            const versionComparison = this.compareVersions(storedDataVersion, this.currentDataVersion);
            
            if (versionComparison < 0) {
                // Upgrade erforderlich
                return await this.handleVersionUpgrade(storedDataVersion, this.currentDataVersion);
            } else if (versionComparison > 0) {
                // Downgrade erkannt
                return await this.handleVersionDowngrade(storedDataVersion, this.currentDataVersion);
            } else if (appVersionChanged) {
                // Patch-Update ohne Datenänderung
                await this.setAppVersion(this.currentAppVersion);
                this.logActivity('app_version_updated', {
                    appVersion: this.currentAppVersion
                });
            }

            return true;
        } catch (error) {
            console.error('Fehler bei der Versionsprüfung:', error);
            return false;
        }
    }

    // Version-Upgrade Dialog
    async handleVersionUpgrade(fromVersion, toVersion) {
        const migrationPath = this.getMigrationPath(fromVersion, toVersion);
        const migrationInfo = this.getMigrationInfo(migrationPath);

        return new Promise((resolve) => {
            const modal = {
                title: '🔄 Datenaktualisierung erforderlich',
                content: (data) => `
                    <div class="version-migration-dialog">
                        <div class="migration-warning">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p><strong>Deine gespeicherten Daten stammen aus Version ${fromVersion} – du nutzt jetzt Version ${toVersion}.</strong></p>
                        </div>
                        
                        <div class="migration-info">
                            <h4>Was ändert sich:</h4>
                            <ul>
                                ${migrationInfo.changes.map(change => `<li>${change}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="migration-options">
                            <h4>Wie möchtest du fortfahren?</h4>
                            <div class="migration-buttons">
                                <button type="button" class="btn btn-primary" data-action="migrate">
                                    <i class="fas fa-arrow-up"></i>
                                    Daten übernehmen und konvertieren
                                </button>
                                <button type="button" class="btn btn-warning" data-action="fresh-start">
                                    <i class="fas fa-refresh"></i>
                                    Daten verwerfen und neu starten
                                </button>
                                <button type="button" class="btn btn-secondary" data-action="backup-first">
                                    <i class="fas fa-download"></i>
                                    Erst Backup erstellen
                                </button>
                            </div>
                        </div>

                        <div class="migration-details">
                            <details>
                                <summary>Technische Details anzeigen</summary>
                                <div class="tech-details">
                                    <p><strong>Migrations-Pfad:</strong> ${migrationPath.join(' → ')}</p>
                                    <p><strong>Beschreibung:</strong> ${migrationInfo.description}</p>
                                    <p><strong>Backup wird automatisch erstellt:</strong> Ja</p>
                                </div>
                            </details>
                        </div>
                    </div>
                `,
                actions: {
                    migrate: async () => {
                        const result = await this.performMigration(fromVersion, toVersion);
                        resolve(result);
                    },
                    'fresh-start': async () => {
                        const result = await this.performFreshStart();
                        resolve(result);
                    },
                    'backup-first': async () => {
                        await this.createPreMigrationBackup(fromVersion);
                        // Nach Backup nochmal den Dialog zeigen
                        setTimeout(() => {
                            this.handleVersionUpgrade(fromVersion, toVersion).then(resolve);
                        }, 1000);
                    }
                },
                closeOnBackdrop: false,
                showCloseButton: false
            };

            this.modalSystem.show(modal);
        });
    }

    // Version-Downgrade Dialog
    async handleVersionDowngrade(fromVersion, toVersion) {
        return new Promise((resolve) => {
            const modal = {
                title: '⚠️ Inkompatible Datenversion erkannt',
                content: () => `
                    <div class="version-downgrade-dialog">
                        <div class="downgrade-warning">
                            <i class="fas fa-exclamation-circle"></i>
                            <p><strong>Deine Daten stammen aus einer neueren Version (${fromVersion}) als diese App-Version (${toVersion}).</strong></p>
                        </div>
                        
                        <div class="downgrade-info">
                            <p>Dies kann zu Datenverlust oder Fehlern führen. Empfohlene Optionen:</p>
                            <ul>
                                <li>App auf neueste Version aktualisieren</li>
                                <li>Daten zurücksetzen und neu beginnen</li>
                                <li>Backup der aktuellen Daten erstellen</li>
                            </ul>
                        </div>

                        <div class="downgrade-buttons">
                            <button type="button" class="btn btn-danger" data-action="reset">
                                <i class="fas fa-trash"></i>
                                Daten zurücksetzen
                            </button>
                            <button type="button" class="btn btn-secondary" data-action="backup-and-reset">
                                <i class="fas fa-download"></i>
                                Backup + Reset
                            </button>
                        </div>
                    </div>
                `,
                actions: {
                    reset: async () => {
                        const result = await this.performFreshStart();
                        resolve(result);
                    },
                    'backup-and-reset': async () => {
                        await this.createPreMigrationBackup(fromVersion);
                        const result = await this.performFreshStart();
                        resolve(result);
                    }
                },
                closeOnBackdrop: false,
                showCloseButton: false
            };

            this.modalSystem.show(modal);
        });
    }

    // Migration durchführen
    async performMigration(fromVersion, toVersion) {
        try {
            // Pre-Migration Backup
            await this.createPreMigrationBackup(fromVersion);
            
            // Migration starten
            this.logActivity('migration_started', {
                fromVersion,
                toVersion,
                timestamp: new Date().toISOString()
            });

            // Alle Daten laden
            const allData = await this.loadAllData();
            
            // Migration-Pfad berechnen
            const migrationPath = this.getMigrationPath(fromVersion, toVersion);
            
            // Schrittweise Migration
            let currentData = allData;
            let currentVersion = fromVersion;
            
            for (let i = 0; i < migrationPath.length - 1; i++) {
                const stepFromVersion = migrationPath[i];
                const stepToVersion = migrationPath[i + 1];
                const migrationKey = `${stepFromVersion}->${stepToVersion}`;
                
                if (this.migrationStrategies.has(migrationKey)) {
                    const strategy = this.migrationStrategies.get(migrationKey);
                    currentData = await strategy.migrate(currentData);
                    currentVersion = stepToVersion;
                    
                    this.logActivity('migration_step_completed', {
                        fromVersion: stepFromVersion,
                        toVersion: stepToVersion,
                        description: strategy.description
                    });
                }
            }

            // Migrierte Daten speichern
            await this.saveAllData(currentData);
            await this.setDataVersion(toVersion);
            await this.setAppVersion(this.currentAppVersion);

            // Migration History aktualisieren
            this.migrationHistory.push({
                timestamp: new Date().toISOString(),
                fromVersion,
                toVersion,
                success: true,
                migrationPath
            });
            await this.saveMigrationHistory();

            this.logActivity('migration_completed', {
                fromVersion,
                toVersion,
                success: true
            });

            // Erfolgs-Benachrichtigung
            if (window.toastManager) {
                window.toastManager.show(
                    `Migration erfolgreich: Version ${fromVersion} → ${toVersion}`,
                    'success',
                    5000
                );
            }

            return true;
        } catch (error) {
            console.error('Migration fehlergeschlagen:', error);
            
            this.logActivity('migration_failed', {
                fromVersion,
                toVersion,
                error: error.message
            });

            // Fehler-Benachrichtigung
            if (window.toastManager) {
                window.toastManager.show(
                    'Migration fehlgeschlagen. Backup wird wiederhergestellt.',
                    'error',
                    5000
                );
            }

            // Backup wiederherstellen
            await this.restoreFromBackup();
            return false;
        }
    }

    // Fresh Start durchführen
    async performFreshStart() {
        try {
            // Backup der aktuellen Daten erstellen
            await this.createPreMigrationBackup('fresh-start');
            
            // Alle Daten löschen
            await this.storageManager.clearAllData();
            
            // Neue Version setzen
            await this.setDataVersion(this.currentDataVersion);
            await this.setAppVersion(this.currentAppVersion);
            
            this.logActivity('fresh_start_completed', {
                newVersion: this.currentDataVersion,
                timestamp: new Date().toISOString()
            });

            if (window.toastManager) {
                window.toastManager.show(
                    'Anwendung wurde zurückgesetzt. Du kannst jetzt neu beginnen.',
                    'info',
                    5000
                );
            }

            // Seite neu laden
            setTimeout(() => {
                window.location.reload();
            }, 2000);

            return true;
        } catch (error) {
            console.error('Fresh Start fehlgeschlagen:', error);
            return false;
        }
    }

    // Migrations-Strategien implementieren
    async migrateV1ToV2(data) {
        // Sendungen mit neuen Feldern erweitern
        if (data.shipments) {
            data.shipments = data.shipments.map(shipment => ({
                ...shipment,
                address3: shipment.address3 || '',
                extension: shipment.extension || '',
                residential: shipment.residential || false,
                // Neue Service-Optionen falls alte Services verwendet wurden
                serviceType: this.mapOldServiceToNew(shipment.serviceType)
            }));
        }

        // Settings erweitern
        if (data.settings) {
            data.settings = {
                ...data.settings,
                addressHistory: data.settings.addressHistory !== undefined ? data.settings.addressHistory : true,
                notifications: data.settings.notifications !== undefined ? data.settings.notifications : true
            };
        }

        return data;
    }

    async migrateV2ToV21(data) {
        // Spracheinstellungen anpassen (nur noch Deutsch)
        if (data.settings && data.settings.language !== 'de') {
            data.settings.language = 'de';
        }

        // Template-Format aktualisieren falls nötig
        if (data.templates) {
            data.templates = data.templates.map(template => ({
                ...template,
                version: '2.1',
                format: 'ups-batch'
            }));
        }

        return data;
    }

    async migrateV21ToV22(data) {
        // Neue Validierung-Settings hinzufügen
        if (data.settings) {
            data.settings = {
                ...data.settings,
                enhancedValidation: true,
                showTooltips: true,
                realtimeValidation: data.settings.realtimeValidation !== undefined ? data.settings.realtimeValidation : true
            };
        }

        // Aktivitäts-Log erweitern für neue Events
        if (data.activities) {
            // Alte Aktivitäten behalten, neue Struktur ist abwärtskompatibel
        }

        return data;
    }

    // Hilfsmethoden
    mapOldServiceToNew(oldService) {
        const serviceMapping = {
            '1': '03', // Standard -> UPS Ground
            '2': '02', // Express -> UPS 2nd Day
            '3': '01'  // Priority -> UPS Next Day
        };
        
        return serviceMapping[oldService] || oldService || '03';
    }

    getMigrationPath(fromVersion, toVersion) {
        const versions = ['1.0', '2.0', '2.1', '2.2'];
        const fromIndex = versions.indexOf(fromVersion);
        const toIndex = versions.indexOf(toVersion);
        
        if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
            return [fromVersion, toVersion];
        }
        
        return versions.slice(fromIndex, toIndex + 1);
    }

    getMigrationInfo(migrationPath) {
        const changes = [];
        let description = '';
        
        for (let i = 0; i < migrationPath.length - 1; i++) {
            const key = `${migrationPath[i]}->${migrationPath[i + 1]}`;
            if (this.migrationStrategies.has(key)) {
                const strategy = this.migrationStrategies.get(key);
                changes.push(...strategy.changes);
                if (description) description += '; ';
                description += strategy.description;
            }
        }
        
        return { changes, description };
    }

    compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        
        for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    // Storage-Methoden
    async getStoredDataVersion() {
        return await this.storageManager.getItem('dataVersion');
    }

    async setDataVersion(version) {
        await this.storageManager.setItem('dataVersion', version);
    }

    async getStoredAppVersion() {
        return await this.storageManager.getItem('appVersion');
    }

    async setAppVersion(version) {
        await this.storageManager.setItem('appVersion', version);
    }

    async hasAppVersionChanged() {
        const storedAppVersion = await this.getStoredAppVersion();
        return storedAppVersion !== this.currentAppVersion;
    }

    async loadAllData() {
        const data = {};
        const keys = ['shipments', 'activities', 'settings', 'addressHistory', 'templates', 'backups'];
        
        for (const key of keys) {
            data[key] = await this.storageManager.getItem(this.storageManager.storageKeys[key]);
        }
        
        return data;
    }

    async saveAllData(data) {
        const keys = ['shipments', 'activities', 'settings', 'addressHistory', 'templates', 'backups'];
        
        for (const key of keys) {
            if (data[key] !== undefined) {
                await this.storageManager.setItem(this.storageManager.storageKeys[key], data[key]);
            }
        }
    }

    async createPreMigrationBackup(version) {
        const backupData = await this.loadAllData();
        const backupInfo = {
            timestamp: new Date().toISOString(),
            version: version,
            type: 'pre-migration',
            appVersion: this.currentAppVersion
        };
        
        return await this.storageManager.createBackup('migration', backupData, backupInfo);
    }

    async restoreFromBackup() {
        // Implementierung hängt von der Backup-Struktur ab
        // Hier würde das neueste Migration-Backup wiederhergestellt
        try {
            const backups = await this.storageManager.getItem('upsBackups') || [];
            const migrationBackup = backups
                .filter(b => b.type === 'pre-migration')
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
            
            if (migrationBackup) {
                await this.storageManager.restoreFromBackup(migrationBackup.id);
                return true;
            }
        } catch (error) {
            console.error('Backup-Wiederherstellung fehlgeschlagen:', error);
        }
        return false;
    }

    // Migration History
    async loadMigrationHistory() {
        this.migrationHistory = await this.storageManager.getItem('migrationHistory') || [];
    }

    async saveMigrationHistory() {
        await this.storageManager.setItem('migrationHistory', this.migrationHistory);
    }

    // Activity Logging
    logActivity(type, data = {}) {
        if (this.activityLogger) {
            this.activityLogger.log(type, {
                category: 'version',
                ...data
            });
        }
    }

    // Public API
    getCurrentAppVersion() {
        return this.currentAppVersion;
    }

    getCurrentDataVersion() {
        return this.currentDataVersion;
    }

    getMigrationHistory() {
        return [...this.migrationHistory];
    }

    async getVersionInfo() {
        return {
            appVersion: this.currentAppVersion,
            dataVersion: this.currentDataVersion,
            storedDataVersion: await this.getStoredDataVersion(),
            storedAppVersion: await this.getStoredAppVersion(),
            migrationHistory: this.getMigrationHistory()
        };
    }
}

// Global export
window.VersionManager = VersionManager;
window.versionManager = new VersionManager();