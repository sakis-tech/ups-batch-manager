// Echtzeit-Feldvalidierung für deutsche UPS Batch Manager Oberfläche
class RealTimeValidator {
    constructor() {
        this.validationQueue = new Map();
        this.girthUpdateQueue = null;
        this.debounceDelay = 300; // ms
        this.girthDebounceDelay = 100; // ms - Kürzere Verzögerung für Gurtmaß
        this.fieldValidators = window.fieldValidators;
        this.girthContainer = null; // Cache für Container
        this.lastGirthValues = { length: 0, width: 0, height: 0 }; // Cache für Werte
        this.validationInProgress = new Set(); // Verhindert Rekursion
        this.initialize();
    }

    initialize() {
        this.setupFormValidation();
        this.addValidationStyles();
        
        // Debug-Ausgabe
        console.log('RealTimeValidator initialisiert');
        
        // Test-Gurtmaß-Container bei Seitenladung erstellen (für Testing)
        setTimeout(() => {
            this.initializeGirthDisplay();
        }, 1000);
    }
    
    // Gurtmaß-Anzeige initialisieren
    initializeGirthDisplay() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            const lengthField = form.querySelector('[name="length"]');
            const widthField = form.querySelector('[name="width"]');
            const heightField = form.querySelector('[name="height"]');
            
            if (lengthField && widthField && heightField) {
                console.log('Dimensions-Felder gefunden, initialisiere Gurtmaß-Anzeige');
                
                // Container erstellen falls nicht vorhanden
                let container = form.querySelector('.girth-calculation-container');
                if (!container) {
                    container = this.createGirthContainer(form);
                    this.girthContainer = container;
                }
                
                // Initial-Anzeige setzen
                this.updateGirthCalculationOptimized(lengthField);
            }
        });
    }

    // Formular-Validierung einrichten
    setupFormValidation() {
        document.addEventListener('input', (e) => {
            if (e.target && e.target.matches && e.target.matches('.form-input, .form-select, .form-textarea')) {
                // Spezielle Behandlung für Dimensions-Felder
                if (e.target.name === 'length' || e.target.name === 'width' || e.target.name === 'height') {
                    this.scheduleGirthUpdate(e.target);
                } else {
                    this.scheduleValidation(e.target);
                }
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target && e.target.matches && e.target.matches('.form-input, .form-select, .form-textarea')) {
                this.validateFieldImmediate(e.target);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target && e.target.matches && e.target.matches('.form-input, .form-select, .form-textarea, input[type="checkbox"], input[type="radio"]')) {
                // Sofortige Validierung bei change-Events
                this.validateFieldImmediate(e.target);
                this.updateDependentFields(e.target);
                
                // Gurtmaß auch bei change aktualisieren
                if (e.target.name === 'length' || e.target.name === 'width' || e.target.name === 'height') {
                    this.updateGirthCalculationOptimized(e.target);
                }
            }
        });
    }

    // Gurtmaß-Update planen (optimiert)
    scheduleGirthUpdate(element) {
        // Vorherige Gurtmaß-Aktualisierung abbrechen
        if (this.girthUpdateQueue) {
            cancelAnimationFrame(this.girthUpdateQueue);
        }

        // Neue Aktualisierung mit requestAnimationFrame planen
        this.girthUpdateQueue = requestAnimationFrame(() => {
            this.updateGirthCalculationOptimized(element);
            this.girthUpdateQueue = null;
        });
    }
    // Validierung planen (mit Debouncing)
    scheduleValidation(element) {
        const fieldName = element.name;
        if (!fieldName) return;

        // Vorherige Validierung abbrechen
        if (this.validationQueue.has(fieldName)) {
            clearTimeout(this.validationQueue.get(fieldName));
        }

        // Neue Validierung planen
        const timeoutId = setTimeout(() => {
            this.validateFieldImmediate(element);
            this.validationQueue.delete(fieldName);
        }, this.debounceDelay);

        this.validationQueue.set(fieldName, timeoutId);
    }

    // Sofortige Feldvalidierung
    validateFieldImmediate(element) {
        const fieldName = element.name;
        const value = this.getFieldValue(element);
        const form = element.closest('form');
        
        if (!form || !fieldName) return;

        // Rekursions-Schutz
        const validationKey = `${form.id || 'form'}_${fieldName}`;
        if (this.validationInProgress.has(validationKey)) {
            return; // Bereits in Validierung
        }
        
        this.validationInProgress.add(validationKey);

        try {
            // Sendungsdaten sammeln für Kontext-Validierung
            const shipmentData = this.getFormData(form);
            
            // Validierung durchführen
            const validation = this.fieldValidators.validateField(fieldName, value, shipmentData);
            
            // UI aktualisieren
            this.updateFieldUI(element, validation);
            
            // Abhängige Felder prüfen
            this.validateDependentFields(form, fieldName, shipmentData);
            
            // Formular-Schaltflächen aktualisieren
            this.updateFormButtons(form);

            return validation;
        } finally {
            // Validierung abgeschlossen
            this.validationInProgress.delete(validationKey);
        }
    }

    // Feldwert abrufen
    getFieldValue(element) {
        if (element.type === 'checkbox') {
            return element.checked;
        } else if (element.type === 'radio') {
            const form = element.closest('form');
            const checkedRadio = form?.querySelector(`input[name="${element.name}"]:checked`);
            return checkedRadio?.value || '';
        }
        return element.value;
    }

    // Formulardaten sammeln
    getFormData(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Checkboxes separat behandeln
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        return data;
    }

    // Feld-UI aktualisieren
    updateFieldUI(element, validation) {
        const fieldGroup = element.closest('.form-group');
        if (!fieldGroup) return;

        // Bestehende Fehler entfernen
        this.clearFieldErrors(fieldGroup);

        // Element-Klassen aktualisieren
        element.classList.remove('error', 'success', 'warning');
        
        if (!validation.isValid && validation.errors.length > 0) {
            element.classList.add('error');
            this.showFieldErrors(fieldGroup, validation.errors);
        } else if (element.value && validation.isValid) {
            element.classList.add('success');
        }

        // Realtime feedback für spezielle Felder
        this.addRealtimeFeedback(element, validation);
    }

    // Echtzeit-Feedback hinzufügen
    addRealtimeFeedback(element, validation) {
        const fieldName = element.name;
        let feedback = '';

        switch (fieldName) {
            case 'weight':
                if (element.value && validation.isValid) {
                    const unit = this.getFormData(element.closest('form')).unitOfMeasure || 'KG';
                    feedback = `✓ ${element.value} ${unit}`;
                }
                break;
                
            case 'postalCode':
                if (element.value && validation.isValid) {
                    const country = this.getFormData(element.closest('form')).country || 'DE';
                    feedback = `✓ Gültig für ${this.getCountryName(country)}`;
                }
                break;
                
            case 'email':
                if (element.value && validation.isValid) {
                    feedback = '✓ E-Mail-Format korrekt';
                }
                break;
                
            case 'telephone':
                if (element.value && validation.isValid) {
                    feedback = '✓ Telefonnummer-Format korrekt';
                }
                break;
                
            case 'length':
            case 'width':
            case 'height':
                // Gurtmaß-Berechnung läuft separat - kein zusätzliches Feedback hier
                return;
        }

        if (feedback) {
            this.showFieldFeedback(element.closest('.form-group'), feedback, 'success');
        }
    }

    // Optimierte Gurtmaß-Berechnung und Anzeige
    updateGirthCalculationOptimized(element) {
        const form = element.closest('form');
        if (!form) return;

        const lengthField = form.querySelector('[name="length"]');
        const widthField = form.querySelector('[name="width"]');
        const heightField = form.querySelector('[name="height"]');

        if (!lengthField || !widthField || !heightField) {
            console.log('Nicht alle Dimensions-Felder gefunden:', { lengthField, widthField, heightField });
            return;
        }

        const length = parseFloat(lengthField.value) || 0;
        const width = parseFloat(widthField.value) || 0;
        const height = parseFloat(heightField.value) || 0;

        console.log('Gurtmaß-Berechnung:', { length, width, height });

        // Prüfen ob sich die Werte geändert haben
        if (this.lastGirthValues.length === length && 
            this.lastGirthValues.width === width && 
            this.lastGirthValues.height === height) {
            console.log('Keine Änderung der Werte, Update übersprungen');
            return; // Keine Änderung, kein Update nötig
        }

        // Werte cachen
        this.lastGirthValues = { length, width, height };

        // Gurtmaß-Container finden oder erstellen (mit Cache)
        if (!this.girthContainer) {
            this.girthContainer = form.querySelector('.girth-calculation-container');
            if (!this.girthContainer) {
                console.log('Erstelle neuen Gurtmaß-Container');
                this.girthContainer = this.createGirthContainer(form);
            } else {
                console.log('Bestehender Gurtmaß-Container gefunden');
            }
        }

        // Live-Aktualisierung: Auch bei unvollständigen Werten anzeigen
        if (length > 0 || width > 0 || height > 0) {
            const country = this.getCountryFromForm();
            const girth = this.calculateGirth(length, width, height);
            const lengthPlusGirth = this.calculateLengthPlusGirth(length, width, height);
            const upsLimits = this.getUPSGirthLimits(country);
            const status = this.checkGirthStatus(lengthPlusGirth, upsLimits, length, country);
            
            console.log('Aktualisiere Gurtmaß-Container:', { girth, lengthPlusGirth, status });
            
            // Optimierte Container-Aktualisierung
            this.updateGirthContainerOptimized(this.girthContainer, length, width, height, girth, lengthPlusGirth, status);
            
            // Container anzeigen
            this.girthContainer.style.display = 'block';
            console.log('Container angezeigt');
        } else {
            // Container verstecken wenn gar keine Werte vorhanden sind
            this.girthContainer.style.display = 'none';
            console.log('Container versteckt - keine Werte');
        }
    }

    // Gurtmaß-Container erstellen
    createGirthContainer(form) {
        const container = document.createElement('div');
        container.className = 'girth-calculation-container';
        container.style.display = 'none'; // Initial versteckt
        
        // Verschiedene Einfügepositionen versuchen
        let insertPosition = null;
        
        // 1. Nach Dimensions-Sektion suchen
        const dimensionsSection = form.querySelector('.dimensions-section');
        if (dimensionsSection) {
            insertPosition = dimensionsSection.nextSibling;
            dimensionsSection.parentNode.insertBefore(container, insertPosition);
        }
        // 2. Nach Höhe-Feld suchen
        else {
            const heightField = form.querySelector('[name="height"]');
            const heightGroup = heightField?.closest('.form-group');
            if (heightGroup) {
                insertPosition = heightGroup.nextSibling;
                heightGroup.parentNode.insertBefore(container, insertPosition);
            }
            // 3. Nach Breite-Feld suchen
            else {
                const widthField = form.querySelector('[name="width"]');
                const widthGroup = widthField?.closest('.form-group');
                if (widthGroup) {
                    insertPosition = widthGroup.nextSibling;
                    widthGroup.parentNode.insertBefore(container, insertPosition);
                }
                // 4. Nach Länge-Feld suchen
                else {
                    const lengthField = form.querySelector('[name="length"]');
                    const lengthGroup = lengthField?.closest('.form-group');
                    if (lengthGroup) {
                        insertPosition = lengthGroup.nextSibling;
                        lengthGroup.parentNode.insertBefore(container, insertPosition);
                    }
                    // 5. Fallback: Am Ende des Formulars
                    else {
                        const formContent = form.querySelector('.form-content, .form-grid, .form-body') || form;
                        formContent.appendChild(container);
                    }
                }
            }
        }
        
        // Debug-Ausgabe
        console.log('Gurtmaß-Container erstellt und eingefügt:', container);
        console.log('Eingefügt nach:', insertPosition);
        
        return container;
    }

    // Optimierte Gurtmaß-Container-Aktualisierung
    updateGirthContainerOptimized(container, length, width, height, girth, lengthPlusGirth, status) {
        const hasAllValues = length > 0 && width > 0 && height > 0;
        const totalGirth = hasAllValues ? girth : 0;
        const totalLengthPlusGirth = hasAllValues ? lengthPlusGirth : 0;
        
        console.log('updateGirthContainerOptimized:', { container, length, width, height, girth, lengthPlusGirth, status, hasAllValues });
        
        // Immer aktualisieren für bessere Sichtbarkeit beim Debugging
        const displayStatus = hasAllValues ? status.status : 'pending';
        
        // Template für bessere Performance
        const template = this.createGirthTemplate(length, width, height, totalGirth, totalLengthPlusGirth, status, hasAllValues);
        
        console.log('Template erstellt:', template);
        
        // DOM-Aktualisierung
        container.innerHTML = template;
        
        // CSS-Klassen aktualisieren
        const displayElement = container.firstElementChild;
        if (displayElement) {
            displayElement.className = `girth-display girth-${displayStatus}`;
            console.log('CSS-Klasse gesetzt:', displayElement.className);
        }
        
        // Sicherstellen, dass Container sichtbar ist
        container.style.display = 'block';
        container.style.visibility = 'visible';
        
        console.log('Container-Status:', {
            display: container.style.display,
            visibility: container.style.visibility,
            clientHeight: container.clientHeight,
            offsetHeight: container.offsetHeight
        });
    }

    // Template für Gurtmaß-Anzeige
    createGirthTemplate(length, width, height, totalGirth, totalLengthPlusGirth, status, hasAllValues) {
        // Formel mit Platzhaltern für fehlende Werte
        const lengthDisplay = length > 0 ? `${length}cm` : '?cm';
        const widthDisplay = width > 0 ? `${width}cm` : '?cm';
        const heightDisplay = height > 0 ? `${height}cm` : '?cm';
        const girthCalc = hasAllValues ? `${totalGirth.toFixed(1)}cm` : '?cm';
        const totalDisplay = hasAllValues ? `${totalLengthPlusGirth.toFixed(1)}cm` : '?cm';
        
        const formula = `L: ${lengthDisplay} + G: ${girthCalc} = ${totalDisplay}`;
        const detailFormula = `(L: ${lengthDisplay} + 2 × (B: ${widthDisplay} + H: ${heightDisplay}))`;
        
        return `
            <div class="girth-display">
                <div class="girth-main">
                    <span class="girth-label">Länge + Gurtmaß:</span>
                    <span class="girth-value">${totalDisplay}</span>
                    ${hasAllValues ? `<span class="girth-status">${status.message}</span>` : '<span class="girth-status">Eingabe erforderlich</span>'}
                </div>
                <div class="girth-formula">
                    ${formula}
                </div>
                <div class="girth-detail">
                    ${detailFormula}
                </div>
            </div>
        `;
    }

    // Hilfsfunktion: Land aus Formular abrufen
    getCountryFromForm() {
        const form = document.querySelector('form');
        if (!form) return 'DE';
        
        const countryField = form.querySelector('[name="country"]');
        return countryField ? countryField.value : 'DE';
    }

    // Gurtmaß berechnen: 2 × (Breite + Höhe)
    calculateGirth(length, width, height) {
        return 2 * (width + height);
    }

    // Länge + Gurtmaß berechnen
    calculateLengthPlusGirth(length, width, height) {
        const girth = this.calculateGirth(length, width, height);
        return length + girth;
    }

    // UPS Gurtmaß-Limits abrufen (basierend auf Land)
    getUPSGirthLimits(country = 'DE') {
        const countryValidation = window.COUNTRY_VALIDATIONS?.[country];
        const isInches = countryValidation && countryValidation.dimensionUnit === 'IN';
        
        if (isInches) {
            // US/PR: inches
            return {
                largePackage: 130,  // inches - Großpaket-Schwelle
                maximum: 165        // inches - Absolutes Maximum
            };
        } else {
            // International: centimeters
            return {
                largePackage: 330,  // cm - Großpaket-Schwelle
                maximum: 400        // cm - Absolutes Maximum
            };
        }
    }

    // Gurtmaß-Status prüfen
    checkGirthStatus(lengthPlusGirth, limits, length = 0, country = 'DE') {
        const countryValidation = window.COUNTRY_VALIDATIONS?.[country];
        const isInches = countryValidation && countryValidation.dimensionUnit === 'IN';
        const maxLength = isInches ? 96 : 244; // US: 96 inches, International: 244 cm
        
        // Prüfe einzelne Länge für Großpaket
        const isLargeByLength = length > maxLength;
        const isLargeByGirth = lengthPlusGirth > limits.largePackage;
        
        if (lengthPlusGirth <= limits.largePackage && !isLargeByLength) {
            return {
                status: 'good',
                message: 'Standard-Paket',
                color: 'success'
            };
        } else if (lengthPlusGirth <= limits.maximum) {
            return {
                status: 'oversized',
                message: `Großpaket ${isLargeByLength ? '(Länge >96"/244cm)' : '(Gurtmaß >130"/330cm)'}`,
                color: 'warning'
            };
        } else {
            return {
                status: 'rejected',
                message: 'Paket zu groß für UPS',
                color: 'error'
            };
        }
    }

    // Feldfehler anzeigen
    showFieldErrors(fieldGroup, errors) {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-errors';
        
        errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'form-error';
            errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error}`;
            errorContainer.appendChild(errorElement);
        });

        fieldGroup.appendChild(errorContainer);
    }

    // Feld-Feedback anzeigen
    showFieldFeedback(fieldGroup, message, type = 'info') {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `field-feedback field-feedback-${type}`;
        feedbackElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        fieldGroup.appendChild(feedbackElement);
    }

    // Feldfehler löschen
    clearFieldErrors(fieldGroup) {
        const existingErrors = fieldGroup.querySelectorAll('.field-errors, .field-feedback');
        existingErrors.forEach(error => error.remove());
    }

    // Abhängige Felder aktualisieren
    updateDependentFields(changedElement) {
        const fieldName = changedElement.name;
        const form = changedElement.closest('form');
        if (!form) return;

        // Land-abhängige Felder
        if (fieldName === 'country') {
            const country = changedElement.value;
            this.updateCountryDependentFields(form, country);
        }

        // Gewichtseinheit-abhängige Felder  
        if (fieldName === 'unitOfMeasure') {
            const weightField = form.querySelector('[name="weight"]');
            if (weightField) {
                this.validateFieldImmediate(weightField);
            }
        }
    }

    // Länderspezifische Felder aktualisieren
    updateCountryDependentFields(form, country) {
        // Postleitzahl neu validieren
        const postalCodeField = form.querySelector('[name="postalCode"]');
        if (postalCodeField) {
            this.validateFieldImmediate(postalCodeField);
        }

        // Telefonnummer neu validieren
        const phoneField = form.querySelector('[name="telephone"]');
        if (phoneField) {
            this.validateFieldImmediate(phoneField);
        }

        // Bundesland-Feld anzeigen/verstecken
        this.toggleStateField(form, country);

        // Internationale Felder anzeigen/verstecken
        this.toggleInternationalFields(form, country);

        // Service-Optionen aktualisieren
        this.updateServiceOptions(form, country);
    }

    // Bundesland-Feld umschalten
    toggleStateField(form, country) {
        const stateField = form.querySelector('[name="state"]');
        const stateGroup = stateField?.closest('.form-group');
        
        if (stateGroup) {
            const stateRequired = ['US', 'CA'].includes(country);
            const stateLabel = stateGroup.querySelector('.form-label');
            
            if (stateRequired) {
                stateGroup.style.display = 'block';
                stateField.required = true;
                if (stateLabel) {
                    stateLabel.innerHTML = stateLabel.innerHTML.replace(' *', '') + ' *';
                }
            } else {
                stateGroup.style.display = country === 'DE' ? 'none' : 'block';
                stateField.required = false;
                if (stateLabel) {
                    stateLabel.innerHTML = stateLabel.innerHTML.replace(' *', '');
                }
            }
        }
    }

    // Internationale Felder umschalten
    toggleInternationalFields(form, country) {
        const internationalFields = ['customsValue', 'goodsDescription'];
        const isInternational = country && country !== 'DE';

        internationalFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            const fieldGroup = field?.closest('.form-group');
            
            if (fieldGroup) {
                const label = fieldGroup.querySelector('.form-label');
                
                if (isInternational) {
                    fieldGroup.style.display = 'block';
                    field.required = true;
                    if (label && !label.innerHTML.includes(' *')) {
                        label.innerHTML += ' *';
                    }
                } else {
                    fieldGroup.style.display = 'none';
                    field.required = false;
                    if (label) {
                        label.innerHTML = label.innerHTML.replace(' *', '');
                    }
                }
            }
        });
    }

    // Service-Optionen aktualisieren
    updateServiceOptions(form, country) {
        const serviceField = form.querySelector('[name="serviceType"]');
        if (!serviceField) return;

        const currentValue = serviceField.value;
        const availableServices = FIELD_HELPERS.calculateServiceOptions(country, false);
        
        serviceField.innerHTML = availableServices.map(option => 
            `<option value="${option.value}" ${option.value === currentValue ? 'selected' : ''}>${option.label}</option>`
        ).join('');

        // Wenn der aktuelle Service nicht verfügbar ist, Standard wählen
        if (!availableServices.find(s => s.value === currentValue)) {
            serviceField.value = availableServices[0]?.value || '03';
        }
    }

    // Abhängige Felder validieren
    validateDependentFields(form, changedFieldName, shipmentData) {
        const dependencies = {
            'country': ['postalCode', 'telephone', 'state', 'customsValue', 'goodsDescription'],
            'unitOfMeasure': ['weight'],
            'serviceType': ['saturdayDelivery', 'deliveryConfirm'],
            'packagingType': ['length', 'width', 'height']
            // Entfernt: Dimensions-Felder validieren sich nicht gegenseitig
            // 'length': ['width', 'height'],
            // 'width': ['length', 'height'],
            // 'height': ['length', 'width']
        };

        const dependentFields = dependencies[changedFieldName];
        if (!dependentFields) return;

        dependentFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field) {
                this.validateFieldImmediate(field);
            }
        });
    }

    // Formular-Schaltflächen aktualisieren
    updateFormButtons(form) {
        const submitButton = form.querySelector('button[type="submit"], button[data-action="save"], button[data-action="confirm"]');
        if (!submitButton) return;

        const hasErrors = form.querySelectorAll('.form-input.error, .form-select.error').length > 0;
        const hasEmptyRequired = Array.from(form.querySelectorAll('[required]')).some(field => {
            return !this.getFieldValue(field) && field.offsetParent !== null; // Sichtbar und leer
        });

        const isValid = !hasErrors && !hasEmptyRequired;
        
        submitButton.disabled = !isValid;
        submitButton.classList.toggle('btn-disabled', !isValid);
        
        // Tooltip für deaktivierte Schaltfläche
        if (!isValid) {
            let reason = '';
            if (hasEmptyRequired) {
                reason = 'Bitte füllen Sie alle Pflichtfelder aus';
            } else if (hasErrors) {
                reason = 'Bitte korrigieren Sie die Fehler im Formular';
            }
            submitButton.title = reason;
        } else {
            submitButton.title = '';
        }
    }

    // Gesamtes Formular validieren
    validateForm(form) {
        const fields = form.querySelectorAll('.form-input, .form-select, .form-textarea');
        const results = [];
        
        fields.forEach(field => {
            const validation = this.validateFieldImmediate(field);
            if (validation) {
                results.push({
                    field: field.name,
                    validation
                });
            }
        });

        const isValid = results.every(result => result.validation.isValid);
        const errors = results.filter(result => !result.validation.isValid);

        return {
            isValid,
            errors,
            results
        };
    }

    // Ländername abrufen
    getCountryName(countryCode) {
        const countries = {
            'DE': 'Deutschland',
            'US': 'USA',
            'CA': 'Kanada',
            'GB': 'Großbritannien',
            'FR': 'Frankreich',
            'IT': 'Italien',
            'ES': 'Spanien',
            'NL': 'Niederlande',
            'BE': 'Belgien',
            'AT': 'Österreich',
            'CH': 'Schweiz',
            'PL': 'Polen',
            'CZ': 'Tschechien'
        };
        
        return countries[countryCode] || countryCode;
    }

    // Validierungs-Styles hinzufügen
    addValidationStyles() {
        const styles = `
            .form-input.error,
            .form-select.error,
            .form-textarea.error {
                border-color: var(--error) !important;
                background-color: var(--error-light);
            }

            .form-input.success,
            .form-select.success,
            .form-textarea.success {
                border-color: var(--success) !important;
            }

            .form-input.warning,
            .form-select.warning,
            .form-textarea.warning {
                border-color: var(--warning) !important;
                background-color: var(--warning-light);
            }

            .field-errors {
                margin-top: var(--space-2);
            }

            .form-error {
                display: flex;
                align-items: center;
                gap: var(--space-1);
                color: var(--error-dark);
                font-size: var(--font-size-xs);
                margin-bottom: var(--space-1);
            }

            .form-error:last-child {
                margin-bottom: 0;
            }

            .field-feedback {
                display: flex;
                align-items: center;
                gap: var(--space-1);
                margin-top: var(--space-2);
                font-size: var(--font-size-xs);
                font-weight: var(--font-weight-medium);
            }

            .field-feedback-success {
                color: var(--success-dark);
            }

            .field-feedback-info {
                color: var(--info-dark);
            }

            .field-feedback-warning {
                color: var(--warning-dark);
            }

            .field-feedback-error {
                color: var(--error-dark);
            }

            .girth-feedback {
                font-weight: var(--font-weight-semibold);
                padding: var(--space-2);
                border-radius: var(--radius-sm);
                background-color: rgba(255, 255, 255, 0.1);
                border-left: 3px solid currentColor;
            }

            .girth-feedback.field-feedback-success {
                background-color: rgba(16, 185, 129, 0.1);
                border-left-color: var(--success);
            }

            .girth-feedback.field-feedback-warning {
                background-color: rgba(245, 158, 11, 0.1);
                border-left-color: var(--warning);
            }

            .girth-feedback.field-feedback-error {
                background-color: rgba(239, 68, 68, 0.1);
                border-left-color: var(--error);
            }

            /* Neue Gurtmaß-Anzeige */
            .girth-calculation-container {
                margin: var(--space-6) 0;
                display: none;
                grid-column: 1 / -1; /* Nimmt die gesamte Breite des Grids ein */
                width: 100%;
            }

            .girth-display {
                padding: var(--space-6);
                border-radius: var(--radius-lg);
                border: 2px solid;
                background-color: rgba(255, 255, 255, 0.05);
                transition: all 0.2s ease;
                width: 100%;
                box-sizing: border-box;
            }

            .girth-display.girth-good {
                border-color: var(--success);
                background-color: rgba(16, 185, 129, 0.1);
            }

            .girth-display.girth-oversized {
                border-color: var(--warning);
                background-color: rgba(245, 158, 11, 0.1);
            }

            .girth-display.girth-rejected {
                border-color: var(--error);
                background-color: rgba(239, 68, 68, 0.1);
            }

            .girth-display.girth-pending {
                border-color: var(--border);
                background-color: rgba(128, 128, 128, 0.1);
            }

            .girth-main {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--space-3);
                margin-bottom: var(--space-3);
                flex-wrap: wrap;
            }

            .girth-label {
                font-size: var(--font-size-lg);
                font-weight: var(--font-weight-semibold);
                color: var(--text-primary);
            }

            .girth-value {
                font-size: var(--font-size-3xl);
                font-weight: var(--font-weight-bold);
                min-width: 120px;
                text-align: center;
            }

            .girth-status {
                font-size: var(--font-size-md);
                font-weight: var(--font-weight-medium);
                padding: var(--space-2) var(--space-3);
                border-radius: var(--radius-full);
                background-color: rgba(255, 255, 255, 0.2);
            }

            .girth-good .girth-value {
                color: var(--success);
            }

            .girth-oversized .girth-value {
                color: var(--warning);
            }

            .girth-rejected .girth-value {
                color: var(--error);
            }

            .girth-pending .girth-value {
                color: var(--text-secondary);
            }

            .girth-formula {
                text-align: center;
                font-size: var(--font-size-lg);
                color: var(--text-primary);
                font-family: 'Courier New', monospace;
                background-color: rgba(255, 255, 255, 0.1);
                padding: var(--space-3);
                border-radius: var(--radius-md);
                border: 1px solid rgba(255, 255, 255, 0.2);
                margin-bottom: var(--space-2);
                font-weight: var(--font-weight-semibold);
            }

            .girth-detail {
                text-align: center;
                font-size: var(--font-size-sm);
                color: var(--text-secondary);
                font-family: 'Courier New', monospace;
                background-color: rgba(255, 255, 255, 0.05);
                padding: var(--space-2);
                border-radius: var(--radius-sm);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            /* Dark Mode für Gurtmaß */
            [data-theme="dark"] .girth-display {
                background-color: rgba(0, 0, 0, 0.2);
            }

            [data-theme="dark"] .girth-display.girth-good {
                background-color: rgba(16, 185, 129, 0.15);
            }

            [data-theme="dark"] .girth-display.girth-oversized {
                background-color: rgba(245, 158, 11, 0.15);
            }

            [data-theme="dark"] .girth-display.girth-rejected {
                background-color: rgba(239, 68, 68, 0.15);
            }

            [data-theme="dark"] .girth-display.girth-pending {
                background-color: rgba(128, 128, 128, 0.15);
            }

            [data-theme="dark"] .girth-formula,
            [data-theme="dark"] .girth-detail {
                background-color: rgba(0, 0, 0, 0.3);
                border-color: rgba(255, 255, 255, 0.1);
            }

            /* Responsive Anpassungen für Gurtmaß */
            @media (max-width: 768px) {
                .girth-main {
                    flex-direction: column;
                    gap: var(--space-2);
                }
                
                .girth-value {
                    font-size: var(--font-size-2xl);
                }
                
                .girth-formula {
                    font-size: var(--font-size-md);
                }
                
                .girth-detail {
                    font-size: var(--font-size-xs);
                }
            }

            .btn-disabled {
                opacity: 0.6;
                cursor: not-allowed;
                pointer-events: none;
            }

            .form-group.has-error .form-label {
                color: var(--error-dark);
            }

            .form-group.has-success .form-label {
                color: var(--success-dark);
            }

            /* Animation für Validierungsänderungen */
            .form-input,
            .form-select,
            .form-textarea {
                transition: border-color 0.2s ease, background-color 0.2s ease;
            }

            .field-errors,
            .field-feedback {
                animation: slideDown 0.3s ease-out;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Responsive Anpassungen */
            @media (max-width: 768px) {
                .form-error,
                .field-feedback {
                    font-size: var(--font-size-xs);
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    // Cleanup bei Destroy
    destroy() {
        // Pending validations abbrechen
        for (let timeoutId of this.validationQueue.values()) {
            clearTimeout(timeoutId);
        }
        this.validationQueue.clear();
        
        // Gurtmaß-Update abbrechen
        if (this.girthUpdateQueue) {
            cancelAnimationFrame(this.girthUpdateQueue);
        }
        
        // Cache leeren
        this.girthContainer = null;
        this.lastGirthValues = { length: 0, width: 0, height: 0 };
        this.validationInProgress.clear();
    }
}

// Real-Time Validator initialisieren
window.RealTimeValidator = RealTimeValidator;
window.realTimeValidator = new RealTimeValidator();

// Globale Funktionen für Kompatibilität
window.validateField = (element) => window.realTimeValidator.validateFieldImmediate(element);
window.validateForm = (form) => window.realTimeValidator.validateForm(form);
window.updateCountryDependentFields = (country) => {
    const form = document.querySelector('#shipmentForm, .shipment-form');
    if (form && window.realTimeValidator) {
        window.realTimeValidator.updateCountryDependentFields(form, country);
    }
};