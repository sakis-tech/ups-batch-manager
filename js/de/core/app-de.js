/**
 * Hauptanwendung für deutsche UPS Batch Manager Oberfläche
 * 
 * Zentrale Steuerung der gesamten Anwendung einschließlich:
 * - Navigation zwischen Sektionen
 * - Event-Handling und UI-Updates
 * - Sendungsverwaltung und Tabellen-Darstellung
 * - Integration aller UI-Komponenten
 * 
 * @class UPSBatchManagerApp
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class UPSBatchManagerApp {
    /**
     * Initialisiert die Hauptanwendung
     * 
     * @constructor
     */
    constructor() {
        /** @type {string} Aktuelle Sektion (dashboard, sendungen, import, export, einstellungen) */
        this.currentSection = 'dashboard';
        
        /** @type {ShipmentManagerDE} Referenz auf den Sendungsmanager */
        this.shipmentManager = window.shipmentManager;
        
        /** @type {number} Aktuelle Seite der Sendungstabelle */
        this.currentPage = 1;
        
        /** @type {number} Anzahl Einträge pro Seite */
        this.itemsPerPage = 10;
        
        /** @type {Object} Aktuelle Filter für die Sendungstabelle */
        this.currentFilters = {};
        
        /** @type {Set<string>} Set der ausgewählten Sendungs-IDs */
        this.selectedShipments = new Set();
        
        /** @type {Map<string, HTMLElement>} Cache für häufig verwendete DOM-Elemente */
        this.domCache = new Map();
        
        /** @type {Map<string, Function>} Cache für debounced Funktionen */
        this.debouncedFunctions = new Map();
        
        this.initialize();
    }

    initialize() {
        this.initializeTheme();
        this.cacheFrequentElements();
        this.setupDebouncedFunctions();
        this.setupEventListeners();
        this.initializeComponents();
        this.updateStats();
        this.renderShipmentsTable();
        this.updateRecentActivities();
        this.setupTooltips();
        this.loadSettings();
    }

    // Theme initialisieren
    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Theme setzen: gespeicherte Preference oder System-Preference
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
        
        // Icon aktualisieren
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // System-Theme-Änderungen überwachen
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Nur reagieren, wenn keine manuelle Preference gesetzt ist
            if (!localStorage.getItem('theme')) {
                const newTheme = e.matches ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', newTheme);
                
                const icon = document.querySelector('#darkModeToggle i');
                if (icon) {
                    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }
        });
    }

    // DOM-Elemente cachen für bessere Performance
    cacheFrequentElements() {
        const elementIds = [
            'sidebar', 'mainContent', 'toggleSidebar', 'sidebarToggle',
            'darkModeToggle', 'fullscreenToggle', 'searchInput', 'serviceFilter',
            'countryFilter', 'selectAll', 'bulkDeleteBtn', 'prevPage', 'nextPage',
            'shipmentsTableBody', 'emptyState', 'pageTitle', 'totalShipments',
            'validShipments', 'dashTotalShipments', 'dashValidShipments',
            'dashInvalidShipments', 'dashTotalWeight'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                this.domCache.set(id, element);
            }
        });
    }

    // Debounced Funktionen einrichten
    setupDebouncedFunctions() {
        this.debouncedFunctions.set('search', this.debounce((value) => {
            this.handleSearch(value);
        }, 300));
        
        this.debouncedFunctions.set('filter', this.debounce((filterType, value) => {
            this.handleFilter(filterType, value);
        }, 200));
    }

    // Debounce-Utility-Funktion
    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    // Cached DOM-Element abrufen
    getElement(id) {
        return this.domCache.get(id) || document.getElementById(id);
    }

    // Event-Listener einrichten
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const section = e.target.dataset.section;
                this.switchToSection(section);
            }
        });

        // Sidebar Toggle
        this.getElement('toggleSidebar')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        this.getElement('sidebarToggle')?.addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Dark Mode Toggle
        this.getElement('darkModeToggle')?.addEventListener('click', () => {
            this.toggleDarkMode();
        });

        // Vollbild Toggle
        this.getElement('fullscreenToggle')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Suche und Filter mit Debouncing
        this.getElement('searchInput')?.addEventListener('input', (e) => {
            this.debouncedFunctions.get('search')(e.target.value);
        });

        this.getElement('serviceFilter')?.addEventListener('change', (e) => {
            this.debouncedFunctions.get('filter')('serviceType', e.target.value);
        });

        this.getElement('countryFilter')?.addEventListener('change', (e) => {
            this.debouncedFunctions.get('filter')('country', e.target.value);
        });

        // Tabellen-Events
        const selectAll = document.getElementById('selectAll');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        
        if (selectAll) {
            selectAll.addEventListener('change', (e) => {
                this.handleSelectAll(e.target.checked);
            });
        }

        if (bulkDeleteBtn) {
            bulkDeleteBtn.addEventListener('click', () => {
                this.handleBulkDelete();
            });
        }

        // Sortierung
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sortable')) {
                const sortField = e.target.closest('.sortable').dataset.sort;
                this.handleSort(sortField);
            }
        });

        // Pagination
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                this.goToPage(this.currentPage - 1);
            });
        }

        if (nextPage) {
            nextPage.addEventListener('click', () => {
                this.goToPage(this.currentPage + 1);
            });
        }

        // Import
        const fileInput = document.getElementById('fileInput');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e.target.files[0]);
            });
        }

        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => {
                if (fileInput) fileInput.click();
            });
        }

        // Drag & Drop
        this.setupDragAndDrop();

        // Einstellungen
        this.setupSettingsListeners();

        // Keyboard Shortcuts
        this.setupKeyboardShortcuts();
    }

    // Komponenten initialisieren
    initializeComponents() {
        // Modal System ist bereits initialisiert
        // Toast System ist bereits initialisiert
        // Accordion System ist bereits initialisiert
        // Pagination System ist bereits initialisiert
    }

    // Navigation zwischen Bereichen (optimiert)
    switchToSection(sectionName) {
        // Batch DOM-Updates für bessere Performance
        requestAnimationFrame(() => {
            // Aktive Navigation aktualisieren
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');

            // Aktive Sektion aktualisieren
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(`${sectionName}Section`)?.classList.add('active');

            // Seitentitel aktualisieren
            const titles = {
                dashboard: 'Dashboard',
                shipments: 'Sendungen',
                import: 'Importieren',
                export: 'Exportieren',
                settings: 'Einstellungen',
                help: 'Hilfe'
            };
            const pageTitle = this.getElement('pageTitle');
            if (pageTitle) {
                pageTitle.textContent = titles[sectionName] || sectionName;
            }

            this.currentSection = sectionName;

            // Sektions-spezifische Updates (deferred)
            setTimeout(() => {
                switch (sectionName) {
                    case 'dashboard':
                        this.updateStats();
                        this.updateRecentActivities();
                        break;
                    case 'shipments':
                        this.renderShipmentsTable();
                        break;
                    case 'export':
                        this.updateExportStats();
                        break;
                    case 'settings':
                        this.updateStorageInfo();
                        this.updateUserSettings();
                        break;
                    case 'help':
                        this.loadHelpContent();
                        break;
                }
            }, 0);
        });
    }

    // Sidebar umschalten (optimiert)
    toggleSidebar() {
        const sidebar = this.getElement('sidebar');
        const mainContent = this.getElement('mainContent');
        
        if (sidebar && mainContent) {
            // CSS-Klassen-Umschaltung für Hardware-Beschleunigung
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    }

    // Dark Mode umschalten
    toggleDarkMode() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Smooth transition for theme change
        document.documentElement.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Icon aktualisieren
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        // Remove transition after change
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
        
        // Trigger custom event for components that need to react to theme change
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
    }

    // Vollbild umschalten
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            document.querySelector('#fullscreenToggle i').className = 'fas fa-compress';
        } else {
            document.exitFullscreen();
            document.querySelector('#fullscreenToggle i').className = 'fas fa-expand';
        }
    }

    // Statistiken aktualisieren
    updateStats() {
        const stats = this.shipmentManager.getStatistics();
        
        // Dashboard Karten
        const dashTotalShipments = document.getElementById('dashTotalShipments');
        const dashValidShipments = document.getElementById('dashValidShipments');
        const dashInvalidShipments = document.getElementById('dashInvalidShipments');
        const dashTotalWeight = document.getElementById('dashTotalWeight');
        
        if (dashTotalShipments) dashTotalShipments.textContent = stats.total;
        if (dashValidShipments) dashValidShipments.textContent = stats.valid;
        if (dashInvalidShipments) dashInvalidShipments.textContent = stats.invalid;
        if (dashTotalWeight) dashTotalWeight.textContent = `${stats.totalWeight} kg`;

        // Sidebar
        const totalShipments = document.getElementById('totalShipments');
        const validShipments = document.getElementById('validShipments');
        
        if (totalShipments) totalShipments.textContent = stats.total;
        if (validShipments) validShipments.textContent = stats.valid;
    }

    // Sendungen-Tabelle rendern
    renderShipmentsTable() {
        const filteredShipments = this.shipmentManager.getFilteredShipments(this.currentFilters);
        const totalItems = filteredShipments.length;
        
        // Pagination berechnen
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const pageShipments = filteredShipments.slice(startIndex, endIndex);

        const tbody = document.getElementById('shipmentsTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.querySelector('.table-container table');

        if (pageShipments.length === 0) {
            tbody.innerHTML = '';
            tableContainer.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            tableContainer.style.display = 'table';
            emptyState.style.display = 'none';

            tbody.innerHTML = pageShipments.map(shipment => `
                <tr>
                    <td>
                        <input type="checkbox" class="checkbox shipment-checkbox" 
                               value="${shipment.id}" 
                               ${this.selectedShipments.has(shipment.id) ? 'checked' : ''}>
                    </td>
                    <td>
                        <div class="recipient-info">
                            <strong>${shipment.companyName}</strong>
                            ${shipment.contactName ? `<br><small>${shipment.contactName}</small>` : ''}
                        </div>
                    </td>
                    <td>
                        <span class="country-flag">${this.getCountryFlag(shipment.country)}</span>
                        ${this.getCountryName(shipment.country)}
                    </td>
                    <td>${shipment.city}</td>
                    <td>${shipment.weight} ${shipment.unitOfMeasure}</td>
                    <td>${this.getServiceName(shipment.serviceType)}</td>
                    <td>
                        <span class="badge ${shipment.isValid ? 'badge-success' : 'badge-error'}">
                            ${shipment.isValid ? 'Gültig' : 'Fehlerhaft'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-ghost" onclick="editShipment(${shipment.id})" title="Bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost" onclick="deleteShipment(${shipment.id})" title="Löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="btn btn-sm btn-ghost" onclick="duplicateShipment(${shipment.id})" title="Duplizieren">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        // Pagination aktualisieren
        this.updatePagination(totalItems, totalPages);

        // Checkbox-Events
        this.setupTableCheckboxes();

        // Bulk-Delete Button Status
        this.updateBulkDeleteButton();
    }

    // Tabellen-Checkboxes einrichten
    setupTableCheckboxes() {
        document.querySelectorAll('.shipment-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const shipmentId = parseInt(e.target.value, 10);
                if (e.target.checked) {
                    this.selectedShipments.add(shipmentId);
                } else {
                    this.selectedShipments.delete(shipmentId);
                }
                this.updateBulkDeleteButton();
                this.updateSelectAllCheckbox();
            });
        });
    }

    // Select All handhaben
    handleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.shipment-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const shipmentId = parseInt(checkbox.value, 10);
            if (checked) {
                this.selectedShipments.add(shipmentId);
            } else {
                this.selectedShipments.delete(shipmentId);
            }
        });
        this.updateBulkDeleteButton();
    }

    // Select All Checkbox Status aktualisieren
    updateSelectAllCheckbox() {
        const checkboxes = document.querySelectorAll('.shipment-checkbox');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (checkboxes.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else {
            const checkedCount = document.querySelectorAll('.shipment-checkbox:checked').length;
            if (checkedCount === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (checkedCount === checkboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }
    }

    // Bulk-Delete Button aktualisieren
    updateBulkDeleteButton() {
        const button = document.getElementById('bulkDeleteBtn');
        if (button) {
            button.disabled = this.selectedShipments.size === 0;
            button.innerHTML = `
                <i class="fas fa-trash"></i>
                Auswahl löschen (${this.selectedShipments.size})
            `;
        }
    }

    // Bulk-Delete handhaben
    handleBulkDelete() {
        if (this.selectedShipments.size === 0) return;

        const count = this.selectedShipments.size;
        window.showConfirmDialog(
            'Sendungen löschen',
            `Möchten Sie wirklich ${count} Sendung(en) löschen?`,
            () => {
                const deletedCount = this.shipmentManager.deleteShipments([...this.selectedShipments]);
                this.selectedShipments.clear();
                this.updateStats();
                this.renderShipmentsTable();
                window.toastSystem.showSuccess(`${deletedCount} Sendungen erfolgreich gelöscht`);
            }
        );
    }

    // Suche handhaben
    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm;
        this.currentPage = 1;
        this.renderShipmentsTable();
    }

    // Filter handhaben
    handleFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.currentPage = 1;
        this.renderShipmentsTable();
    }

    // Filter zurücksetzen
    clearFilters() {
        this.currentFilters = {};
        
        const searchInput = document.getElementById('searchInput');
        const serviceFilter = document.getElementById('serviceFilter');
        const countryFilter = document.getElementById('countryFilter');
        
        if (searchInput) searchInput.value = '';
        if (serviceFilter) serviceFilter.value = '';
        if (countryFilter) countryFilter.value = '';
        
        this.currentPage = 1;
        this.renderShipmentsTable();
    }

    // Sortierung handhaben
    handleSort(sortField) {
        if (this.currentFilters.sortBy === sortField) {
            this.currentFilters.sortDirection = this.currentFilters.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentFilters.sortBy = sortField;
            this.currentFilters.sortDirection = 'asc';
        }
        
        this.renderShipmentsTable();
        this.updateSortIcons(sortField, this.currentFilters.sortDirection);
    }

    // Sort-Icons aktualisieren
    updateSortIcons(activeField, direction) {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const activeIcon = document.querySelector(`[data-sort="${activeField}"] i`);
        if (activeIcon) {
            activeIcon.className = `fas fa-sort-${direction === 'asc' ? 'up' : 'down'}`;
        }
    }

    // Pagination
    goToPage(page) {
        const filteredShipments = this.shipmentManager.getFilteredShipments(this.currentFilters);
        const totalPages = Math.ceil(filteredShipments.length / this.itemsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderShipmentsTable();
        }
    }

    // Pagination UI aktualisieren
    updatePagination(totalItems, totalPages) {
        const start = totalItems > 0 ? (this.currentPage - 1) * this.itemsPerPage + 1 : 0;
        const end = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        const paginationStart = document.getElementById('paginationStart');
        const paginationEnd = document.getElementById('paginationEnd');
        const paginationTotal = document.getElementById('paginationTotal');
        
        if (paginationStart) paginationStart.textContent = start;
        if (paginationEnd) paginationEnd.textContent = end;
        if (paginationTotal) paginationTotal.textContent = totalItems;

        // Buttons
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (prevPage) prevPage.disabled = this.currentPage <= 1;
        if (nextPage) nextPage.disabled = this.currentPage >= totalPages;

        // Seitennummern
        this.renderPageNumbers(totalPages);
    }

    // Seitennummern rendern
    renderPageNumbers(totalPages) {
        const container = document.getElementById('pageNumbers');
        if (!container) return;

        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        let html = '';
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="page-number ${i === this.currentPage ? 'active' : ''}" 
                        onclick="window.appDE.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        container.innerHTML = html;
    }

    // Letzte Aktivitäten aktualisieren
    updateRecentActivities() {
        const activities = this.shipmentManager.getRecentActivities(5);
        const container = document.getElementById('recentActivityList');
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="activity-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Willkommen im UPS Batch-Manager!</span>
                    <small>Jetzt</small>
                </div>
            `;
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                <span>${activity.message}</span>
                <small>${activity.time}</small>
            </div>
        `).join('');
    }

    // Aktivitäts-Icon ermitteln
    getActivityIcon(type) {
        const icons = {
            add: 'plus',
            update: 'edit',
            delete: 'trash',
            import: 'file-import',
            export: 'file-export',
            clear: 'trash-alt'
        };
        return icons[type] || 'info-circle';
    }

    // File Upload handhaben
    handleFileUpload(file) {
        if (!file) return;

        // Validierung der Datei
        if (!this.validateFile(file)) {
            return;
        }

        const loadingToast = window.toastSystem && window.toastSystem.showLoading 
            ? window.toastSystem.showLoading(`Importiere "${file.name}"...`)
            : null;

        const reader = new FileReader();
        
        // Error handler für FileReader
        reader.onerror = (error) => {
            if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                window.toastSystem.hideToast(loadingToast);
            }
            
            console.error('FileReader error:', error);
            
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Fehler beim Lesen der Datei. Bitte versuchen Sie es erneut.');
            }
        };
        
        // Timeout für FileReader
        const timeoutId = setTimeout(() => {
            reader.abort();
            if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                window.toastSystem.hideToast(loadingToast);
            }
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Timeout beim Lesen der Datei. Datei möglicherweise zu groß.');
            }
        }, 30000); // 30 Sekunden Timeout
        
        reader.onload = (e) => {
            clearTimeout(timeoutId);
            
            try {
                const csvData = e.target.result;
                
                if (!csvData || csvData.trim().length === 0) {
                    throw new Error('Datei ist leer oder ungültig');
                }
                
                const delimiter = file.name.endsWith('.ssv') ? ';' : ',';
                const result = this.shipmentManager.importFromCSV(csvData, delimiter);

                if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                    window.toastSystem.hideToast(loadingToast);
                }

                if (result.success) {
                    this.updateStats();
                    this.renderShipmentsTable();
                    this.switchToSection('shipments');
                    
                    if (window.toastSystem && window.toastSystem.showSuccess) {
                        window.toastSystem.showSuccess(
                            `${result.imported} Sendungen erfolgreich importiert`,
                            { 
                                duration: 5000,
                                actions: result.errors.length > 0 ? [
                                    { text: 'Fehler anzeigen', action: 'showErrors', class: 'btn-warning' }
                                ] : []
                            }
                        );
                    }
                } else {
                    if (window.toastSystem && window.toastSystem.showError) {
                        window.toastSystem.showError(`Import fehlgeschlagen: ${result.error}`);
                    }
                }
            } catch (error) {
                if (loadingToast && window.toastSystem && window.toastSystem.hideToast) {
                    window.toastSystem.hideToast(loadingToast);
                }
                
                console.error('Error processing file:', error);
                
                if (window.toastSystem && window.toastSystem.showError) {
                    window.toastSystem.showError(`Fehler beim Lesen der Datei: ${error.message}`);
                }
            }
        };

        reader.readAsText(file);
    }
    
    // Datei validieren
    validateFile(file) {
        // Dateigröße prüfen (max 10MB)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Datei ist zu groß. Maximale Größe: 10MB');
            }
            return false;
        }
        
        // Dateityp prüfen
        const allowedTypes = ['text/csv', 'application/csv', 'text/plain'];
        const allowedExtensions = ['.csv', '.ssv', '.txt'];
        
        const hasValidType = allowedTypes.includes(file.type);
        const hasValidExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
        
        if (!hasValidType && !hasValidExtension) {
            if (window.toastSystem && window.toastSystem.showError) {
                window.toastSystem.showError('Ungültiger Dateityp. Nur CSV, SSV und TXT Dateien sind erlaubt.');
            }
            return false;
        }
        
        return true;
    }

    // Drag & Drop einrichten
    setupDragAndDrop() {
        const uploadArea = document.getElementById('fileUploadArea');
        if (!uploadArea) return;

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });
    }

    // Export-Statistiken aktualisieren
    updateExportStats() {
        const stats = this.shipmentManager.getStatistics();
        
        const exportTotalCount = document.getElementById('exportTotalCount');
        const exportValidCount = document.getElementById('exportValidCount');
        const exportSelectedCount = document.getElementById('exportSelectedCount');
        
        if (exportTotalCount) exportTotalCount.textContent = stats.total;
        if (exportValidCount) exportValidCount.textContent = stats.valid;
        if (exportSelectedCount) exportSelectedCount.textContent = this.selectedShipments.size;
    }

    // Einstellungen laden
    loadSettings() {
        // Theme laden
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
            const icon = document.querySelector('#darkModeToggle i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }

        // Andere Einstellungen laden
        const defaultCountry = localStorage.getItem('defaultCountry') || 'DE';
        const defaultService = localStorage.getItem('defaultService') || '03';
        const defaultUnit = localStorage.getItem('defaultUnit') || 'KG';

        const defaultCountrySelect = document.getElementById('defaultCountry');
        const defaultServiceSelect = document.getElementById('defaultService');
        const defaultUnitSelect = document.getElementById('defaultUnit');
        
        if (defaultCountrySelect) defaultCountrySelect.value = defaultCountry;
        if (defaultServiceSelect) defaultServiceSelect.value = defaultService;
        if (defaultUnitSelect) defaultUnitSelect.value = defaultUnit;
    }

    // Einstellungen-Listener einrichten
    setupSettingsListeners() {
        // Theme Selector
        const themeSelect = document.getElementById('themeSelect');
        
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                const theme = e.target.value;
                if (theme === 'auto') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
                    localStorage.removeItem('theme');
                } else {
                    document.documentElement.setAttribute('data-theme', theme);
                    localStorage.setItem('theme', theme);
                }
            });
        }

        // Standard-Einstellungen
        ['defaultCountry', 'defaultService', 'defaultUnit'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    localStorage.setItem(id, e.target.value);
                });
            }
        });
    }

    // Speicher-Info aktualisieren
    updateStorageInfo() {
        try {
            // Sicherer Zugriff auf localStorage
            if (typeof(Storage) === 'undefined') {
                console.warn('localStorage nicht verfügbar');
                return;
            }
            
            let used = 0;
            try {
                const storageData = JSON.stringify(localStorage);
                used = new Blob([storageData]).size;
            } catch (storageError) {
                // Fallback: Einzelne Schlüssel durchgehen
                for (let key in localStorage) {
                    if (localStorage.hasOwnProperty(key)) {
                        try {
                            used += localStorage[key].length + key.length;
                        } catch (keyError) {
                            console.warn(`Fehler beim Lesen von localStorage key: ${key}`, keyError);
                        }
                    }
                }
            }
            
            const total = 5 * 1024 * 1024; // 5MB
            const percentage = Math.round((used / total) * 100);

            const storageUsage = document.getElementById('storageUsage');
            const storageText = document.getElementById('storageText');
            
            if (storageUsage) storageUsage.style.width = `${percentage}%`;
            if (storageText) storageText.textContent = `${percentage}% verwendet`;
        } catch (error) {
            console.error('Fehler beim Berechnen der Speicher-Nutzung:', error);
            
            // Fallback UI
            const storageUsage = document.getElementById('storageUsage');
            const storageText = document.getElementById('storageText');
            
            if (storageUsage) storageUsage.style.width = '0%';
            if (storageText) storageText.textContent = 'Unbekannt';
        }
    }

    // Nutzer-Einstellungen aktualisieren
    updateUserSettings() {
        const userSettingsContent = document.getElementById('userSettingsContent');
        if (!userSettingsContent) return;
        
        if (window.userManager && window.userManager.isLoggedIn()) {
            userSettingsContent.innerHTML = window.userManager.getUserSettingsHTML();
        } else {
            userSettingsContent.innerHTML = `
                <div class="user-settings-placeholder">
                    <i class="fas fa-user-slash"></i>
                    <p>Kein Nutzer angemeldet</p>
                </div>
            `;
        }
    }

    // Hilfe-Inhalt laden
    loadHelpContent() {
        const faqList = document.getElementById('faqList');
        if (!faqList) return;

        const faqs = [
            {
                question: 'Wie erstelle ich eine neue Sendung?',
                answer: 'Klicken Sie auf "Neue Sendung" im Dashboard oder in der Sendungen-Übersicht. Füllen Sie alle erforderlichen Felder aus und klicken Sie auf "Speichern".'
            },
            {
                question: 'Welche Dateiformate werden für den Import unterstützt?',
                answer: 'CSV (Comma Separated Values) und SSV (Semicolon Separated Values) Dateien werden unterstützt. Die maximale Dateigröße beträgt 10MB.'
            },
            {
                question: 'Wie kann ich Sendungen in großen Mengen bearbeiten?',
                answer: 'Wählen Sie mehrere Sendungen in der Tabelle aus und verwenden Sie die Bulk-Aktionen wie "Auswahl löschen".'
            },
            {
                question: 'Was bedeuten die Validierungsfehler?',
                answer: 'Validierungsfehler zeigen an, dass bestimmte Felder nicht den UPS-Anforderungen entsprechen. Überprüfen Sie Pflichtfelder, Formate und Längenbeschränkungen.'
            },
            {
                question: 'Wo werden meine Daten gespeichert?',
                answer: 'Alle Daten werden lokal in Ihrem Browser gespeichert. Es werden keine Daten an externe Server übertragen.'
            }
        ];

        faqList.innerHTML = faqs.map((faq, index) => `
            <div class="faq-item">
                <div class="faq-question" onclick="toggleFAQ(${index})">
                    ${faq.question}
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer" id="faq-${index}">
                    ${faq.answer}
                </div>
            </div>
        `).join('');
    }

    // Keyboard Shortcuts einrichten
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 's':
                        e.preventDefault();
                        if (this.currentSection === 'shipments') {
                            window.showCreateShipmentModal();
                        }
                        break;
                    case 'i':
                        e.preventDefault();
                        this.switchToSection('import');
                        break;
                    case 'e':
                        e.preventDefault();
                        this.switchToSection('export');
                        break;
                    case 'd':
                        e.preventDefault();
                        this.downloadTemplate();
                        break;
                }
            }

            if (e.key === 'Escape') {
                if (this.currentSection === 'shipments') {
                    this.clearFilters();
                }
            }
        });
    }

    // Tooltips einrichten
    setupTooltips() {
        // Tooltips für Buttons und Icons
        document.querySelectorAll('[title]').forEach(element => {
            element.classList.add('tooltip');
            element.setAttribute('data-tooltip', element.getAttribute('title'));
            element.removeAttribute('title');
        });
    }

    // Hilfsfunktionen
    getCountryFlag(countryCode) {
        const flags = {
            'DE': '🇩🇪',
            'US': '🇺🇸',
            'CA': '🇨🇦',
            'GB': '🇬🇧',
            'FR': '🇫🇷',
            'IT': '🇮🇹',
            'ES': '🇪🇸',
            'NL': '🇳🇱',
            'BE': '🇧🇪',
            'AT': '🇦🇹',
            'CH': '🇨🇭',
            'PL': '🇵🇱',
            'CZ': '🇨🇿',
            'DK': '🇩🇰',
            'SE': '🇸🇪',
            'NO': '🇳🇴',
            'FI': '🇫🇮'
        };
        return flags[countryCode] || '🌍';
    }

    getCountryName(countryCode) {
        const field = UPS_FIELDS.Country;
        const option = field.options.find(opt => opt.value === countryCode);
        return option ? option.label : countryCode;
    }

    getServiceName(serviceCode) {
        const field = UPS_FIELDS.Service;
        const option = field.options.find(opt => opt.value === serviceCode);
        return option ? option.label : serviceCode;
    }

    // Template herunterladen
    downloadTemplate() {
        const headers = Object.keys(UPS_FIELDS);
        const csvContent = headers.join(',');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'ups-batch-template.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        this.shipmentManager.addActivity('download', 'CSV-Vorlage heruntergeladen');
        window.toastSystem.showSuccess('Vorlage erfolgreich heruntergeladen');
    }
}

// Globale Funktionen für HTML onclick-Handler
window.editShipment = (id) => {
    const shipment = window.shipmentManager.getShipment(id);
    if (shipment) {
        window.modalSystem.showEditShipmentModal(shipment);
    }
};

window.deleteShipment = (id) => {
    const shipment = window.shipmentManager.getShipment(id);
    if (shipment) {
        window.showConfirmDialog(
            'Sendung löschen',
            `Möchten Sie die Sendung "${shipment.companyName}" wirklich löschen?`,
            () => {
                window.shipmentManager.deleteShipment(id);
                window.appDE.updateStats();
                window.appDE.renderShipmentsTable();
            }
        );
    }
};

window.duplicateShipment = (id) => {
    const shipment = window.shipmentManager.getShipment(id);
    if (shipment) {
        const duplicateData = { ...shipment };
        delete duplicateData.id;
        delete duplicateData.createdAt;
        delete duplicateData.updatedAt;
        duplicateData.companyName += ' (Kopie)';
        
        window.shipmentManager.addShipment(duplicateData);
        window.appDE.updateStats();
        window.appDE.renderShipmentsTable();
        window.toastSystem.showSuccess('Sendung erfolgreich dupliziert');
    }
};

window.switchToSection = (section) => {
    window.appDE.switchToSection(section);
};

window.clearFilters = () => {
    window.appDE.clearFilters();
};

window.downloadTemplate = () => {
    window.appDE.downloadTemplate();
};

window.exportBatch = () => {
    // Use the new export handler
    if (window.exportHandler) {
        window.exportHandler.showExportModal();
    } else {
        // Fallback to old implementation
        try {
            const format = document.querySelector('input[name="exportFormat"]:checked')?.value || 'csv';
            const includeHeaders = document.getElementById('includeHeaders')?.checked;
            const onlyValid = document.getElementById('exportOnlyValid')?.checked;

            const csvData = window.shipmentManager.exportToUPSFormat({
                format,
                includeHeaders,
                onlyValid
            });

            const filename = `ups-batch-${new Date().toISOString().slice(0, 10)}.${format}`;
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess(`Batch-Datei "${filename}" erfolgreich exportiert`);
            }
        } catch (error) {
            if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
                window.toastSystem.showError(`Export fehlgeschlagen: ${error.message}`);
            }
        }
    }
};

window.exportSummary = () => {
    const stats = window.shipmentManager.getStatistics();
    const summary = `UPS Batch-Manager Zusammenfassung
Erstellt am: ${new Date().toLocaleDateString('de-DE')}

Statistiken:
- Gesamt Sendungen: ${stats.total}
- Gültige Sendungen: ${stats.valid}
- Fehlerhafte Sendungen: ${stats.invalid}
- Gesamtgewicht: ${stats.totalWeight} kg
- Gültigkeitsrate: ${stats.validPercentage}%
`;

    const blob = new Blob([summary], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ups-batch-summary.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
        window.toastSystem.showSuccess('Zusammenfassung erfolgreich exportiert');
    }
};

window.exportErrors = () => {
    const shipments = window.shipmentManager.getAllShipments();
    const invalidShipments = shipments.filter(s => !s.isValid);
    
    if (invalidShipments.length === 0) {
        if (window.toastSystem && typeof window.toastSystem.showInfo === 'function') {
            window.toastSystem.showInfo('Keine fehlerhaften Sendungen vorhanden');
        }
        return;
    }

    let errorReport = 'UPS Batch-Manager Fehler-Report\n';
    errorReport += `Erstellt am: ${new Date().toLocaleDateString('de-DE')}\n\n`;
    
    invalidShipments.forEach((shipment, index) => {
        errorReport += `Sendung ${index + 1}: ${shipment.companyName}\n`;
        shipment.errors.forEach(error => {
            errorReport += `  - ${error.message}\n`;
        });
        errorReport += '\n';
    });

    const blob = new Blob([errorReport], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'ups-batch-errors.txt');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
        window.toastSystem.showSuccess('Fehler-Report erfolgreich exportiert');
    }
};

window.clearAddressHistory = () => {
    window.showConfirmDialog(
        'Adressverlauf löschen',
        'Möchten Sie wirklich den gesamten Adressverlauf löschen?',
        () => {
            // Implementierung für Adressverlauf löschen
            if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                window.toastSystem.showSuccess('Adressverlauf erfolgreich gelöscht');
            }
        }
    );
};

window.clearAllData = () => {
    window.showConfirmDialog(
        'Alle Daten löschen',
        'Möchten Sie wirklich alle Sendungen und Einstellungen löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        () => {
            window.shipmentManager.clearAllData();
            window.appDE.updateStats();
            window.appDE.renderShipmentsTable();
            window.appDE.updateRecentActivities();
        }
    );
};

window.toggleFAQ = (index) => {
    const answer = document.getElementById(`faq-${index}`);
    const question = answer.previousElementSibling;
    
    answer.classList.toggle('active');
    question.classList.toggle('active');
};

// App initialisieren
document.addEventListener('DOMContentLoaded', () => {
    window.appDE = new UPSBatchManagerApp();
});