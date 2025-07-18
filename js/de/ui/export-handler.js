// Export-Handler für deutsche UPS Batch Manager Oberfläche
class ExportHandlerDE {
    constructor() {
        this.exportFormats = {
            csv: 'Comma Separated Values (CSV)',
            xml: 'XML-Datei (XML)',
            ssv: 'Semikolon-getrennte Werte (SSV)'
        };
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Schnell-Export Buttons
        const quickExportCSV = document.getElementById('quickExportCSV');
        const quickExportXML = document.getElementById('quickExportXML');
        const quickExportSSV = document.getElementById('quickExportSSV');
        
        if (quickExportCSV) {
            quickExportCSV.addEventListener('click', () => {
                this.performQuickExport('csv');
            });
        }
        
        if (quickExportXML) {
            quickExportXML.addEventListener('click', () => {
                this.performQuickExport('xml');
            });
        }
        
        if (quickExportSSV) {
            quickExportSSV.addEventListener('click', () => {
                this.performQuickExport('ssv');
            });
        }
    }

    // Schnell-Export ohne Modal
    performQuickExport(format) {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        
        if (validShipments.length === 0) {
            window.toastSystem?.showWarning('Keine gültigen Sendungen zum Exportieren vorhanden');
            return;
        }

        try {
            let exportData;
            let filename = `ups-batch-${new Date().toISOString().slice(0, 10)}`;
            
            if (format === 'xml') {
                exportData = this.exportToXML(validShipments);
                filename += '.xml';
            } else if (format === 'ssv') {
                exportData = this.exportToSSV(validShipments);
                filename += '.ssv';
            } else {
                exportData = this.exportToCSV(validShipments);
                filename += '.csv';
            }
            
            this.downloadFile(exportData, filename, format);
            
            window.toastSystem?.showSuccess(
                `${validShipments.length} Sendungen erfolgreich als ${format.toUpperCase()} exportiert`
            );
        } catch (error) {
            console.error('Export error:', error);
            window.toastSystem?.showError(`Export fehlgeschlagen: ${error.message}`);
        }
    }

    // Export zu CSV mit UPS-konformen Feldnamen - vollständig UPS-kompatibel
    exportToCSV(shipments) {
        if (!window.UPS_FIELD_ORDER || !window.UPS_FIELDS) {
            console.error('UPS_FIELD_ORDER oder UPS_FIELDS nicht verfügbar - ups-fields.js nicht geladen');
            throw new Error('UPS-Feldkonfiguration nicht verfügbar');
        }

        // UPS-Header in exakter Reihenfolge wie von UPS spezifiziert
        const headers = window.UPS_FIELD_ORDER;
        let csvContent = headers.join(',') + '\n';
        
        shipments.forEach(shipment => {
            const row = window.UPS_FIELD_ORDER.map(upsFieldName => {
                const fieldConfig = window.UPS_FIELDS[upsFieldName];
                if (!fieldConfig) {
                    console.warn(`Feldkonfiguration für ${upsFieldName} nicht gefunden`);
                    return '';
                }
                
                let value = '';
                
                // Wert aus Sendungsdaten extrahieren
                if (shipment[fieldConfig.key] !== undefined && shipment[fieldConfig.key] !== null) {
                    value = shipment[fieldConfig.key];
                }
                
                // UPS-spezifische Feldverarbeitung
                if (window.FIELD_HELPERS && window.FIELD_HELPERS.processFieldForExport) {
                    value = window.FIELD_HELPERS.processFieldForExport(upsFieldName, value, shipment);
                }
                
                // Standardwerte für leere Felder
                if (value === '' && window.DEFAULT_VALUES && window.DEFAULT_VALUES[fieldConfig.key]) {
                    value = window.DEFAULT_VALUES[fieldConfig.key];
                }
                
                // Spezielle Behandlung für bestimmte Felder
                switch (fieldConfig.key) {
                    case 'telephone':
                        value = shipment.phone || shipment.telephone || '';
                        break;
                    case 'packagingType':
                        value = shipment.packageType || shipment.packagingType || '';
                        break;
                    case 'service':
                        value = shipment.serviceType || shipment.service || '';
                        break;
                    case 'goodsDescription':
                        value = shipment.description || shipment.goodsDescription || '';
                        break;
                    case 'declaredValue':
                        value = shipment.packageDeclaredValue || shipment.declaredValue || '';
                        break;
                    case 'reference1':
                        value = shipment.reference || shipment.reference1 || '';
                        break;
                    case 'residential':
                        // Nur wenn explizit gesetzt, sonst leer lassen
                        if (shipment.residential === true) {
                            value = '1';
                        } else if (shipment.residential === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'documentsNoCommercialValue':
                        if (shipment.documentsNoCommercialValue === true) {
                            value = '1';
                        } else if (shipment.documentsNoCommercialValue === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'gnifc':
                        if (shipment.gnifc === true) {
                            value = '1';
                        } else if (shipment.gnifc === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'shipperRelease':
                        if (shipment.shipperRelease === true) {
                            value = '1';
                        } else if (shipment.shipperRelease === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'returnOfDocument':
                        if (shipment.returnOfDocuments === true) {
                            value = '1';
                        } else if (shipment.returnOfDocuments === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'saturdayDelivery':
                        if (shipment.saturdayDelivery === true) {
                            value = '1';
                        } else if (shipment.saturdayDelivery === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'carbonNeutral':
                        if (shipment.carbonNeutral === true) {
                            value = '1';
                        } else if (shipment.carbonNeutral === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'largePackage':
                        if (shipment.largePackage === true) {
                            value = '1';
                        } else if (shipment.largePackage === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'additionalHandling':
                        if (shipment.additionalHandling === true) {
                            value = '1';
                        } else if (shipment.additionalHandling === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'upsPremiumCare':
                        if (shipment.upsPremiumCare === true) {
                            value = '1';
                        } else if (shipment.upsPremiumCare === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'weekendCommercialDelivery':
                        if (shipment.weekendCommercialDelivery === true) {
                            value = '1';
                        } else if (shipment.weekendCommercialDelivery === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonAlone':
                        if (shipment.lithiumIonAlone === true) {
                            value = '1';
                        } else if (shipment.lithiumIonAlone === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonInEquipment':
                        if (shipment.lithiumIonInEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumIonInEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonWithEquipment':
                        if (shipment.lithiumIonWithEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumIonWithEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalAlone':
                        if (shipment.lithiumMetalAlone === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalAlone === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalInEquipment':
                        if (shipment.lithiumMetalInEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalInEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalWithEquipment':
                        if (shipment.lithiumMetalWithEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalWithEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'upsSurePostLimitedQuantity':
                        if (shipment.upsSurePostLimitedQuantity === true) {
                            value = '1';
                        } else if (shipment.upsSurePostLimitedQuantity === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'adlDeliverToAddressee':
                        if (shipment.adlDeliverToAddressee === true) {
                            value = '1';
                        } else if (shipment.adlDeliverToAddressee === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'adlDirectDeliveryOnly':
                        if (shipment.adlDirectDeliveryOnly === true) {
                            value = '1';
                        } else if (shipment.adlDirectDeliveryOnly === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'electronicPackageReleaseAuth':
                        value = shipment.electronicPackageRelease || shipment.electronicPackageReleaseAuth || '';
                        break;
                    // E-Mail-Benachrichtigungen
                    case 'emailNotification1Ship':
                    case 'emailNotification1Exception':
                    case 'emailNotification1Delivery':
                    case 'emailNotification2Ship':
                    case 'emailNotification2Exception':
                    case 'emailNotification2Delivery':
                    case 'emailNotification3Ship':
                    case 'emailNotification3Exception':
                    case 'emailNotification3Delivery':
                    case 'emailNotification4Ship':
                    case 'emailNotification4Exception':
                    case 'emailNotification4Delivery':
                    case 'emailNotification5Ship':
                    case 'emailNotification5Exception':
                    case 'emailNotification5Delivery':
                        if (shipment[fieldConfig.key] === true) {
                            value = '1';
                        } else if (shipment[fieldConfig.key] === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                }
                
                // CSV-Formatierung anwenden
                return this.escapeCSVField(String(value));
            });
            
            csvContent += row.join(',') + '\n';
        });
        
        return csvContent;
    }

    // Export zu XML - UPS-konforme XML-Datei erstellen mit allen Feldern
    exportToXML(shipments) {
        if (!window.UPS_FIELD_ORDER || !window.UPS_FIELDS) {
            console.error('UPS_FIELD_ORDER oder UPS_FIELDS nicht verfügbar - ups-fields.js nicht geladen');
            throw new Error('UPS-Feldkonfiguration nicht verfügbar');
        }

        let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xmlContent += '<ups-batch>\n';
        xmlContent += `  <created-at>${new Date().toISOString()}</created-at>\n`;
        xmlContent += `  <shipment-count>${shipments.length}</shipment-count>\n`;
        xmlContent += `  <format-version>UPS-Batch-1.0</format-version>\n`;
        xmlContent += '  <shipments>\n';
        
        shipments.forEach((shipment, index) => {
            xmlContent += `    <shipment id="${index + 1}">\n`;
            
            // Alle UPS-Felder in korrekter Reihenfolge durchgehen
            window.UPS_FIELD_ORDER.forEach(upsFieldName => {
                const fieldConfig = window.UPS_FIELDS[upsFieldName];
                if (!fieldConfig) {
                    console.warn(`Feldkonfiguration für ${upsFieldName} nicht gefunden`);
                    return;
                }
                
                let value = '';
                
                // Wert aus Sendungsdaten extrahieren
                if (shipment[fieldConfig.key] !== undefined && shipment[fieldConfig.key] !== null) {
                    value = shipment[fieldConfig.key];
                }
                
                // UPS-spezifische Feldverarbeitung
                if (window.FIELD_HELPERS && window.FIELD_HELPERS.processFieldForExport) {
                    value = window.FIELD_HELPERS.processFieldForExport(upsFieldName, value, shipment);
                }
                
                // Standardwerte für leere Felder
                if (value === '' && window.DEFAULT_VALUES && window.DEFAULT_VALUES[fieldConfig.key]) {
                    value = window.DEFAULT_VALUES[fieldConfig.key];
                }
                
                // Spezielle Behandlung für bestimmte Felder (gleiche Logik wie CSV)
                switch (fieldConfig.key) {
                    case 'telephone':
                        value = shipment.phone || shipment.telephone || '';
                        break;
                    case 'packagingType':
                        value = shipment.packageType || shipment.packagingType || '';
                        break;
                    case 'service':
                        value = shipment.serviceType || shipment.service || '';
                        break;
                    case 'goodsDescription':
                        value = shipment.description || shipment.goodsDescription || '';
                        break;
                    case 'declaredValue':
                        value = shipment.packageDeclaredValue || shipment.declaredValue || '';
                        break;
                    case 'reference1':
                        value = shipment.reference || shipment.reference1 || '';
                        break;
                    case 'residential':
                        // Nur wenn explizit gesetzt, sonst leer lassen
                        if (shipment.residential === true) {
                            value = '1';
                        } else if (shipment.residential === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'documentsNoCommercialValue':
                        if (shipment.documentsNoCommercialValue === true) {
                            value = '1';
                        } else if (shipment.documentsNoCommercialValue === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'gnifc':
                        if (shipment.gnifc === true) {
                            value = '1';
                        } else if (shipment.gnifc === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'shipperRelease':
                        if (shipment.shipperRelease === true) {
                            value = '1';
                        } else if (shipment.shipperRelease === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'returnOfDocument':
                        if (shipment.returnOfDocuments === true) {
                            value = '1';
                        } else if (shipment.returnOfDocuments === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'saturdayDelivery':
                        if (shipment.saturdayDelivery === true) {
                            value = '1';
                        } else if (shipment.saturdayDelivery === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'carbonNeutral':
                        if (shipment.carbonNeutral === true) {
                            value = '1';
                        } else if (shipment.carbonNeutral === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'largePackage':
                        if (shipment.largePackage === true) {
                            value = '1';
                        } else if (shipment.largePackage === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'additionalHandling':
                        if (shipment.additionalHandling === true) {
                            value = '1';
                        } else if (shipment.additionalHandling === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'upsPremiumCare':
                        if (shipment.upsPremiumCare === true) {
                            value = '1';
                        } else if (shipment.upsPremiumCare === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'weekendCommercialDelivery':
                        if (shipment.weekendCommercialDelivery === true) {
                            value = '1';
                        } else if (shipment.weekendCommercialDelivery === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonAlone':
                        if (shipment.lithiumIonAlone === true) {
                            value = '1';
                        } else if (shipment.lithiumIonAlone === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonInEquipment':
                        if (shipment.lithiumIonInEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumIonInEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonWithEquipment':
                        if (shipment.lithiumIonWithEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumIonWithEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalAlone':
                        if (shipment.lithiumMetalAlone === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalAlone === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalInEquipment':
                        if (shipment.lithiumMetalInEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalInEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalWithEquipment':
                        if (shipment.lithiumMetalWithEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalWithEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'upsSurePostLimitedQuantity':
                        if (shipment.upsSurePostLimitedQuantity === true) {
                            value = '1';
                        } else if (shipment.upsSurePostLimitedQuantity === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'adlDeliverToAddressee':
                        if (shipment.adlDeliverToAddressee === true) {
                            value = '1';
                        } else if (shipment.adlDeliverToAddressee === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'adlDirectDeliveryOnly':
                        if (shipment.adlDirectDeliveryOnly === true) {
                            value = '1';
                        } else if (shipment.adlDirectDeliveryOnly === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'electronicPackageReleaseAuth':
                        value = shipment.electronicPackageRelease || shipment.electronicPackageReleaseAuth || '';
                        break;
                    // E-Mail-Benachrichtigungen
                    case 'emailNotification1Ship':
                    case 'emailNotification1Exception':
                    case 'emailNotification1Delivery':
                    case 'emailNotification2Ship':
                    case 'emailNotification2Exception':
                    case 'emailNotification2Delivery':
                    case 'emailNotification3Ship':
                    case 'emailNotification3Exception':
                    case 'emailNotification3Delivery':
                    case 'emailNotification4Ship':
                    case 'emailNotification4Exception':
                    case 'emailNotification4Delivery':
                    case 'emailNotification5Ship':
                    case 'emailNotification5Exception':
                    case 'emailNotification5Delivery':
                        if (shipment[fieldConfig.key] === true) {
                            value = '1';
                        } else if (shipment[fieldConfig.key] === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                }
                
                // XML-Tag-Name aus UPS-Feldname erstellen
                const xmlTagName = upsFieldName.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/^-+|-+$/g, '');
                
                xmlContent += `      <${xmlTagName}>${this.escapeXMLField(String(value))}</${xmlTagName}>\n`;
            });
            
            xmlContent += `    </shipment>\n`;
        });
        
        xmlContent += '  </shipments>\n';
        xmlContent += '</ups-batch>\n';
        
        return xmlContent;
    }

    // Export zu SSV - Semikolon-getrennte Werte, vollständig UPS-kompatibel
    exportToSSV(shipments) {
        if (!window.UPS_FIELD_ORDER || !window.UPS_FIELDS) {
            console.error('UPS_FIELD_ORDER oder UPS_FIELDS nicht verfügbar - ups-fields.js nicht geladen');
            throw new Error('UPS-Feldkonfiguration nicht verfügbar');
        }

        // UPS-Header in exakter Reihenfolge wie von UPS spezifiziert
        const headers = window.UPS_FIELD_ORDER;
        let ssvContent = headers.join(';') + '\n';
        
        shipments.forEach(shipment => {
            const row = window.UPS_FIELD_ORDER.map(upsFieldName => {
                const fieldConfig = window.UPS_FIELDS[upsFieldName];
                if (!fieldConfig) {
                    console.warn(`Feldkonfiguration für ${upsFieldName} nicht gefunden`);
                    return '';
                }
                
                let value = '';
                
                // Wert aus Sendungsdaten extrahieren
                if (shipment[fieldConfig.key] !== undefined && shipment[fieldConfig.key] !== null) {
                    value = shipment[fieldConfig.key];
                }
                
                // UPS-spezifische Feldverarbeitung
                if (window.FIELD_HELPERS && window.FIELD_HELPERS.processFieldForExport) {
                    value = window.FIELD_HELPERS.processFieldForExport(upsFieldName, value, shipment);
                }
                
                // Standardwerte für leere Felder
                if (value === '' && window.DEFAULT_VALUES && window.DEFAULT_VALUES[fieldConfig.key]) {
                    value = window.DEFAULT_VALUES[fieldConfig.key];
                }
                
                // Spezielle Behandlung für bestimmte Felder (gleiche Logik wie CSV)
                switch (fieldConfig.key) {
                    case 'telephone':
                        value = shipment.phone || shipment.telephone || '';
                        break;
                    case 'packagingType':
                        value = shipment.packageType || shipment.packagingType || '';
                        break;
                    case 'service':
                        value = shipment.serviceType || shipment.service || '';
                        break;
                    case 'goodsDescription':
                        value = shipment.description || shipment.goodsDescription || '';
                        break;
                    case 'declaredValue':
                        value = shipment.packageDeclaredValue || shipment.declaredValue || '';
                        break;
                    case 'reference1':
                        value = shipment.reference || shipment.reference1 || '';
                        break;
                    case 'residential':
                        // Nur wenn explizit gesetzt, sonst leer lassen
                        if (shipment.residential === true) {
                            value = '1';
                        } else if (shipment.residential === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'documentsNoCommercialValue':
                        if (shipment.documentsNoCommercialValue === true) {
                            value = '1';
                        } else if (shipment.documentsNoCommercialValue === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'gnifc':
                        if (shipment.gnifc === true) {
                            value = '1';
                        } else if (shipment.gnifc === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'shipperRelease':
                        if (shipment.shipperRelease === true) {
                            value = '1';
                        } else if (shipment.shipperRelease === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'returnOfDocument':
                        if (shipment.returnOfDocuments === true) {
                            value = '1';
                        } else if (shipment.returnOfDocuments === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'saturdayDelivery':
                        if (shipment.saturdayDelivery === true) {
                            value = '1';
                        } else if (shipment.saturdayDelivery === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'carbonNeutral':
                        if (shipment.carbonNeutral === true) {
                            value = '1';
                        } else if (shipment.carbonNeutral === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'largePackage':
                        if (shipment.largePackage === true) {
                            value = '1';
                        } else if (shipment.largePackage === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'additionalHandling':
                        if (shipment.additionalHandling === true) {
                            value = '1';
                        } else if (shipment.additionalHandling === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'upsPremiumCare':
                        if (shipment.upsPremiumCare === true) {
                            value = '1';
                        } else if (shipment.upsPremiumCare === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'weekendCommercialDelivery':
                        if (shipment.weekendCommercialDelivery === true) {
                            value = '1';
                        } else if (shipment.weekendCommercialDelivery === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonAlone':
                        if (shipment.lithiumIonAlone === true) {
                            value = '1';
                        } else if (shipment.lithiumIonAlone === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonInEquipment':
                        if (shipment.lithiumIonInEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumIonInEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumIonWithEquipment':
                        if (shipment.lithiumIonWithEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumIonWithEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalAlone':
                        if (shipment.lithiumMetalAlone === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalAlone === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalInEquipment':
                        if (shipment.lithiumMetalInEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalInEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'lithiumMetalWithEquipment':
                        if (shipment.lithiumMetalWithEquipment === true) {
                            value = '1';
                        } else if (shipment.lithiumMetalWithEquipment === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'upsSurePostLimitedQuantity':
                        if (shipment.upsSurePostLimitedQuantity === true) {
                            value = '1';
                        } else if (shipment.upsSurePostLimitedQuantity === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'adlDeliverToAddressee':
                        if (shipment.adlDeliverToAddressee === true) {
                            value = '1';
                        } else if (shipment.adlDeliverToAddressee === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'adlDirectDeliveryOnly':
                        if (shipment.adlDirectDeliveryOnly === true) {
                            value = '1';
                        } else if (shipment.adlDirectDeliveryOnly === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                    case 'electronicPackageReleaseAuth':
                        value = shipment.electronicPackageRelease || shipment.electronicPackageReleaseAuth || '';
                        break;
                    // E-Mail-Benachrichtigungen
                    case 'emailNotification1Ship':
                    case 'emailNotification1Exception':
                    case 'emailNotification1Delivery':
                    case 'emailNotification2Ship':
                    case 'emailNotification2Exception':
                    case 'emailNotification2Delivery':
                    case 'emailNotification3Ship':
                    case 'emailNotification3Exception':
                    case 'emailNotification3Delivery':
                    case 'emailNotification4Ship':
                    case 'emailNotification4Exception':
                    case 'emailNotification4Delivery':
                    case 'emailNotification5Ship':
                    case 'emailNotification5Exception':
                    case 'emailNotification5Delivery':
                        if (shipment[fieldConfig.key] === true) {
                            value = '1';
                        } else if (shipment[fieldConfig.key] === false) {
                            value = '0';
                        } else {
                            value = '';
                        }
                        break;
                }
                
                // SSV-Formatierung anwenden
                return this.escapeSSVField(String(value));
            });
            
            ssvContent += row.join(';') + '\n';
        });
        
        return ssvContent;
    }

    // XML-Feld escapen
    escapeXMLField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        return str.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&#39;');
    }

    // SSV-Feld escapen
    escapeSSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    // CSV-Feld escapen
    escapeCSVField(field) {
        if (field === null || field === undefined) {
            return '';
        }
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    // MIME-Type ermitteln
    getMimeType(format) {
        switch (format) {
            case 'csv': 
                return 'text/csv;charset=utf-8';
            case 'xml': 
                return 'application/xml;charset=utf-8';
            case 'ssv': 
                return 'text/plain;charset=utf-8';
            default: 
                return 'text/plain;charset=utf-8';
        }
    }

    // Datei herunterladen
    downloadFile(content, filename, format) {
        const mimeType = this.getMimeType(format);
        
        // Für SSV: BOM hinzufügen für bessere Excel-Kompatibilität
        let fileContent = content;
        if (format === 'ssv') {
            // BOM (Byte Order Mark) für UTF-8
            fileContent = '\uFEFF' + content;
        }
        
        const blob = new Blob([fileContent], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    // Export-Statistiken für Debugging
    getExportStatistics() {
        const shipments = window.shipmentManager?.getAllShipments() || [];
        const validShipments = shipments.filter(s => s.isValid);
        const invalidShipments = shipments.filter(s => !s.isValid);
        
        return {
            total: shipments.length,
            valid: validShipments.length,
            invalid: invalidShipments.length,
            validPercentage: shipments.length > 0 ? Math.round((validShipments.length / shipments.length) * 100) : 0,
            totalWeight: validShipments.reduce((sum, s) => sum + (parseFloat(s.weight) || 0), 0),
            countries: [...new Set(validShipments.map(s => s.country).filter(Boolean))],
            services: [...new Set(validShipments.map(s => s.service).filter(Boolean))]
        };
    }
}

// Globale Instanz für Rückwärtskompatibilität
window.exportHandler = new ExportHandlerDE();
