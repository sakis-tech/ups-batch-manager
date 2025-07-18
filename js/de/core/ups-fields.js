// UPS Felder Definitionen - KORRIGIERT nach offizieller UPS-Spezifikation
// Exakte Reihenfolge und Feldnamen entsprechen ups-batch-file-shipping-spa-gb-en.json

// WICHTIG: Diese Reihenfolge muss exakt der UPS-Spezifikation entsprechen!
// Die offizielle UPS-Spaltenreihenfolge aus der JSON-Spezifikation:
const UPS_FIELD_ORDER = [
    'Contact Name',
    'Company or Name', 
    'Country',
    'Address 1',
    'Address 2', 
    'Address 3',
    'City',
    'State/Prov/Other',
    'Postal Code',
    'Telephone',
    'Ext',
    'Residential Ind',
    'Consignee Email',
    'Packaging Type',
    'Customs Value',
    'Weight',
    'Length',
    'Width',
    'Height',
    'Unit of Measure',
    'Description of Goods',
    'Documents of No Commercial Value',
    'GNIFC',
    'Pkg Decl Value',
    'Service',
    'Delivery Confirmation',
    'Shipper Release',
    'Ret of Documents',
    'Saturday Deliver',
    'Carbon Neutral',
    'Large Package',
    'Addl handling',
    'Reference 1',
    'Reference 2',
    'Reference 3',
    'QV Notif 1-Addr',
    'QV Notif 1-Ship',
    'QV Notif 1-Excp',
    'QV Notif 1-Delv',
    'QV Notif 2-Addr',
    'QV Notif 2-Ship',
    'QV Notif 2-Excp',
    'QV Notif 2-Delv',
    'QV Notif 3-Addr',
    'QV Notif 3-Ship',
    'QV Notif 3-Excp',
    'QV Notif 3-Delv',
    'QV Notif 4-Addr',
    'QV Notif 4-Ship',
    'QV Notif 4-Excp',
    'QV Notif 4-Delv',
    'QV Notif 5-Addr',
    'QV Notif 5-Ship',
    'QV Notif 5-Excp',
    'QV Notif 5-Delv',
    'QV Notif Msg',
    'QV Failure Addr',
    'UPS Premium Care',
    'ADL Location ID',
    'ADL Media Type',
    'ADL Language',
    'ADL Notification Addr',
    'ADL Failure Addr',
    'ADL COD Value',
    'ADL Deliver to Addressee',
    'ADL Shipper Media Type',
    'ADL Shipper Language',
    'ADL Shipper Notification Addr',
    'ADL Direct Delivery Only',
    'Electronic Package Release Authentication',
    'Lithium Ion Alone',
    'Lithium Ion In Equipment',
    'Lithium Ion With_Equipment',
    'Lithium Metal Alone',
    'Lithium Metal In Equipment',
    'Lithium Metal With Equipment',
    'Weekend Commercial Delivery',
    'Dry Ice Weight',
    'Merchandise Description',
    'UPS SurePost®Limited Quantity/Lithium Battery'
];

// Korrigierte UPS-Felder mit exakten Namen aus der UPS-Spezifikation
const UPS_FIELDS_CORRECTED = {
    'Contact Name': {
        key: 'contactName',
        label: 'Kontaktname',
        type: 'text',
        required: 'conditional',
        maxLength: 35,
        description: 'Name der Kontaktperson beim Empfänger'
    },
    'Company or Name': {
        key: 'companyName',
        label: 'Firma oder Name',
        type: 'text',
        required: true,
        maxLength: 35,
        description: 'Firmenname oder Name des Empfängers'
    },
    'Country': {
        key: 'country',
        label: 'Land',
        type: 'select',
        required: true,
        maxLength: 2,
        description: 'Zielland - nur ISO Alpha-2 Codes'
    },
    'Address 1': {
        key: 'address1',
        label: 'Adresse 1',
        type: 'text',
        required: true,
        maxLength: 35,
        description: 'Hauptadresse (Straße und Hausnummer)'
    },
    'Address 2': {
        key: 'address2',
        label: 'Adresse 2',
        type: 'text',
        required: false,
        maxLength: 35,
        description: 'Zusätzliche Adressinformationen'
    },
    'Address 3': {
        key: 'address3',
        label: 'Adresse 3',
        type: 'text',
        required: false,
        maxLength: 35,
        description: 'Weitere Adressinformationen'
    },
    'City': {
        key: 'city',
        label: 'Stadt',
        type: 'text',
        required: true,
        maxLength: 30,
        description: 'Zielstadt'
    },
    'State/Prov/Other': {
        key: 'state',
        label: 'Bundesland/Provinz',
        type: 'text',
        required: 'conditional',
        maxLength: 30,
        description: 'Bundesland, Provinz oder anderes regionales Gebiet'
    },
    'Postal Code': {
        key: 'postalCode',
        label: 'Postleitzahl',
        type: 'text',
        required: 'conditional',
        maxLength: 10,
        description: 'Postleitzahl des Ziels'
    },
    'Telephone': {
        key: 'telephone',
        label: 'Telefon',
        type: 'tel',
        required: 'conditional',
        maxLength: 15,
        description: 'Telefonnummer des Empfängers'
    },
    'Ext': {
        key: 'extension',
        label: 'Durchwahl',
        type: 'text',
        required: false,
        maxLength: 5,
        description: 'Telefon-Durchwahl'
    },
    'Residential Ind': {
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
    'Consignee Email': {
        key: 'email',
        label: 'E-Mail',
        type: 'email',
        required: false,
        maxLength: 50,
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
        required: 'conditional',
        maxLength: 15,
        description: 'Zollwert für internationale Sendungen (USD)'
    },
    'Weight': {
        key: 'weight',
        label: 'Gewicht',
        type: 'number',
        required: 'conditional',
        maxLength: 5,
        description: 'Gewicht des Pakets'
    },
    'Length': {
        key: 'length',
        label: 'Länge',
        type: 'number',
        required: false,
        maxLength: 4,
        description: 'Länge des Pakets'
    },
    'Width': {
        key: 'width',
        label: 'Breite',
        type: 'number',
        required: false,
        maxLength: 4,
        description: 'Breite des Pakets'
    },
    'Height': {
        key: 'height',
        label: 'Höhe',
        type: 'number',
        required: false,
        maxLength: 4,
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
        description: 'Maßeinheit für Gewicht'
    },
    'Description of Goods': {
        key: 'goodsDescription',
        label: 'Warenbeschreibung',
        type: 'text',
        required: 'conditional',
        maxLength: 35,
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
    'GNIFC': {
        key: 'gnifc',
        label: 'GNIFC',
        type: 'select',
        required: 'conditional',
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Waren nicht im freien Verkehr (EU-Bewegungen)'
    },
    'Pkg Decl Value': {
        key: 'declaredValue',
        label: 'Angegebener Wert',
        type: 'number',
        required: false,
        maxLength: 7,
        description: 'Angegebener Wert für UPS-Haftung'
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
    'Shipper Release': {
        key: 'shipperRelease',
        label: 'Versender-Freigabe',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Zustellung ohne Unterschrift (nur USA)'
    },
    'Ret of Documents': {
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
    'Saturday Deliver': {
        key: 'saturdayDelivery',
        label: 'Samstag-Zustellung',
        type: 'select',
        required: false,
        options: [
            { value: '0', label: 'Nein' },
            { value: '1', label: 'Ja' }
        ],
        description: 'Zustellung am Samstag'
    },
    'Carbon Neutral': {
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
        description: 'Großpaket'
    },
    'Addl handling': {
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
        description: 'Erste Referenznummer'
    },
    'Reference 2': {
        key: 'reference2',
        label: 'Referenz 2',
        type: 'text',
        required: false,
        maxLength: 35,
        description: 'Zweite Referenznummer'
    },
    'Reference 3': {
        key: 'reference3',
        label: 'Referenz 3',
        type: 'text',
        required: false,
        maxLength: 35,
        description: 'Dritte Referenznummer'
    },
    'QV Notif 1-Addr': {
        key: 'emailNotification1Address',
        label: 'E-Mail-Benachrichtigung 1 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'QV Notif 1-Ship': {
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
    'QV Notif 1-Excp': {
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
    'QV Notif 1-Delv': {
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
    'QV Notif 2-Addr': {
        key: 'emailNotification2Address',
        label: 'E-Mail-Benachrichtigung 2 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'QV Notif 2-Ship': {
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
    'QV Notif 2-Excp': {
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
    'QV Notif 2-Delv': {
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
    'QV Notif 3-Addr': {
        key: 'emailNotification3Address',
        label: 'E-Mail-Benachrichtigung 3 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'QV Notif 3-Ship': {
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
    'QV Notif 3-Excp': {
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
    'QV Notif 3-Delv': {
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
    'QV Notif 4-Addr': {
        key: 'emailNotification4Address',
        label: 'E-Mail-Benachrichtigung 4 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'QV Notif 4-Ship': {
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
    'QV Notif 4-Excp': {
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
    'QV Notif 4-Delv': {
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
    'QV Notif 5-Addr': {
        key: 'emailNotification5Address',
        label: 'E-Mail-Benachrichtigung 5 - Adresse',
        type: 'email',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse für Benachrichtigungen'
    },
    'QV Notif 5-Ship': {
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
    'QV Notif 5-Excp': {
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
    'QV Notif 5-Delv': {
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
    'QV Notif Msg': {
        key: 'emailMessage',
        label: 'E-Mail-Nachricht',
        type: 'text',
        required: false,
        maxLength: 150,
        description: 'Zusätzliche Nachricht für E-Mail-Benachrichtigungen'
    },
    'QV Failure Addr': {
        key: 'emailFailureAddress',
        label: 'E-Mail-Fehleradresse',
        type: 'email',
        required: false,
        maxLength: 50,
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
    'ADL Location ID': {
        key: 'locationId',
        label: 'Standort-ID',
        type: 'text',
        required: false,
        maxLength: 10,
        description: 'Eindeutige Kennung für UPS Access Point'
    },
    'ADL Media Type': {
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
    'ADL Language': {
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
    'ADL Notification Addr': {
        key: 'notificationAddress',
        label: 'Benachrichtigungsadresse',
        type: 'text',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse oder Mobilnummer für Benachrichtigungen'
    },
    'ADL Failure Addr': {
        key: 'adlFailureAddress',
        label: 'ADL Fehleradresse',
        type: 'email',
        required: false,
        maxLength: 50,
        description: 'E-Mail-Adresse für fehlgeschlagene ADL-Benachrichtigungen'
    },
    'ADL COD Value': {
        key: 'adlCodValue',
        label: 'ADL COD-Wert',
        type: 'number',
        required: false,
        maxLength: 10,
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
    'ADL Shipper Notification Addr': {
        key: 'adlShipperNotification',
        label: 'ADL Versender-Benachrichtigung',
        type: 'text',
        required: false,
        maxLength: 50,
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
        required: 'conditional',
        maxLength: 6,
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
        description: 'Trockeneis-Gewicht'
    },
    'Merchandise Description': {
        key: 'merchandiseDescription',
        label: 'Warenbeschreibung',
        type: 'text',
        required: 'conditional',
        maxLength: 35,
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

// Export für Browser-Umgebung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UPS_FIELD_ORDER,
        UPS_FIELDS_CORRECTED
    };
} else {
    // Browser environment - make available globally
    window.UPS_FIELD_ORDER = UPS_FIELD_ORDER;
    window.UPS_FIELDS_CORRECTED = UPS_FIELDS_CORRECTED;
    
    // Backup: Überschreibe die alte UPS_FIELDS-Variable mit der korrigierten Version
    window.UPS_FIELDS = UPS_FIELDS_CORRECTED;
}