// Sendungen page specific functionality
class SendungenPage {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {};
        this.selectedShipments = new Set();
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStats();
        this.renderShipmentsTable();
        this.loadFromStorage();
    }

    setupEventListeners() {
        // Search and filter with debouncing
        const searchInput = document.getElementById('searchInput');
        const serviceFilter = document.getElementById('serviceFilter');
        const countryFilter = document.getElementById('countryFilter');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        if (serviceFilter) {
            serviceFilter.addEventListener('change', (e) => {
                this.handleFilter('serviceType', e.target.value);
            });
        }

        if (countryFilter) {
            countryFilter.addEventListener('change', (e) => {
                this.handleFilter('country', e.target.value);
            });
        }

        // Table events
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

        // Sorting
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

        // Update on shipment changes
        if (window.shipmentManager) {
            window.addEventListener('storage', (e) => {
                if (e.key === 'upsShipments') {
                    this.updateStats();
                    this.renderShipmentsTable();
                }
            });
        }
    }

    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    updateStats() {
        if (window.shipmentManager) {
            const stats = window.shipmentManager.getStatistics();
            
            // Update sidebar stats (handled by shared manager)
            if (window.sharedPageManager) {
                window.sharedPageManager.updateStats();
            }
        }
    }

    renderShipmentsTable() {
        if (!window.shipmentManager) return;

        const filteredShipments = window.shipmentManager.getFilteredShipments(this.currentFilters);
        const totalItems = filteredShipments.length;
        
        // Calculate pagination
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        const pageShipments = filteredShipments.slice(startIndex, endIndex);

        const tbody = document.getElementById('shipmentsTableBody');
        const emptyState = document.getElementById('emptyState');
        const tableContainer = document.querySelector('.table-container table');

        if (!tbody || !emptyState || !tableContainer) return;

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

        // Update pagination
        this.updatePagination(totalItems, totalPages);

        // Setup checkbox events
        this.setupTableCheckboxes();

        // Update bulk delete button
        this.updateBulkDeleteButton();
    }

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

    updateSelectAllCheckbox() {
        const checkboxes = document.querySelectorAll('.shipment-checkbox');
        const selectAllCheckbox = document.getElementById('selectAll');
        
        if (!selectAllCheckbox) return;

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

    handleBulkDelete() {
        if (this.selectedShipments.size === 0) return;

        const count = this.selectedShipments.size;
        if (window.showConfirmDialog && typeof window.showConfirmDialog === 'function') {
            window.showConfirmDialog(
                'Sendungen löschen',
                `Möchten Sie wirklich ${count} Sendung(en) löschen?`,
                () => {
                    if (window.shipmentManager && typeof window.shipmentManager.deleteShipments === 'function') {
                        const deletedCount = window.shipmentManager.deleteShipments([...this.selectedShipments]);
                        this.selectedShipments.clear();
                        this.updateStats();
                        this.renderShipmentsTable();
                        
                        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                            window.toastSystem.showSuccess(`${deletedCount} Sendungen erfolgreich gelöscht`);
                        }
                    }
                }
            );
        }
    }

    handleSearch(searchTerm) {
        this.currentFilters.search = searchTerm;
        this.currentPage = 1;
        this.renderShipmentsTable();
    }

    handleFilter(filterType, value) {
        this.currentFilters[filterType] = value;
        this.currentPage = 1;
        this.renderShipmentsTable();
    }

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

    updateSortIcons(activeField, direction) {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const activeIcon = document.querySelector(`[data-sort="${activeField}"] i`);
        if (activeIcon) {
            activeIcon.className = `fas fa-sort-${direction === 'asc' ? 'up' : 'down'}`;
        }
    }

    goToPage(page) {
        if (!window.shipmentManager) return;

        const filteredShipments = window.shipmentManager.getFilteredShipments(this.currentFilters);
        const totalPages = Math.ceil(filteredShipments.length / this.itemsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            this.currentPage = page;
            this.renderShipmentsTable();
        }
    }

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

        // Page numbers
        this.renderPageNumbers(totalPages);
    }

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
                        onclick="window.sendungenPage.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        container.innerHTML = html;
    }

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
        if (!window.UPS_FIELDS || !window.UPS_FIELDS.Country) {
            return countryCode;
        }
        const field = window.UPS_FIELDS.Country;
        const option = field.options.find(opt => opt.value === countryCode);
        return option ? option.label : countryCode;
    }

    getServiceName(serviceCode) {
        if (!window.UPS_FIELDS || !window.UPS_FIELDS.Service) {
            return serviceCode;
        }
        const field = window.UPS_FIELDS.Service;
        const option = field.options.find(opt => opt.value === serviceCode);
        return option ? option.label : serviceCode;
    }

    loadFromStorage() {
        // Load any sendungen-specific settings
        const sendungenSettings = localStorage.getItem('sendungenSettings');
        if (sendungenSettings) {
            try {
                const settings = JSON.parse(sendungenSettings);
                this.applySendungenSettings(settings);
            } catch (error) {
                console.error('Error loading sendungen settings:', error);
            }
        }
    }

    applySendungenSettings(settings) {
        if (settings.itemsPerPage) {
            this.itemsPerPage = settings.itemsPerPage;
        }
        if (settings.currentFilters) {
            this.currentFilters = settings.currentFilters;
        }
    }

    renderContent() {
        this.renderShipmentsTable();
    }
}

// Global function for clear filters
window.clearFilters = () => {
    if (window.sendungenPage) {
        window.sendungenPage.currentFilters = {};
        
        const searchInput = document.getElementById('searchInput');
        const serviceFilter = document.getElementById('serviceFilter');
        const countryFilter = document.getElementById('countryFilter');
        
        if (searchInput) searchInput.value = '';
        if (serviceFilter) serviceFilter.value = '';
        if (countryFilter) countryFilter.value = '';
        
        window.sendungenPage.currentPage = 1;
        window.sendungenPage.renderShipmentsTable();
    }
};

// Initialize sendungen page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sendungenPage = new SendungenPage();
    window.pageManager = window.sendungenPage; // Set as global page manager
});