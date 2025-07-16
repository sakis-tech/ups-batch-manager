/**
 * Tabellen-Handler für die deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet die Sendungstabelle mit Features wie:
 * - Sortierung und Filterung
 * - Pagination
 * - Bulk-Operationen
 * - Inline-Bearbeitung
 * 
 * @class TableHandlerDE
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class TableHandlerDE {
    /**
     * Initialisiert den Tabellen-Handler
     * 
     * @constructor
     */
    constructor() {
        /** @type {string} Aktuelle Sortier-Spalte */
        this.sortColumn = null;
        
        /** @type {string} Aktuelle Sortier-Richtung */
        this.sortDirection = 'asc';
        
        /** @type {Object} Aktuelle Filter */
        this.filters = {};
        
        /** @type {number} Aktuelle Seite */
        this.currentPage = 1;
        
        /** @type {number} Einträge pro Seite */
        this.itemsPerPage = 10;
        
        /** @type {Set<number>} Ausgewählte Sendungs-IDs */
        this.selectedItems = new Set();
        
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.setupTableObserver();
    }

    // Event-Listener einrichten
    setupEventListeners() {
        // Sortier-Header
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sortable')) {
                this.handleSort(e);
            }
        });

        // Checkbox-Auswahl
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('shipment-checkbox')) {
                this.handleItemSelection(e);
            } else if (e.target.id === 'selectAll') {
                this.handleSelectAll(e);
            }
        });

        // Bulk-Aktionen
        document.addEventListener('click', (e) => {
            if (e.target.id === 'bulkDeleteBtn' || e.target.closest('#bulkDeleteBtn')) {
                this.handleBulkDelete();
            }
        });

        // Inline-Bearbeitung
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-edit')) {
                this.handleEdit(e);
            } else if (e.target.closest('.btn-delete')) {
                this.handleDelete(e);
            } else if (e.target.closest('.btn-duplicate')) {
                this.handleDuplicate(e);
            }
        });

        // Pagination
        document.addEventListener('click', (e) => {
            if (e.target.closest('.page-number')) {
                this.handlePageChange(e);
            }
        });
    }

    // Tabellen-Observer einrichten
    setupTableObserver() {
        const tableBody = document.getElementById('shipmentsTableBody');
        if (tableBody) {
            const observer = new MutationObserver(() => {
                this.updateTableState();
            });
            observer.observe(tableBody, { childList: true, subtree: true });
        }
    }

    // Sortierung handhaben
    handleSort(e) {
        const sortElement = e.target.closest('.sortable');
        const column = sortElement.dataset.sort;
        
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.updateSortIcons();
        this.refreshTable();
    }

    // Sortier-Icons aktualisieren
    updateSortIcons() {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        if (this.sortColumn) {
            const activeIcon = document.querySelector(`[data-sort="${this.sortColumn}"] i`);
            if (activeIcon) {
                activeIcon.className = `fas fa-sort-${this.sortDirection === 'asc' ? 'up' : 'down'}`;
            }
        }
    }

    // Einzelne Auswahl handhaben
    handleItemSelection(e) {
        const checkbox = e.target;
        const itemId = parseInt(checkbox.value, 10);
        
        if (checkbox.checked) {
            this.selectedItems.add(itemId);
        } else {
            this.selectedItems.delete(itemId);
        }
        
        this.updateBulkActions();
        this.updateSelectAllState();
    }

    // Alle auswählen handhaben
    handleSelectAll(e) {
        const selectAll = e.target;
        const checkboxes = document.querySelectorAll('.shipment-checkbox');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = selectAll.checked;
            const itemId = parseInt(checkbox.value, 10);
            
            if (selectAll.checked) {
                this.selectedItems.add(itemId);
            } else {
                this.selectedItems.delete(itemId);
            }
        });
        
        this.updateBulkActions();
    }

    // Select-All-Status aktualisieren
    updateSelectAllState() {
        const selectAll = document.getElementById('selectAll');
        const checkboxes = document.querySelectorAll('.shipment-checkbox');
        
        if (!selectAll || checkboxes.length === 0) return;
        
        const checkedCount = document.querySelectorAll('.shipment-checkbox:checked').length;
        
        if (checkedCount === 0) {
            selectAll.checked = false;
            selectAll.indeterminate = false;
        } else if (checkedCount === checkboxes.length) {
            selectAll.checked = true;
            selectAll.indeterminate = false;
        } else {
            selectAll.checked = false;
            selectAll.indeterminate = true;
        }
    }

    // Bulk-Aktionen aktualisieren
    updateBulkActions() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        if (bulkDeleteBtn) {
            bulkDeleteBtn.disabled = this.selectedItems.size === 0;
            bulkDeleteBtn.innerHTML = `
                <i class="fas fa-trash"></i>
                Auswahl löschen (${this.selectedItems.size})
            `;
        }
    }

    // Bulk-Löschung handhaben
    handleBulkDelete() {
        if (this.selectedItems.size === 0) return;
        
        const count = this.selectedItems.size;
        window.showConfirmDialog(
            'Sendungen löschen',
            `Möchten Sie wirklich ${count} Sendung(en) löschen?`,
            () => {
                if (window.shipmentManager) {
                    const deletedCount = window.shipmentManager.deleteShipments([...this.selectedItems]);
                    this.selectedItems.clear();
                    this.refreshTable();
                    
                    if (window.toastSystem) {
                        window.toastSystem.showSuccess(`${deletedCount} Sendungen erfolgreich gelöscht`);
                    }
                }
            }
        );
    }

    // Bearbeitung handhaben
    handleEdit(e) {
        const button = e.target.closest('.btn-edit');
        const row = button.closest('tr');
        const shipmentId = this.getShipmentIdFromRow(row);
        
        if (shipmentId && window.shipmentManager) {
            const shipment = window.shipmentManager.getShipment(shipmentId);
            if (shipment && window.modalSystem) {
                window.modalSystem.showEditShipmentModal(shipment);
            }
        }
    }

    // Löschung handhaben
    handleDelete(e) {
        const button = e.target.closest('.btn-delete');
        const row = button.closest('tr');
        const shipmentId = this.getShipmentIdFromRow(row);
        
        if (shipmentId && window.shipmentManager) {
            const shipment = window.shipmentManager.getShipment(shipmentId);
            if (shipment) {
                window.showConfirmDialog(
                    'Sendung löschen',
                    `Möchten Sie die Sendung "${shipment.companyName}" wirklich löschen?`,
                    () => {
                        window.shipmentManager.deleteShipment(shipmentId);
                        this.refreshTable();
                        
                        if (window.toastSystem) {
                            window.toastSystem.showSuccess('Sendung erfolgreich gelöscht');
                        }
                    }
                );
            }
        }
    }

    // Duplizierung handhaben
    handleDuplicate(e) {
        const button = e.target.closest('.btn-duplicate');
        const row = button.closest('tr');
        const shipmentId = this.getShipmentIdFromRow(row);
        
        if (shipmentId && window.shipmentManager) {
            const shipment = window.shipmentManager.getShipment(shipmentId);
            if (shipment) {
                const duplicateData = { ...shipment };
                delete duplicateData.id;
                delete duplicateData.createdAt;
                delete duplicateData.updatedAt;
                duplicateData.companyName += ' (Kopie)';
                
                window.shipmentManager.addShipment(duplicateData);
                this.refreshTable();
                
                if (window.toastSystem) {
                    window.toastSystem.showSuccess('Sendung erfolgreich dupliziert');
                }
            }
        }
    }

    // Seitenwechsel handhaben
    handlePageChange(e) {
        const button = e.target.closest('.page-number');
        const page = parseInt(button.textContent, 10);
        this.currentPage = page;
        this.refreshTable();
    }

    // Sendungs-ID aus Tabellenzeile extrahieren
    getShipmentIdFromRow(row) {
        const checkbox = row.querySelector('.shipment-checkbox');
        return checkbox ? parseInt(checkbox.value, 10) : null;
    }

    // Tabelle aktualisieren
    refreshTable() {
        if (window.appDE && typeof window.appDE.renderShipmentsTable === 'function') {
            window.appDE.renderShipmentsTable();
        }
    }

    // Tabellen-Status aktualisieren
    updateTableState() {
        this.updateSelectAllState();
        this.updateBulkActions();
        this.updateEmptyState();
    }

    // Leerer Zustand aktualisieren
    updateEmptyState() {
        const tableBody = document.getElementById('shipmentsTableBody');
        const emptyState = document.getElementById('emptyState');
        const table = document.querySelector('.table-container table');
        
        if (tableBody && emptyState && table) {
            const hasRows = tableBody.children.length > 0;
            
            if (hasRows) {
                table.style.display = 'table';
                emptyState.style.display = 'none';
            } else {
                table.style.display = 'none';
                emptyState.style.display = 'block';
            }
        }
    }

    // Filter setzen
    setFilter(key, value) {
        this.filters[key] = value;
        this.currentPage = 1;
        this.refreshTable();
    }

    // Filter löschen
    clearFilter(key) {
        delete this.filters[key];
        this.currentPage = 1;
        this.refreshTable();
    }

    // Alle Filter löschen
    clearAllFilters() {
        this.filters = {};
        this.currentPage = 1;
        this.refreshTable();
    }

    // Auswahl löschen
    clearSelection() {
        this.selectedItems.clear();
        document.querySelectorAll('.shipment-checkbox').forEach(cb => cb.checked = false);
        this.updateBulkActions();
        this.updateSelectAllState();
    }

    // Aktuelle Auswahl abrufen
    getSelectedItems() {
        return Array.from(this.selectedItems);
    }

    // Paginierung setzen
    setPage(page) {
        this.currentPage = page;
        this.refreshTable();
    }

    // Einträge pro Seite setzen
    setItemsPerPage(count) {
        this.itemsPerPage = count;
        this.currentPage = 1;
        this.refreshTable();
    }

    // Tabelle exportieren
    exportTable(format = 'csv') {
        const selectedIds = this.getSelectedItems();
        
        if (selectedIds.length === 0) {
            if (window.toastSystem) {
                window.toastSystem.showWarning('Keine Sendungen ausgewählt');
            }
            return;
        }

        if (window.exportHandler) {
            const options = {
                format: format,
                selection: 'selected',
                selectedIds: selectedIds
            };
            window.exportHandler.executeExport(options);
        }
    }

    // Tabellen-Statistiken abrufen
    getTableStatistics() {
        const tableBody = document.getElementById('shipmentsTableBody');
        const totalRows = tableBody ? tableBody.children.length : 0;
        const selectedCount = this.selectedItems.size;
        
        return {
            totalRows,
            selectedCount,
            currentPage: this.currentPage,
            itemsPerPage: this.itemsPerPage,
            sortColumn: this.sortColumn,
            sortDirection: this.sortDirection,
            activeFilters: Object.keys(this.filters).length
        };
    }

    // Tabelle zurücksetzen
    reset() {
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.filters = {};
        this.currentPage = 1;
        this.selectedItems.clear();
        this.updateSortIcons();
        this.refreshTable();
    }
}

// Tabellen-Handler initialisieren
window.TableHandlerDE = TableHandlerDE;
window.tableHandler = new TableHandlerDE();

// Globale Funktionen für Kompatibilität
window.sortTable = (column) => window.tableHandler.handleSort({ target: { closest: () => ({ dataset: { sort: column } }) } });
window.selectAllShipments = (checked) => window.tableHandler.handleSelectAll({ target: { checked } });
window.clearTableSelection = () => window.tableHandler.clearSelection();
window.exportSelectedShipments = (format) => window.tableHandler.exportTable(format);