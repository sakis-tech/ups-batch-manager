// Echtzeit-Feldvalidierung für deutsche UPS Batch Manager Oberfläche
class RealTimeValidator {
    constructor() {
        this.validationQueue = new Map();
        this.debounceDelay = 300; // ms
        this.fieldValidators = window.fieldValidators;
        this.initialize();
    }

    initialize() {
        this.setupFormValidation();
        this.addValidationStyles();
    }

    // Formular-Validierung einrichten
    setupFormValidation() {
        document.addEventListener('input', (e) => {
            if (e.target && e.target.matches && e.target.matches('.form-input, .form-select, .form-textarea')) {
                this.scheduleValidation(e.target);
            }
        });

        document.addEventListener('blur', (e) => {
            if (e.target && e.target.matches && e.target.matches('.form-input, .form-select, .form-textarea')) {
                this.validateFieldImmediate(e.target);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target && e.target.matches && e.target.matches('.form-input, .form-select, .form-textarea, input[type="checkbox"], input[type="radio"]')) {
                this.validateFieldImmediate(e.target);
                this.updateDependentFields(e.target);
            }
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
        }

        if (feedback) {
            this.showFieldFeedback(element.closest('.form-group'), feedback, 'success');
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
                background-color: var(--success-light);
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