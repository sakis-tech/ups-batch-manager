/**
 * Modal System für die deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet dynamische Modal-Dialoge mit Features wie:
 * - Verschiedene Größen und Layouts
 * - Formular-Integration mit Validierung
 * - Tastatur-Navigation (ESC zum Schließen)
 * - Backdrop-Handling und Focus-Management
 * 
 * @class ModalSystem
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class ModalSystem {
    /**
     * Initialisiert das Modal-System
     * 
     * @constructor
     */
    constructor() {
        /** @type {Map<string, Object>} Alle registrierten Modals */
        this.modals = new Map();
        
        /** @type {string|null} ID des aktuell geöffneten Modals */
        this.currentModal = null;
        
        this.initialize();
    }

    initialize() {
        // Modal Container erstellen falls nicht vorhanden
        if (!document.getElementById('modalContainer')) {
            const container = document.createElement('div');
            container.id = 'modalContainer';
            container.className = 'modal-container';
            document.body.appendChild(container);
        }

        // Event-Listener für ESC-Taste
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });

        // Event-Listener für Klick außerhalb des Modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-container') && this.currentModal) {
                this.closeModal();
            }
        });
    }

    /**
     * Erstellt ein neues Modal mit der angegebenen Konfiguration
     * 
     * @param {string} id - Eindeutige ID für das Modal
     * @param {Object} config - Konfigurationsobjekt
     * @param {string} config.title - Titel des Modals
     * @param {string|Function} config.content - Inhalt des Modals
     * @param {string} config.size - Größe (small, medium, large, extra-large)
     * @param {boolean} config.closable - Ob das Modal schließbar ist
     * @param {Array} config.buttons - Array der Buttons
     * @returns {Object} Das erstellte Modal-Objekt
     */
    createModal(id, config) {
        const modal = {
            id,
            title: config.title || 'Modal',
            content: config.content || '',
            size: config.size || 'medium',
            closable: config.closable !== false,
            backdrop: config.backdrop !== false,
            onShow: config.onShow || null,
            onHide: config.onHide || null,
            onConfirm: config.onConfirm || null,
            onCancel: config.onCancel || null,
            buttons: config.buttons || []
        };

        this.modals.set(id, modal);
        return modal;
    }

    // Modal anzeigen
    showModal(id, data = {}) {
        const modal = this.modals.get(id);
        if (!modal) {
            console.error(`Modal mit ID "${id}" nicht gefunden`);
            return;
        }

        // Aktuelles Modal schließen
        if (this.currentModal) {
            this.closeModal();
        }

        this.currentModal = id;
        const container = document.getElementById('modalContainer');
        
        // Modal HTML erstellen
        const modalHTML = this.renderModal(modal, data);
        container.innerHTML = modalHTML;
        container.classList.add('active');

        // Event-Listener für Buttons
        this.attachModalListeners(modal, data);
        
        // Unsaved Changes Monitoring für Formulare starten
        if (id.includes('shipment') || id.includes('edit')) {
            const form = container.querySelector('form');
            if (form && window.unsavedChangesManager) {
                const shipmentId = data.shipment ? data.shipment.id : null;
                setTimeout(() => {
                    window.unsavedChangesManager.startMonitoring(form, shipmentId);
                }, 100);
            }
        }

        // Body-Scroll deaktivieren
        document.body.style.overflow = 'hidden';

        // onShow-Callback
        if (modal.onShow) {
            modal.onShow(data);
        }

        // Animation
        const modalElement = container.querySelector('.modal');
        if (modalElement) {
            modalElement.classList.add('animate-slideUp');
        }

        return modal;
    }

    // Modal schließen
    closeModal() {
        if (!this.currentModal) return;

        const modal = this.modals.get(this.currentModal);
        const container = document.getElementById('modalContainer');

        // Unsaved Changes Monitoring stoppen
        if (window.unsavedChangesManager) {
            window.unsavedChangesManager.stopMonitoring();
        }

        // onHide-Callback
        if (modal && modal.onHide) {
            modal.onHide();
        }

        // Modal verstecken
        container.classList.remove('active');
        container.innerHTML = '';

        // Body-Scroll aktivieren
        document.body.style.overflow = '';

        this.currentModal = null;
    }

    // Modal HTML rendern
    renderModal(modal, data) {
        const sizeClass = `modal-${modal.size}`;
        const closableClass = modal.closable ? '' : 'modal-no-close';

        return `
            <div class="modal ${sizeClass} ${closableClass}">
                <div class="modal-header">
                    <h3 class="modal-title">${modal.title}</h3>
                    ${modal.closable ? '<button class="modal-close" aria-label="Schließen"><i class="fas fa-times"></i></button>' : ''}
                </div>
                <div class="modal-body">
                    ${typeof modal.content === 'function' ? modal.content(data) : modal.content}
                </div>
                ${modal.buttons.length > 0 ? this.renderModalFooter(modal) : ''}
            </div>
        `;
    }

    // Modal Footer rendern
    renderModalFooter(modal) {
        const buttonsHTML = modal.buttons.map((button, index) => {
            const btnClass = button.class || 'btn-secondary';
            const btnAction = typeof button.action === 'function' ? `custom-${index}` : (button.action || 'close');
            const btnIcon = button.icon ? `<i class="${button.icon}"></i>` : '';
            
            return `
                <button class="btn ${btnClass}" data-action="${btnAction}" data-index="${index}" ${button.disabled ? 'disabled' : ''}>
                    ${btnIcon}
                    ${button.text}
                </button>
            `;
        }).join('');

        return `
            <div class="modal-footer">
                ${buttonsHTML}
            </div>
        `;
    }

    // Event-Listener für Modal
    attachModalListeners(modal, data) {
        const container = document.getElementById('modalContainer');

        // Schließen-Button
        const closeBtn = container.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Footer-Buttons
        const buttons = container.querySelectorAll('.modal-footer button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = button.dataset.action;
                
                switch (action) {
                    case 'close':
                        this.closeModal();
                        break;
                    case 'confirm':
                        if (modal.onConfirm) {
                            const result = modal.onConfirm(data);
                            if (result !== false) {
                                this.closeModal();
                            }
                        }
                        break;
                    case 'save':
                        if (modal.save) {
                            const result = modal.save(data);
                            if (result !== false) {
                                this.closeModal();
                            }
                        } else if (modal.onConfirm) {
                            const result = modal.onConfirm(data);
                            if (result !== false) {
                                this.closeModal();
                            }
                        }
                        break;
                    case 'cancel':
                        if (modal.onCancel) {
                            modal.onCancel(data);
                        }
                        this.closeModal();
                        break;
                    default:
                        // Custom-Action - prüfen ob es eine Custom-Funktion ist
                        if (action.startsWith('custom-')) {
                            const buttonIndex = parseInt(button.dataset.index);
                            const buttonConfig = modal.buttons[buttonIndex];
                            if (buttonConfig && typeof buttonConfig.action === 'function') {
                                buttonConfig.action(data);
                            }
                        } else if (modal[action]) {
                            const result = modal[action](data);
                            if (result !== false) {
                                this.closeModal();
                            }
                        }
                        break;
                }
            });
        });
    }

    // Vordefinierte Modals
    showConfirmDialog(title, message, onConfirm, onCancel) {
        const modalId = 'confirmDialog';
        
        if (!this.modals.has(modalId)) {
            this.createModal(modalId, {
                title: title || 'Bestätigung',
                size: 'small',
                content: (data) => `
                    <div class="confirm-dialog">
                        <div class="confirm-icon">
                            <i class="fas fa-question-circle"></i>
                        </div>
                        <p>${data.message}</p>
                    </div>
                `,
                buttons: [
                    { text: 'Abbrechen', class: 'btn-secondary', action: 'cancel' },
                    { text: 'Bestätigen', class: 'btn-primary', action: 'confirm' }
                ],
                onConfirm: onConfirm,
                onCancel: onCancel
            });
        }

        return this.showModal(modalId, { message });
    }

    showAlertDialog(title, message, type = 'info') {
        const modalId = 'alertDialog';
        
        if (!this.modals.has(modalId)) {
            this.createModal(modalId, {
                title: title || 'Hinweis',
                size: 'small',
                content: (data) => `
                    <div class="alert-dialog">
                        <div class="alert-icon ${data.type}">
                            <i class="fas fa-${this.getAlertIcon(data.type)}"></i>
                        </div>
                        <p>${data.message}</p>
                    </div>
                `,
                buttons: [
                    { text: 'OK', class: 'btn-primary', action: 'close' }
                ]
            });
        }

        return this.showModal(modalId, { message, type });
    }

    showValidationAlert(title, message, type = 'error', missingFields = []) {
        const modalId = 'validationAlertDialog';
        
        if (!this.modals.has(modalId)) {
            this.createModal(modalId, {
                title: title || 'Validation Error',
                size: 'small',
                content: (data) => `
                    <div class="alert-dialog">
                        <div class="alert-icon ${data.type}">
                            <i class="fas fa-${this.getAlertIcon(data.type)}"></i>
                        </div>
                        <p>${data.message}</p>
                    </div>
                `,
                buttons: [
                    { 
                        text: 'Zu den Feldern', 
                        class: 'btn-primary', 
                        action: (data) => {
                            this.highlightMissingFields(data.missingFields);
                            this.closeModal();
                        }
                    }
                ]
            });
        }

        return this.showModal(modalId, { message, type, missingFields });
    }

    showLoadingModal(title, message) {
        const modalId = 'loadingModal';
        
        if (!this.modals.has(modalId)) {
            this.createModal(modalId, {
                title: title || 'Lädt...',
                size: 'small',
                closable: false,
                backdrop: false,
                content: (data) => `
                    <div class="loading-modal">
                        <div class="loading-spinner"></div>
                        <p>${data.message}</p>
                    </div>
                `
            });
        }

        return this.showModal(modalId, { message });
    }

    getAlertIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'error': 'times-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Sendung erstellen Modal
    showCreateShipmentModal() {
        const modalId = 'createShipmentModal';
        
        if (!this.modals.has(modalId)) {
            this.createModal(modalId, {
                title: 'Neue Sendung erstellen',
                size: 'extra-large',
                content: this.getShipmentFormContent.bind(this),
                buttons: [
                    { text: 'Abbrechen', class: 'btn-secondary', action: 'cancel' },
                    { text: 'Speichern', class: 'btn-primary', action: 'save' }
                ],
                onConfirm: this.saveShipment.bind(this),
                save: this.saveShipment.bind(this)
            });
        }

        return this.showModal(modalId);
    }

    // Sendung bearbeiten Modal
    showEditShipmentModal(shipment) {
        const modalId = 'editShipmentModal';
        
        if (!this.modals.has(modalId)) {
            this.createModal(modalId, {
                title: 'Sendung bearbeiten',
                size: 'extra-large',
                content: this.getShipmentFormContent.bind(this),
                buttons: [
                    { text: 'Abbrechen', class: 'btn-secondary', action: 'cancel' },
                    { text: 'Speichern', class: 'btn-primary', action: 'save' }
                ],
                onConfirm: this.updateShipment.bind(this),
                save: this.updateShipment.bind(this)
            });
        }

        return this.showModal(modalId, { shipment });
    }

    // Sendungs-Formular Content
    getShipmentFormContent(data) {
        const shipment = data?.shipment || {};
        
        return `
            <form id="shipmentForm" class="shipment-form accordion-form">
                <!-- Pflichtfelder - Immer sichtbar -->
                <div class="required-fields">
                    <h3><i class="fas fa-star"></i> Pflichtfelder</h3>
                    
                    <!-- Empfänger-Informationen - 2-Grid für Name/Firma und Kontaktperson -->
                    <div class="form-section">
                        <h4><i class="fas fa-user"></i> Empfänger-Informationen</h4>
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label class="form-label">Empfänger Name/Firma *</label>
                                <input type="text" name="companyName" class="form-input" required 
                                       value="${shipment.companyName || ''}" maxlength="35" placeholder="Name oder Firmenname">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Kontaktperson</label>
                                <input type="text" name="contactName" class="form-input" 
                                       value="${shipment.contactName || ''}" maxlength="35" placeholder="Name der Kontaktperson">
                            </div>
                        </div>
                        
                        <!-- Straße - 1-Grid (volle Breite) -->
                        <div class="form-grid-1">
                            <div class="form-group">
                                <label class="form-label">Straße und Hausnummer *</label>
                                <input type="text" name="address1" class="form-input" required 
                                       value="${shipment.address1 || ''}" maxlength="35" placeholder="Straße, Hausnummer">
                            </div>
                        </div>
                        
                        <!-- Land, PLZ, Stadt - 3-Grid -->
                        <div class="form-grid-3">
                            <div class="form-group">
                                <label class="form-label">Land *</label>
                                <select name="country" class="form-select" required onchange="updateCountryDependentFields(this.value)">
                                    ${this.getCountryOptions(shipment.country)}
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Postleitzahl *</label>
                                <input type="text" name="postalCode" class="form-input" required 
                                       value="${shipment.postalCode || ''}" maxlength="10" placeholder="PLZ">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Stadt *</label>
                                <input type="text" name="city" class="form-input" required 
                                       value="${shipment.city || ''}" maxlength="30" placeholder="Stadt">
                            </div>
                        </div>
                    </div>

                    <!-- Paket-Grundinformationen -->
                    <div class="form-section">
                        <h4><i class="fas fa-box"></i> Paket-Grundinformationen</h4>
                        <!-- Gewicht und Verpackung - 2-Grid -->
                        <div class="form-grid-2">
                            <div class="form-group">
                                <label class="form-label">Gewicht *</label>
                                <div class="input-group">
                                    <input type="number" name="weight" class="form-input" required 
                                           value="${shipment.weight || '1.0'}" min="0.1" max="70" step="0.1" placeholder="Gewicht">
                                    <select name="unitOfMeasure" class="input-suffix-select">
                                        <option value="KG" ${shipment.unitOfMeasure === 'KG' ? 'selected' : ''}>kg</option>
                                        <option value="LB" ${shipment.unitOfMeasure === 'LB' ? 'selected' : ''}>lbs</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Verpackungsart *</label>
                                <select name="packagingType" class="form-select" required>
                                    ${this.getPackagingOptions(shipment.packagingType)}
                                </select>
                            </div>
                        </div>
                        
                        <!-- Service-Art - 1-Grid -->
                        <div class="form-grid-1">
                            <div class="form-group">
                                <label class="form-label">Service-Art *</label>
                                <select name="serviceType" class="form-select" required>
                                    ${this.getServiceOptions(shipment.serviceType)}
                                </select>
                            </div>
                        </div>
                        
                        <!-- Paket-Abmessungen - 3-Grid für Länge, Breite, Höhe -->
                        <div class="form-grid-3">
                            <div class="form-group">
                                <label class="form-label">Länge</label>
                                <div class="input-group">
                                    <input type="number" name="length" class="form-input" 
                                           value="${shipment.length || ''}" min="1" max="270" placeholder="Länge">
                                    <span class="input-suffix">cm</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Breite</label>
                                <div class="input-group">
                                    <input type="number" name="width" class="form-input" 
                                           value="${shipment.width || ''}" min="1" max="270" placeholder="Breite">
                                    <span class="input-suffix">cm</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Höhe</label>
                                <div class="input-group">
                                    <input type="number" name="height" class="form-input" 
                                           value="${shipment.height || ''}" min="1" max="270" placeholder="Höhe">
                                    <span class="input-suffix">cm</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Paket-Wert - 1-Grid -->
                        <div class="form-grid-1">
                            <div class="form-group">
                                <label class="form-label">Paket-Deklarationswert</label>
                                <div class="input-group">
                                    <input type="number" name="packageDeclaredValue" class="form-input" 
                                           value="${shipment.packageDeclaredValue || ''}" min="0" max="99999" step="0.01" placeholder="Wert des Pakets">
                                    <span class="input-suffix">€</span>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Service-Optionen -->
                        <div class="form-subsection">
                            <h5>Service-Optionen</h5>
                            <!-- Zustellbestätigung - 1-Grid -->
                            <div class="form-grid-1">
                                <div class="form-group">
                                    <label class="form-label">Zustellbestätigung</label>
                                    <select name="deliveryConfirm" class="form-select">
                                        ${this.getDeliveryConfirmOptions(shipment.deliveryConfirm)}
                                    </select>
                                </div>
                            </div>
                            
                            <!-- Referenzen - 3-Grid -->
                            <div class="form-grid-3">
                                <div class="form-group">
                                    <label class="form-label">Referenz 1</label>
                                    <input type="text" name="reference1" class="form-input" 
                                           placeholder="Referenz 1" value="${shipment.reference1 || ''}" maxlength="35">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Referenz 2</label>
                                    <input type="text" name="reference2" class="form-input" 
                                           placeholder="Referenz 2" value="${shipment.reference2 || ''}" maxlength="35">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Referenz 3</label>
                                    <input type="text" name="reference3" class="form-input" 
                                           placeholder="Referenz 3" value="${shipment.reference3 || ''}" maxlength="35">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Accordion Sections -->
                <div class="accordion-container">
                    <!-- Erweiterte Empfänger-Informationen -->
                    <div class="accordion-section">
                        <div class="accordion-header" onclick="toggleAccordion('recipient-details')">
                            <h4><i class="fas fa-user-plus"></i> Erweiterte Empfänger-Informationen</h4>
                            <i class="fas fa-chevron-down accordion-icon"></i>
                        </div>
                        <div id="recipient-details" class="accordion-content">
                            <!-- Zusätzliche Adressen - 2-Grid -->
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">Adresse 2</label>
                                    <input type="text" name="address2" class="form-input" 
                                           value="${shipment.address2 || ''}" maxlength="35" placeholder="Zusätzliche Adresse">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Adresse 3</label>
                                    <input type="text" name="address3" class="form-input" 
                                           value="${shipment.address3 || ''}" maxlength="35" placeholder="Weitere Adresse">
                                </div>
                            </div>
                            
                            <!-- Bundesland, Telefon, E-Mail - 3-Grid -->
                            <div class="form-grid-3">
                                <div class="form-group">
                                    <label class="form-label">Bundesland/Provinz</label>
                                    <input type="text" name="state" class="form-input" 
                                           value="${shipment.state || ''}" maxlength="5" placeholder="Für USA/Kanada erforderlich">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Telefon</label>
                                    <input type="tel" name="telephone" class="form-input" 
                                           value="${shipment.telephone || ''}" maxlength="15" placeholder="Telefonnummer">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">E-Mail</label>
                                    <input type="email" name="email" class="form-input" 
                                           value="${shipment.email || ''}" maxlength="50" placeholder="E-Mail-Adresse">
                                </div>
                            </div>
                            
                            <!-- Durchwahl und Privatadresse - 2-Grid -->
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">Durchwahl</label>
                                    <input type="text" name="extension" class="form-input" 
                                           value="${shipment.extension || ''}" maxlength="4" placeholder="Telefon-Durchwahl">
                                </div>
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="residential" ${shipment.residential ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Privatadresse (Wohnadresse statt Geschäftsadresse)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Internationale Sendungen -->
                    <div class="accordion-section">
                        <div class="accordion-header" onclick="toggleAccordion('international-details')">
                            <h4><i class="fas fa-globe"></i> Internationale Sendungen</h4>
                            <i class="fas fa-chevron-down accordion-icon"></i>
                        </div>
                        <div id="international-details" class="accordion-content">
                            <!-- Warenbeschreibung - 1-Grid -->
                            <div class="form-grid-1">
                                <div class="form-group">
                                    <label class="form-label">Warenbeschreibung</label>
                                    <input type="text" name="goodsDescription" class="form-input" 
                                           value="${shipment.goodsDescription || ''}" maxlength="50" placeholder="Beschreibung der Waren">
                                    <div class="form-help">Erforderlich für internationale Sendungen</div>
                                </div>
                            </div>
                            
                            <!-- Zollwert und GNIFC - 2-Grid -->
                            <div class="form-grid-2">
                                <div class="form-group">
                                    <label class="form-label">Zollwert</label>
                                    <div class="input-group">
                                        <input type="number" name="customsValue" class="form-input" 
                                               value="${shipment.customsValue || ''}" min="0" max="99999" step="0.01" placeholder="Zollwert">
                                        <span class="input-suffix">€</span>
                                    </div>
                                    <div class="form-help">Erforderlich für internationale Sendungen</div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">GNIFC</label>
                                    <input type="text" name="gnifc" class="form-input" 
                                           value="${shipment.gnifc || ''}" maxlength="15" placeholder="GNIFC-Code">
                                    <div class="form-help">Goods Not In Free Circulation</div>
                                </div>
                            </div>
                            
                            <!-- Dokumente ohne Wert - 1-Grid -->
                            <div class="form-grid-1">
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="documentsNoCommercialValue" ${shipment.documentsNoCommercialValue ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Dokumente ohne kommerziellen Wert
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Erweiterte Optionen -->
                    <div class="accordion-section">
                        <div class="accordion-header" onclick="toggleAccordion('advanced-options')">
                            <h4><i class="fas fa-cog"></i> Erweiterte Optionen</h4>
                            <i class="fas fa-chevron-down accordion-icon"></i>
                        </div>
                        <div id="advanced-options" class="accordion-content">
                            <div class="form-subsection">
                                <h5>Zustelloptionen</h5>
                                <div class="checkbox-grid-2">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="saturdayDelivery" ${shipment.saturdayDelivery ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Samstag-Zustellung
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="shipperRelease" ${shipment.shipperRelease ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Versender-Freigabe
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="returnOfDocuments" ${shipment.returnOfDocuments ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Rückgabe von Dokumenten
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-subsection">
                                <h5>Paket-Spezifikationen</h5>
                                <div class="checkbox-grid-2">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="largePackage" ${shipment.largePackage ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Großpaket (>30 kg oder übergroß)
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="additionalHandling" ${shipment.additionalHandling ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Zusätzliche Behandlung erforderlich
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="carbonNeutral" ${shipment.carbonNeutral ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Klimaneutraler Versand
                                    </label>
                                </div>
                            </div>

                            <div class="form-subsection">
                                <h5>Premium Services</h5>
                                <div class="checkbox-grid-2">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="upsPremiumCare" ${shipment.upsPremiumCare ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        UPS Premium Care
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="electronicPackageRelease" ${shipment.electronicPackageRelease ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Elektronische Paket-Freigabe
                                    </label>
                                </div>
                            </div>

                            <div class="form-subsection">
                                <h5>Gefährliche Güter</h5>
                                <div class="checkbox-grid-2">
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="lithiumIonAlone" ${shipment.lithiumIonAlone ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Lithium-Ionen-Batterien (allein)
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" name="lithiumIonInEquipment" ${shipment.lithiumIonInEquipment ? 'checked' : ''}>
                                        <span class="checkbox-custom"></span>
                                        Lithium-Ionen-Batterien (in Geräten)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        `;
    }

    getRecipientFormFields(shipment) {
        return `
            <div class="form-section">
                <h4>Empfänger-Informationen</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Firma oder Name *</label>
                        <input type="text" name="companyName" class="form-input" required 
                               value="${shipment.companyName || ''}" maxlength="35">
                        <div class="form-help">Name des Empfängers oder der Firma</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Kontaktname</label>
                        <input type="text" name="contactName" class="form-input" 
                               value="${shipment.contactName || ''}" maxlength="35">
                        <div class="form-help">Name der Kontaktperson (optional)</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Adresse 1 *</label>
                        <input type="text" name="address1" class="form-input" required 
                               value="${shipment.address1 || ''}" maxlength="35">
                        <div class="form-help">Straße und Hausnummer</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Adresse 2</label>
                        <input type="text" name="address2" class="form-input" 
                               value="${shipment.address2 || ''}" maxlength="35">
                        <div class="form-help">Zusätzliche Adressinformationen</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Adresse 3</label>
                        <input type="text" name="address3" class="form-input" 
                               value="${shipment.address3 || ''}" maxlength="35">
                        <div class="form-help">Weitere Adressinformationen</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stadt *</label>
                        <input type="text" name="city" class="form-input" required 
                               value="${shipment.city || ''}" maxlength="30">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Land *</label>
                        <select name="country" class="form-select" required onchange="updateCountryDependentFields(this.value)">
                            ${this.getCountryOptions(shipment.country)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Postleitzahl *</label>
                        <input type="text" name="postalCode" class="form-input" required 
                               value="${shipment.postalCode || ''}" maxlength="10">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bundesland/Provinz</label>
                        <input type="text" name="state" class="form-input" 
                               value="${shipment.state || ''}" maxlength="5">
                        <div class="form-help">Erforderlich für USA und Kanada</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Telefon</label>
                        <input type="tel" name="telephone" class="form-input" 
                               value="${shipment.telephone || ''}" maxlength="15">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Durchwahl</label>
                        <input type="text" name="extension" class="form-input" 
                               value="${shipment.extension || ''}" maxlength="4">
                    </div>
                    <div class="form-group">
                        <label class="form-label">E-Mail</label>
                        <input type="email" name="email" class="form-input" 
                               value="${shipment.email || ''}" maxlength="50">
                    </div>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="residential" ${shipment.residential ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                        Privatadresse (Wohnadresse statt Geschäftsadresse)
                    </label>
                </div>
            </div>
        `;
    }

    getPackageFormFields(shipment) {
        return `
            <div class="form-section">
                <h4>Paket-Informationen</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Gewicht *</label>
                        <div class="input-group">
                            <input type="number" name="weight" class="form-input" required 
                                   value="${shipment.weight || '1.0'}" min="0.1" max="70" step="0.1">
                            <select name="unitOfMeasure" class="input-suffix-select">
                                <option value="KG" ${shipment.unitOfMeasure === 'KG' ? 'selected' : ''}>kg</option>
                                <option value="LB" ${shipment.unitOfMeasure === 'LB' ? 'selected' : ''}>lbs</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Verpackungsart *</label>
                        <select name="packagingType" class="form-select" required>
                            ${this.getPackagingOptions(shipment.packagingType)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Länge</label>
                        <div class="input-group">
                            <input type="number" name="length" class="form-input" 
                                   value="${shipment.length || ''}" min="1" max="270">
                            <span class="input-suffix">cm</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Breite</label>
                        <div class="input-group">
                            <input type="number" name="width" class="form-input" 
                                   value="${shipment.width || ''}" min="1" max="270">
                            <span class="input-suffix">cm</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Höhe</label>
                        <div class="input-group">
                            <input type="number" name="height" class="form-input" 
                                   value="${shipment.height || ''}" min="1" max="270">
                            <span class="input-suffix">cm</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Warenbeschreibung</label>
                        <input type="text" name="goodsDescription" class="form-input" 
                               value="${shipment.goodsDescription || ''}" maxlength="50">
                        <div class="form-help">Erforderlich für internationale Sendungen</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Zollwert</label>
                        <div class="input-group">
                            <input type="number" name="customsValue" class="form-input" 
                                   value="${shipment.customsValue || ''}" min="0" max="99999" step="0.01">
                            <span class="input-suffix">€</span>
                        </div>
                        <div class="form-help">Erforderlich für internationale Sendungen</div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Paket-Deklarationswert</label>
                        <div class="input-group">
                            <input type="number" name="packageDeclaredValue" class="form-input" 
                                   value="${shipment.packageDeclaredValue || ''}" min="0" max="99999" step="0.01">
                            <span class="input-suffix">€</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">GNIFC</label>
                        <input type="text" name="gnifc" class="form-input" 
                               value="${shipment.gnifc || ''}" maxlength="15">
                        <div class="form-help">Goods Not In Free Circulation</div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" name="documentsNoCommercialValue" ${shipment.documentsNoCommercialValue ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                        Dokumente ohne kommerziellen Wert
                    </label>
                </div>
            </div>
        `;
    }

    getServiceFormFields(shipment) {
        return `
            <div class="form-section">
                <h4>Service-Optionen</h4>
                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label">Service-Art *</label>
                        <select name="serviceType" class="form-select" required>
                            ${this.getServiceOptions(shipment.serviceType)}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Zustellbestätigung</label>
                        <select name="deliveryConfirm" class="form-select">
                            ${this.getDeliveryConfirmOptions(shipment.deliveryConfirm)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Referenzen</label>
                    <div class="form-grid">
                        <input type="text" name="reference1" class="form-input" 
                               placeholder="Referenz 1" value="${shipment.reference1 || ''}" maxlength="35">
                        <input type="text" name="reference2" class="form-input" 
                               placeholder="Referenz 2" value="${shipment.reference2 || ''}" maxlength="35">
                        <input type="text" name="reference3" class="form-input" 
                               placeholder="Referenz 3" value="${shipment.reference3 || ''}" maxlength="35">
                    </div>
                </div>
            </div>
        `;
    }

    getOptionsFormFields(shipment) {
        return `
            <div class="form-section">
                <h4>Zusätzliche Optionen</h4>
                <div class="form-subsection">
                    <h5>Zustelloptionen</h5>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="saturdayDelivery" ${shipment.saturdayDelivery ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Samstag-Zustellung
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="shipperRelease" ${shipment.shipperRelease ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Versender-Freigabe (Zustellung ohne Unterschrift)
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="returnOfDocuments" ${shipment.returnOfDocuments ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Rückgabe von Dokumenten
                        </label>
                    </div>
                </div>
                
                <div class="form-subsection">
                    <h5>Paket-Spezifikationen</h5>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="largePackage" ${shipment.largePackage ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Großpaket (>30 kg oder übergroß)
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="additionalHandling" ${shipment.additionalHandling ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Zusätzliche Behandlung erforderlich
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="carbonNeutral" ${shipment.carbonNeutral ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Klimaneutraler Versand
                        </label>
                    </div>
                </div>

                <div class="form-subsection">
                    <h5>Premium Services</h5>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="upsPremiumCare" ${shipment.upsPremiumCare ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            UPS Premium Care
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="electronicPackageRelease" ${shipment.electronicPackageRelease ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Elektronische Paket-Freigabe-Authentifizierung
                        </label>
                    </div>
                </div>

                <div class="form-subsection">
                    <h5>Gefährliche Güter</h5>
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" name="lithiumIonAlone" ${shipment.lithiumIonAlone ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Lithium-Ionen-Batterien (allein)
                        </label>
                        <label class="checkbox-label">
                            <input type="checkbox" name="lithiumIonInEquipment" ${shipment.lithiumIonInEquipment ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            Lithium-Ionen-Batterien (in Geräten)
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    getCountryOptions(selected) {
        return UPS_FIELDS.Country.options.map(option => 
            `<option value="${option.value}" ${selected === option.value ? 'selected' : ''}>${option.label}</option>`
        ).join('');
    }

    getPackagingOptions(selected) {
        return UPS_FIELDS['Packaging Type'].options.map(option => 
            `<option value="${option.value}" ${selected === option.value ? 'selected' : ''}>${option.label}</option>`
        ).join('');
    }

    getServiceOptions(selected) {
        return UPS_FIELDS.Service.options.map(option => 
            `<option value="${option.value}" ${selected === option.value ? 'selected' : ''}>${option.label}</option>`
        ).join('');
    }

    getDeliveryConfirmOptions(selected) {
        return UPS_FIELDS['Delivery Confirmation'].options.map(option => 
            `<option value="${option.value}" ${selected === option.value ? 'selected' : ''}>${option.label}</option>`
        ).join('');
    }

    saveShipment(data) {
        const form = document.getElementById('shipmentForm');
        if (!form) {
            console.error('Formular nicht gefunden');
            return false;
        }

        const formData = new FormData(form);
        const shipmentData = {};

        // Alle Formularfelder extrahieren
        for (let [key, value] of formData.entries()) {
            shipmentData[key] = value;
        }

        // Checkboxes separat verarbeiten (da sie nicht in FormData erscheinen wenn nicht gecheckt)
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            shipmentData[checkbox.name] = checkbox.checked;
        });

        // Validation
        if (!this.validateShipmentData(shipmentData)) {
            return false;
        }

        // Eindeutige ID generieren
        shipmentData.id = Date.now().toString();
        shipmentData.createdAt = new Date().toISOString();

        // Save to storage
        if (window.shipmentManager) {
            window.shipmentManager.addShipment(shipmentData);
            
            // Toast-Benachrichtigung
            if (window.toastSystem) {
                window.toastSystem.showSuccess('Sendung wurde erfolgreich erstellt.');
            }
        } else {
            console.error('ShipmentManager nicht verfügbar');
            if (window.toastSystem) {
                window.toastSystem.showError('Fehler beim Speichern der Sendung.');
            }
            return false;
        }
        
        // Log activity
        if (window.activityLogger) {
            window.activityLogger.logShipmentCreated(shipmentData);
        }

        // Update UI
        if (window.appDE) {
            window.appDE.updateStats();
            window.appDE.renderShipmentsTable();
        }

        return true;
    }

    updateShipment(data) {
        const form = document.getElementById('shipmentForm');
        if (!form) {
            console.error('Formular nicht gefunden');
            return false;
        }

        const formData = new FormData(form);
        const shipmentData = {};

        // Alle Formularfelder extrahieren
        for (let [key, value] of formData.entries()) {
            shipmentData[key] = value;
        }

        // Checkboxes separat verarbeiten
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            shipmentData[checkbox.name] = checkbox.checked;
        });

        // Validation
        if (!this.validateShipmentData(shipmentData)) {
            return false;
        }

        // Update in storage
        if (window.shipmentManager && data.shipment) {
            // Vorherigen Zustand für Undo speichern
            const previousState = { ...data.shipment };
            
            // ID und Erstellungsdatum beibehalten
            shipmentData.id = data.shipment.id;
            shipmentData.createdAt = data.shipment.createdAt;
            shipmentData.updatedAt = new Date().toISOString();
            
            window.shipmentManager.updateShipment(data.shipment.id, shipmentData);
            
            // Toast-Benachrichtigung
            if (window.toastSystem) {
                window.toastSystem.showSuccess('Sendung wurde erfolgreich aktualisiert.');
            }
            
            // Log activity mit vorherigem Zustand
            if (window.activityLogger) {
                window.activityLogger.logShipmentUpdated(shipmentData, [], previousState);
            }
        } else {
            console.error('ShipmentManager nicht verfügbar oder Sendung nicht vorhanden');
            if (window.toastSystem) {
                window.toastSystem.showError('Fehler beim Aktualisieren der Sendung.');
            }
            return false;
        }

        // Update UI
        if (window.appDE) {
            window.appDE.updateStats();
            window.appDE.renderShipmentsTable();
        }

        return true;
    }

    validateShipmentData(data) {
        // Pflichtfelder prüfen
        const requiredFields = {
            companyName: 'Empfänger Name/Firma',
            address1: 'Straße und Hausnummer',
            city: 'Stadt',
            country: 'Land',
            postalCode: 'Postleitzahl',
            weight: 'Gewicht',
            packagingType: 'Verpackungsart',
            serviceType: 'Service-Art'
        };

        const missingFields = [];
        const missingFieldNames = [];
        for (const [field, label] of Object.entries(requiredFields)) {
            if (!data[field] || data[field].trim() === '') {
                missingFields.push(label);
                missingFieldNames.push(field);
            }
        }

        if (missingFields.length > 0) {
            const message = `Folgende Pflichtfelder fehlen:\n• ${missingFields.join('\n• ')}`;
            this.showValidationAlert('Pflichtfelder fehlen', message, 'error', missingFieldNames);
            return false;
        }

        // Gewicht validieren
        const weight = parseFloat(data.weight);
        if (isNaN(weight) || weight <= 0) {
            this.showAlertDialog('Ungültiges Gewicht', 'Bitte geben Sie ein gültiges Gewicht größer als 0 an.', 'error');
            return false;
        }

        if (weight > 70) {
            this.showAlertDialog('Gewicht zu hoch', 'Das maximale Gewicht beträgt 70 kg.', 'error');
            return false;
        }

        // E-Mail validieren (falls vorhanden)
        if (data.email && data.email.trim() !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                this.showAlertDialog('Ungültige E-Mail', 'Bitte geben Sie eine gültige E-Mail-Adresse an.', 'error');
                return false;
            }
        }

        // Postleitzahl validieren (grundlegende Prüfung)
        if (data.postalCode && data.postalCode.length < 3) {
            this.showAlertDialog('Ungültige Postleitzahl', 'Bitte geben Sie eine gültige Postleitzahl an.', 'error');
            return false;
        }

        return true;
    }

    // Accordion Toggle-Funktion
    toggleAccordion(sectionId) {
        const content = document.getElementById(sectionId);
        const header = content.previousElementSibling;
        const icon = header.querySelector('.accordion-icon');
        
        if (content.classList.contains('active')) {
            content.classList.remove('active');
            content.style.maxHeight = null;
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            content.classList.add('active');
            content.style.maxHeight = content.scrollHeight + "px";
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }

    // Fehlende Felder hervorheben und zu ihnen springen
    highlightMissingFields(missingFields) {
        if (!missingFields || missingFields.length === 0) return;

        // Zuerst alle vorherigen Hervorhebungen entfernen
        const allFields = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        allFields.forEach(field => {
            field.classList.remove('error');
            field.style.borderColor = '';
            field.style.boxShadow = '';
        });

        // Fehlende Felder hervorheben
        let firstMissingField = null;
        missingFields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"]`);
            if (field) {
                field.classList.add('error');
                field.style.borderColor = 'var(--error)';
                field.style.boxShadow = '0 0 0 3px var(--error-bg)';
                
                // Event-Listener hinzufügen, um Hervorhebung zu entfernen wenn der Benutzer tippt
                const removeErrorHighlight = () => {
                    field.classList.remove('error');
                    field.style.borderColor = '';
                    field.style.boxShadow = '';
                    field.removeEventListener('input', removeErrorHighlight);
                    field.removeEventListener('change', removeErrorHighlight);
                };
                
                field.addEventListener('input', removeErrorHighlight);
                field.addEventListener('change', removeErrorHighlight);
                
                // Das erste fehlende Feld merken
                if (!firstMissingField) {
                    firstMissingField = field;
                }
            }
        });

        // Zum ersten fehlenden Feld springen
        if (firstMissingField) {
            // Scroll to field
            firstMissingField.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Focus auf das Feld setzen (mit kurzer Verzögerung für smooth scroll)
            setTimeout(() => {
                firstMissingField.focus();
            }, 500);
        }
    }
}

// Modal System initialisieren
window.modalSystem = new ModalSystem();

// Globale Funktionen für Kompatibilität
window.showCreateShipmentModal = () => window.modalSystem.showCreateShipmentModal();
window.showEditShipmentModal = (shipment) => window.modalSystem.showEditShipmentModal(shipment);
window.showConfirmDialog = (title, message, onConfirm, onCancel) => window.modalSystem.showConfirmDialog(title, message, onConfirm, onCancel);
window.showAlertDialog = (title, message, type) => window.modalSystem.showAlertDialog(title, message, type);
window.showLoadingModal = (title, message) => window.modalSystem.showLoadingModal(title, message);
window.closeModal = () => window.modalSystem.closeModal();
window.toggleAccordion = (sectionId) => window.modalSystem.toggleAccordion(sectionId);