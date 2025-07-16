// Pagination System für die deutsche UPS Batch Manager Oberfläche
class PaginationSystem {
    constructor() {
        this.instances = new Map();
        this.initialize();
    }

    initialize() {
        // Event-Listener für Pagination-Buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.pagination-controls button')) {
                this.handlePaginationClick(e);
            }
        });

        // Keyboard-Navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.pagination-controls')) {
                this.handlePaginationKeydown(e);
            }
        });
    }

    // Pagination-Instanz erstellen
    createPagination(containerId, options = {}) {
        const config = {
            containerId,
            currentPage: options.currentPage || 1,
            totalItems: options.totalItems || 0,
            itemsPerPage: options.itemsPerPage || 10,
            maxVisiblePages: options.maxVisiblePages || 5,
            showPageInfo: options.showPageInfo !== false,
            showJumpToPage: options.showJumpToPage || false,
            showItemsPerPageSelector: options.showItemsPerPageSelector || false,
            itemsPerPageOptions: options.itemsPerPageOptions || [10, 25, 50, 100],
            labels: {
                previous: 'Vorherige',
                next: 'Nächste',
                first: 'Erste',
                last: 'Letzte',
                pageInfo: 'Zeige {start} bis {end} von {total} Einträgen',
                jumpToPage: 'Zur Seite springen',
                itemsPerPage: 'Einträge pro Seite',
                ...options.labels
            },
            onPageChange: options.onPageChange || null,
            onItemsPerPageChange: options.onItemsPerPageChange || null
        };

        this.instances.set(containerId, config);
        this.renderPagination(containerId);
        
        return config;
    }

    // Pagination rendern
    renderPagination(containerId) {
        const config = this.instances.get(containerId);
        if (!config) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = Math.ceil(config.totalItems / config.itemsPerPage);
        const currentPage = Math.max(1, Math.min(config.currentPage, totalPages));

        // Pagination-Container erstellen
        container.innerHTML = `
            <div class="pagination-wrapper">
                ${config.showPageInfo ? this.renderPageInfo(config, currentPage, totalPages) : ''}
                ${config.showItemsPerPageSelector ? this.renderItemsPerPageSelector(config) : ''}
                ${totalPages > 1 ? this.renderPaginationControls(config, currentPage, totalPages) : ''}
                ${config.showJumpToPage && totalPages > 1 ? this.renderJumpToPage(config, totalPages) : ''}
            </div>
        `;

        // Event-Listener für Items per Page Selector
        if (config.showItemsPerPageSelector) {
            const selector = container.querySelector('.items-per-page-select');
            if (selector) {
                selector.addEventListener('change', (e) => {
                    this.changeItemsPerPage(containerId, parseInt(e.target.value, 10));
                });
            }
        }

        // Event-Listener für Jump to Page
        if (config.showJumpToPage) {
            const jumpInput = container.querySelector('.jump-to-page-input');
            if (jumpInput) {
                jumpInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        const page = parseInt(e.target.value, 10);
                        if (page >= 1 && page <= totalPages) {
                            this.goToPage(containerId, page);
                        }
                    }
                });
            }
        }
    }

    // Seiten-Info rendern
    renderPageInfo(config, currentPage, totalPages) {
        const start = (currentPage - 1) * config.itemsPerPage + 1;
        const end = Math.min(currentPage * config.itemsPerPage, config.totalItems);
        
        const pageInfoText = config.labels.pageInfo
            .replace('{start}', start)
            .replace('{end}', end)
            .replace('{total}', config.totalItems);

        return `
            <div class="pagination-info">
                ${pageInfoText}
            </div>
        `;
    }

    // Items per Page Selector rendern
    renderItemsPerPageSelector(config) {
        const options = config.itemsPerPageOptions.map(count => 
            `<option value="${count}" ${count === config.itemsPerPage ? 'selected' : ''}>${count}</option>`
        ).join('');

        return `
            <div class="items-per-page-selector">
                <label>${config.labels.itemsPerPage}:</label>
                <select class="items-per-page-select form-select">
                    ${options}
                </select>
            </div>
        `;
    }

    // Pagination-Controls rendern
    renderPaginationControls(config, currentPage, totalPages) {
        const prevDisabled = currentPage <= 1;
        const nextDisabled = currentPage >= totalPages;

        return `
            <div class="pagination-controls">
                <button class="btn btn-ghost" data-page="1" ${prevDisabled ? 'disabled' : ''} title="${config.labels.first}">
                    <i class="fas fa-angle-double-left"></i>
                </button>
                <button class="btn btn-ghost" data-page="${currentPage - 1}" ${prevDisabled ? 'disabled' : ''} title="${config.labels.previous}">
                    <i class="fas fa-chevron-left"></i>
                </button>
                ${this.renderPageNumbers(config, currentPage, totalPages)}
                <button class="btn btn-ghost" data-page="${currentPage + 1}" ${nextDisabled ? 'disabled' : ''} title="${config.labels.next}">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button class="btn btn-ghost" data-page="${totalPages}" ${nextDisabled ? 'disabled' : ''} title="${config.labels.last}">
                    <i class="fas fa-angle-double-right"></i>
                </button>
            </div>
        `;
    }

    // Seitennummern rendern
    renderPageNumbers(config, currentPage, totalPages) {
        const maxVisible = config.maxVisiblePages;
        const pages = [];
        
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);
        
        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Erste Seite und Ellipsis
        if (startPage > 1) {
            pages.push(this.renderPageButton(1, currentPage));
            if (startPage > 2) {
                pages.push('<span class="pagination-ellipsis">...</span>');
            }
        }

        // Sichtbare Seiten
        for (let i = startPage; i <= endPage; i++) {
            pages.push(this.renderPageButton(i, currentPage));
        }

        // Ellipsis und letzte Seite
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push('<span class="pagination-ellipsis">...</span>');
            }
            pages.push(this.renderPageButton(totalPages, currentPage));
        }

        return `<div class="page-numbers">${pages.join('')}</div>`;
    }

    // Seiten-Button rendern
    renderPageButton(page, currentPage) {
        const isActive = page === currentPage;
        const activeClass = isActive ? 'active' : '';
        
        return `
            <button class="page-number ${activeClass}" 
                    data-page="${page}" 
                    ${isActive ? 'disabled' : ''}
                    aria-label="Seite ${page}"
                    aria-current="${isActive ? 'page' : 'false'}">
                ${page}
            </button>
        `;
    }

    // Jump to Page rendern
    renderJumpToPage(config, totalPages) {
        return `
            <div class="jump-to-page">
                <label>${config.labels.jumpToPage}:</label>
                <input type="number" class="jump-to-page-input form-input" 
                       min="1" max="${totalPages}" 
                       placeholder="1-${totalPages}">
            </div>
        `;
    }

    // Pagination-Klick handhaben
    handlePaginationClick(e) {
        const button = e.target.closest('button');
        if (!button || button.disabled) return;

        const page = parseInt(button.dataset.page, 10);
        if (!page) return;

        const containerId = this.findContainerForButton(button);
        if (containerId) {
            this.goToPage(containerId, page);
        }
    }

    // Keyboard-Navigation
    handlePaginationKeydown(e) {
        const button = e.target.closest('button');
        if (!button) return;

        const containerId = this.findContainerForButton(button);
        const config = this.instances.get(containerId);
        if (!config) return;

        const totalPages = Math.ceil(config.totalItems / config.itemsPerPage);
        const currentPage = config.currentPage;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                if (currentPage > 1) {
                    this.goToPage(containerId, currentPage - 1);
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentPage < totalPages) {
                    this.goToPage(containerId, currentPage + 1);
                }
                break;
            case 'Home':
                e.preventDefault();
                this.goToPage(containerId, 1);
                break;
            case 'End':
                e.preventDefault();
                this.goToPage(containerId, totalPages);
                break;
        }
    }

    // Container für Button finden
    findContainerForButton(button) {
        const paginationWrapper = button.closest('.pagination-wrapper');
        if (paginationWrapper) {
            return paginationWrapper.parentElement.id;
        }
        return null;
    }

    // Zu Seite springen
    goToPage(containerId, page) {
        const config = this.instances.get(containerId);
        if (!config) return;

        const totalPages = Math.ceil(config.totalItems / config.itemsPerPage);
        const newPage = Math.max(1, Math.min(page, totalPages));

        if (newPage !== config.currentPage) {
            config.currentPage = newPage;
            this.renderPagination(containerId);

            // Callback aufrufen
            if (config.onPageChange) {
                config.onPageChange(newPage, config.itemsPerPage);
            }
        }
    }

    // Items per Page ändern
    changeItemsPerPage(containerId, itemsPerPage) {
        const config = this.instances.get(containerId);
        if (!config) return;

        const oldItemsPerPage = config.itemsPerPage;
        config.itemsPerPage = itemsPerPage;

        // Aktuelle Seite anpassen
        const currentFirstItem = (config.currentPage - 1) * oldItemsPerPage + 1;
        config.currentPage = Math.ceil(currentFirstItem / itemsPerPage);

        this.renderPagination(containerId);

        // Callback aufrufen
        if (config.onItemsPerPageChange) {
            config.onItemsPerPageChange(config.currentPage, itemsPerPage);
        }
    }

    // Pagination-Daten aktualisieren
    updatePagination(containerId, totalItems, currentPage) {
        const config = this.instances.get(containerId);
        if (!config) return;

        config.totalItems = totalItems;
        if (currentPage !== undefined) {
            config.currentPage = currentPage;
        }

        this.renderPagination(containerId);
    }

    // Pagination-Konfiguration abrufen
    getPaginationConfig(containerId) {
        return this.instances.get(containerId);
    }

    // Aktuelle Seite abrufen
    getCurrentPage(containerId) {
        const config = this.instances.get(containerId);
        return config ? config.currentPage : 1;
    }

    // Items per Page abrufen
    getItemsPerPage(containerId) {
        const config = this.instances.get(containerId);
        return config ? config.itemsPerPage : 10;
    }

    // Pagination-Bereich für aktuelle Seite abrufen
    getPaginationRange(containerId) {
        const config = this.instances.get(containerId);
        if (!config) return { start: 0, end: 0 };

        const start = (config.currentPage - 1) * config.itemsPerPage;
        const end = start + config.itemsPerPage;

        return { start, end };
    }

    // Pagination zurücksetzen
    resetPagination(containerId) {
        const config = this.instances.get(containerId);
        if (!config) return;

        config.currentPage = 1;
        this.renderPagination(containerId);
    }

    // Pagination entfernen
    removePagination(containerId) {
        this.instances.delete(containerId);
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }

    // Alle Paginationen zurücksetzen
    resetAllPaginations() {
        this.instances.forEach((config, containerId) => {
            config.currentPage = 1;
            this.renderPagination(containerId);
        });
    }
}

// CSS für Pagination
const paginationStyles = `
    .pagination-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        padding: var(--space-4) 0;
    }

    .pagination-info {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
        white-space: nowrap;
    }

    .items-per-page-selector {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
    }

    .items-per-page-select {
        min-width: 80px;
        padding: var(--space-2) var(--space-3);
    }

    .pagination-controls {
        display: flex;
        align-items: center;
        gap: var(--space-1);
    }

    .page-numbers {
        display: flex;
        gap: var(--space-1);
    }

    .page-number {
        min-width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        color: var(--text-secondary);
        background: var(--bg-primary);
        cursor: pointer;
        transition: var(--transition-fast);
        font-size: var(--font-size-sm);
        font-weight: var(--font-weight-medium);
    }

    .page-number:hover:not(:disabled) {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
        border-color: var(--border-medium);
    }

    .page-number.active {
        background-color: var(--primary);
        color: var(--white);
        border-color: var(--primary);
    }

    .page-number:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .pagination-ellipsis {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 40px;
        height: 40px;
        color: var(--text-tertiary);
        font-size: var(--font-size-sm);
    }

    .jump-to-page {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        font-size: var(--font-size-sm);
    }

    .jump-to-page-input {
        width: 80px;
        padding: var(--space-2) var(--space-3);
        text-align: center;
    }

    .pagination-controls .btn {
        min-width: 40px;
        height: 40px;
        padding: var(--space-2);
    }

    .pagination-controls .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .pagination-wrapper {
            flex-direction: column;
            gap: var(--space-3);
        }

        .pagination-info {
            order: 1;
        }

        .pagination-controls {
            order: 2;
        }

        .items-per-page-selector,
        .jump-to-page {
            order: 3;
        }

        .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
        }
    }

    @media (max-width: 480px) {
        .page-number,
        .pagination-controls .btn {
            min-width: 36px;
            height: 36px;
            font-size: var(--font-size-xs);
        }

        .pagination-ellipsis {
            min-width: 36px;
            height: 36px;
        }
    }
`;

// CSS hinzufügen
const paginationStyleSheet = document.createElement('style');
paginationStyleSheet.textContent = paginationStyles;
document.head.appendChild(paginationStyleSheet);

// Pagination System initialisieren
window.paginationSystem = new PaginationSystem();

// Globale Funktionen für Kompatibilität
window.createPagination = (containerId, options) => window.paginationSystem.createPagination(containerId, options);
window.updatePagination = (containerId, totalItems, currentPage) => window.paginationSystem.updatePagination(containerId, totalItems, currentPage);
window.goToPage = (containerId, page) => window.paginationSystem.goToPage(containerId, page);
window.getCurrentPage = (containerId) => window.paginationSystem.getCurrentPage(containerId);
window.getItemsPerPage = (containerId) => window.paginationSystem.getItemsPerPage(containerId);
window.getPaginationRange = (containerId) => window.paginationSystem.getPaginationRange(containerId);
window.resetPagination = (containerId) => window.paginationSystem.resetPagination(containerId);