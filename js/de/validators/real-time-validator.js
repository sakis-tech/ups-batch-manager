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
        element.classList.remove('field-error', 'field-success', 'error', 'success', 'warning');
        fieldGroup.classList.remove('has-error', 'has-success');
        
        if (!validation.isValid && validation.errors.length > 0) {
            element.classList.add('field-error');
            fieldGroup.classList.add('has-error');
            this.showFieldErrors(fieldGroup, validation.errors, validation.detailedError);
            this.addFieldTooltip(element, validation.detailedError, 'error');
        } else if (element.value && validation.isValid) {
            element.classList.add('field-success');
            fieldGroup.classList.add('has-success');
            this.showSuccessMessage(fieldGroup, element);
        }

        // Tooltip für Feldhilfe hinzufügen (wenn kein Fehler)
        if (validation.isValid && validation.tooltip) {
            this.addFieldTooltip(element, validation.tooltip, 'info');
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
    showFieldErrors(fieldGroup, errors, detailedError = '') {
        const errorContainer = document.createElement('div');
        errorContainer.className = 'field-errors';
        
        // Hauptfehlermeldung anzeigen
        const mainError = detailedError || errors[0] || '';
        if (mainError) {
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `<i class="fas fa-exclamation-circle error-icon"></i> ${mainError}`;
            errorContainer.appendChild(errorElement);
        }

        fieldGroup.appendChild(errorContainer);
    }

    // Feld-Feedback anzeigen
    showFieldFeedback(fieldGroup, message, type = 'info') {
        const feedbackElement = document.createElement('div');
        feedbackElement.className = `field-feedback field-feedback-${type}`;
        feedbackElement.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        fieldGroup.appendChild(feedbackElement);
    }

    // Erfolgsmeldung anzeigen
    showSuccessMessage(fieldGroup, element) {
        const fieldName = element.name;
        let successText = '';
        
        switch (fieldName) {
            case 'weight':
                const unit = this.getFormData(element.closest('form')).unitOfMeasure || 'KG';
                successText = `Gültiges Gewicht: ${element.value} ${unit}`;
                break;
            case 'email':
                successText = 'E-Mail-Format korrekt';
                break;
            case 'postalCode':
                const country = this.getFormData(element.closest('form')).country || 'DE';
                successText = `Gültige Postleitzahl für ${this.getCountryName(country)}`;
                break;
            case 'telephone':
                successText = 'Telefonnummer-Format korrekt';
                break;
            default:
                return; // Keine Erfolgsmeldung für andere Felder
        }

        if (successText) {
            const successContainer = document.createElement('div');
            successContainer.className = 'success-message';
            successContainer.innerHTML = `<i class="fas fa-check-circle success-icon"></i> ${successText}`;
            fieldGroup.appendChild(successContainer);
        }
    }

    // Tooltip zu Feld hinzufügen
    addFieldTooltip(element, message, type = 'info') {
        if (!message) return;

        // Bestehende Tooltips entfernen
        this.removeFieldTooltip(element);

        // Tooltip-Container erstellen
        const tooltip = document.createElement('div');
        tooltip.className = `field-tooltip ${type === 'error' ? 'error-tooltip' : ''}`;
        
        // Tooltip-Inhalt
        const tooltipContent = document.createElement('div');
        tooltipContent.className = 'tooltip-content';
        tooltipContent.textContent = message;
        tooltip.appendChild(tooltipContent);

        // Element in Tooltip einwickeln
        const parent = element.parentNode;
        parent.insertBefore(tooltip, element);
        tooltip.appendChild(element);
    }

    // Tooltip von Feld entfernen
    removeFieldTooltip(element) {
        const existingTooltip = element.closest('.field-tooltip');
        if (existingTooltip) {
            const parent = existingTooltip.parentNode;
            parent.insertBefore(element, existingTooltip);
            existingTooltip.remove();
        }
    }

    // Feldfehler löschen
    clearFieldErrors(fieldGroup) {
        const existingErrors = fieldGroup.querySelectorAll('.field-errors, .field-feedback, .error-message, .success-message');
        existingErrors.forEach(error => error.remove());
        
        // Tooltips von allen Feldern in der Gruppe entfernen
        const fields = fieldGroup.querySelectorAll('.form-input, .form-select, .form-textarea');
        fields.forEach(field => this.removeFieldTooltip(field));
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

        const hasErrors = form.querySelectorAll('.form-input.field-error, .form-select.field-error').length > 0;
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

    // Validierungs-Styles hinzufügen (jetzt in components.css)
    addValidationStyles() {
        // Styles sind jetzt in components.css definiert
        // Diese Methode bleibt für Kompatibilität erhalten
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