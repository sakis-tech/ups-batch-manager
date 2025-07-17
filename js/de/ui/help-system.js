// Hilfe-System für deutsche UPS Batch Manager Oberfläche
class HelpSystemDE {
    constructor() {
        this.helpSections = {
            overview: 'Übersicht',
            sendungen: 'Sendungen verwalten',
            import: 'CSV-Import',
            export: 'Batch-Export',
            validation: 'Validierung verstehen',
            templates: 'Vorlagen nutzen',
            offline: 'Offline-Nutzung',
            troubleshooting: 'Problemlösung',
            shortcuts: 'Tastaturkürzel'
        };
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.addHelpButton();
    }

    setupEventListeners() {
        // Help-Button im Header
        document.addEventListener('click', (e) => {
            if (e.target.matches('.help-trigger, .help-trigger *')) {
                e.preventDefault();
                this.showHelpModal();
            }
        });

        // Kontextuelle Hilfe
        document.addEventListener('click', (e) => {
            if (e.target.matches('.context-help')) {
                e.preventDefault();
                const section = e.target.dataset.helpSection;
                this.showHelpModal(section);
            }
        });
    }

    addHelpButton() {
        const helpButton = document.createElement('button');
        helpButton.className = 'help-trigger btn btn-ghost';
        helpButton.innerHTML = '<i class="fas fa-question-circle"></i> Hilfe';
        helpButton.title = 'Hilfe öffnen (F1)';

        // Zur Navigation hinzufügen
        const nav = document.querySelector('.sidebar-nav ul');
        if (nav) {
            const helpItem = document.createElement('li');
            helpItem.appendChild(helpButton);
            nav.appendChild(helpItem);
        }

        // F1 Shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showHelpModal();
            }
        });
    }

    showHelpModal(section = 'overview') {
        window.modalSystem?.createModal('helpModal', {
            title: 'UPS Batch-Manager Hilfe',
            size: 'extra-large',
            content: this.getHelpContent.bind(this),
            buttons: [
                { text: 'Schließen', class: 'btn-primary', action: 'close' }
            ]
        });

        window.modalSystem?.showModal('helpModal', { section });
    }

    getHelpContent(data) {
        const { section = 'overview' } = data;

        return `
            <div class="help-content">
                <div class="help-sidebar">
                    <nav class="help-nav">
                        ${Object.entries(this.helpSections).map(([key, title]) => `
                            <a href="#" class="help-nav-item ${key === section ? 'active' : ''}" 
                               onclick="window.helpSystem.showSection('${key}')">
                                ${this.getSectionIcon(key)} ${title}
                            </a>
                        `).join('')}
                    </nav>
                </div>
                <div class="help-main">
                    <div id="helpSectionContent">
                        ${this.getSectionContent(section)}
                    </div>
                </div>
            </div>
        `;
    }

    showSection(sectionKey) {
        const content = document.getElementById('helpSectionContent');
        const navItems = document.querySelectorAll('.help-nav-item');
        
        if (content) {
            content.innerHTML = this.getSectionContent(sectionKey);
        }

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.onclick.toString().includes(sectionKey)) {
                item.classList.add('active');
            }
        });
    }

    getSectionIcon(section) {
        const icons = {
            overview: '<i class="fas fa-home"></i>',
            sendungen: '<i class="fas fa-boxes"></i>',
            import: '<i class="fas fa-file-import"></i>',
            export: '<i class="fas fa-file-export"></i>',
            validation: '<i class="fas fa-check-circle"></i>',
            templates: '<i class="fas fa-file-download"></i>',
            offline: '<i class="fas fa-wifi-slash"></i>',
            troubleshooting: '<i class="fas fa-tools"></i>',
            shortcuts: '<i class="fas fa-keyboard"></i>'
        };
        return icons[section] || '<i class="fas fa-question"></i>';
    }

    getSectionContent(section) {
        switch (section) {
            case 'overview': return this.getOverviewContent();
            case 'sendungen': return this.getSendungenContent();
            case 'import': return this.getImportContent();
            case 'export': return this.getExportContent();
            case 'validation': return this.getValidationContent();
            case 'templates': return this.getTemplatesContent();
            case 'offline': return this.getOfflineContent();
            case 'troubleshooting': return this.getTroubleshootingContent();
            case 'shortcuts': return this.getShortcutsContent();
            default: return this.getOverviewContent();
        }
    }

    getOverviewContent() {
        return `
            <div class="help-section">
                <h2>🚚 Willkommen beim UPS Batch-Manager</h2>
                <p>Der UPS Batch-Manager ist ein professionelles Tool zur Erstellung und Verwaltung von UPS Batch-Versanddateien mit bis zu 250 Sendungen.</p>
                
                <div class="help-grid">
                    <div class="help-card">
                        <h3>🎯 Hauptfunktionen</h3>
                        <ul>
                            <li><strong>Sendungsverwaltung</strong>: Erstellen, bearbeiten, löschen</li>
                            <li><strong>CSV-Import</strong>: Intelligente Datenübernahme</li>
                            <li><strong>Batch-Export</strong>: UPS-kompatible Dateien</li>
                            <li><strong>Echtzeit-Validierung</strong>: Sofortige Fehlerprüfung</li>
                        </ul>
                    </div>
                    
                    <div class="help-card">
                        <h3>⚡ Quick Start</h3>
                        <ol>
                            <li><strong>Neue Sendung</strong> über Dashboard erstellen</li>
                            <li><strong>CSV importieren</strong> für bestehende Daten</li>
                            <li><strong>Validierung prüfen</strong> und Fehler korrigieren</li>
                            <li><strong>Batch exportieren</strong> für UPS WorldShip</li>
                        </ol>
                    </div>
                </div>

                <div class="help-features">
                    <h3>✨ Besondere Features</h3>
                    <div class="feature-grid">
                        <div class="feature-item">
                            <i class="fas fa-wifi-slash"></i>
                            <strong>100% Offline</strong>
                            <p>Funktioniert ohne Internetverbindung</p>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-shield-alt"></i>
                            <strong>Datenschutz</strong>
                            <p>Alle Daten bleiben auf Ihrem Gerät</p>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-mobile-alt"></i>
                            <strong>Responsive</strong>
                            <p>Funktioniert auf allen Geräten</p>
                        </div>
                        <div class="feature-item">
                            <i class="fas fa-language"></i>
                            <strong>Deutsche UI</strong>
                            <p>Vollständig lokalisiert</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSendungenContent() {
        return `
            <div class="help-section">
                <h2>📦 Sendungen verwalten</h2>
                
                <div class="help-steps">
                    <h3>🆕 Neue Sendung erstellen</h3>
                    <ol>
                        <li>Klicken Sie auf <strong>"Neue Sendung"</strong> im Dashboard</li>
                        <li>Füllen Sie die <strong>Empfänger-Informationen</strong> aus</li>
                        <li>Geben Sie <strong>Paket-Details</strong> (Gewicht, Abmessungen) ein</li>
                        <li>Wählen Sie den <strong>Service-Typ</strong></li>
                        <li>Klicken Sie <strong>"Speichern"</strong></li>
                    </ol>
                </div>

                <div class="help-validation">
                    <h3>✅ Echtzeit-Validierung</h3>
                    <div class="validation-examples">
                        <div class="validation-item success">
                            <i class="fas fa-check-circle"></i>
                            <strong>Grüner Rahmen</strong>: Feld ist gültig
                        </div>
                        <div class="validation-item error">
                            <i class="fas fa-exclamation-circle"></i>
                            <strong>Roter Rahmen</strong>: Fehler im Feld
                        </div>
                        <div class="validation-item info">
                            <i class="fas fa-info-circle"></i>
                            <strong>Blaue Hinweise</strong>: Hilfreiche Informationen
                        </div>
                    </div>
                </div>

                <div class="help-pflichtfelder">
                    <h3>⭐ Pflichtfelder</h3>
                    <div class="pflichtfeld-grid">
                        <div class="pflichtfeld-group">
                            <h4>Empfänger</h4>
                            <ul>
                                <li>Firma oder Name</li>
                                <li>Adresse 1</li>
                                <li>Stadt</li>
                                <li>Postleitzahl</li>
                                <li>Land</li>
                            </ul>
                        </div>
                        <div class="pflichtfeld-group">
                            <h4>Paket</h4>
                            <ul>
                                <li>Gewicht</li>
                                <li>Maßeinheit</li>
                                <li>Verpackungsart</li>
                                <li>Service-Typ</li>
                            </ul>
                        </div>
                        <div class="pflichtfeld-group">
                            <h4>International</h4>
                            <ul>
                                <li>Warenbeschreibung*</li>
                                <li>Zollwert*</li>
                                <li>Bundesland/Provinz**</li>
                            </ul>
                            <small>* Nur für Nicht-EU Länder<br>** Nur für USA und Kanada</small>
                        </div>
                    </div>
                </div>

                <div class="help-tips">
                    <h3>💡 Tipps & Tricks</h3>
                    <div class="tip-list">
                        <div class="tip-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Länderspezifische Felder</strong>: Postleitzahlen und Telefonnummern werden automatisch nach dem ausgewählten Land validiert.
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-copy"></i>
                            <strong>Sendung duplizieren</strong>: Nutzen Sie die Duplikat-Funktion für ähnliche Sendungen.
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-search"></i>
                            <strong>Schnell finden</strong>: Verwenden Sie die Suchfunktion, um Sendungen schnell zu finden.
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getImportContent() {
        return `
            <div class="help-section">
                <h2>📥 CSV-Import durchführen</h2>
                
                <div class="import-workflow">
                    <h3>🔄 3-Schritt Import-Prozess</h3>
                    <div class="workflow-steps">
                        <div class="workflow-step">
                            <div class="step-number">1</div>
                            <div class="step-content">
                                <h4>Datei auswählen</h4>
                                <ul>
                                    <li>CSV, SSV oder TXT-Dateien</li>
                                    <li>Drag & Drop oder Datei-Browser</li>
                                    <li>Automatische Delimiter-Erkennung</li>
                                    <li>Maximum 10MB Dateigröße</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="workflow-step">
                            <div class="step-number">2</div>
                            <div class="step-content">
                                <h4>Vorschau & Mapping</h4>
                                <ul>
                                    <li>Intelligente Spalten-Zuordnung</li>
                                    <li>Erste 10 Zeilen als Vorschau</li>
                                    <li>Manuelle Korrektur möglich</li>
                                    <li>Feld-Mapping Überprüfung</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="workflow-step">
                            <div class="step-number">3</div>
                            <div class="step-content">
                                <h4>Validierung & Import</h4>
                                <ul>
                                    <li>Detaillierte Fehleranalyse</li>
                                    <li>Kritische vs. Warnungen</li>
                                    <li>Import-Empfehlungen</li>
                                    <li>Partieller Import möglich</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="import-formats">
                    <h3>📄 Unterstützte Formate</h3>
                    <div class="format-grid">
                        <div class="format-item">
                            <i class="fas fa-file-csv"></i>
                            <strong>CSV</strong>
                            <p>Komma-getrennte Werte<br><code>Name,Adresse,Stadt</code></p>
                        </div>
                        <div class="format-item recommended">
                            <i class="fas fa-file-alt"></i>
                            <strong>SSV</strong>
                            <p>Semikolon-getrennt (empfohlen)<br><code>Name;Adresse;Stadt</code></p>
                        </div>
                        <div class="format-item">
                            <i class="fas fa-file"></i>
                            <strong>TXT</strong>
                            <p>Tab-getrennte Werte<br><code>Name→Adresse→Stadt</code></p>
                        </div>
                    </div>
                </div>

                <div class="import-mapping">
                    <h3>🎯 Intelligente Feld-Zuordnung</h3>
                    <p>Der Import erkennt automatisch häufige Feldnamen:</p>
                    <div class="mapping-examples">
                        <div class="mapping-example">
                            <strong>Firma/Company</strong> → Firma oder Name
                        </div>
                        <div class="mapping-example">
                            <strong>Straße/Street</strong> → Adresse 1
                        </div>
                        <div class="mapping-example">
                            <strong>PLZ/ZIP</strong> → Postleitzahl
                        </div>
                        <div class="mapping-example">
                            <strong>Gewicht/Weight</strong> → Gewicht
                        </div>
                    </div>
                </div>

                <div class="import-errors">
                    <h3>⚠️ Fehlerbehandlung</h3>
                    <div class="error-types">
                        <div class="error-type critical">
                            <i class="fas fa-exclamation-triangle"></i>
                            <strong>Kritische Fehler</strong>
                            <p>Fehlende Pflichtfelder, ungültige Datentypen</p>
                        </div>
                        <div class="error-type warning">
                            <i class="fas fa-info-circle"></i>
                            <strong>Warnungen</strong>
                            <p>Fehlende E-Mail, hohe Gewichte, internationale Sendungen</p>
                        </div>
                    </div>
                </div>

                <div class="import-tips">
                    <h3>💡 Import-Tipps</h3>
                    <ul>
                        <li><strong>UTF-8 Kodierung</strong> verwenden für Umlaute</li>
                        <li><strong>Erste Zeile</strong> sollte Spaltennamen enthalten</li>
                        <li><strong>Leere Zeilen</strong> werden automatisch übersprungen</li>
                        <li><strong>Vorschau nutzen</strong> vor dem finalen Import</li>
                        <li><strong>Duplikate prüfen</strong> basierend auf Adresse</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getExportContent() {
        return `
            <div class="help-section">
                <h2>📤 Batch-Export erstellen</h2>
                
                <div class="export-options">
                    <h3>⚙️ Export-Optionen</h3>
                    <div class="option-grid">
                        <div class="option-item">
                            <h4>📄 Format wählen</h4>
                            <ul>
                                <li><strong>CSV</strong>: Standard-Format</li>
                                <li><strong>SSV</strong>: Für deutsche Excel (empfohlen)</li>
                                <li><strong>TXT</strong>: Tab-getrennt</li>
                            </ul>
                        </div>
                        
                        <div class="option-item">
                            <h4>📋 Sendungen auswählen</h4>
                            <ul>
                                <li><strong>Nur gültige</strong>: Nur validierte Sendungen</li>
                                <li><strong>Alle</strong>: Einschließlich fehlerhafter</li>
                                <li><strong>Ausgewählte</strong>: Nur markierte Sendungen</li>
                            </ul>
                        </div>
                        
                        <div class="option-item">
                            <h4>🗂️ Felder auswählen</h4>
                            <ul>
                                <li><strong>Standard</strong>: Wichtigste UPS-Felder</li>
                                <li><strong>Erweitert</strong>: Alle verfügbaren Felder</li>
                                <li><strong>International</strong>: Mit Zoll-Feldern</li>
                                <li><strong>Individuell</strong>: Eigene Auswahl</li>
                            </ul>
                        </div>
                        
                        <div class="option-item">
                            <h4>🔧 Erweiterte Optionen</h4>
                            <ul>
                                <li><strong>Kopfzeile</strong>: Feldnamen einschließen</li>
                                <li><strong>Sortierung</strong>: Nach Land oder Service</li>
                                <li><strong>Zeitstempel</strong>: Exportdatum hinzufügen</li>
                                <li><strong>Gruppierung</strong>: Nach Service-Typ</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="export-workflow">
                    <h3>🚀 Schnell-Export</h3>
                    <p>Für den schnellen Export ohne Konfiguration:</p>
                    <div class="quick-export-buttons">
                        <div class="quick-button">
                            <i class="fas fa-file-csv"></i>
                            <strong>CSV Export</strong>
                            <p>Standard CSV mit allen gültigen Sendungen</p>
                        </div>
                        <div class="quick-button recommended">
                            <i class="fas fa-file-alt"></i>
                            <strong>SSV Export</strong>
                            <p>Empfohlen für deutsche Excel-Versionen</p>
                        </div>
                    </div>
                </div>

                <div class="export-fields">
                    <h3>📊 UPS-Felder Übersicht</h3>
                    <div class="field-categories">
                        <div class="field-category">
                            <h4>👤 Empfänger-Felder</h4>
                            <ul>
                                <li>Kontaktname, Firmenname</li>
                                <li>Adresse 1-3</li>
                                <li>Stadt, Bundesland, PLZ, Land</li>
                                <li>Telefon, E-Mail</li>
                                <li>Privatadresse-Kennzeichnung</li>
                            </ul>
                        </div>
                        
                        <div class="field-category">
                            <h4>📦 Paket-Felder</h4>
                            <ul>
                                <li>Gewicht, Maßeinheit</li>
                                <li>Abmessungen (L×B×H)</li>
                                <li>Verpackungsart</li>
                                <li>Warenbeschreibung</li>
                                <li>Zollwert, Deklarationswert</li>
                            </ul>
                        </div>
                        
                        <div class="field-category">
                            <h4>🚚 Service-Felder</h4>
                            <ul>
                                <li>Service-Typ</li>
                                <li>Zustellbestätigung</li>
                                <li>Samstag-Zustellung</li>
                                <li>Zusätzliche Behandlung</li>
                                <li>Referenznummern 1-3</li>
                            </ul>
                        </div>
                        
                        <div class="field-category">
                            <h4>⭐ Spezial-Services</h4>
                            <ul>
                                <li>UPS Premium Care</li>
                                <li>Lithium-Batterien</li>
                                <li>Elektronische Paket-Freigabe</li>
                                <li>Versender-Freigabe</li>
                                <li>Klimaneutraler Versand</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="export-tips">
                    <h3>💡 Export-Tipps</h3>
                    <ul>
                        <li><strong>SSV-Format</strong> verwenden für deutsche Excel-Versionen</li>
                        <li><strong>Gültige Sendungen</strong> zuerst exportieren und prüfen</li>
                        <li><strong>Zeitstempel</strong> aktivieren für Versionierung</li>
                        <li><strong>Feldauswahl</strong> an UPS WorldShip-Konfiguration anpassen</li>
                        <li><strong>Dateiname</strong> mit Datum für bessere Organisation</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getValidationContent() {
        return `
            <div class="help-section">
                <h2>✅ Validierung verstehen</h2>
                
                <div class="validation-overview">
                    <h3>🎯 Was wird validiert?</h3>
                    <p>Der UPS Batch-Manager prüft alle Eingaben in Echtzeit und beim Import auf:</p>
                    <div class="validation-categories">
                        <div class="validation-category">
                            <i class="fas fa-check-circle success"></i>
                            <strong>Pflichtfelder</strong>
                            <p>Alle notwendigen Felder sind ausgefüllt</p>
                        </div>
                        <div class="validation-category">
                            <i class="fas fa-ruler info"></i>
                            <strong>Feldlängen</strong>
                            <p>Texte überschreiten nicht die UPS-Limits</p>
                        </div>
                        <div class="validation-category">
                            <i class="fas fa-format warning"></i>
                            <strong>Formate</strong>
                            <p>E-Mails, Telefonnummern, PLZ sind korrekt</p>
                        </div>
                        <div class="validation-category">
                            <i class="fas fa-globe primary"></i>
                            <strong>Länderspezifisch</strong>
                            <p>Regeln abhängig vom Zielland</p>
                        </div>
                    </div>
                </div>

                <div class="validation-rules">
                    <h3>📋 Validierungsregeln im Detail</h3>
                    
                    <div class="rule-section">
                        <h4>📮 Postleitzahlen</h4>
                        <div class="rule-examples">
                            <div class="rule-item">
                                <strong>🇩🇪 Deutschland:</strong> 5 Ziffern (z.B. 12345)
                            </div>
                            <div class="rule-item">
                                <strong>🇺🇸 USA:</strong> 5 oder 5+4 Ziffern (z.B. 12345-6789)
                            </div>
                            <div class="rule-item">
                                <strong>🇨🇦 Kanada:</strong> A1A 1A1 Format
                            </div>
                            <div class="rule-item">
                                <strong>🇬🇧 Großbritannien:</strong> SW1A 1AA Format
                            </div>
                        </div>
                    </div>

                    <div class="rule-section">
                        <h4>⚖️ Gewichte & Abmessungen</h4>
                        <div class="weight-rules">
                            <div class="weight-item">
                                <strong>Kilogramm (KG):</strong> 0,1 - 70 kg
                            </div>
                            <div class="weight-item">
                                <strong>Pfund (LB):</strong> 0,1 - 150 lbs
                            </div>
                            <div class="weight-item">
                                <strong>Abmessungen:</strong> 1 - 270 cm pro Dimension
                            </div>
                            <div class="weight-item">
                                <strong>Umfang:</strong> Länge + 2×(Breite + Höhe) ≤ 400 cm
                            </div>
                        </div>
                    </div>

                    <div class="rule-section">
                        <h4>🌍 Internationale Sendungen</h4>
                        <div class="international-rules">
                            <div class="rule-requirement">
                                <i class="fas fa-exclamation-triangle warning"></i>
                                <strong>Pflicht für Nicht-EU Länder:</strong>
                                <ul>
                                    <li>Warenbeschreibung (max. 50 Zeichen)</li>
                                    <li>Zollwert in Euro</li>
                                </ul>
                            </div>
                            <div class="rule-requirement">
                                <i class="fas fa-info-circle info"></i>
                                <strong>Pflicht für USA/Kanada:</strong>
                                <ul>
                                    <li>Bundesland/Provinz (2 Buchstaben)</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="validation-visual">
                    <h3>🎨 Visuelle Hinweise</h3>
                    <div class="visual-guide">
                        <div class="visual-item success">
                            <div class="sample-field valid">Muster GmbH</div>
                            <div class="visual-description">
                                <i class="fas fa-check-circle"></i>
                                <strong>Grüner Rahmen:</strong> Feld ist gültig und korrekt ausgefüllt
                            </div>
                        </div>
                        
                        <div class="visual-item error">
                            <div class="sample-field error">12</div>
                            <div class="visual-description">
                                <i class="fas fa-exclamation-circle"></i>
                                <strong>Roter Rahmen:</strong> Fehler im Feld - Korrektur erforderlich
                            </div>
                        </div>
                        
                        <div class="visual-item warning">
                            <div class="sample-field warning">35.5</div>
                            <div class="visual-description">
                                <i class="fas fa-exclamation-triangle"></i>
                                <strong>Gelber Rahmen:</strong> Warnung - funktioniert, aber prüfen
                            </div>
                        </div>
                        
                        <div class="visual-item neutral">
                            <div class="sample-field neutral">Optionales Feld</div>
                            <div class="visual-description">
                                <i class="fas fa-circle"></i>
                                <strong>Neutraler Rahmen:</strong> Optionales Feld ohne Probleme
                            </div>
                        </div>
                    </div>
                </div>

                <div class="validation-tips">
                    <h3>💡 Validierungs-Tipps</h3>
                    <ul>
                        <li><strong>Sofortige Korrektur:</strong> Beheben Sie rote Fehler sofort</li>
                        <li><strong>Pflichtfelder zuerst:</strong> Füllen Sie markierte Pflichtfelder (*) aus</li>
                        <li><strong>Länder-Wechsel:</strong> Felder werden automatisch neu validiert</li>
                        <li><strong>Import-Validierung:</strong> Nutzen Sie die Vorschau vor dem Import</li>
                        <li><strong>Warnungen beachten:</strong> Gelbe Warnungen können wichtig sein</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getTemplatesContent() {
        return `
            <div class="help-section">
                <h2>📋 Vorlagen nutzen</h2>
                
                <div class="template-overview">
                    <h3>📥 Vorlagen-Download</h3>
                    <p>Laden Sie vorgefertigte CSV-Vorlagen herunter, um den Import zu vereinfachen:</p>
                </div>

                <div class="template-types">
                    <h3>📄 Verfügbare Vorlagen</h3>
                    <div class="template-grid">
                        <div class="template-item basic">
                            <i class="fas fa-file-alt"></i>
                            <h4>Basis-Vorlage</h4>
                            <p>Nur die wichtigsten Felder für Standard-Sendungen</p>
                            <ul>
                                <li>Empfänger-Informationen</li>
                                <li>Adresse und Kontakt</li>
                                <li>Gewicht und Service</li>
                                <li>12 Grund-Felder</li>
                            </ul>
                        </div>
                        
                        <div class="template-item advanced">
                            <i class="fas fa-file-code"></i>
                            <h4>Erweiterte Vorlage</h4>
                            <p>Alle verfügbaren Felder für komplexe Sendungen</p>
                            <ul>
                                <li>Alle UPS-Standard-Felder</li>
                                <li>Spezial-Services</li>
                                <li>Gefährliche Güter</li>
                                <li>35+ Felder</li>
                            </ul>
                        </div>
                        
                        <div class="template-item international">
                            <i class="fas fa-globe"></i>
                            <h4>Internationale Vorlage</h4>
                            <p>Felder für internationale Sendungen</p>
                            <ul>
                                <li>Basis-Felder</li>
                                <li>Zoll-Informationen</li>
                                <li>Warenbeschreibung</li>
                                <li>18 Felder</li>
                            </ul>
                        </div>
                        
                        <div class="template-item example">
                            <i class="fas fa-graduation-cap"></i>
                            <h4>Beispiel mit Daten</h4>
                            <p>Vorlage mit 3 Beispiel-Sendungen</p>
                            <ul>
                                <li>Deutschland nach Deutschland</li>
                                <li>Deutschland nach USA</li>
                                <li>Deutschland nach Frankreich</li>
                                <li>Zum Lernen und Testen</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="template-formats">
                    <h3>💾 Download-Formate</h3>
                    <div class="format-options">
                        <div class="format-option">
                            <i class="fas fa-file-csv"></i>
                            <strong>CSV</strong>
                            <p>Komma-getrennt, universal kompatibel</p>
                        </div>
                        <div class="format-option recommended">
                            <i class="fas fa-star"></i>
                            <strong>SSV (Empfohlen)</strong>
                            <p>Semikolon-getrennt, für deutsche Excel-Versionen</p>
                        </div>
                        <div class="format-option">
                            <i class="fas fa-file-excel"></i>
                            <strong>Excel-kompatibel</strong>
                            <p>Direkt in Excel öffnebar</p>
                        </div>
                    </div>
                </div>

                <div class="template-usage">
                    <h3>🔄 Vorlagen verwenden</h3>
                    <div class="usage-steps">
                        <div class="step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <strong>Vorlage herunterladen</strong>
                                <p>Dashboard → "Vorlage Herunterladen" → Typ wählen</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <strong>In Excel/Calc öffnen</strong>
                                <p>Datei öffnen und eigene Daten eintragen</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <strong>Als CSV speichern</strong>
                                <p>Als UTF-8 CSV oder SSV speichern</p>
                            </div>
                        </div>
                        <div class="step">
                            <span class="step-number">4</span>
                            <div class="step-content">
                                <strong>Importieren</strong>
                                <p>In UPS Batch-Manager importieren</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="template-examples">
                    <h3>📝 Beispiel-Daten</h3>
                    <div class="example-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Company or Name</th>
                                    <th>Address 1</th>
                                    <th>City</th>
                                    <th>Postal Code</th>
                                    <th>Country</th>
                                    <th>Weight</th>
                                    <th>Service</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Musterfirma GmbH</td>
                                    <td>Musterstraße 123</td>
                                    <td>Berlin</td>
                                    <td>10115</td>
                                    <td>DE</td>
                                    <td>2.5</td>
                                    <td>03</td>
                                </tr>
                                <tr>
                                    <td>Example Corp</td>
                                    <td>123 Main Street</td>
                                    <td>New York</td>
                                    <td>10001</td>
                                    <td>US</td>
                                    <td>5.0</td>
                                    <td>01</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="template-tips">
                    <h3>💡 Vorlagen-Tipps</h3>
                    <ul>
                        <li><strong>UTF-8 Kodierung</strong> verwenden für Umlaute (ä, ö, ü)</li>
                        <li><strong>Erste Zeile</strong> nicht ändern - enthält Feldnamen</li>
                        <li><strong>Leere Spalten</strong> können übersprungen werden</li>
                        <li><strong>Beispiel-Vorlage</strong> zum Verstehen der Feldformate nutzen</li>
                        <li><strong>Service-Codes</strong> beachten: 03=Standard, 07=Express, etc.</li>
                        <li><strong>Länder-Codes</strong> verwenden: DE, US, GB, FR, etc.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    getOfflineContent() {
        return `
            <div class="help-section">
                <h2>🌐 Offline-Nutzung</h2>
                
                <div class="offline-intro">
                    <div class="offline-badge">
                        <i class="fas fa-wifi-slash"></i>
                        <strong>100% Offline-Fähig</strong>
                    </div>
                    <p>Der UPS Batch-Manager funktioniert vollständig ohne Internetverbindung. Alle Daten bleiben auf Ihrem Gerät.</p>
                </div>

                <div class="offline-setup">
                    <h3>🚀 Einrichtung für Offline-Nutzung</h3>
                    <div class="setup-steps">
                        <div class="setup-step">
                            <span class="step-number">1</span>
                            <div class="step-content">
                                <strong>Erstmaliges Laden</strong>
                                <p>Öffnen Sie die Anwendung einmal mit Internetverbindung. Alle Dateien werden im Browser-Cache gespeichert.</p>
                            </div>
                        </div>
                        <div class="setup-step">
                            <span class="step-number">2</span>
                            <div class="step-content">
                                <strong>Cache-Überprüfung</strong>
                                <p>Schließen Sie den Browser und öffnen Sie die Anwendung erneut. Sie sollte ohne Internet funktionieren.</p>
                            </div>
                        </div>
                        <div class="setup-step">
                            <span class="step-number">3</span>
                            <div class="step-content">
                                <strong>Vollständig Offline</strong>
                                <p>Trennen Sie die Internetverbindung. Alle Funktionen bleiben verfügbar.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="offline-features">
                    <h3>✅ Offline verfügbare Funktionen</h3>
                    <div class="feature-grid">
                        <div class="feature-group">
                            <h4>📦 Sendungsverwaltung</h4>
                            <ul>
                                <li>✅ Neue Sendungen erstellen</li>
                                <li>✅ Bestehende bearbeiten</li>
                                <li>✅ Sendungen löschen</li>
                                <li>✅ Duplikate erstellen</li>
                                <li>✅ Echtzeit-Validierung</li>
                            </ul>
                        </div>
                        
                        <div class="feature-group">
                            <h4>🔄 Import/Export</h4>
                            <ul>
                                <li>✅ CSV-Dateien importieren</li>
                                <li>✅ Batch-Dateien exportieren</li>
                                <li>✅ Vorlagen herunterladen</li>
                                <li>✅ Backup erstellen</li>
                                <li>✅ Daten wiederherstellen</li>
                            </ul>
                        </div>
                        
                        <div class="feature-group">
                            <h4>⚙️ Einstellungen</h4>
                            <ul>
                                <li>✅ Persönliche Anpassungen</li>
                                <li>✅ Theme-Wechsel</li>
                                <li>✅ Standardwerte setzen</li>
                                <li>✅ Speicher-Verwaltung</li>
                                <li>✅ Daten-Bereinigung</li>
                            </ul>
                        </div>
                        
                        <div class="feature-group">
                            <h4>📊 Übersicht</h4>
                            <ul>
                                <li>✅ Dashboard-Statistiken</li>
                                <li>✅ Aktivitätsverlauf</li>
                                <li>✅ Sendungsfilter</li>
                                <li>✅ Suchfunktion</li>
                                <li>✅ Sortierung</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="offline-storage">
                    <h3>💾 Lokale Datenspeicherung</h3>
                    <div class="storage-info">
                        <div class="storage-item">
                            <i class="fas fa-database"></i>
                            <strong>LocalStorage</strong>
                            <p>Alle Sendungen und Einstellungen werden im Browser gespeichert</p>
                        </div>
                        <div class="storage-item">
                            <i class="fas fa-shield-alt"></i>
                            <strong>Datenschutz</strong>
                            <p>Daten verlassen niemals Ihr Gerät - 100% privat</p>
                        </div>
                        <div class="storage-item">
                            <i class="fas fa-sync-alt"></i>
                            <strong>Automatische Speicherung</strong>
                            <p>Änderungen werden sofort gespeichert</p>
                        </div>
                        <div class="storage-item">
                            <i class="fas fa-download"></i>
                            <strong>Backup-Funktion</strong>
                            <p>Daten als JSON-Datei exportierbar</p>
                        </div>
                    </div>
                </div>

                <div class="offline-limitations">
                    <h3>⚠️ Offline-Einschränkungen</h3>
                    <div class="limitation-list">
                        <div class="limitation-item">
                            <i class="fas fa-times-circle"></i>
                            <strong>Keine UPS API-Integration</strong>
                            <p>Echte UPS-Services (Tracking, Preise) benötigen Internet</p>
                        </div>
                        <div class="limitation-item">
                            <i class="fas fa-times-circle"></i>
                            <strong>Keine Adress-Validierung</strong>
                            <p>Online-Adressprüfung nicht verfügbar</p>
                        </div>
                        <div class="limitation-item">
                            <i class="fas fa-times-circle"></i>
                            <strong>Keine Updates</strong>
                            <p>Neue Versionen benötigen Internetverbindung</p>
                        </div>
                        <div class="limitation-item">
                            <i class="fas fa-info-circle"></i>
                            <strong>Browser-abhängig</strong>
                            <p>Daten sind an den Browser gebunden</p>
                        </div>
                    </div>
                </div>

                <div class="offline-tips">
                    <h3>💡 Offline-Tipps</h3>
                    <ul>
                        <li><strong>Browser-Cache</strong> nicht löschen für dauerhafte Offline-Nutzung</li>
                        <li><strong>Regelmäßige Backups</strong> erstellen für Datensicherheit</li>
                        <li><strong>Lesezeichen setzen</strong> für schnellen Zugriff</li>
                        <li><strong>Mehrere Browser</strong> für Redundanz nutzen</li>
                        <li><strong>Portable Version</strong> auf USB-Stick für mobile Nutzung</li>
                        <li><strong>Einmalig online</strong> neue Versionen laden</li>
                    </ul>
                </div>

                <div class="offline-security">
                    <h3>🔒 Sicherheit & Datenschutz</h3>
                    <div class="security-features">
                        <div class="security-item">
                            <i class="fas fa-lock"></i>
                            <strong>Keine Datenübertragung</strong>
                            <p>Sendungsdaten verlassen niemals Ihr Gerät</p>
                        </div>
                        <div class="security-item">
                            <i class="fas fa-eye-slash"></i>
                            <strong>Kein Tracking</strong>
                            <p>Keine Analytik, keine Cookies, keine Verfolgung</p>
                        </div>
                        <div class="security-item">
                            <i class="fas fa-user-secret"></i>
                            <strong>Vollständige Privatsphäre</strong>
                            <p>Arbeiten Sie ohne Internetverbindung</p>
                        </div>
                        <div class="security-item">
                            <i class="fas fa-certificate"></i>
                            <strong>HTTPS-kompatibel</strong>
                            <p>Funktioniert mit sicheren Verbindungen</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getTroubleshootingContent() {
        return `
            <div class="help-section">
                <h2>🛠️ Problemlösung</h2>
                
                <div class="common-issues">
                    <h3>🔧 Häufige Probleme</h3>
                    
                    <div class="issue-group">
                        <div class="issue-item">
                            <h4>❌ Import schlägt fehl</h4>
                            <div class="issue-solutions">
                                <div class="solution">
                                    <strong>Problem:</strong> CSV-Datei wird nicht erkannt
                                    <br><strong>Lösung:</strong> 
                                    <ul>
                                        <li>Dateigröße unter 10MB prüfen</li>
                                        <li>UTF-8 Kodierung verwenden</li>
                                        <li>Dateiendung .csv, .ssv oder .txt</li>
                                        <li>Erste Zeile sollte Spaltennamen enthalten</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="issue-item">
                            <h4>💾 Speicher voll / Daten weg</h4>
                            <div class="issue-solutions">
                                <div class="solution">
                                    <strong>Problem:</strong> LocalStorage Quota überschritten
                                    <br><strong>Lösung:</strong>
                                    <ul>
                                        <li>Einstellungen → Speicher bereinigen</li>
                                        <li>Backup erstellen vor Bereinigung</li>
                                        <li>Alte Aktivitäten automatisch löschen lassen</li>
                                        <li>Browser-Cache leeren als letzter Ausweg</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="issue-item">
                            <h4>🚫 Validierungsfehler</h4>
                            <div class="issue-solutions">
                                <div class="solution">
                                    <strong>Problem:</strong> Felder werden als ungültig markiert
                                    <br><strong>Lösung:</strong>
                                    <ul>
                                        <li>Pflichtfelder (*) alle ausfüllen</li>
                                        <li>Postleitzahl an Land anpassen</li>
                                        <li>Gewicht zwischen 0,1 und 70 kg</li>
                                        <li>Bei internationalen Sendungen: Zollwert und Warenbeschreibung</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="issue-item">
                            <h4>📱 Layout-Probleme auf Mobile</h4>
                            <div class="issue-solutions">
                                <div class="solution">
                                    <strong>Problem:</strong> Tabellen zu breit, Buttons zu klein
                                    <br><strong>Lösung:</strong>
                                    <ul>
                                        <li>Querformat verwenden für Tabellen</li>
                                        <li>Zoom auf 100% setzen</li>
                                        <li>Browser-Cache leeren</li>
                                        <li>Moderne Browser verwenden (Chrome, Safari)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="browser-issues">
                    <h3>🌐 Browser-spezifische Probleme</h3>
                    <div class="browser-grid">
                        <div class="browser-item">
                            <i class="fab fa-chrome"></i>
                            <strong>Chrome/Edge</strong>
                            <ul>
                                <li>✅ Vollständig unterstützt</li>
                                <li>Inkognito-Modus: LocalStorage funktioniert eingeschränkt</li>
                                <li>Cache leeren: Strg+Shift+Del</li>
                            </ul>
                        </div>
                        
                        <div class="browser-item">
                            <i class="fab fa-firefox"></i>
                            <strong>Firefox</strong>
                            <ul>
                                <li>✅ Vollständig unterstützt</li>
                                <li>Privater Modus: Daten werden beim Schließen gelöscht</li>
                                <li>Tracking-Schutz kann CSS blockieren</li>
                            </ul>
                        </div>
                        
                        <div class="browser-item">
                            <i class="fab fa-safari"></i>
                            <strong>Safari</strong>
                            <ul>
                                <li>✅ Grundsätzlich unterstützt</li>
                                <li>LocalStorage-Limits können kleiner sein</li>
                                <li>Häufige Backups empfohlen</li>
                            </ul>
                        </div>
                        
                        <div class="browser-item">
                            <i class="fas fa-mobile-alt"></i>
                            <strong>Mobile Browser</strong>
                            <ul>
                                <li>⚠️ Eingeschränkt unterstützt</li>
                                <li>Speicher kann bei niedrigem RAM gelöscht werden</li>
                                <li>Drag & Drop funktioniert nicht immer</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="performance-issues">
                    <h3>⚡ Performance-Probleme</h3>
                    <div class="perf-solutions">
                        <div class="perf-item">
                            <strong>🐌 Langsame Tabellen bei vielen Sendungen</strong>
                            <ul>
                                <li>Paginierung verwenden (10/25/50 pro Seite)</li>
                                <li>Filter anwenden um Datenmenge zu reduzieren</li>
                                <li>Browser-Cache leeren</li>
                                <li>Alte Sendungen archivieren/löschen</li>
                            </ul>
                        </div>
                        
                        <div class="perf-item">
                            <strong>💾 Hoher Speicherverbrauch</strong>
                            <ul>
                                <li>Einstellungen → Daten & Speicher → Bereinigen</li>
                                <li>Aktivitätsverlauf begrenzen</li>
                                <li>Backup erstellen und Daten neu importieren</li>
                                <li>Andere Browser-Tabs schließen</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="data-recovery">
                    <h3>🔄 Datenwiederherstellung</h3>
                    <div class="recovery-steps">
                        <div class="recovery-step">
                            <h4>📥 Backup wiederherstellen</h4>
                            <ol>
                                <li>Einstellungen → Daten & Speicher öffnen</li>
                                <li>"Backup wiederherstellen" klicken</li>
                                <li>JSON-Backup-Datei auswählen</li>
                                <li>Wiederherstellung bestätigen</li>
                            </ol>
                        </div>
                        
                        <div class="recovery-step">
                            <h4>🗑️ Komplett neu starten</h4>
                            <ol>
                                <li>Alle wichtigen Daten exportieren</li>
                                <li>Einstellungen → "Alle Daten löschen"</li>
                                <li>Browser neu laden (F5)</li>
                                <li>Daten neu importieren</li>
                            </ol>
                        </div>
                    </div>
                </div>

                <div class="debug-info">
                    <h3>🔍 Debug-Informationen</h3>
                    <div class="debug-steps">
                        <h4>Browser-Konsole öffnen:</h4>
                        <ul>
                            <li><strong>Chrome/Edge:</strong> F12 oder Strg+Shift+I</li>
                            <li><strong>Firefox:</strong> F12 oder Strg+Shift+K</li>
                            <li><strong>Safari:</strong> Cmd+Alt+I</li>
                        </ul>
                        
                        <h4>Hilfreiche Konsolen-Befehle:</h4>
                        <div class="console-commands">
                            <code>localStorage.length</code> - Anzahl gespeicherter Elemente
                            <br>
                            <code>window.storageManager.getStorageInfo()</code> - Speicher-Statistiken
                            <br>
                            <code>window.shipmentManager.getAllShipments().length</code> - Anzahl Sendungen
                        </div>
                    </div>
                </div>

                <div class="contact-support">
                    <h3>📞 Weitere Hilfe</h3>
                    <div class="support-info">
                        <div class="support-item">
                            <i class="fas fa-book"></i>
                            <strong>Dokumentation</strong>
                            <p>Vollständige Anleitung in der README.md Datei</p>
                        </div>
                        <div class="support-item">
                            <i class="fas fa-question-circle"></i>
                            <strong>UPS WorldShip</strong>
                            <p>Für UPS-spezifische Fragen wenden Sie sich an UPS Support</p>
                        </div>
                        <div class="support-item">
                            <i class="fas fa-lightbulb"></i>
                            <strong>Tipps</strong>
                            <p>Browser-Version aktuell halten, regelmäßige Backups</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getShortcutsContent() {
        return `
            <div class="help-section">
                <h2>⌨️ Tastaturkürzel</h2>
                
                <div class="shortcuts-intro">
                    <p>Nutzen Sie diese Tastaturkürzel für eine effizientere Bedienung des UPS Batch-Managers:</p>
                </div>

                <div class="shortcut-categories">
                    <div class="shortcut-category">
                        <h3>🌐 Globale Shortcuts</h3>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>F1</kbd>
                                <span>Hilfe öffnen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>S</kbd>
                                <span>Sendung speichern</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>I</kbd>
                                <span>Import-Bereich öffnen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>E</kbd>
                                <span>Export-Bereich öffnen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>D</kbd>
                                <span>Vorlage herunterladen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>Modale schließen / Filter zurücksetzen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Entf</kbd>
                                <span>Ausgewählte Sendungen löschen</span>
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-category">
                        <h3>🧭 Navigation</h3>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>Tab</kbd>
                                <span>Zum nächsten Eingabefeld</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Shift</kbd> + <kbd>Tab</kbd>
                                <span>Zum vorherigen Eingabefeld</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Enter</kbd>
                                <span>Schaltfläche aktivieren</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Leertaste</kbd>
                                <span>Checkbox umschalten</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>↑</kbd> <kbd>↓</kbd>
                                <span>Durch Listen navigieren</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>←</kbd> <kbd>→</kbd>
                                <span>Durch Tabellenspalten navigieren</span>
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-category">
                        <h3>📋 Formulare</h3>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>Enter</kbd>
                                <span>Formular absenden</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>Z</kbd>
                                <span>Letzte Änderung rückgängig*</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>Y</kbd>
                                <span>Änderung wiederherstellen*</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>A</kbd>
                                <span>Alles auswählen (in Feldern)</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>C</kbd>
                                <span>Kopieren</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>V</kbd>
                                <span>Einfügen</span>
                            </div>
                        </div>
                        <small>* In kommender Version verfügbar</small>
                    </div>

                    <div class="shortcut-category">
                        <h3>📊 Tabellen</h3>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>Klick</kbd>
                                <span>Mehrfachauswahl</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Shift</kbd> + <kbd>Klick</kbd>
                                <span>Bereichsauswahl</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>A</kbd>
                                <span>Alle Sendungen auswählen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Entf</kbd>
                                <span>Ausgewählte Zeilen löschen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>F2</kbd>
                                <span>Sendung bearbeiten</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>F</kbd>
                                <span>Suche fokussieren</span>
                            </div>
                        </div>
                    </div>

                    <div class="shortcut-category">
                        <h3>🔧 Entwickler & Debug</h3>
                        <div class="shortcut-list">
                            <div class="shortcut-item">
                                <kbd>F12</kbd>
                                <span>Entwicklertools öffnen</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd>
                                <span>Entwicklertools (alternativ)</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>F5</kbd>
                                <span>Seite neu laden</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>F5</kbd>
                                <span>Hard-Reload (Cache löschen)</span>
                            </div>
                            <div class="shortcut-item">
                                <kbd>Strg</kbd> + <kbd>Shift</kbd> + <kbd>Del</kbd>
                                <span>Browser-Daten löschen</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accessibility-info">
                    <h3>♿ Barrierefreiheit</h3>
                    <div class="accessibility-features">
                        <div class="access-item">
                            <i class="fas fa-keyboard"></i>
                            <strong>Vollständige Tastatur-Navigation</strong>
                            <p>Alle Funktionen sind ohne Maus bedienbar</p>
                        </div>
                        <div class="access-item">
                            <i class="fas fa-eye"></i>
                            <strong>Screen Reader Unterstützung</strong>
                            <p>ARIA-Labels und Beschreibungen für alle Elemente</p>
                        </div>
                        <div class="access-item">
                            <i class="fas fa-adjust"></i>
                            <strong>Hoher Kontrast</strong>
                            <p>WCAG 2.1 AA konforme Farbkontraste</p>
                        </div>
                        <div class="access-item">
                            <i class="fas fa-search-plus"></i>
                            <strong>Skalierbar</strong>
                            <p>Funktioniert bei 50% - 200% Zoom</p>
                        </div>
                    </div>
                </div>

                <div class="shortcut-tips">
                    <h3>💡 Effizienz-Tipps</h3>
                    <div class="tip-list">
                        <div class="tip-item">
                            <i class="fas fa-rocket"></i>
                            <strong>Workflow-Kombination</strong>
                            <p><kbd>Strg+I</kbd> → Datei auswählen → <kbd>Tab</kbd> Navigation → <kbd>Enter</kbd> für schnellen Import</p>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-copy"></i>
                            <strong>Schnelle Duplikation</strong>
                            <p>Sendung auswählen → <kbd>F2</kbd> → Daten ändern → <kbd>Strg+S</kbd></p>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-filter"></i>
                            <strong>Effektive Suche</strong>
                            <p><kbd>Strg+F</kbd> → Suchbegriff → <kbd>Enter</kbd> → Pfeiltasten für Navigation</p>
                        </div>
                        <div class="tip-item">
                            <i class="fas fa-trash"></i>
                            <strong>Bulk-Löschung</strong>
                            <p><kbd>Strg+A</kbd> → <kbd>Strg+Klick</kbd> (Ausnahmen) → <kbd>Entf</kbd></p>
                        </div>
                    </div>
                </div>

                <div class="browser-specific">
                    <h3>🌐 Browser-spezifische Shortcuts</h3>
                    <div class="browser-shortcuts">
                        <div class="browser-group">
                            <h4>Chrome / Edge</h4>
                            <ul>
                                <li><kbd>Strg+Shift+N</kbd> - Inkognito-Modus</li>
                                <li><kbd>Strg+L</kbd> - Adressleiste fokussieren</li>
                                <li><kbd>Strg+T</kbd> - Neuer Tab</li>
                            </ul>
                        </div>
                        <div class="browser-group">
                            <h4>Firefox</h4>
                            <ul>
                                <li><kbd>Strg+Shift+P</kbd> - Privater Modus</li>
                                <li><kbd>F6</kbd> - Adressleiste fokussieren</li>
                                <li><kbd>Strg+K</kbd> - Suchleiste fokussieren</li>
                            </ul>
                        </div>
                        <div class="browser-group">
                            <h4>Safari (Mac)</h4>
                            <ul>
                                <li><kbd>Cmd+Shift+N</kbd> - Privates Surfen</li>
                                <li><kbd>Cmd+L</kbd> - Adressleiste fokussieren</li>
                                <li><kbd>Cmd+Alt+I</kbd> - Entwicklertools</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // CSS für das Hilfe-System
    addHelpStyles() {
        const styles = `
            .help-content {
                display: flex;
                height: 70vh;
                max-height: 600px;
            }

            .help-sidebar {
                width: 250px;
                border-right: 1px solid var(--border-light);
                background-color: var(--bg-secondary);
            }

            .help-nav {
                padding: var(--space-4);
            }

            .help-nav-item {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2) var(--space-3);
                color: var(--text-secondary);
                text-decoration: none;
                border-radius: var(--radius-md);
                margin-bottom: var(--space-1);
                transition: var(--transition-fast);
            }

            .help-nav-item:hover {
                background-color: var(--bg-tertiary);
                color: var(--text-primary);
            }

            .help-nav-item.active {
                background-color: var(--primary);
                color: var(--white);
            }

            .help-main {
                flex: 1;
                padding: var(--space-6);
                overflow-y: auto;
            }

            .help-section h2 {
                margin-top: 0;
                color: var(--primary);
                border-bottom: 2px solid var(--primary);
                padding-bottom: var(--space-2);
            }

            .help-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: var(--space-4);
                margin: var(--space-4) 0;
            }

            .help-card {
                padding: var(--space-4);
                border: 1px solid var(--border-light);
                border-radius: var(--radius-md);
                background-color: var(--bg-secondary);
            }

            .help-card h3 {
                margin-top: 0;
                color: var(--primary);
            }

            .feature-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: var(--space-4);
                margin: var(--space-4) 0;
            }

            .feature-item {
                text-align: center;
                padding: var(--space-4);
                border: 1px solid var(--border-light);
                border-radius: var(--radius-md);
                background-color: var(--bg-secondary);
            }

            .feature-item i {
                font-size: var(--font-size-2xl);
                color: var(--primary);
                margin-bottom: var(--space-2);
            }

            .shortcut-categories {
                display: grid;
                gap: var(--space-6);
            }

            .shortcut-category h3 {
                color: var(--primary);
                border-bottom: 1px solid var(--border-light);
                padding-bottom: var(--space-2);
            }

            .shortcut-list {
                display: grid;
                gap: var(--space-2);
                margin-top: var(--space-3);
            }

            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: var(--space-2) var(--space-3);
                background-color: var(--bg-secondary);
                border-radius: var(--radius-sm);
            }

            .shortcut-item kbd {
                background-color: var(--bg-tertiary);
                border: 1px solid var(--border-medium);
                border-radius: var(--radius-sm);
                padding: var(--space-1) var(--space-2);
                font-family: monospace;
                font-size: var(--font-size-xs);
            }

            .validation-examples {
                display: grid;
                gap: var(--space-2);
                margin: var(--space-3) 0;
            }

            .validation-item {
                display: flex;
                align-items: center;
                gap: var(--space-2);
                padding: var(--space-2);
                border-radius: var(--radius-sm);
            }

            .validation-item.success {
                background-color: var(--success-light);
                color: var(--success-dark);
            }

            .validation-item.error {
                background-color: var(--error-light);
                color: var(--error-dark);
            }

            .validation-item.info {
                background-color: var(--info-light);
                color: var(--info-dark);
            }

            .modal-extra-large {
                max-width: 90vw;
                width: 1200px;
            }

            @media (max-width: 768px) {
                .help-content {
                    flex-direction: column;
                    height: auto;
                }

                .help-sidebar {
                    width: 100%;
                    border-right: none;
                    border-bottom: 1px solid var(--border-light);
                }

                .help-nav {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: var(--space-2);
                }

                .help-main {
                    padding: var(--space-4);
                }

                .modal-extra-large {
                    max-width: 95vw;
                    width: auto;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
}

// Hilfe-System initialisieren
window.HelpSystemDE = HelpSystemDE;
const helpSystemInstance = new HelpSystemDE();
helpSystemInstance.addHelpStyles();
window.helpSystem = helpSystemInstance;

// Globale Funktionen für HTML-Kompatibilität
window.showHelp = (section) => window.helpSystem.showHelpModal(section);