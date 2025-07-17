/**
 * Formular-Handler für die deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet Formulare mit Features wie:
 * - Echtzeit-Validierung
 * - Auto-Vervollständigung
 * - Feldabhängigkeiten
 * - Formular-Serialisierung
 * 
 * @class FormHandlerDE
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class FormHandlerDE {
    /**
     * Initialisiert den Formular-Handler
     * 
     * @constructor
     */
    constructor() {
        /** @type {Map<string, Object>} Registrierte Formulare */
        this.forms = new Map();
        
        /** @type {Map<string, Object>} Validierungsregeln */
        this.validationRules = new Map();
        
        /** @type {Object} Aktuelle Feldwerte */
        this.currentValues = {};
        
        /** @type {boolean} Ob Echtzeit-Validierung aktiv ist */
        this.realtimeValidation = true;
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupFormObserver();
        this.initializeExistingForms();
    }

    // Event-Listener einrichten
    setupEventListeners() {
        // Formular-Submission
        document.addEventListener('submit', (e) => {
            if (e.target.tagName === 'FORM') {
                this.handleFormSubmit(e);
            }
        });

        // Eingabe-Validierung
        document.addEventListener('input', (e) => {
            if (e.target.form) {
                this.handleFieldInput(e);
            }
        });

        // Feld-Änderungen
        document.addEventListener('change', (e) => {
            if (e.target.form) {
                this.handleFieldChange(e);
            }
        });

        // Fokus-Events
        document.addEventListener('focus', (e) => {
            if (e.target.form) {
                this.handleFieldFocus(e);
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.form) {
                this.handleFieldBlur(e);
            }
        }, true);

        // Accordion-Navigation  
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.form-accordion')) {
                this.handleAccordionNavigation(e);
            }
        });

        // Country-Abhängigkeiten
        document.addEventListener('change', (e) => {
            if (e.target.name === 'country') {
                this.handleCountryChange(e);
            }
        });

        // Unit-Abhängigkeiten
        document.addEventListener('change', (e) => {
            if (e.target.name === 'unitOfMeasure') {
                this.handleUnitChange(e);
            }
        });
    }

    // Formular-Observer einrichten
    setupFormObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.tagName === 'FORM') {
                        this.registerForm(node);
                    } else if (node.nodeType === 1) {
                        const forms = node.querySelectorAll('form');
                        forms.forEach(form => this.registerForm(form));
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    // Bestehende Formulare initialisieren
    initializeExistingForms() {
        document.querySelectorAll('form').forEach(form => {
            this.registerForm(form);
        });
    }

    // Formular registrieren
    registerForm(formElement) {
        const formId = formElement.id || this.generateFormId();
        if (!formElement.id) {
            formElement.id = formId;
        }

        const formConfig = {
            element: formElement,
            fields: this.getFormFields(formElement),
            validationRules: this.getValidationRules(formElement),
            isValid: false,
            errors: new Map()
        };

        this.forms.set(formId, formConfig);
        this.setupFormValidation(formConfig);
        this.setupAccordionForm(formElement);
        this.setupFieldDependencies(formConfig);
    }

    // Formular-Felder abrufen
    getFormFields(form) {
        const fields = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                fields[input.name] = {
                    element: input,
                    type: input.type || 'text',
                    required: input.required || input.hasAttribute('required'),
                    value: this.getFieldValue(input),
                    isValid: true,
                    errors: []
                };
            }
        });

        return fields;
    }

    // Validierungsregeln abrufen
    getValidationRules(form) {
        const rules = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name && window.UPS_FIELDS) {
                const fieldName = this.getUPSFieldName(input.name);
                const upsField = window.UPS_FIELDS[fieldName];
                
                if (upsField) {
                    rules[input.name] = {
                        required: upsField.required || input.required,
                        maxLength: upsField.maxLength,
                        pattern: upsField.validation,
                        min: upsField.min,
                        max: upsField.max,
                        type: upsField.type,
                        customValidator: this.getCustomValidator(input.name)
                    };
                }
            }
        });

        return rules;
    }

    // UPS-Feldname abrufen
    getUPSFieldName(inputName) {
        const fieldMapping = {
            'contactName': 'Contact Name',
            'companyName': 'Company or Name',
            'address1': 'Address 1',
            'address2': 'Address 2',
            'address3': 'Address 3',
            'city': 'City',
            'state': 'State/Prov/Other',
            'postalCode': 'Postal Code',
            'country': 'Country',
            'telephone': 'Telephone',
            'extension': 'Ext',
            'residential': 'Residential Ind',
            'email': 'Consignee Email',
            'packagingType': 'Packaging Type',
            'weight': 'Weight',
            'length': 'Length',
            'width': 'Width',
            'height': 'Height',
            'unitOfMeasure': 'Unit of Measure',
            'goodsDescription': 'Description of Goods',
            'customsValue': 'Customs Value',
            'serviceType': 'Service',
            'deliveryConfirm': 'Delivery Confirm',
            'reference1': 'Reference 1',
            'reference2': 'Reference 2',
            'reference3': 'Reference 3'
        };

        return fieldMapping[inputName] || inputName;
    }

    // Benutzerdefinierten Validator abrufen
    getCustomValidator(fieldName) {
        const customValidators = {
            'postalCode': (value, form) => {
                const country = form.country?.value || 'DE';
                return window.FIELD_VALIDATORS?.validatePostalCode(value, country) !== false;
            },
            'email': (value) => {
                return window.FIELD_VALIDATORS?.validateEmail(value) !== false;
            },
            'weight': (value, form) => {
                const unit = form.unitOfMeasure?.value || 'KG';
                return window.FIELD_VALIDATORS?.validateWeight(value, unit) !== false;
            },
            'telephone': (value, form) => {
                const country = form.country?.value || 'DE';
                return window.FIELD_VALIDATORS?.validatePhone(value, country) !== false;
            }
        };

        return customValidators[fieldName];
    }

    // Formular-Validierung einrichten
    setupFormValidation(formConfig) {
        Object.keys(formConfig.fields).forEach(fieldName => {
            const field = formConfig.fields[fieldName];
            this.addFieldValidation(field.element, formConfig.validationRules[fieldName]);
        });
    }

    // Feld-Validierung hinzufügen
    addFieldValidation(element, rules) {
        if (!rules) return;

        // Eingabe-Validierung
        element.addEventListener('input', () => {
            if (this.realtimeValidation) {
                this.validateField(element, rules);
            }
        });

        // Blur-Validierung
        element.addEventListener('blur', () => {
            this.validateField(element, rules);
        });
    }

    // Accordion-Formular einrichten
    setupAccordionForm(form) {
        const accordionHeaders = form.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            const accordionId = header.getAttribute('data-accordion');
            if (accordionId && window.accordionSystem) {
                // Registriere das Accordion mit dem globalen System
                const accordionItem = header.closest('.accordion-item');
                window.accordionSystem.registerAccordion(accordionId, accordionItem);
            }
        });

        // Bei Formular-Validierungsfehlern öffne das entsprechende Accordion
        form.addEventListener('invalid', (e) => {
            const errorField = e.target;
            const accordionContent = errorField.closest('.accordion-content');
            if (accordionContent) {
                const accordionHeader = accordionContent.previousElementSibling;
                const accordionId = accordionHeader?.getAttribute('data-accordion');
                if (accordionId && window.accordionSystem) {
                    window.accordionSystem.openAccordion(accordionId);
                }
            }
        }, true);
    }

    // Feldabhängigkeiten einrichten
    setupFieldDependencies(formConfig) {
        const form = formConfig.element;
        
        // Land-Abhängigkeiten
        const countryField = form.querySelector('[name="country"]');
        if (countryField) {
            countryField.addEventListener('change', () => {
                this.updateCountryDependentFields(form);
            });
        }

        // Service-Typ-Abhängigkeiten
        const serviceField = form.querySelector('[name="serviceType"]');
        if (serviceField) {
            serviceField.addEventListener('change', () => {
                this.updateServiceDependentFields(form);
            });
        }
    }

    // Formular-Submission handhaben
    handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formConfig = this.forms.get(form.id);
        
        if (!formConfig) return;

        // Vollständige Validierung
        const isValid = this.validateForm(form);
        
        if (isValid) {
            const formData = this.serializeForm(form);
            this.submitForm(form, formData);
        } else {
            this.showValidationErrors(form);
        }
    }

    // Feld-Eingabe handhaben
    handleFieldInput(e) {
        const field = e.target;
        this.currentValues[field.name] = this.getFieldValue(field);
        
        if (this.realtimeValidation) {
            this.validateField(field);
        }
        
        this.updateFieldDependencies(field);
    }

    // Feld-Änderung handhaben
    handleFieldChange(e) {
        const field = e.target;
        this.currentValues[field.name] = this.getFieldValue(field);
        this.validateField(field);
        this.updateFieldDependencies(field);
    }

    // Feld-Fokus handhaben
    handleFieldFocus(e) {
        const field = e.target;
        this.clearFieldErrors(field);
        this.showFieldHelp(field);
    }

    // Feld-Blur handhaben
    handleFieldBlur(e) {
        const field = e.target;
        this.validateField(field);
        this.hideFieldHelp(field);
    }

    // Accordion-Navigation handhaben
    handleAccordionNavigation(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            const currentHeader = e.target.closest('.accordion-header');
            if (currentHeader) {
                e.preventDefault();
                const headers = Array.from(currentHeader.closest('.form-accordion').querySelectorAll('.accordion-header'));
                const currentIndex = headers.indexOf(currentHeader);
                
                let nextIndex;
                if (e.key === 'ArrowDown') {
                    nextIndex = (currentIndex + 1) % headers.length;
                } else {
                    nextIndex = (currentIndex - 1 + headers.length) % headers.length;
                }
                
                headers[nextIndex].focus();
            }
        } else if (e.key === 'Enter' || e.key === ' ') {
            const currentHeader = e.target.closest('.accordion-header');
            if (currentHeader) {
                e.preventDefault();
                const accordionId = currentHeader.getAttribute('data-accordion');
                if (accordionId && window.accordionSystem) {
                    window.accordionSystem.toggleAccordion(accordionId);
                }
            }
        }
    }

    // Land-Änderung handhaben
    handleCountryChange(e) {
        const form = e.target.form;
        this.updateCountryDependentFields(form);
    }

    // Einheiten-Änderung handhaben
    handleUnitChange(e) {
        const form = e.target.form;
        this.updateUnitDependentFields(form);
    }

    // Feld validieren
    validateField(element, rules = null) {
        const formConfig = this.forms.get(element.form.id);
        if (!formConfig) return true;

        const fieldRules = rules || formConfig.validationRules[element.name];
        if (!fieldRules) return true;

        const value = this.getFieldValue(element);
        const errors = [];

        // Pflichtfeld-Validierung
        if (fieldRules.required && !value) {
            errors.push('Dieses Feld ist erforderlich');
        }

        // Längen-Validierung
        if (value && fieldRules.maxLength && value.length > fieldRules.maxLength) {
            errors.push(`Maximal ${fieldRules.maxLength} Zeichen erlaubt`);
        }

        // Pattern-Validierung
        if (value && fieldRules.pattern && !fieldRules.pattern.test(value)) {
            errors.push('Ungültiges Format');
        }

        // Zahlen-Validierung
        if (value && fieldRules.type === 'number') {
            const numValue = parseFloat(value);
            if (isNaN(numValue)) {
                errors.push('Muss eine Zahl sein');
            } else {
                if (fieldRules.min !== undefined && numValue < fieldRules.min) {
                    errors.push(`Mindestens ${fieldRules.min}`);
                }
                if (fieldRules.max !== undefined && numValue > fieldRules.max) {
                    errors.push(`Maximal ${fieldRules.max}`);
                }
            }
        }

        // Benutzerdefinierte Validierung
        if (value && fieldRules.customValidator) {
            const formFields = this.getFormValues(element.form);
            if (!fieldRules.customValidator(value, formFields)) {
                errors.push('Ungültiger Wert');
            }
        }

        const isValid = errors.length === 0;
        this.updateFieldStatus(element, isValid, errors);
        
        return isValid;
    }

    // Formular validieren
    validateForm(form) {
        const formConfig = this.forms.get(form.id);
        if (!formConfig) return false;

        let isValid = true;
        const allErrors = new Map();

        Object.keys(formConfig.fields).forEach(fieldName => {
            const field = formConfig.fields[fieldName];
            const fieldValid = this.validateField(field.element);
            
            if (!fieldValid) {
                isValid = false;
                allErrors.set(fieldName, field.errors);
            }
        });

        formConfig.isValid = isValid;
        formConfig.errors = allErrors;

        return isValid;
    }

    // Feld-Status aktualisieren
    updateFieldStatus(element, isValid, errors) {
        const formGroup = element.closest('.form-group');
        if (!formGroup) return;

        // CSS-Klassen aktualisieren
        if (isValid) {
            formGroup.classList.remove('has-error');
            formGroup.classList.add('has-success');
        } else {
            formGroup.classList.remove('has-success');
            formGroup.classList.add('has-error');
        }

        // Fehlermeldungen anzeigen
        this.showFieldErrors(element, errors);
    }

    // Feld-Fehler anzeigen
    showFieldErrors(element, errors) {
        const formGroup = element.closest('.form-group');
        if (!formGroup) return;

        // Bestehende Fehlermeldungen entfernen
        const existingErrors = formGroup.querySelectorAll('.field-error');
        existingErrors.forEach(error => error.remove());

        // Neue Fehlermeldungen hinzufügen
        if (errors.length > 0) {
            const errorContainer = document.createElement('div');
            errorContainer.className = 'field-error';
            errorContainer.innerHTML = errors.map(error => `<span>${error}</span>`).join('');
            formGroup.appendChild(errorContainer);
        }
    }

    // Feld-Fehler löschen
    clearFieldErrors(element) {
        const formGroup = element.closest('.form-group');
        if (!formGroup) return;

        formGroup.classList.remove('has-error', 'has-success');
        const errors = formGroup.querySelectorAll('.field-error');
        errors.forEach(error => error.remove());
    }

    // Feld-Hilfe anzeigen
    showFieldHelp(element) {
        const formGroup = element.closest('.form-group');
        const helpText = formGroup?.querySelector('.form-help');
        
        if (helpText) {
            helpText.style.display = 'block';
        }
    }

    // Feld-Hilfe verstecken
    hideFieldHelp(element) {
        const formGroup = element.closest('.form-group');
        const helpText = formGroup?.querySelector('.form-help');
        
        if (helpText) {
            helpText.style.display = 'none';
        }
    }

    // Länderabhängige Felder aktualisieren
    updateCountryDependentFields(form) {
        const countryField = form.querySelector('[name="country"]');
        const stateField = form.querySelector('[name="state"]');
        const postalCodeField = form.querySelector('[name="postalCode"]');
        
        if (!countryField) return;
        
        const country = countryField.value;
        
        // Bundesland-Feld
        if (stateField) {
            const stateRequired = ['US', 'CA'].includes(country);
            stateField.required = stateRequired;
            
            const stateGroup = stateField.closest('.form-group');
            if (stateGroup) {
                const label = stateGroup.querySelector('label');
                if (label) {
                    label.textContent = stateRequired ? 'Bundesland/Provinz *' : 'Bundesland/Provinz';
                }
            }
        }

        // Postleitzahl-Platzhalter
        if (postalCodeField) {
            const placeholders = {
                'US': '12345',
                'CA': 'A1A 1A1',
                'DE': '12345',
                'GB': 'SW1A 1AA',
                'FR': '75001'
            };
            postalCodeField.placeholder = placeholders[country] || '';
        }
    }

    // Service-abhängige Felder aktualisieren
    updateServiceDependentFields(form) {
        const serviceField = form.querySelector('[name="serviceType"]');
        if (!serviceField) return;

        const service = serviceField.value;
        
        // Samstag-Zustellung nur für bestimmte Services
        const saturdayField = form.querySelector('[name="saturdayDelivery"]');
        if (saturdayField) {
            const saturdayServices = ['01', '02', '07', '13', '14'];
            saturdayField.disabled = !saturdayServices.includes(service);
        }
    }

    // Einheiten-abhängige Felder aktualisieren
    updateUnitDependentFields(form) {
        const unitField = form.querySelector('[name="unitOfMeasure"]');
        const weightField = form.querySelector('[name="weight"]');
        
        if (!unitField || !weightField) return;
        
        const unit = unitField.value;
        
        // Gewicht-Limits anpassen
        if (unit === 'KG') {
            weightField.max = '70';
        } else if (unit === 'LB') {
            weightField.max = '150';
        }
    }

    // Feldabhängigkeiten aktualisieren
    updateFieldDependencies(changedField) {
        const form = changedField.form;
        
        if (changedField.name === 'country') {
            this.updateCountryDependentFields(form);
        } else if (changedField.name === 'serviceType') {
            this.updateServiceDependentFields(form);
        } else if (changedField.name === 'unitOfMeasure') {
            this.updateUnitDependentFields(form);
        }
    }

    // Formular serialisieren
    serializeForm(form) {
        const formData = {};
        const inputs = form.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = this.getFieldValue(input);
            }
        });

        return formData;
    }

    // Formular-Werte abrufen
    getFormValues(form) {
        return this.serializeForm(form);
    }

    // Feldwert abrufen
    getFieldValue(element) {
        if (element.type === 'checkbox') {
            return element.checked;
        } else if (element.type === 'radio') {
            return element.checked ? element.value : '';
        } else {
            return element.value;
        }
    }

    // Formular absenden
    submitForm(form, formData) {
        // Implementierung abhängig vom Formular-Typ
        if (form.id === 'shipmentForm') {
            this.submitShipmentForm(form, formData);
        }
    }

    // Sendungsformular absenden
    submitShipmentForm(form, formData) {
        try {
            if (window.shipmentManager) {
                const shipmentData = this.processShipmentData(formData);
                window.shipmentManager.addShipment(shipmentData);
                
                if (window.toastSystem) {
                    window.toastSystem.showSuccess('Sendung erfolgreich gespeichert');
                }
                
                if (window.modalSystem) {
                    window.modalSystem.closeModal();
                }
            }
        } catch (error) {
            console.error('Fehler beim Speichern der Sendung:', error);
            if (window.toastSystem) {
                window.toastSystem.showError('Fehler beim Speichern der Sendung');
            }
        }
    }

    // Sendungsdaten verarbeiten
    processShipmentData(formData) {
        // Numerische Werte konvertieren
        const numericFields = ['weight', 'length', 'width', 'height', 'customsValue', 'packageDeclaredValue'];
        numericFields.forEach(field => {
            if (formData[field]) {
                formData[field] = parseFloat(formData[field]) || 0;
            }
        });

        // Boolean-Werte konvertieren
        const booleanFields = [
            'residential', 'documentsNoCommercialValue', 'saturdayDelivery',
            'shipperRelease', 'returnOfDocuments', 'carbonNeutral', 'largePackage',
            'additionalHandling', 'upsPremiumCare', 'electronicPackageRelease',
            'lithiumIonAlone', 'lithiumIonInEquipment'
        ];
        booleanFields.forEach(field => {
            formData[field] = Boolean(formData[field]);
        });

        return formData;
    }

    // Validierungsfehler anzeigen
    showValidationErrors(form) {
        const firstError = form.querySelector('.has-error');
        if (firstError) {
            // Finde das Accordion, das den Fehler enthält
            const accordionContent = firstError.closest('.accordion-content');
            if (accordionContent) {
                const accordionHeader = accordionContent.previousElementSibling;
                const accordionId = accordionHeader?.getAttribute('data-accordion');
                if (accordionId && window.accordionSystem) {
                    // Öffne das Accordion mit dem Fehler
                    window.accordionSystem.openAccordion(accordionId);
                    
                    // Warte kurz auf die Animation und scrolle dann
                    setTimeout(() => {
                        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        
                        const input = firstError.querySelector('input, select, textarea');
                        if (input) {
                            input.focus();
                        }
                    }, 350);
                }
            } else {
                // Fallback für Felder außerhalb von Accordions
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                const input = firstError.querySelector('input, select, textarea');
                if (input) {
                    input.focus();
                }
            }
        }

        if (window.toastSystem) {
            window.toastSystem.showError('Bitte korrigieren Sie die Eingabefehler');
        }
    }

    // Formular-ID generieren
    generateFormId() {
        return `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Formular zurücksetzen
    resetForm(formId) {
        const formConfig = this.forms.get(formId);
        if (!formConfig) return;

        const form = formConfig.element;
        form.reset();
        
        // Fehler löschen
        form.querySelectorAll('.has-error, .has-success').forEach(group => {
            group.classList.remove('has-error', 'has-success');
        });
        
        form.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
    }

    // Echtzeit-Validierung umschalten
    toggleRealtimeValidation(enabled) {
        this.realtimeValidation = enabled;
    }
}

// CSS für Formular-Validierung
const formStyles = `
    .form-group.has-error .form-input,
    .form-group.has-error .form-select {
        border-color: var(--error);
        box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.25);
    }

    .form-group.has-success .form-input,
    .form-group.has-success .form-select {
        border-color: var(--success);
        box-shadow: 0 0 0 2px rgba(40, 167, 69, 0.25);
    }

    .field-error {
        margin-top: var(--space-2);
        color: var(--error);
        font-size: var(--font-size-sm);
    }

    .field-error span {
        display: block;
        margin-bottom: var(--space-1);
    }

    .form-help {
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        margin-top: var(--space-1);
        display: none;
    }

    .form-group:focus-within .form-help {
        display: block;
    }
`;

// CSS hinzufügen
const formStyleSheet = document.createElement('style');
formStyleSheet.textContent = formStyles;
document.head.appendChild(formStyleSheet);

// Formular-Handler initialisieren
window.FormHandlerDE = FormHandlerDE;
window.formHandler = new FormHandlerDE();

// Globale Funktionen für Kompatibilität
window.validateForm = (formId) => {
    const form = document.getElementById(formId);
    return form ? window.formHandler.validateForm(form) : false;
};

window.resetForm = (formId) => window.formHandler.resetForm(formId);
window.serializeForm = (formId) => {
    const form = document.getElementById(formId);
    return form ? window.formHandler.serializeForm(form) : {};
};

window.updateCountryDependentFields = (countryValue) => {
    const form = document.querySelector('form');
    if (form) {
        const countryField = form.querySelector('[name="country"]');
        if (countryField) {
            countryField.value = countryValue;
            window.formHandler.updateCountryDependentFields(form);
        }
    }
};