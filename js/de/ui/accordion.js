// Accordion System für die deutsche UPS Batch Manager Oberfläche
class AccordionSystem {
    constructor() {
        this.accordions = new Map();
        this.initialize();
    }

    initialize() {
        // Event-Listener für Accordion-Header
        document.addEventListener('click', (e) => {
            if (e.target.closest('.accordion-header')) {
                this.handleAccordionClick(e);
            }
        });

        // Keyboard-Navigation
        document.addEventListener('keydown', (e) => {
            if (e.target.closest('.accordion-header')) {
                this.handleAccordionKeydown(e);
            }
        });

        // Bestehende Accordions initialisieren
        this.initializeExistingAccordions();
        
        // Debug-Logging
        console.log(`AccordionSystem initialized with ${this.accordions.size} accordions`);
    }

    // Bestehende Accordions initialisieren
    initializeExistingAccordions() {
        const accordions = document.querySelectorAll('.accordion-item');
        accordions.forEach(accordion => {
            const header = accordion.querySelector('.accordion-header');
            if (header) {
                const id = header.getAttribute('data-accordion') || 
                          header.getAttribute('onclick')?.match(/'([^']+)'/)?.[1] ||
                          this.generateAccordionId();
                
                // Setze data-accordion falls nicht vorhanden
                if (!header.getAttribute('data-accordion')) {
                    header.setAttribute('data-accordion', id);
                }
                
                this.registerAccordion(id, accordion);
            }
        });
    }

    // Accordion registrieren
    registerAccordion(id, element) {
        if (!element) {
            element = document.querySelector(`[data-accordion="${id}"]`)?.closest('.accordion-item');
        }

        if (element) {
            const header = element.querySelector('.accordion-header');
            const content = element.querySelector('.accordion-content');
            
            // Prüfe Initial-Zustand basierend auf CSS display
            const isOpen = content && window.getComputedStyle(content).display !== 'none';
            
            this.accordions.set(id, {
                element,
                header,
                content,
                isOpen: isOpen || false
            });
            
            // Setze aria-expanded korrekt
            if (header) {
                header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            }
            
            console.log(`Registered accordion "${id}": isOpen=${isOpen}`);
        }
    }

    // Accordion-Klick handhaben
    handleAccordionClick(e) {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        e.preventDefault();
        
        const accordionId = header.getAttribute('data-accordion') || 
                           header.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
        
        if (accordionId) {
            this.toggleAccordion(accordionId);
        }
    }

    // Keyboard-Navigation
    handleAccordionKeydown(e) {
        const header = e.target.closest('.accordion-header');
        if (!header) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            header.click();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.focusNextAccordion(header);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.focusPreviousAccordion(header);
        }
    }

    // Nächstes Accordion fokussieren
    focusNextAccordion(currentHeader) {
        const headers = Array.from(document.querySelectorAll('.accordion-header'));
        const currentIndex = headers.indexOf(currentHeader);
        const nextHeader = headers[currentIndex + 1] || headers[0];
        nextHeader.focus();
    }

    // Vorheriges Accordion fokussieren
    focusPreviousAccordion(currentHeader) {
        const headers = Array.from(document.querySelectorAll('.accordion-header'));
        const currentIndex = headers.indexOf(currentHeader);
        const prevHeader = headers[currentIndex - 1] || headers[headers.length - 1];
        prevHeader.focus();
    }

    // Accordion umschalten
    toggleAccordion(id) {
        const accordion = this.accordions.get(id);
        if (!accordion) return;

        if (accordion.isOpen) {
            this.closeAccordion(id);
        } else {
            this.openAccordion(id);
        }
    }

    // Accordion öffnen (optimiert)
    openAccordion(id) {
        const accordion = this.accordions.get(id);
        if (!accordion || accordion.isOpen) return;

        const { header, content } = accordion;

        // Header-Pfeil animieren
        const arrow = header.querySelector('i');
        if (arrow) {
            arrow.classList.add('rotated');
        }

        // Content anzeigen mit Hardware-Beschleunigung
        content.style.display = 'block';
        content.classList.add('active');

        // Optimierte Animation mit will-change
        const height = content.scrollHeight;
        content.style.willChange = 'height';
        content.style.height = '0';
        content.style.overflow = 'hidden';
        
        // Batch DOM-Updates
        requestAnimationFrame(() => {
            content.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            content.style.height = height + 'px';
        });

        // Nach Animation aufräumen
        const cleanupTimeout = setTimeout(() => {
            content.style.height = '';
            content.style.overflow = '';
            content.style.transition = '';
            content.style.willChange = '';
        }, 300);

        // Header-Zustand aktualisieren
        header.classList.add('active');
        header.setAttribute('aria-expanded', 'true');

        // Accordion-Zustand aktualisieren
        accordion.isOpen = true;
        accordion.cleanupTimeout = cleanupTimeout;

        // Event auslösen
        this.dispatchAccordionEvent('open', id);
    }

    // Accordion schließen (optimiert)
    closeAccordion(id) {
        const accordion = this.accordions.get(id);
        if (!accordion || !accordion.isOpen) return;

        // Cleanup vorheriger Timeouts
        if (accordion.cleanupTimeout) {
            clearTimeout(accordion.cleanupTimeout);
        }

        const { header, content } = accordion;

        // Header-Pfeil animieren
        const arrow = header.querySelector('i');
        if (arrow) {
            arrow.classList.remove('rotated');
        }

        // Content-Höhe für Animation setzen mit Hardware-Beschleunigung
        const height = content.scrollHeight;
        content.style.willChange = 'height';
        content.style.height = height + 'px';
        content.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            content.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            content.style.height = '0';
        });

        // Nach Animation verstecken
        const cleanupTimeout = setTimeout(() => {
            content.style.display = 'none';
            content.classList.remove('active');
            content.style.height = '';
            content.style.overflow = '';
            content.style.transition = '';
            content.style.willChange = '';
        }, 300);

        // Header-Zustand aktualisieren
        header.classList.remove('active');
        header.setAttribute('aria-expanded', 'false');

        // Accordion-Zustand aktualisieren
        accordion.isOpen = false;
        accordion.cleanupTimeout = cleanupTimeout;

        // Event auslösen
        this.dispatchAccordionEvent('close', id);
    }

    // Alle Accordions schließen
    closeAllAccordions() {
        this.accordions.forEach((accordion, id) => {
            if (accordion.isOpen) {
                this.closeAccordion(id);
            }
        });
    }

    // Alle Accordions öffnen
    openAllAccordions() {
        this.accordions.forEach((accordion, id) => {
            if (!accordion.isOpen) {
                this.openAccordion(id);
            }
        });
    }

    // Accordion-Gruppe erstellen
    createAccordionGroup(containerId, items) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const accordionHTML = items.map((item, index) => `
            <div class="accordion-item">
                <div class="accordion-header" 
                     data-accordion="${item.id || `accordion-${index}`}"
                     tabindex="0"
                     role="button"
                     aria-expanded="false"
                     aria-controls="${item.id || `accordion-${index}`}-content">
                    <h3>${item.title}</h3>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="accordion-content" 
                     id="${item.id || `accordion-${index}`}-content"
                     role="region"
                     aria-labelledby="${item.id || `accordion-${index}`}">
                    ${item.content}
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="accordion-group">
                ${accordionHTML}
            </div>
        `;

        // Neue Accordions registrieren
        items.forEach((item, index) => {
            const id = item.id || `accordion-${index}`;
            this.registerAccordion(id);
        });
    }

    // Accordion-Event auslösen
    dispatchAccordionEvent(eventType, accordionId) {
        const event = new CustomEvent(`accordion${eventType}`, {
            detail: { accordionId }
        });
        document.dispatchEvent(event);
    }

    // Accordion-ID generieren
    generateAccordionId() {
        return `accordion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Accordion-Zustand abrufen
    getAccordionState(id) {
        const accordion = this.accordions.get(id);
        return accordion ? accordion.isOpen : false;
    }

    // Accordion-Zustand für alle abrufen
    getAllAccordionStates() {
        const states = {};
        this.accordions.forEach((accordion, id) => {
            states[id] = accordion.isOpen;
        });
        return states;
    }

    // Accordion-Zustände wiederherstellen
    restoreAccordionStates(states) {
        Object.entries(states).forEach(([id, isOpen]) => {
            if (isOpen) {
                this.openAccordion(id);
            } else {
                this.closeAccordion(id);
            }
        });
    }

    // Accordion entfernen
    removeAccordion(id) {
        const accordion = this.accordions.get(id);
        if (accordion) {
            accordion.element.remove();
            this.accordions.delete(id);
        }
    }

    // Accordion-Content aktualisieren
    updateAccordionContent(id, content) {
        const accordion = this.accordions.get(id);
        if (accordion) {
            accordion.content.innerHTML = content;
        }
    }

    // Accordion-Titel aktualisieren
    updateAccordionTitle(id, title) {
        const accordion = this.accordions.get(id);
        if (accordion) {
            const titleElement = accordion.header.querySelector('h3');
            if (titleElement) {
                titleElement.textContent = title;
            }
        }
    }

    // Accordion deaktivieren
    disableAccordion(id) {
        const accordion = this.accordions.get(id);
        if (accordion) {
            accordion.header.style.pointerEvents = 'none';
            accordion.header.style.opacity = '0.5';
            accordion.header.setAttribute('aria-disabled', 'true');
        }
    }

    // Accordion aktivieren
    enableAccordion(id) {
        const accordion = this.accordions.get(id);
        if (accordion) {
            accordion.header.style.pointerEvents = '';
            accordion.header.style.opacity = '';
            accordion.header.setAttribute('aria-disabled', 'false');
        }
    }

    // Accordion-System zurücksetzen
    reset() {
        this.accordions.clear();
        this.initializeExistingAccordions();
    }
}

// CSS für Accordion-Animationen
const accordionStyles = `
    .accordion-header {
        cursor: pointer;
        user-select: none;
        position: relative;
        transition: background-color var(--transition-fast);
    }

    .accordion-header:focus {
        outline: 2px solid var(--primary);
        outline-offset: 2px;
    }

    .accordion-header i {
        transition: transform var(--transition-fast);
    }

    .accordion-header.active i,
    .accordion-header i.rotated {
        transform: rotate(180deg);
    }

    .accordion-content {
        overflow: hidden;
        transition: height var(--transition-normal) ease-out;
    }

    .accordion-item {
        border-bottom: 1px solid var(--border-light);
    }

    .accordion-item:last-child {
        border-bottom: none;
    }

    .accordion-group {
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        overflow: hidden;
    }

    .accordion-group .accordion-item {
        border-bottom: 1px solid var(--border-light);
    }

    .accordion-group .accordion-item:last-child {
        border-bottom: none;
    }

    @media (prefers-reduced-motion: reduce) {
        .accordion-header i,
        .accordion-content {
            transition: none !important;
        }
    }
`;

// CSS hinzufügen
const accordionStyleSheet = document.createElement('style');
accordionStyleSheet.textContent = accordionStyles;
document.head.appendChild(accordionStyleSheet);

// Accordion System initialisieren
window.accordionSystem = new AccordionSystem();

// Globale Funktionen für Kompatibilität
window.toggleAccordion = (id) => window.accordionSystem.toggleAccordion(id);
window.openAccordion = (id) => window.accordionSystem.openAccordion(id);
window.closeAccordion = (id) => window.accordionSystem.closeAccordion(id);
window.createAccordionGroup = (containerId, items) => window.accordionSystem.createAccordionGroup(containerId, items);