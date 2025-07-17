// Deutsche Feld-Validatoren für UPS Batch Manager
class FieldValidatorsDE {
    constructor() {
        this.errorMessages = {
            required: 'Dieses Feld ist erforderlich',
            invalidFormat: 'Ungültiges Format',
            tooLong: 'Text ist zu lang',
            tooShort: 'Text ist zu kurz',
            invalidEmail: 'Ungültige E-Mail-Adresse',
            invalidPhone: 'Ungültige Telefonnummer',
            invalidPostalCode: 'Ungültige Postleitzahl',
            invalidWeight: 'Ungültiges Gewicht',
            invalidDimensions: 'Ungültige Abmessungen',
            weightTooHigh: 'Gewicht ist zu hoch',
            weightTooLow: 'Gewicht ist zu niedrig',
            invalidCountry: 'Ungültiges Land',
            invalidService: 'Ungültiger Service-Typ',
            customsRequired: 'Zollwert ist für internationale Sendungen erforderlich',
            descriptionRequired: 'Warenbeschreibung ist für internationale Sendungen erforderlich'
        };

        this.tooltipMessages = {
            contactName: 'Name der Kontaktperson beim Empfänger. Maximal 35 Zeichen.',
            companyName: 'Firmenname oder Name des Empfängers. Maximal 35 Zeichen.',
            country: 'Zielland für die Sendung. Bestimmt verfügbare Services und Validierungsregeln.',
            address1: 'Hauptadresse des Empfängers. Straße und Hausnummer. Maximal 35 Zeichen.',
            address2: 'Zusätzliche Adressinformationen (optional). Maximal 35 Zeichen.',
            address3: 'Weitere Adressinformationen (optional). Maximal 35 Zeichen.',
            city: 'Stadt oder Ort des Empfängers. Maximal 30 Zeichen.',
            state: 'Bundesland/Provinz. Erforderlich für USA und Kanada.',
            postalCode: 'Postleitzahl entsprechend dem jeweiligen Länderformat.',
            telephone: 'Telefonnummer des Empfängers für Rückfragen bei der Zustellung.',
            extension: 'Durchwahl (optional). Maximal 4 Zeichen.',
            residential: 'Markieren Sie dies, wenn es sich um eine Privatadresse handelt.',
            email: 'E-Mail-Adresse für Sendungsbenachrichtigungen (optional).',
            packagingType: 'Art der Verpackung. Beeinflusst Größen- und Gewichtslimits.',
            customsValue: 'Warenwert für internationale Sendungen in Euro. Erforderlich außerhalb Deutschlands.',
            weight: 'Gewicht des Pakets. Zwischen 0,1 und 70 kg (oder bis 150 lbs).',
            length: 'Länge des Pakets in cm. Zwischen 1 und 270 cm.',
            width: 'Breite des Pakets in cm. Zwischen 1 und 270 cm.',
            height: 'Höhe des Pakets in cm. Zwischen 1 und 270 cm.',
            unitOfMeasure: 'Maßeinheit für Gewicht und Abmessungen.',
            goodsDescription: 'Beschreibung des Inhalts für internationale Sendungen.',
            serviceType: 'UPS Service-Typ. Verfügbare Optionen hängen vom Zielland ab.',
            deliveryConfirm: 'Zusätzliche Zustellbestätigung gegen Aufpreis.',
            reference1: 'Erste Referenznummer für interne Zuordnung (optional).',
            reference2: 'Zweite Referenznummer für interne Zuordnung (optional).',
            reference3: 'Dritte Referenznummer für interne Zuordnung (optional).'
        };

        this.detailedErrors = {
            weight: {
                invalid: 'Bitte nur Zahlen zwischen 0,1 und 70 kg eingeben',
                tooLow: 'Mindestgewicht beträgt 0,1 kg für UPS-Sendungen',
                tooHigh: 'Höchstgewicht beträgt 70 kg für Standard-Pakete'
            },
            postalCode: {
                DE: 'Deutsche Postleitzahl: 5 Ziffern (z.B. 12345)',
                US: 'US ZIP Code: 5 Ziffern oder 5+4 Format (z.B. 12345 oder 12345-6789)',
                CA: 'Kanadischer Postal Code: A1A 1A1 Format',
                GB: 'UK Postcode: z.B. SW1A 1AA oder M1 1AA',
                FR: 'Französische Postleitzahl: 5 Ziffern (z.B. 75001)',
                general: 'Postleitzahl entsprechend dem gewählten Länderformat'
            },
            telephone: {
                DE: 'Deutsche Telefonnummer: +49 oder 0 am Anfang (z.B. +49 30 12345678)',
                US: 'US Telefonnummer: 10 Ziffern (z.B. (555) 123-4567)',
                CA: 'Kanadische Telefonnummer: 10 Ziffern (z.B. (416) 123-4567)',
                GB: 'UK Telefonnummer: +44 oder 0 am Anfang',
                general: 'Internationale Telefonnummer mit Ländervorwahl'
            },
            email: 'Gültige E-Mail-Adresse im Format name@domain.com',
            dimensions: 'Abmessungen zwischen 1 und 270 cm. Umfang (L + 2×B + 2×H) max. 400 cm'
        };
    }

    // Allgemeine Validierung
    validateField(fieldKey, value, shipment = {}) {
        const fieldConfig = UPS_FIELDS[this.getUPSFieldName(fieldKey)];
        if (!fieldConfig) return { isValid: true, errors: [] };

        const errors = [];

        // Pflichtfeld-Prüfung
        if (fieldConfig.required && this.isEmpty(value)) {
            errors.push(this.errorMessages.required);
        }

        // Leeres optionales Feld
        if (!fieldConfig.required && this.isEmpty(value)) {
            return { isValid: true, errors: [] };
        }

        // Längen-Validierung
        if (fieldConfig.maxLength && value.length > fieldConfig.maxLength) {
            errors.push(`${this.errorMessages.tooLong} (max. ${fieldConfig.maxLength} Zeichen)`);
        }

        // Regex-Validierung
        if (fieldConfig.validation && !fieldConfig.validation.test(value)) {
            errors.push(this.errorMessages.invalidFormat);
        }

        // Feld-spezifische Validierung
        switch (fieldKey) {
            case 'email':
                if (value && !this.validateEmail(value)) {
                    errors.push(this.errorMessages.invalidEmail);
                }
                break;
            case 'telephone':
                if (value && !this.validatePhone(value, shipment.country)) {
                    errors.push(this.errorMessages.invalidPhone);
                }
                break;
            case 'postalCode':
                if (value && !this.validatePostalCode(value, shipment.country)) {
                    errors.push(this.errorMessages.invalidPostalCode);
                }
                break;
            case 'weight':
                const weightValidation = this.validateWeight(value, shipment.unitOfMeasure);
                if (!weightValidation.isValid) {
                    errors.push(weightValidation.message);
                }
                break;
            case 'customsValue':
                if (shipment.country && shipment.country !== 'DE' && (!value || parseFloat(value) <= 0)) {
                    errors.push(this.errorMessages.customsRequired);
                }
                break;
            case 'goodsDescription':
                if (shipment.country && shipment.country !== 'DE' && !value) {
                    errors.push(this.errorMessages.descriptionRequired);
                }
                break;
        }

        // Abhängigkeits-Validierung
        const dependencyValidation = this.validateDependencies(fieldKey, value, shipment);
        if (!dependencyValidation.isValid) {
            errors.push(...dependencyValidation.errors);
        }

        return {
            isValid: errors.length === 0,
            errors,
            tooltip: this.getFieldTooltip(fieldKey, shipment),
            detailedError: this.getDetailedError(fieldKey, value, shipment, errors)
        };
    }

    // E-Mail validieren
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    // Telefonnummer validieren
    validatePhone(phone, country = 'DE') {
        if (!phone) return true;

        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        
        switch (country) {
            case 'DE':
                // Deutsche Telefonnummern
                return /^(\+49|0)[1-9]\d{7,11}$/.test(cleanPhone);
            case 'US':
            case 'CA':
                // Nordamerikanische Telefonnummern
                return /^(\+1)?[2-9]\d{9}$/.test(cleanPhone);
            case 'GB':
                // Britische Telefonnummern
                return /^(\+44|0)[1-9]\d{8,9}$/.test(cleanPhone);
            case 'FR':
                // Französische Telefonnummern
                return /^(\+33|0)[1-9]\d{8}$/.test(cleanPhone);
            default:
                // Allgemeine internationale Nummer
                return /^\+?\d{7,15}$/.test(cleanPhone);
        }
    }

    // Postleitzahl validieren
    validatePostalCode(postalCode, country = 'DE') {
        if (!postalCode) return false;

        const cleanCode = postalCode.replace(/\s/g, '').toUpperCase();

        switch (country) {
            case 'DE':
                return /^\d{5}$/.test(cleanCode);
            case 'US':
                return /^\d{5}(-\d{4})?$/.test(cleanCode);
            case 'CA':
                return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(cleanCode);
            case 'GB':
                return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(cleanCode);
            case 'FR':
                return /^\d{5}$/.test(cleanCode);
            case 'IT':
                return /^\d{5}$/.test(cleanCode);
            case 'ES':
                return /^\d{5}$/.test(cleanCode);
            case 'NL':
                return /^\d{4}[A-Z]{2}$/.test(cleanCode);
            case 'BE':
                return /^\d{4}$/.test(cleanCode);
            case 'AT':
                return /^\d{4}$/.test(cleanCode);
            case 'CH':
                return /^\d{4}$/.test(cleanCode);
            case 'PL':
                return /^\d{2}-\d{3}$/.test(cleanCode);
            case 'CZ':
                return /^\d{3}\s?\d{2}$/.test(cleanCode);
            case 'DK':
                return /^\d{4}$/.test(cleanCode);
            case 'SE':
                return /^\d{3}\s?\d{2}$/.test(cleanCode);
            case 'NO':
                return /^\d{4}$/.test(cleanCode);
            case 'FI':
                return /^\d{5}$/.test(cleanCode);
            default:
                return /^[\d\s\-A-Z]{3,10}$/.test(cleanCode);
        }
    }

    // Gewicht validieren
    validateWeight(weight, unit = 'KG') {
        const numWeight = parseFloat(weight);
        
        if (isNaN(numWeight) || numWeight <= 0) {
            return {
                isValid: false,
                message: this.errorMessages.invalidWeight
            };
        }

        if (unit === 'KG') {
            if (numWeight < 0.1) {
                return {
                    isValid: false,
                    message: 'Mindestgewicht: 0,1 kg'
                };
            }
            if (numWeight > 70) {
                return {
                    isValid: false,
                    message: 'Höchstgewicht: 70 kg'
                };
            }
        } else if (unit === 'LB') {
            if (numWeight < 0.1) {
                return {
                    isValid: false,
                    message: 'Mindestgewicht: 0,1 lbs'
                };
            }
            if (numWeight > 150) {
                return {
                    isValid: false,
                    message: 'Höchstgewicht: 150 lbs'
                };
            }
        }

        return { isValid: true };
    }

    // Abmessungen validieren
    validateDimensions(length, width, height) {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const h = parseFloat(height) || 0;

        // Alle Werte 0 oder leer = OK
        if (l === 0 && w === 0 && h === 0) {
            return { isValid: true };
        }

        // Mindest- und Höchstwerte prüfen
        if ((l > 0 && (l < 1 || l > 270)) ||
            (w > 0 && (w < 1 || w > 270)) ||
            (h > 0 && (h < 1 || h > 270))) {
            return {
                isValid: false,
                message: 'Abmessungen müssen zwischen 1 und 270 cm liegen'
            };
        }

        // Girth-Berechnung (Umfang)
        if (l > 0 && w > 0 && h > 0) {
            const girth = l + 2 * (w + h);
            if (girth > 400) {
                return {
                    isValid: false,
                    message: 'Umfang (Länge + 2×Breite + 2×Höhe) darf 400 cm nicht überschreiten'
                };
            }
        }

        return { isValid: true };
    }

    // Abhängigkeiten validieren
    validateDependencies(fieldKey, value, shipment) {
        const errors = [];

        // Bundesland für bestimmte Länder erforderlich
        if (fieldKey === 'state') {
            const requiresState = ['US', 'CA'];
            if (requiresState.includes(shipment.country) && !value) {
                errors.push('Bundesland/Provinz ist für dieses Land erforderlich');
            }
        }

        // Zollwert für internationale Sendungen
        if (fieldKey === 'customsValue' && shipment.country && shipment.country !== 'DE') {
            if (!value || parseFloat(value) <= 0) {
                errors.push(this.errorMessages.customsRequired);
            }
        }

        // Warenbeschreibung für internationale Sendungen
        if (fieldKey === 'goodsDescription' && shipment.country && shipment.country !== 'DE') {
            if (!value) {
                errors.push(this.errorMessages.descriptionRequired);
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Service-Typ basierend auf Land validieren
    validateServiceForCountry(serviceType, country) {
        const domesticServices = ['01', '02', '03', '12', '13', '14', '59'];
        const internationalServices = ['07', '08', '11', '54', '65'];

        if (country === 'US' || country === 'CA') {
            return domesticServices.includes(serviceType);
        } else {
            return internationalServices.includes(serviceType);
        }
    }

    // Komplett-Validierung einer Sendung
    validateShipment(shipment) {
        const errors = [];
        const fieldKeys = Object.keys(shipment);

        // Jedes Feld einzeln validieren
        fieldKeys.forEach(fieldKey => {
            const validation = this.validateField(fieldKey, shipment[fieldKey], shipment);
            if (!validation.isValid) {
                errors.push({
                    field: fieldKey,
                    messages: validation.errors
                });
            }
        });

        // Zusätzliche Kreuz-Validierungen
        if (shipment.length || shipment.width || shipment.height) {
            const dimensionValidation = this.validateDimensions(
                shipment.length, 
                shipment.width, 
                shipment.height
            );
            if (!dimensionValidation.isValid) {
                errors.push({
                    field: 'dimensions',
                    messages: [dimensionValidation.message]
                });
            }
        }

        // Service-Typ für Land validieren
        if (shipment.serviceType && shipment.country) {
            if (!this.validateServiceForCountry(shipment.serviceType, shipment.country)) {
                errors.push({
                    field: 'serviceType',
                    messages: ['Service-Typ ist für das gewählte Land nicht verfügbar']
                });
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Echtzeit-Validierung für Formulare
    setupRealTimeValidation(formElement) {
        const inputs = formElement.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            const fieldKey = input.name;
            
            // Validierung bei Änderung
            input.addEventListener('blur', () => {
                this.validateFormField(input, fieldKey, formElement);
            });

            // Formatierung bei Eingabe
            if (fieldKey === 'telephone') {
                input.addEventListener('input', () => {
                    this.formatPhoneNumber(input, formElement);
                });
            }

            if (fieldKey === 'postalCode') {
                input.addEventListener('input', () => {
                    this.formatPostalCode(input, formElement);
                });
            }
        });
    }

    // Einzelnes Formularfeld validieren
    validateFormField(input, fieldKey, formElement) {
        const shipmentData = this.getFormData(formElement);
        const validation = this.validateField(fieldKey, input.value, shipmentData);
        
        this.showFieldValidation(input, validation);
        
        return validation.isValid;
    }

    // Validierungs-UI anzeigen
    showFieldValidation(input, validation) {
        // Vorherige Fehler entfernen
        this.clearFieldValidation(input);

        if (!validation.isValid) {
            input.classList.add('error');
            
            // Fehlermeldungen anzeigen
            const errorContainer = document.createElement('div');
            errorContainer.className = 'form-error';
            errorContainer.textContent = validation.errors[0];
            
            input.parentNode.appendChild(errorContainer);
        } else {
            input.classList.remove('error');
            input.classList.add('success');
        }
    }

    // Feld-Validierung zurücksetzen
    clearFieldValidation(input) {
        input.classList.remove('error', 'success');
        
        const existingError = input.parentNode.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Telefonnummer formatieren
    formatPhoneNumber(input, formElement) {
        const countryField = formElement.querySelector('[name="country"]');
        const country = countryField ? countryField.value : 'DE';
        
        let value = input.value.replace(/\D/g, '');
        
        switch (country) {
            case 'DE':
                if (value.startsWith('49')) {
                    value = '+49 ' + value.substring(2);
                } else if (value.startsWith('0')) {
                    value = value.substring(1);
                }
                if (value.length > 3) {
                    value = value.substring(0, 3) + ' ' + value.substring(3);
                }
                break;
            case 'US':
            case 'CA':
                if (value.length >= 6) {
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                }
                break;
        }
        
        input.value = value;
    }

    // Postleitzahl formatieren
    formatPostalCode(input, formElement) {
        const countryField = formElement.querySelector('[name="country"]');
        const country = countryField ? countryField.value : 'DE';
        
        let value = input.value.toUpperCase();
        
        switch (country) {
            case 'CA':
                value = value.replace(/\s/g, '');
                if (value.length === 6) {
                    value = value.substring(0, 3) + ' ' + value.substring(3);
                }
                break;
            case 'GB':
                value = value.replace(/\s/g, '');
                if (value.length > 3) {
                    const outward = value.substring(0, value.length - 3);
                    const inward = value.substring(value.length - 3);
                    value = outward + ' ' + inward;
                }
                break;
        }
        
        input.value = value;
    }

    // Formulardaten extrahieren
    getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Hilfsfunktionen
    isEmpty(value) {
        return value === null || value === undefined || value === '';
    }

    getUPSFieldName(fieldKey) {
        // Mapping von fieldKey zu UPS Feldnamen
        const mapping = {
            contactName: 'Contact Name',
            companyName: 'Company or Name',
            country: 'Country',
            address1: 'Address 1',
            address2: 'Address 2',
            address3: 'Address 3',
            city: 'City',
            state: 'State/Prov/Other',
            postalCode: 'Postal Code',
            telephone: 'Telephone',
            extension: 'Ext',
            residential: 'Residential Ind',
            email: 'Consignee Email',
            packagingType: 'Packaging Type',
            customsValue: 'Customs Value',
            weight: 'Weight',
            length: 'Length',
            width: 'Width',
            height: 'Height',
            unitOfMeasure: 'Unit of Measure',
            goodsDescription: 'Description of Goods',
            serviceType: 'Service',
            deliveryConfirm: 'Delivery Confirm',
            reference1: 'Reference 1',
            reference2: 'Reference 2',
            reference3: 'Reference 3'
        };
        
        return mapping[fieldKey] || fieldKey;
    }

    // Feld-Tooltip abrufen
    getFieldTooltip(fieldKey, shipment = {}) {
        return this.tooltipMessages[fieldKey] || '';
    }

    // Detaillierte Fehlermeldung abrufen
    getDetailedError(fieldKey, value, shipment = {}, errors = []) {
        if (errors.length === 0) return '';

        const country = shipment.country || 'DE';
        
        switch (fieldKey) {
            case 'weight':
                if (this.detailedErrors.weight) {
                    if (errors.some(e => e.includes('Mindestgewicht'))) {
                        return this.detailedErrors.weight.tooLow;
                    }
                    if (errors.some(e => e.includes('Höchstgewicht'))) {
                        return this.detailedErrors.weight.tooHigh;
                    }
                    return this.detailedErrors.weight.invalid;
                }
                break;
                
            case 'postalCode':
                if (this.detailedErrors.postalCode[country]) {
                    return this.detailedErrors.postalCode[country];
                }
                return this.detailedErrors.postalCode.general;
                
            case 'telephone':
                if (this.detailedErrors.telephone[country]) {
                    return this.detailedErrors.telephone[country];
                }
                return this.detailedErrors.telephone.general;
                
            case 'email':
                return this.detailedErrors.email;
                
            case 'length':
            case 'width':
            case 'height':
                return this.detailedErrors.dimensions;
                
            default:
                return errors[0] || '';
        }
        
        return errors[0] || '';
    }
}

// Export für globale Nutzung
window.FieldValidatorsDE = FieldValidatorsDE;
window.fieldValidators = new FieldValidatorsDE();

// Kompatibilität mit bestehendem Code
window.FIELD_VALIDATORS = {
    validateEmail: (email) => window.fieldValidators.validateEmail(email),
    validatePhone: (phone, country) => window.fieldValidators.validatePhone(phone, country),
    validatePostalCode: (postalCode, country) => window.fieldValidators.validatePostalCode(postalCode, country),
    validateWeight: (weight, unit) => window.fieldValidators.validateWeight(weight, unit),
    validateDimensions: (length, width, height) => window.fieldValidators.validateDimensions(length, width, height),
    validateRequired: (value, field) => {
        if (!field.required) return true;
        return !window.fieldValidators.isEmpty(value);
    }
};