// UPS Felder Definitionen basierend auf der JSON-Spezifikation
const UPS_FIELDS = {
    // Empfänger-Informationen
    'Contact Name': {
        key: 'contactName',
        label: 'Kontaktname',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z\s\-\.\']{0,35}$/,
        description: 'Name der Kontaktperson beim Empfänger'
    },
    'Company or Name': {
        key: 'companyName',
        label: 'Firma oder Name',
        type: 'text',
        required: true,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\']{1,35}$/,
        description: 'Firmenname oder Name des Empfängers'
    },
    'Country': {
        key: 'country',
        label: 'Land',
        type: 'select',
        required: true,
        options: [
            { value: 'DE', label: 'Deutschland' },
            { value: 'US', label: 'USA' },
            { value: 'CA', label: 'Kanada' },
            { value: 'GB', label: 'Großbritannien' },
            { value: 'FR', label: 'Frankreich' },
            { value: 'IT', label: 'Italien' },
            { value: 'ES', label: 'Spanien' },
            { value: 'NL', label: 'Niederlande' },
            { value: 'BE', label: 'Belgien' },
            { value: 'AT', label: 'Österreich' },
            { value: 'CH', label: 'Schweiz' },
            { value: 'PL', label: 'Polen' },
            { value: 'CZ', label: 'Tschechien' },
            { value: 'DK', label: 'Dänemark' },
            { value: 'SE', label: 'Schweden' },
            { value: 'NO', label: 'Norwegen' },
            { value: 'FI', label: 'Finnland' }
        ],
        description: 'Zielland für die Sendung'
    },
    'Address 1': {
        key: 'address1',
        label: 'Adresse 1',
        type: 'text',
        required: true,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{1,35}$/,
        description: 'Hauptadresse (Straße und Hausnummer)'
    },
    'Address 2': {
        key: 'address2',
        label: 'Adresse 2',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{0,35}$/,
        description: 'Zusätzliche Adressinformationen'
    },
    'Address 3': {
        key: 'address3',
        label: 'Adresse 3',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{0,35}$/,
        description: 'Weitere Adressinformationen'
    },
    'City': {
        key: 'city',
        label: 'Stadt',
        type: 'text',
        required: true,
        maxLength: 30,
        validation: /^[a-zA-Z\s\-\.\']{1,30}$/,
        description: 'Zielstadt'
    },
    'State/Prov/Other': {
        key: 'state',
        label: 'Bundesland/Provinz',
        type: 'text',
        required: false,
        maxLength: 5,
        validation: /^[a-zA-Z0-9]{0,5}$/,
        description: 'Bundesland, Provinz oder anderes regionales Gebiet'
    },
    'Postal Code': {
        key: 'postalCode',
        label: 'Postleitzahl',
        type: 'text',
        required: true,
        maxLength: 10,
        validation: /^[a-zA-Z0-9\s\-]{1,10}$/,
        description: 'Postleitzahl des Ziels'
    },
    'Telephone': {
        key: 'telephone',
        label: 'Telefon',
        type: 'tel',
        required: false,
        maxLength: 15,
        validation: /^[\d\s\-\+\(\)]{0,15}$/,
        description: 'Telefonnummer des Empfängers'
    },
    'Ext': {
        key: 'extension',
        label: 'Durchwahl',
        type: 'text',
        required: false,
        maxLength: 4,
        validation: /^[\d]{0,4}$/,
        description: 'Telefon-Durchwahl'
    },
    'Residential Ind': {
        key: 'residential',
        label: 'Privat-Adresse',
        type: 'checkbox',
        required: false,
        description: 'Markieren, wenn es sich um eine Privatadresse handelt'
    },
    'Consignee Email': {
        key: 'email',
        label: 'E-Mail',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse des Empfängers'
    },

    // Paket-Informationen
    'Packaging Type': {
        key: 'packagingType',
        label: 'Verpackungsart',
        type: 'select',
        required: true,
        options: [
            { value: '02', label: 'Paket' },
            { value: '01', label: 'UPS Brief' },
            { value: '03', label: 'Röhre' },
            { value: '04', label: 'Pak' },
            { value: '21', label: 'UPS Express-Box' },
            { value: '24', label: 'UPS 25KG Box' },
            { value: '25', label: 'UPS 10KG Box' },
            { value: '30', label: 'Palette' },
            { value: '2a', label: 'Kleine Express-Box' },
            { value: '2b', label: 'Mittlere Express-Box' },
            { value: '2c', label: 'Große Express-Box' }
        ],
        description: 'Art der Verpackung'
    },
    'Weight': {
        key: 'weight',
        label: 'Gewicht',
        type: 'number',
        required: true,
        min: 0.1,
        max: 70,
        step: 0.1,
        unit: 'kg',
        validation: /^\d+(\.\d{1,2})?$/,
        description: 'Gewicht des Pakets in Kilogramm'
    },
    'Length': {
        key: 'length',
        label: 'Länge',
        type: 'number',
        required: false,
        min: 1,
        max: 270,
        step: 1,
        unit: 'cm',
        validation: /^\d+$/,
        description: 'Länge des Pakets in Zentimetern'
    },
    'Width': {
        key: 'width',
        label: 'Breite',
        type: 'number',
        required: false,
        min: 1,
        max: 270,
        step: 1,
        unit: 'cm',
        validation: /^\d+$/,
        description: 'Breite des Pakets in Zentimetern'
    },
    'Height': {
        key: 'height',
        label: 'Höhe',
        type: 'number',
        required: false,
        min: 1,
        max: 270,
        step: 1,
        unit: 'cm',
        validation: /^\d+$/,
        description: 'Höhe des Pakets in Zentimetern'
    },
    'Unit of Measure': {
        key: 'unitOfMeasure',
        label: 'Maßeinheit',
        type: 'select',
        required: true,
        options: [
            { value: 'KG', label: 'Kilogramm (KG)' },
            { value: 'LB', label: 'Pfund (LB)' }
        ],
        description: 'Maßeinheit für Gewicht'
    },
    'Description of Goods': {
        key: 'goodsDescription',
        label: 'Warenbeschreibung',
        type: 'text',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{0,50}$/,
        description: 'Beschreibung der versendeten Waren'
    },
    'Customs Value': {
        key: 'customsValue',
        label: 'Zollwert',
        type: 'number',
        required: false,
        min: 0,
        max: 99999,
        step: 0.01,
        unit: '€',
        validation: /^\d+(\.\d{1,2})?$/,
        description: 'Zollwert für internationale Sendungen'
    },

    // Service-Optionen
    'Service': {
        key: 'serviceType',
        label: 'Service-Art',
        type: 'select',
        required: true,
        options: [
            { value: '03', label: 'UPS Standard' },
            { value: '11', label: 'UPS Standard (International)' },
            { value: '01', label: 'UPS Next Day Air' },
            { value: '02', label: 'UPS 2nd Day Air' },
            { value: '07', label: 'UPS Express' },
            { value: '08', label: 'UPS Expedited' },
            { value: '54', label: 'UPS Express Plus' },
            { value: '65', label: 'UPS Saver' },
            { value: '12', label: 'UPS 3 Day Select' },
            { value: '13', label: 'UPS Next Day Air Early' },
            { value: '14', label: 'UPS Next Day Air Early A.M.' },
            { value: '59', label: 'UPS 2nd Day Air A.M.' }
        ],
        description: 'UPS Service-Typ'
    },
    'Delivery Confirm': {
        key: 'deliveryConfirm',
        label: 'Zustellbestätigung',
        type: 'select',
        required: false,
        options: [
            { value: '', label: 'Keine' },
            { value: '1', label: 'Zustellbestätigung' },
            { value: '2', label: 'Unterschrift erforderlich' },
            { value: '3', label: 'Erwachsenen-Unterschrift erforderlich' }
        ],
        description: 'Art der Zustellbestätigung'
    },
    'Shipper Release': {
        key: 'shipperRelease',
        label: 'Versender-Freigabe',
        type: 'checkbox',
        required: false,
        description: 'Versender-Freigabe für Zustellung ohne Unterschrift'
    },
    'Saturday Deliver': {
        key: 'saturdayDelivery',
        label: 'Samstag-Zustellung',
        type: 'checkbox',
        required: false,
        description: 'Zustellung am Samstag'
    },
    'Carbon Neutral': {
        key: 'carbonNeutral',
        label: 'Klimaneutral',
        type: 'checkbox',
        required: false,
        description: 'Klimaneutraler Versand'
    },
    'Large Package': {
        key: 'largePackage',
        label: 'Großpaket',
        type: 'checkbox',
        required: false,
        description: 'Kennzeichnung als Großpaket'
    },
    'Addl handling': {
        key: 'additionalHandling',
        label: 'Zusätzliche Behandlung',
        type: 'checkbox',
        required: false,
        description: 'Zusätzliche Behandlung erforderlich'
    },

    // Referenz-Informationen
    'Reference 1': {
        key: 'reference1',
        label: 'Referenz 1',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{0,35}$/,
        description: 'Erste Referenznummer'
    },
    'Reference 2': {
        key: 'reference2',
        label: 'Referenz 2',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{0,35}$/,
        description: 'Zweite Referenznummer'
    },
    'Reference 3': {
        key: 'reference3',
        label: 'Referenz 3',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\/\#]{0,35}$/,
        description: 'Dritte Referenznummer'
    },

    // Weitere Felder basierend auf der JSON-Spezifikation
    'Documents of No Commercial Value': {
        key: 'documentsNoCommercialValue',
        label: 'Dokumente ohne Handelswert',
        type: 'checkbox',
        required: false,
        description: 'Dokumente ohne kommerziellen Wert'
    },
    'GNIFC': {
        key: 'gnifc',
        label: 'GNIFC',
        type: 'text',
        required: false,
        maxLength: 15,
        validation: /^[a-zA-Z0-9]{0,15}$/,
        description: 'Goods Not In Free Circulation'
    },
    'Pkg Decl Value': {
        key: 'packageDeclaredValue',
        label: 'Paket-Deklarationswert',
        type: 'number',
        required: false,
        min: 0,
        max: 99999,
        step: 0.01,
        unit: '€',
        validation: /^\d+(\.\d{1,2})?$/,
        description: 'Deklarierter Wert des Pakets'
    },
    'Ret of Documents': {
        key: 'returnOfDocuments',
        label: 'Dokumentenrückgabe',
        type: 'checkbox',
        required: false,
        description: 'Rückgabe von Dokumenten'
    },
    'UPS Premium Care': {
        key: 'upsPremiumCare',
        label: 'UPS Premium Care',
        type: 'checkbox',
        required: false,
        description: 'UPS Premium Care Service'
    },
    'Electronic Package Release Authentication': {
        key: 'electronicPackageRelease',
        label: 'Elektronische Paket-Freigabe',
        type: 'checkbox',
        required: false,
        description: 'Elektronische Paket-Freigabe-Authentifizierung'
    },
    'Lithium Ion Alone': {
        key: 'lithiumIonAlone',
        label: 'Lithium-Ionen allein',
        type: 'checkbox',
        required: false,
        description: 'Lithium-Ionen-Batterien allein'
    },
    'Lithium Ion In Equipment': {
        key: 'lithiumIonInEquipment',
        label: 'Lithium-Ionen in Geräten',
        type: 'checkbox',
        required: false,
        description: 'Lithium-Ionen-Batterien in Geräten'
    }
};

// Länderspezifische Validierungen
const COUNTRY_VALIDATIONS = {
    'US': {
        postalCode: /^\d{5}(-\d{4})?$/,
        state: /^[A-Z]{2}$/,
        stateRequired: true,
        phone: /^\+?1?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/
    },
    'CA': {
        postalCode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
        state: /^[A-Z]{2}$/,
        stateRequired: true,
        phone: /^\+?1?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/
    },
    'DE': {
        postalCode: /^\d{5}$/,
        state: /^[A-Z]{2}$/,
        stateRequired: false,
        phone: /^\+?49[\s\-]?\d{3,4}[\s\-]?\d{6,8}$/
    },
    'GB': {
        postalCode: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
        state: /^[A-Z]{2,3}$/,
        stateRequired: false,
        phone: /^\+?44[\s\-]?\d{4}[\s\-]?\d{6}$/
    },
    'FR': {
        postalCode: /^\d{5}$/,
        state: /^[A-Z]{2}$/,
        stateRequired: false,
        phone: /^\+?33[\s\-]?\d[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}$/
    }
};

// Service-Typ-Gruppen
const SERVICE_GROUPS = {
    'domestic': {
        label: 'Inland',
        services: ['03', '12', '01', '02', '13', '14', '59']
    },
    'international': {
        label: 'International',
        services: ['11', '07', '08', '54', '65']
    },
    'express': {
        label: 'Express',
        services: ['01', '07', '13', '14', '54']
    },
    'ground': {
        label: 'Standard',
        services: ['03', '11', '12']
    }
};

// Standardwerte
const DEFAULT_VALUES = {
    country: 'DE',
    unitOfMeasure: 'KG',
    packagingType: '02',
    serviceType: '03',
    residential: false,
    weight: 1.0,
    customsValue: 0,
    packageDeclaredValue: 0
};

// Feldabhängigkeiten
const FIELD_DEPENDENCIES = {
    customsValue: {
        depends: ['country'],
        condition: (values) => values.country && values.country !== 'DE',
        required: true
    },
    goodsDescription: {
        depends: ['country'],
        condition: (values) => values.country && values.country !== 'DE',
        required: true
    },
    state: {
        depends: ['country'],
        condition: (values) => {
            const countryValidation = COUNTRY_VALIDATIONS[values.country];
            return countryValidation && countryValidation.stateRequired;
        },
        required: true
    }
};

// Validierungsfunktionen
const FIELD_VALIDATORS = {
    validatePostalCode: (value, country) => {
        const countryValidation = COUNTRY_VALIDATIONS[country];
        if (!countryValidation) return true;
        return countryValidation.postalCode.test(value);
    },
    
    validateState: (value, country) => {
        const countryValidation = COUNTRY_VALIDATIONS[country];
        if (!countryValidation) return true;
        return countryValidation.state.test(value);
    },
    
    validatePhone: (value, country) => {
        if (!value) return true;
        const countryValidation = COUNTRY_VALIDATIONS[country];
        if (!countryValidation) return true;
        return countryValidation.phone.test(value);
    },
    
    validateWeight: (value, unitOfMeasure) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        
        if (unitOfMeasure === 'KG') {
            return numValue >= 0.1 && numValue <= 70;
        } else if (unitOfMeasure === 'LB') {
            return numValue >= 0.1 && numValue <= 150;
        }
        return false;
    },
    
    validateDimensions: (length, width, height) => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const h = parseFloat(height) || 0;
        
        if (l === 0 && w === 0 && h === 0) return true;
        
        // Alle Dimensionen müssen zwischen 1 und 270 cm liegen
        if (l > 0 && (l < 1 || l > 270)) return false;
        if (w > 0 && (w < 1 || w > 270)) return false;
        if (h > 0 && (h < 1 || h > 270)) return false;
        
        // Umfang-Validierung: Länge + 2*(Breite + Höhe) <= 400 cm
        if (l > 0 && w > 0 && h > 0) {
            const girth = l + 2 * (w + h);
            return girth <= 400;
        }
        
        return true;
    },
    
    validateEmail: (value) => {
        if (!value) return true;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
    },
    
    validateRequired: (value, field) => {
        if (!field.required) return true;
        if (typeof value === 'boolean') return true;
        return value !== null && value !== undefined && value !== '';
    }
};

// Hilfsfunktionen
const FIELD_HELPERS = {
    formatPostalCode: (value, country) => {
        if (!value) return value;
        
        switch (country) {
            case 'CA':
                return value.replace(/(.{3})(.{3})/, '$1 $2').toUpperCase();
            case 'GB':
                return value.replace(/(.+)(.{3})/, '$1 $2').toUpperCase();
            default:
                return value;
        }
    },
    
    formatPhone: (value, country) => {
        if (!value) return value;
        
        const digits = value.replace(/\D/g, '');
        
        switch (country) {
            case 'US':
            case 'CA':
                if (digits.length === 10) {
                    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
                }
                break;
            case 'DE':
                if (digits.length >= 10) {
                    return digits.replace(/(\d{2})(\d{3,4})(\d{6,8})/, '+49 $2 $3');
                }
                break;
        }
        
        return value;
    },
    
    convertWeight: (value, fromUnit, toUnit) => {
        if (!value || fromUnit === toUnit) return value;
        
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return value;
        
        if (fromUnit === 'KG' && toUnit === 'LB') {
            return (numValue * 2.20462).toFixed(1);
        } else if (fromUnit === 'LB' && toUnit === 'KG') {
            return (numValue / 2.20462).toFixed(1);
        }
        
        return value;
    },
    
    calculateServiceOptions: (country, residential) => {
        const availableServices = [];
        
        if (country === 'US' || country === 'CA') {
            availableServices.push(...SERVICE_GROUPS.domestic.services);
        } else {
            availableServices.push(...SERVICE_GROUPS.international.services);
        }
        
        return UPS_FIELDS.Service.options.filter(option => 
            availableServices.includes(option.value)
        );
    }
};

// Export der Definitionen
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UPS_FIELDS,
        COUNTRY_VALIDATIONS,
        SERVICE_GROUPS,
        DEFAULT_VALUES,
        FIELD_DEPENDENCIES,
        FIELD_VALIDATORS,
        FIELD_HELPERS
    };
} else {
    // Browser environment - make available globally
    window.UPS_FIELDS = UPS_FIELDS;
    window.COUNTRY_VALIDATIONS = COUNTRY_VALIDATIONS;
    window.SERVICE_GROUPS = SERVICE_GROUPS;
    window.DEFAULT_VALUES = DEFAULT_VALUES;
    window.FIELD_DEPENDENCIES = FIELD_DEPENDENCIES;
    window.FIELD_VALIDATORS = FIELD_VALIDATORS;
    window.FIELD_HELPERS = FIELD_HELPERS;
}