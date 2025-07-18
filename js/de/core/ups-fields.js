// UPS Felder Definitionen basierend auf der offiziellen UPS Batch-Datei-Spezifikation
// Reihenfolge entspricht exakt der UPS-Vorlage (ups-batch-file-shipping-spa-gb-en.json)
const UPS_FIELDS = {
    // Reihenfolge muss exakt der UPS-Spezifikation entsprechen
    'Contact Name': {
        key: 'contactName',
        label: 'Kontaktname',
        type: 'text',
        required: 'conditional', // Required for international/export or Next Day Air Early AM
        maxLength: 35,
        validation: /^[a-zA-Z\s\-\.\'\u00C0-\u017F]{0,35}$/,
        description: 'Name der Kontaktperson beim Empfänger'
    },
    'Company or Name': {
        key: 'companyName',
        label: 'Firma oder Name',
        type: 'text',
        required: true,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F]{1,35}$/,
        description: 'Firmenname oder Name des Empfängers'
    },
    'Country': {
        key: 'country',
        label: 'Land',
        type: 'select',
        required: true,
        maxLength: 2,
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
            { value: 'FI', label: 'Finnland' },
            { value: 'JP', label: 'Japan' },
            { value: 'AU', label: 'Australien' },
            { value: 'BR', label: 'Brasilien' },
            { value: 'MX', label: 'Mexiko' },
            { value: 'CN', label: 'China' },
            { value: 'IN', label: 'Indien' },
            { value: 'KR', label: 'Südkorea' },
            { value: 'SG', label: 'Singapur' },
            { value: 'HK', label: 'Hongkong' },
            { value: 'TW', label: 'Taiwan' },
            { value: 'MY', label: 'Malaysia' },
            { value: 'TH', label: 'Thailand' },
            { value: 'ID', label: 'Indonesien' },
            { value: 'PH', label: 'Philippinen' },
            { value: 'VN', label: 'Vietnam' },
            { value: 'NZ', label: 'Neuseeland' },
            { value: 'ZA', label: 'Südafrika' },
            { value: 'RU', label: 'Russland' },
            { value: 'TR', label: 'Türkei' },
            { value: 'IL', label: 'Israel' },
            { value: 'AE', label: 'Vereinigte Arabische Emirate' },
            { value: 'SA', label: 'Saudi-Arabien' },
            { value: 'EG', label: 'Ägypten' },
            { value: 'AR', label: 'Argentinien' },
            { value: 'CL', label: 'Chile' },
            { value: 'CO', label: 'Kolumbien' },
            { value: 'PE', label: 'Peru' },
            { value: 'UY', label: 'Uruguay' },
            { value: 'EC', label: 'Ecuador' },
            { value: 'VE', label: 'Venezuela' },
            { value: 'PR', label: 'Puerto Rico' }
        ],
        description: 'Zielland - nur ISO Alpha-2 Codes'
    },
    'Address 1': {
        key: 'address1',
        label: 'Adresse 1',
        type: 'text',
        required: true,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{1,35}$/,
        description: 'Hauptadresse (Straße und Hausnummer)'
    },
    'Address 2': {
        key: 'address2',
        label: 'Adresse 2',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Zusätzliche Adressinformationen'
    },
    'Address 3': {
        key: 'address3',
        label: 'Adresse 3',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Weitere Adressinformationen'
    },
    'City': {
        key: 'city',
        label: 'Stadt',
        type: 'text',
        required: true,
        maxLength: 30,
        validation: /^[a-zA-Z\s\-\.\'\u00C0-\u017F]{1,30}$/,
        description: 'Zielstadt'
    },
    'State/Province/Other': {
        key: 'state',
        label: 'Bundesland/Provinz',
        type: 'text',
        required: 'conditional', // Required for certain destination countries
        maxLength: 30,
        validation: /^[a-zA-Z0-9\s\-]{0,30}$/,
        description: 'Bundesland, Provinz oder anderes regionales Gebiet'
    },
    'Postal Code': {
        key: 'postalCode',
        label: 'Postleitzahl',
        type: 'text',
        required: 'conditional', // Required for certain destination countries
        maxLength: 10,
        validation: /^[a-zA-Z0-9\s\-]{0,10}$/,
        description: 'Postleitzahl des Ziels'
    },
    'Telephone': {
        key: 'telephone',
        label: 'Telefon',
        type: 'tel',
        required: 'conditional', // Required for international/export or Next Day Air Early AM
        maxLength: 15,
        validation: /^[\d\s\-\+\(\)]{0,15}$/,
        description: 'Telefonnummer des Empfängers'
    },
    'Extension': {
        key: 'extension',
        label: 'Durchwahl',
        type: 'text',
        required: false,
        maxLength: 5,
        validation: /^[\d]{0,5}$/,
        description: 'Telefon-Durchwahl'
    },
    'Residential Indicator': {
        key: 'residential',
        label: 'Privat-Adresse',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Geschäftlich' },
            { value: '1', label: 'Privat' }
        ],
        description: '1=Privat; 0=Geschäftlich'
    },
    'E-mail Address': {
        key: 'email',
        label: 'E-Mail',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse des Empfängers'
    },
    'Packaging Type': {
        key: 'packagingType',
        label: 'Verpackungsart',
        type: 'select',
        required: true,
        maxLength: 2,
        options: [
            { value: '1', label: 'UPS Brief/Umschlag' },
            { value: '4', label: 'UPS PAK' },
            { value: '3', label: 'UPS Röhre' },
            { value: 'S', label: 'UPS Express Box (Klein)' },
            { value: 'M', label: 'UPS Express Box (Mittel)' },
            { value: 'L', label: 'UPS Express Box (Groß)' },
            { value: '21', label: 'UPS Box' },
            { value: '25', label: 'UPS 10 KG Box' },
            { value: '24', label: 'UPS 25 KG Box' },
            { value: '2', label: 'Andere Verpackung/Kundenverpackung' },
            { value: '30', label: 'Palette (nur für PL nach PL)' }
        ],
        description: 'Art der Verpackung für die Sendung'
    },
    'Customs Value': {
        key: 'customsValue',
        label: 'Zollwert',
        type: 'number',
        required: 'conditional', // Required for US-to-CA and US-to-PR shipments
        maxLength: 15,
        min: 0,
        max: 999999999,
        step: 0.01,
        unit: 'USD',
        validation: /^\d+(\.\d{1,2})?$/,
        description: 'Zollwert für internationale Sendungen (USD)'
    },
    'Weight': {
        key: 'weight',
        label: 'Gewicht',
        type: 'number',
        required: 'conditional', // Required for packaging type 2, optional for type 1
        maxLength: 5,
        min: 0.1,
        max: 999,
        step: 0.1,
        validation: /^\d+(\.\d{1,2})?$/,
        description: 'Gewicht des Pakets'
    },
    'Length': {
        key: 'length',
        label: 'Länge',
        type: 'number',
        required: false,
        maxLength: 4,
        min: 1,
        max: 9999,
        step: 1,
        validation: /^\d+$/,
        description: 'Länge des Pakets'
    },
    'Width': {
        key: 'width',
        label: 'Breite',
        type: 'number',
        required: false,
        maxLength: 4,
        min: 1,
        max: 9999,
        step: 1,
        validation: /^\d+$/,
        description: 'Breite des Pakets'
    },
    'Height': {
        key: 'height',
        label: 'Höhe',
        type: 'number',
        required: false,
        maxLength: 4,
        min: 1,
        max: 9999,
        step: 1,
        validation: /^\d+$/,
        description: 'Höhe des Pakets'
    },
    'Unit of Measure': {
        key: 'unitOfMeasure',
        label: 'Maßeinheit',
        type: 'select',
        required: false,
        maxLength: 2,
        options: [
            { value: 'LB', label: 'Pfund (LB)' },
            { value: 'KG', label: 'Kilogramm (KG)' }
        ],
        description: 'Maßeinheit für Gewicht (Standard: LB für US/PR, KG für andere)'
    },
    'Description of Goods': {
        key: 'goodsDescription',
        label: 'Warenbeschreibung',
        type: 'text',
        required: 'conditional', // Required when Ship to/Ship from countries are different
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Beschreibung der versendeten Waren'
    },
    'Documents of No Commercial Value': {
        key: 'documentsNoCommercialValue',
        label: 'Dokumente ohne Handelswert',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Dokumente ohne kommerziellen Wert'
    },
    'GNIFC (Goods not in Free Circulation)': {
        key: 'gnifc',
        label: 'GNIFC',
        type: 'select',
        required: 'conditional', // Required for EU movements when goods are dutiable
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Waren nicht im freien Verkehr (EU-Bewegungen)'
    },
    'Declared Value': {
        key: 'declaredValue',
        label: 'Angegebener Wert',
        type: 'number',
        required: false,
        maxLength: 7,
        min: 0,
        max: 999999,
        step: 1,
        validation: /^\d+$/,
        description: 'Angegebener Wert für UPS-Haftung (max. 1000 USD oder lokales Äquivalent)'
    },
    'Service': {
        key: 'service',
        label: 'Service-Art',
        type: 'select',
        required: true,
        maxLength: 2,
        options: [
            { value: '01', label: 'Next Day Air' },
            { value: '02', label: '2nd Day Air' },
            { value: '03', label: 'Ground' },
            { value: '07', label: 'International Express' },
            { value: '08', label: 'International Expedited' },
            { value: '11', label: 'International Standard' },
            { value: '12', label: '3 Day Select' },
            { value: '13', label: 'Next Day Air Saver' },
            { value: '14', label: 'Next Day Air Early' },
            { value: '54', label: 'International Express Plus' },
            { value: '59', label: '2 Day Air A.M' },
            { value: '64', label: 'UPS Express NA1' },
            { value: '65', label: 'UPS Saver' },
            { value: '70', label: 'UPS Access Point Economy' },
            { value: '74', label: 'UPS Express 12:00' },
            { value: '82', label: 'UPS Today Standard' },
            { value: '83', label: 'UPS Today Dedicated Courier' },
            { value: '84', label: 'UPS Today Intercity' },
            { value: '85', label: 'UPS Today Express' },
            { value: '86', label: 'UPS Today Express Saver' },
            { value: '93', label: 'SurePost Parcel Select' },
            { value: '94', label: 'SurePost Bound Printed Matter' },
            { value: '95', label: 'SurePost Media Mail' }
        ],
        description: 'UPS Service-Typ'
    },
    'Delivery Confirmation': {
        key: 'deliveryConfirmation',
        label: 'Zustellbestätigung',
        type: 'select',
        required: false,
        options: [
            { value: '', label: 'Keine' },
            { value: 'S', label: 'Unterschrift erforderlich' },
            { value: 'N', label: 'Zustellbestätigung ohne Unterschrift' },
            { value: 'A', label: 'Erwachsenen-Unterschrift erforderlich' },
            { value: 'V', label: 'Mündliche Bestätigung' }
        ],
        description: 'Art der Zustellbestätigung'
    },
    'Shipper Release/Deliver Without Signature': {
        key: 'shipperRelease',
        label: 'Versender-Freigabe ohne Unterschrift',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Zustellung ohne Unterschrift (nur USA)'
    },
    'Return of Document': {
        key: 'returnOfDocument',
        label: 'Dokumentenrückgabe',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Nur für Polen-zu-Polen Sendungen'
    },
    'Deliver on Saturday': {
        key: 'saturdayDelivery',
        label: 'Samstag-Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Zustellung am Samstag (nur bei bestimmten Services)'
    },
    'UPS carbon neutral': {
        key: 'carbonNeutral',
        label: 'UPS Klimaneutral',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Klimaneutraler Versand'
    },
    'Large Package': {
        key: 'largePackage',
        label: 'Großpaket',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Großpaket (Länge >96 Zoll oder Länge+Gurtmaß >130 Zoll bzw. >244cm oder >330cm)'
    },
    'Additional Handling': {
        key: 'additionalHandling',
        label: 'Zusätzliche Behandlung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Zusätzliche Behandlung erforderlich'
    },
    'Reference 1': {
        key: 'reference1',
        label: 'Referenz 1',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Erste Referenznummer'
    },
    'Reference 2': {
        key: 'reference2',
        label: 'Referenz 2',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Zweite Referenznummer'
    },
    'Reference 3': {
        key: 'reference3',
        label: 'Referenz 3',
        type: 'text',
        required: false,
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Dritte Referenznummer (nur UPS CampusShip)'
    },
    'E-mail Notification 1 - Address': {
        key: 'emailNotification1Address',
        label: 'E-Mail-Benachrichtigung 1 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'E-mail Notification 1 - Ship': {
        key: 'emailNotification1Ship',
        label: 'E-Mail-Benachrichtigung 1 - Versand',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung beim Versand'
    },
    'E-mail Notification 1 - Exception': {
        key: 'emailNotification1Exception',
        label: 'E-Mail-Benachrichtigung 1 - Ausnahme',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Ausnahmen'
    },
    'E-mail Notification 1 - Delivery': {
        key: 'emailNotification1Delivery',
        label: 'E-Mail-Benachrichtigung 1 - Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Zustellung'
    },
    'E-mail Notification 2 - Address': {
        key: 'emailNotification2Address',
        label: 'E-Mail-Benachrichtigung 2 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'E-mail Notification 2 - Ship': {
        key: 'emailNotification2Ship',
        label: 'E-Mail-Benachrichtigung 2 - Versand',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung beim Versand'
    },
    'E-mail Notification 2 - Exception': {
        key: 'emailNotification2Exception',
        label: 'E-Mail-Benachrichtigung 2 - Ausnahme',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Ausnahmen'
    },
    'E-mail Notification 2 - Delivery': {
        key: 'emailNotification2Delivery',
        label: 'E-Mail-Benachrichtigung 2 - Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Zustellung'
    },
    'E-mail Notification 3 - Address': {
        key: 'emailNotification3Address',
        label: 'E-Mail-Benachrichtigung 3 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'E-mail Notification 3 - Ship': {
        key: 'emailNotification3Ship',
        label: 'E-Mail-Benachrichtigung 3 - Versand',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung beim Versand'
    },
    'E-mail Notification 3 - Exception': {
        key: 'emailNotification3Exception',
        label: 'E-Mail-Benachrichtigung 3 - Ausnahme',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Ausnahmen'
    },
    'E-mail Notification 3 - Delivery': {
        key: 'emailNotification3Delivery',
        label: 'E-Mail-Benachrichtigung 3 - Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Zustellung'
    },
    'E-mail Notification 4 - Address': {
        key: 'emailNotification4Address',
        label: 'E-Mail-Benachrichtigung 4 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'E-mail Notification 4 - Ship': {
        key: 'emailNotification4Ship',
        label: 'E-Mail-Benachrichtigung 4 - Versand',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung beim Versand'
    },
    'E-mail Notification 4 - Exception': {
        key: 'emailNotification4Exception',
        label: 'E-Mail-Benachrichtigung 4 - Ausnahme',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Ausnahmen'
    },
    'E-mail Notification 4 - Delivery': {
        key: 'emailNotification4Delivery',
        label: 'E-Mail-Benachrichtigung 4 - Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Zustellung'
    },
    'E-mail Notification 5 - Address': {
        key: 'emailNotification5Address',
        label: 'E-Mail-Benachrichtigung 5 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'E-mail Notification 5 - Ship': {
        key: 'emailNotification5Ship',
        label: 'E-Mail-Benachrichtigung 5 - Versand',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung beim Versand'
    },
    'E-mail Notification 5 - Exception': {
        key: 'emailNotification5Exception',
        label: 'E-Mail-Benachrichtigung 5 - Ausnahme',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Ausnahmen'
    },
    'E-mail Notification 5 - Delivery': {
        key: 'emailNotification5Delivery',
        label: 'E-Mail-Benachrichtigung 5 - Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'E-Mail-Benachrichtigung bei Zustellung'
    },
    'E-mail Message': {
        key: 'emailMessage',
        label: 'E-Mail-Nachricht',
        type: 'text',
        required: false,
        maxLength: 150,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#\,\;\:\!\?\(\)]{0,150}$/,
        description: 'Zusätzliche Nachricht für E-Mail-Benachrichtigungen'
    },
    'E-mail Failure Address': {
        key: 'emailFailureAddress',
        label: 'E-Mail-Fehleradresse',
        type: 'email',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        description: 'E-Mail-Adresse für fehlgeschlagene Benachrichtigungen'
    },
    'UPS Premium Care': {
        key: 'upsPremiumCare',
        label: 'UPS Premium Care',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'UPS Premium Care Service'
    },
    'Location ID': {
        key: 'locationId',
        label: 'Standort-ID',
        type: 'text',
        required: false,
        maxLength: 10,
        validation: /^[a-zA-Z0-9]{0,10}$/,
        description: 'Eindeutige Kennung für alternativen Zustellort (UPS Access Point)'
    },
    'Notification Media Type': {
        key: 'notificationMediaType',
        label: 'Benachrichtigungs-Medientyp',
        type: 'select',
        required: false,
        options: [
            { value: '01', label: 'Sprache' },
            { value: '03', label: 'E-Mail' },
            { value: '12', label: 'SMS Text' }
        ],
        description: 'Medientyp für Benachrichtigungen'
    },
    'Notification Language': {
        key: 'notificationLanguage',
        label: 'Benachrichtigungssprache',
        type: 'select',
        required: false,
        maxLength: 6,
        options: [
            { value: 'DAN_97', label: 'Dänisch' },
            { value: 'DEU_97', label: 'Deutsch' },
            { value: 'ENG_CA', label: 'Kanadisches Englisch' },
            { value: 'ENG_GB', label: 'Britisches Englisch' },
            { value: 'ENG_US', label: 'US-Englisch' },
            { value: 'FIN_97', label: 'Finnisch' },
            { value: 'FRA_97', label: 'Französisch' },
            { value: 'FRA_CA', label: 'Kanadisches Französisch' },
            { value: 'ITA_97', label: 'Italienisch' },
            { value: 'NLD_97', label: 'Niederländisch' },
            { value: 'NOR_97', label: 'Norwegisch' },
            { value: 'POL_97', label: 'Polnisch' },
            { value: 'SPA_97', label: 'Spanisch' },
            { value: 'SPA_MX', label: 'Mexikanisches Spanisch' },
            { value: 'SPA_PR', label: 'Puerto-ricanisches Spanisch' },
            { value: 'SWE_97', label: 'Schwedisch' }
        ],
        description: 'Sprache für Benachrichtigungen'
    },
    'Notification Address': {
        key: 'notificationAddress',
        label: 'Benachrichtigungsadresse',
        type: 'text',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-@\s]{0,50}$/,
        description: 'E-Mail-Adresse oder Mobilnummer für Benachrichtigungen'
    },
    'ADL COD Value': {
        key: 'adlCodValue',
        label: 'ADL COD-Wert',
        type: 'number',
        required: false,
        maxLength: 10,
        min: 0,
        max: 9999999999,
        step: 0.01,
        validation: /^\d+(\.\d{1,2})?$/,
        description: 'Nachnahme-Betrag für UPS Access Point'
    },
    'ADL Deliver to Addressee': {
        key: 'adlDeliverToAddressee',
        label: 'ADL Zustellung an Adressaten',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Nur an Adressaten zustellbar'
    },
    'ADL Shipper Media Type': {
        key: 'adlShipperMediaType',
        label: 'ADL Versender-Medientyp',
        type: 'select',
        required: false,
        options: [
            { value: '01', label: 'Sprache' },
            { value: '03', label: 'E-Mail' },
            { value: '12', label: 'SMS Text' }
        ],
        description: 'Medientyp für Versender-Benachrichtigungen'
    },
    'ADL Shipper Language': {
        key: 'adlShipperLanguage',
        label: 'ADL Versender-Sprache',
        type: 'select',
        required: false,
        maxLength: 6,
        options: [
            { value: 'DAN_97', label: 'Dänisch' },
            { value: 'DEU_97', label: 'Deutsch' },
            { value: 'ENG_CA', label: 'Kanadisches Englisch' },
            { value: 'ENG_GB', label: 'Britisches Englisch' },
            { value: 'ENG_US', label: 'US-Englisch' },
            { value: 'FIN_97', label: 'Finnisch' },
            { value: 'FRA_97', label: 'Französisch' },
            { value: 'FRA_CA', label: 'Kanadisches Französisch' },
            { value: 'ITA_97', label: 'Italienisch' },
            { value: 'NLD_97', label: 'Niederländisch' },
            { value: 'NOR_97', label: 'Norwegisch' },
            { value: 'POL_97', label: 'Polnisch' },
            { value: 'SPA_97', label: 'Spanisch' },
            { value: 'SPA_MX', label: 'Mexikanisches Spanisch' },
            { value: 'SPA_PR', label: 'Puerto-ricanisches Spanisch' },
            { value: 'SWE_97', label: 'Schwedisch' }
        ],
        description: 'Sprache für Versender-Benachrichtigungen'
    },
    'ADL Shipper Notification': {
        key: 'adlShipperNotification',
        label: 'ADL Versender-Benachrichtigung',
        type: 'text',
        required: false,
        maxLength: 50,
        validation: /^[a-zA-Z0-9._%+-@\s]{0,50}$/,
        description: 'E-Mail oder Mobilnummer für Versender-Benachrichtigungen'
    },
    'ADL Direct Delivery Only': {
        key: 'adlDirectDeliveryOnly',
        label: 'ADL Nur Direktzustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Nur Direktzustellung an angegebene Adresse'
    },
    'Electronic Package Release Authentication': {
        key: 'electronicPackageReleaseAuth',
        label: 'Elektronische Paket-Freigabe-Authentifizierung',
        type: 'text',
        required: 'conditional', // Required if using Access Point
        maxLength: 6,
        validation: /^[a-zA-Z0-9]{4,6}$/,
        description: 'Code für Paket-Abholung am Access Point'
    },
    'Lithium Ion Alone': {
        key: 'lithiumIonAlone',
        label: 'Lithium-Ionen allein',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Lithium-Ionen-Batterien allein'
    },
    'Lithium Ion In Equipment': {
        key: 'lithiumIonInEquipment',
        label: 'Lithium-Ionen in Geräten',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Lithium-Ionen-Batterien in Geräten'
    },
    'Lithium Ion With_Equipment': {
        key: 'lithiumIonWithEquipment',
        label: 'Lithium-Ionen mit Geräten',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Lithium-Ionen-Batterien mit Geräten'
    },
    'Lithium Metal Alone': {
        key: 'lithiumMetalAlone',
        label: 'Lithium-Metall allein',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Lithium-Metall-Batterien allein'
    },
    'Lithium Metal In Equipment': {
        key: 'lithiumMetalInEquipment',
        label: 'Lithium-Metall in Geräten',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Lithium-Metall-Batterien in Geräten'
    },
    'Lithium Metal With Equipment': {
        key: 'lithiumMetalWithEquipment',
        label: 'Lithium-Metall mit Geräten',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Lithium-Metall-Batterien mit Geräten'
    },
    'Weekend Commercial Delivery': {
        key: 'weekendCommercialDelivery',
        label: 'Wochenende Geschäftszustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Geschäftszustellung am Wochenende'
    },
    'Dry Ice Weight': {
        key: 'dryIceWeight',
        label: 'Trockeneis-Gewicht',
        type: 'number',
        required: false,
        maxLength: 16,
        min: 0,
        max: 999999999999999,
        step: 1,
        validation: /^\d+$/,
        description: 'Trockeneis-Gewicht (ganze Zahl, max. Paketgewicht)'
    },
    'Merchandise Description': {
        key: 'merchandiseDescription',
        label: 'Warenbeschreibung',
        type: 'text',
        required: 'conditional', // Required when Ship to/Ship from country is Mexico
        maxLength: 35,
        validation: /^[a-zA-Z0-9\s\-\.\'\u00C0-\u017F\/\#]{0,35}$/,
        description: 'Warenbeschreibung für Mexiko-Sendungen'
    },
    'UPS SurePost®Limited Quantity/Lithium Battery': {
        key: 'upsSurePostLimitedQuantity',
        label: 'UPS SurePost® Begrenzte Menge/Lithium-Batterie',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'UPS SurePost® Begrenzte Menge/Lithium-Batterie'
    }
};

// Länderspezifische Validierungen
const COUNTRY_VALIDATIONS = {
    'US': {
        postalCode: /^\d{5}(-\d{4})?$/,
        state: /^[A-Z]{2}$/,
        stateRequired: true,
        phone: /^\+?1?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/,
        unitOfMeasure: 'LB',
        dimensionUnit: 'IN'
    },
    'CA': {
        postalCode: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/,
        state: /^[A-Z]{2}$/,
        stateRequired: true,
        phone: /^\+?1?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/,
        unitOfMeasure: 'LB', // Can choose between LB/KG
        dimensionUnit: 'IN'   // Can choose between IN/CM
    },
    'DE': {
        postalCode: /^\d{5}$/,
        state: /^[A-Z]{2}$/,
        stateRequired: false,
        phone: /^\+?49[\s\-]?\d{3,4}[\s\-]?\d{6,8}$/,
        unitOfMeasure: 'KG',
        dimensionUnit: 'CM'
    },
    'GB': {
        postalCode: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/,
        state: /^[A-Z]{2,3}$/,
        stateRequired: false,
        phone: /^\+?44[\s\-]?\d{4}[\s\-]?\d{6}$/,
        unitOfMeasure: 'KG',
        dimensionUnit: 'CM'
    },
    'FR': {
        postalCode: /^\d{5}$/,
        state: /^[A-Z]{2}$/,
        stateRequired: false,
        phone: /^\+?33[\s\-]?\d[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}[\s\-]?\d{2}$/,
        unitOfMeasure: 'KG',
        dimensionUnit: 'CM'
    },
    'PR': {
        postalCode: /^\d{5}(-\d{4})?$/,
        state: /^[A-Z]{2}$/,
        stateRequired: false,
        phone: /^\+?1?[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}$/,
        unitOfMeasure: 'LB',
        dimensionUnit: 'IN'
    },
    'MX': {
        postalCode: /^\d{5}$/,
        state: /^[A-Z]{2,3}$/,
        stateRequired: true,
        phone: /^\+?52[\s\-]?\d{2,3}[\s\-]?\d{3,4}[\s\-]?\d{4}$/,
        unitOfMeasure: 'KG',
        dimensionUnit: 'CM'
    }
};

// Service-Typ-Gruppen
const SERVICE_GROUPS = {
    'domestic': {
        label: 'Inland',
        services: ['01', '02', '03', '12', '13', '14', '59']
    },
    'international': {
        label: 'International',
        services: ['07', '08', '11', '54', '65', '70', '74']
    },
    'express': {
        label: 'Express',
        services: ['01', '07', '13', '14', '54', '74', '85']
    },
    'ground': {
        label: 'Standard',
        services: ['03', '11', '12', '70']
    },
    'today': {
        label: 'Heute',
        services: ['82', '83', '84', '85', '86']
    },
    'surepost': {
        label: 'SurePost',
        services: ['93', '94', '95']
    }
};

// Standardwerte basierend auf UPS-Spezifikation
const DEFAULT_VALUES = {
    country: 'DE',
    unitOfMeasure: 'KG',
    packagingType: '2',
    service: '11', // International Standard als Standard
    residential: '0',
    weight: 1.0,
    customsValue: 0,
    declaredValue: 0,
    carbonNeutral: '0',
    saturdayDelivery: '0',
    largePackage: '0',
    additionalHandling: '0',
    shipperRelease: '0',
    documentsNoCommercialValue: '0',
    gnifc: '0',
    returnOfDocument: '0',
    upsPremiumCare: '0',
    weekendCommercialDelivery: '0',
    lithiumIonAlone: '0',
    lithiumIonInEquipment: '0',
    lithiumIonWithEquipment: '0',
    lithiumMetalAlone: '0',
    lithiumMetalInEquipment: '0',
    lithiumMetalWithEquipment: '0',
    upsSurePostLimitedQuantity: '0',
    adlDeliverToAddressee: '0',
    adlDirectDeliveryOnly: '0',
    emailNotification1Ship: '0',
    emailNotification1Exception: '0',
    emailNotification1Delivery: '0',
    emailNotification2Ship: '0',
    emailNotification2Exception: '0',
    emailNotification2Delivery: '0',
    emailNotification3Ship: '0',
    emailNotification3Exception: '0',
    emailNotification3Delivery: '0',
    emailNotification4Ship: '0',
    emailNotification4Exception: '0',
    emailNotification4Delivery: '0',
    emailNotification5Ship: '0',
    emailNotification5Exception: '0',
    emailNotification5Delivery: '0',
    notificationLanguage: 'DEU_97',
    adlShipperLanguage: 'DEU_97'
};

// Feldabhängigkeiten basierend auf UPS-Spezifikation
const FIELD_DEPENDENCIES = {
    customsValue: {
        depends: ['country'],
        condition: (values) => {
            // Required for US-to-CA and US-to-PR shipments
            return values.country === 'CA' || values.country === 'PR';
        },
        required: true
    },
    goodsDescription: {
        depends: ['country'],
        condition: (values) => {
            // Required when Ship to/Ship from countries are different
            return values.country && values.country !== 'DE';
        },
        required: true
    },
    merchandiseDescription: {
        depends: ['country'],
        condition: (values) => {
            // Required when Ship to/Ship from country is Mexico
            return values.country === 'MX';
        },
        required: true
    },
    contactName: {
        depends: ['country', 'service'],
        condition: (values) => {
            // Required for international/export or Next Day Air Early AM
            return (values.country && values.country !== 'DE') || values.service === '14';
        },
        required: true
    },
    telephone: {
        depends: ['country', 'service'],
        condition: (values) => {
            // Required for international/export or Next Day Air Early AM
            return (values.country && values.country !== 'DE') || values.service === '14';
        },
        required: true
    },
    state: {
        depends: ['country'],
        condition: (values) => {
            const countryValidation = COUNTRY_VALIDATIONS[values.country];
            return countryValidation && countryValidation.stateRequired;
        },
        required: true
    },
    postalCode: {
        depends: ['country'],
        condition: (values) => {
            // Required for certain destination countries
            return values.country && ['US', 'CA', 'DE', 'GB', 'FR'].includes(values.country);
        },
        required: true
    },
    weight: {
        depends: ['packagingType'],
        condition: (values) => {
            // Required for packaging type 2, optional for type 1
            return values.packagingType === '2';
        },
        required: true
    },
    gnifc: {
        depends: ['country'],
        condition: (values) => {
            // Required for EU movements when goods are dutiable
            const euCountries = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PL', 'CZ', 'DK', 'SE', 'NO', 'FI'];
            return euCountries.includes(values.country);
        },
        required: false // Only required when goods are dutiable
    },
    electronicPackageReleaseAuth: {
        depends: ['locationId'],
        condition: (values) => {
            // Required if using Access Point
            return values.locationId && values.locationId.length > 0;
        },
        required: true
    }
};

// Erweiterte Validierungsfunktionen
const FIELD_VALIDATORS = {
    validatePostalCode: (value, country) => {
        if (!value) return !FIELD_DEPENDENCIES.postalCode.condition({country});
        const countryValidation = COUNTRY_VALIDATIONS[country];
        if (!countryValidation) return true;
        return countryValidation.postalCode.test(value);
    },
    
    validateState: (value, country) => {
        if (!value) return !FIELD_DEPENDENCIES.state.condition({country});
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
    
    validateDimensions: (length, width, height, country) => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const h = parseFloat(height) || 0;
        
        if (l === 0 && w === 0 && h === 0) return true;
        
        const countryValidation = COUNTRY_VALIDATIONS[country];
        const isInches = countryValidation && countryValidation.dimensionUnit === 'IN';
        
        if (isInches) {
            // US/PR: inches, max 108 inches length, max 165 inches length + girth combined
            if (l > 0 && (l < 1 || l > 108)) return false;
            if (w > 0 && (w < 1 || w > 108)) return false;
            if (h > 0 && (h < 1 || h > 108)) return false;
            
            if (l > 0 && w > 0 && h > 0) {
                const girth = 2 * (w + h);
                const lengthPlusGirth = l + girth;
                return lengthPlusGirth <= 165;
            }
        } else {
            // International: centimeters, max 270 cm length, max 400 cm length + girth combined
            if (l > 0 && (l < 1 || l > 270)) return false;
            if (w > 0 && (w < 1 || w > 270)) return false;
            if (h > 0 && (h < 1 || h > 270)) return false;
            
            if (l > 0 && w > 0 && h > 0) {
                const girth = 2 * (w + h);
                const lengthPlusGirth = l + girth;
                return lengthPlusGirth <= 400;
            }
        }
        
        return true;
    },
    
    calculateGirth: (width, height) => {
        const w = parseFloat(width) || 0;
        const h = parseFloat(height) || 0;
        return 2 * (w + h);
    },
    
    calculateLengthPlusGirth: (length, width, height) => {
        const l = parseFloat(length) || 0;
        const girth = FIELD_VALIDATORS.calculateGirth(width, height);
        return l + girth;
    },
    
    isLargePackage: (length, width, height, country) => {
        const l = parseFloat(length) || 0;
        const w = parseFloat(width) || 0;
        const h = parseFloat(height) || 0;
        
        if (l === 0 || w === 0 || h === 0) return false;
        
        const countryValidation = COUNTRY_VALIDATIONS[country];
        const isInches = countryValidation && countryValidation.dimensionUnit === 'IN';
        
        if (isInches) {
            // US/PR: Large package if length > 96 inches OR length + girth > 130 inches
            const lengthPlusGirth = FIELD_VALIDATORS.calculateLengthPlusGirth(l, w, h);
            return l > 96 || lengthPlusGirth > 130;
        } else {
            // International: Large package if length > 244 cm OR length + girth > 330 cm
            const lengthPlusGirth = FIELD_VALIDATORS.calculateLengthPlusGirth(l, w, h);
            return l > 244 || lengthPlusGirth > 330;
        }
    }
    
    validateLithiumBatteries: (values) => {
        // Max 3 lithium battery fields can be selected
        const lithiumFields = [
            'lithiumIonAlone',
            'lithiumIonInEquipment',
            'lithiumIonWithEquipment',
            'lithiumMetalAlone',
            'lithiumMetalInEquipment',
            'lithiumMetalWithEquipment'
        ];
        
        const selectedCount = lithiumFields.filter(field => values[field] === '1').length;
        return selectedCount <= 3;
    },
    
    validateEmail: (value) => {
        if (!value) return true;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(value);
    },
    
    validateRequired: (value, field) => {
        if (!field.required) return true;
        if (typeof value === 'boolean') return true;
        if (field.type === 'select' && field.options) {
            return value !== null && value !== undefined && value !== '';
        }
        return value !== null && value !== undefined && value !== '';
    },
    
    validateCustomsValue: (value, country) => {
        if (!value) return true;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        
        // Must be positive
        if (numValue < 0) return false;
        
        // Max 15 characters including decimal
        const stringValue = numValue.toString();
        return stringValue.length <= 15;
    },
    
    validateDeclaredValue: (value) => {
        if (!value) return true;
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return false;
        
        // Must be less than $1000 USD or local equivalent
        return numValue >= 0 && numValue < 1000;
    },
    
    validateDryIceWeight: (value, totalWeight) => {
        if (!value) return true;
        const dryIceWeight = parseFloat(value);
        const packageWeight = parseFloat(totalWeight);
        
        if (isNaN(dryIceWeight) || isNaN(packageWeight)) return false;
        
        // Must be whole number
        if (dryIceWeight % 1 !== 0) return false;
        
        // Cannot exceed total package weight
        return dryIceWeight <= packageWeight;
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
            case 'DE':
                return value.replace(/\D/g, '').slice(0, 5);
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
    
    getDefaultUnitOfMeasure: (country) => {
        const countryValidation = COUNTRY_VALIDATIONS[country];
        return countryValidation ? countryValidation.unitOfMeasure : 'KG';
    },
    
    getDefaultDimensionUnit: (country) => {
        const countryValidation = COUNTRY_VALIDATIONS[country];
        return countryValidation ? countryValidation.dimensionUnit : 'CM';
    },
    
    calculateServiceOptions: (country, residential) => {
        const availableServices = [];
        
        if (country === 'US' || country === 'CA' || country === 'PR') {
            availableServices.push(...SERVICE_GROUPS.domestic.services);
        } else {
            availableServices.push(...SERVICE_GROUPS.international.services);
        }
        
        return UPS_FIELDS.Service.options.filter(option => 
            availableServices.includes(option.value)
        );
    },
    
    validateCSVValue: (value, delimiter) => {
        const stringValue = String(value || '');
        // Check if value contains delimiter, quotes, or newlines
        if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    },
    
    processFieldForExport: (fieldName, value, shipmentData) => {
        // Process field values for UPS export format
        const field = UPS_FIELDS[fieldName];
        if (!field) return '';
        
        let processedValue = value || '';
        
        // Auto-detect large packages
        if (fieldName === 'Large Package' && shipmentData) {
            const isLarge = FIELD_VALIDATORS.isLargePackage(
                shipmentData.length, 
                shipmentData.width, 
                shipmentData.height, 
                shipmentData.country
            );
            processedValue = isLarge ? '1' : '0';
        }
        
        // Handle different field types
        switch (field.type) {
            case 'select':
                // For select fields, ensure we have a valid option
                if (field.options && processedValue) {
                    const validOption = field.options.find(opt => opt.value === processedValue);
                    if (!validOption) {
                        processedValue = field.options[0]?.value || '';
                    }
                }
                break;
            case 'number':
                // For number fields, ensure proper formatting
                if (processedValue) {
                    const numValue = parseFloat(processedValue);
                    if (!isNaN(numValue)) {
                        processedValue = numValue.toString();
                    } else {
                        processedValue = '';
                    }
                }
                break;
            case 'email':
                // Validate email format
                if (processedValue && !FIELD_VALIDATORS.validateEmail(processedValue)) {
                    processedValue = '';
                }
                break;
        }
        
        // Apply maximum length restrictions
        if (field.maxLength && processedValue.length > field.maxLength) {
            processedValue = processedValue.substring(0, field.maxLength);
        }
        
        return processedValue;
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