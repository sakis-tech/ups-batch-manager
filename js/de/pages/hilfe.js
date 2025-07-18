// Hilfe page specific functionality
class HilfePage {
    constructor() {
        this.faqs = [];
        this.currentTab = 'app-usage';
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStats();
        this.loadFAQs();
        this.setupTabs();
        this.setupAccordions();
    }

    setupEventListeners() {
        // Help search
        const helpSearch = document.getElementById('helpSearch');
        if (helpSearch) {
            helpSearch.addEventListener('input', this.debounce((e) => {
                this.handleHelpSearch(e.target.value);
            }, 300));
        }

        // Update stats when shipment manager changes
        if (window.shipmentManager) {
            window.addEventListener('storage', (e) => {
                if (e.key === 'upsShipments') {
                    this.updateStats();
                }
            });
        }
    }

    setupTabs() {
        // Tab switching functionality
        const tabButtons = document.querySelectorAll('.help-tab');
        const tabContents = document.querySelectorAll('.help-tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                this.currentTab = targetTab;
            });
        });
    }

    setupAccordions() {
        // UPS field categories accordion
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const accordionItem = header.parentElement;
                const content = header.nextElementSibling;
                const isActive = accordionItem.classList.contains('active');
                
                // Close all accordion items
                accordionHeaders.forEach(otherHeader => {
                    const otherItem = otherHeader.parentElement;
                    const otherContent = otherHeader.nextElementSibling;
                    otherItem.classList.remove('active');
                    if (otherContent) {
                        otherContent.style.maxHeight = null;
                    }
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    accordionItem.classList.add('active');
                    if (content) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                }
            });
        });
    }

    debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    updateStats() {
        if (window.sharedPageManager) {
            window.sharedPageManager.updateStats();
        }
    }

    loadFAQs() {
        // FAQs basierend auf der UPS-JSON-Spezifikation und allgemeine Nutzung
        this.faqs = [
            // Aus UPS JSON - Frequent Asked Questions
            {
                id: 'faq-ups-1',
                question: 'Muss ich alle Felder in der Batch-Datei ausfüllen, auch wenn sie nicht erforderlich sind?',
                answer: 'Ja, Sie müssen alle Spalten berücksichtigen, auch optionale Felder, die Sie nicht verwenden. Diese Spalten können leer bleiben, dürfen aber nicht gelöscht werden. UPS erwartet alle 66 Felder in der korrekten Reihenfolge.',
                category: 'UPS-Batch',
                keywords: ['felder', 'spalten', 'optional', 'leer', 'löschen', 'erforderlich']
            },
            {
                id: 'faq-ups-2',
                question: 'Welche Services und Abholtage sind für mein Herkunfts- und Zielland gültig?',
                answer: 'Sie finden Service- und Abholinformationen auf der UPS-Website unter "Zeit und Kosten berechnen". Die verfügbaren Services hängen von der Route und dem Zielland ab.',
                category: 'UPS-Services',
                keywords: ['service', 'abholtage', 'herkunft', 'ziel', 'kosten', 'berechnen']
            },
            {
                id: 'faq-ups-3',
                question: 'Warum erhalte ich einen Adressfehler?',
                answer: 'Achten Sie auf falsch geschriebene Städte. Verwenden Sie keine Straßentyp-Abkürzungen wie "Str." - schreiben Sie "Straße" aus. Vermeiden Sie Sonderzeichen und ungewöhnliche Abkürzungen.',
                category: 'UPS-Validierung',
                keywords: ['adresse', 'fehler', 'stadt', 'straße', 'abkürzung', 'sonderzeichen']
            },
            {
                id: 'faq-ups-4',
                question: 'Erhalte ich einen Fehler, wenn die Datei nicht korrekt ist?',
                answer: 'Ja, Sie erhalten einen Fehler, wenn das Format nicht korrekt ist. Achten Sie auf alle Fehlermeldungen, die Sie während des Batch-Import-Prozesses erhalten.',
                category: 'UPS-Import',
                keywords: ['fehler', 'format', 'korrekt', 'fehlermeldung', 'import', 'prozess']
            },
            {
                id: 'faq-ups-5',
                question: 'Kann ich die Header-Zeile in meiner Batch-Datei belassen?',
                answer: 'Nein, die Header-Zeile darf nicht in der Batch-Datei enthalten sein. Löschen Sie die Header-Zeile vor dem Upload zu UPS.',
                category: 'UPS-Format',
                keywords: ['header', 'zeile', 'belassen', 'löschen', 'upload', 'batch']
            },
            {
                id: 'faq-ups-6',
                question: 'Muss ich die Felder in einer bestimmten Reihenfolge eingeben?',
                answer: 'Ja, die Felder müssen in Ihrer Import-Datei in derselben Reihenfolge eingegeben werden, wie sie in der UPS-Vorlage erscheinen. Diese Anwendung stellt automatisch die korrekte Reihenfolge sicher.',
                category: 'UPS-Format',
                keywords: ['reihenfolge', 'felder', 'eingeben', 'vorlage', 'korrekt']
            },
            {
                id: 'faq-ups-7',
                question: 'Welches Format sollte ich für das Land verwenden?',
                answer: 'Verwenden Sie das zweistellige ISO-Länder-Kürzel. Beispiel: "DE" statt "Deutschland", "US" statt "United States".',
                category: 'UPS-Format',
                keywords: ['format', 'land', 'iso', 'kürzel', 'deutschland', 'zweistellig']
            },
            {
                id: 'faq-ups-8',
                question: 'Was gebe ich für das Bundesland/Provinz-Feld bei USA-Sendungen ein?',
                answer: 'Verwenden Sie die zweistellige Bundesland-Abkürzung. Beispiel: "PA" statt "Pennsylvania", "NJ" statt "New Jersey".',
                category: 'UPS-Format',
                keywords: ['bundesland', 'provinz', 'usa', 'abkürzung', 'pennsylvania', 'zweistellig']
            },
            {
                id: 'faq-ups-9',
                question: 'Kann ich Kommas in meinen Feldern verwenden, z.B. in der Adresse?',
                answer: 'Nein, verwenden Sie keine Kommas in Ihren Feldern. Kommas würden Fehler bei der Verarbeitung Ihrer Datei verursachen.',
                category: 'UPS-Format',
                keywords: ['kommas', 'felder', 'adresse', 'verwenden', 'fehler', 'verarbeitung']
            },
            {
                id: 'faq-ups-10',
                question: 'Kann ich Batch-Sendungen mit SurePost-Services erstellen?',
                answer: 'Ja, solange Sie einen Account mit einem SurePost-Vertrag haben, können Sie Batch-Sendungen mit SurePost-Services erstellen.',
                category: 'UPS-Services',
                keywords: ['batch', 'surepost', 'services', 'account', 'vertrag']
            },
            
            // Anwendungs-spezifische FAQs
            {
                id: 'faq-app-1',
                question: 'Wie erstelle ich eine neue Sendung?',
                answer: 'Klicken Sie auf "Sendungen" im Menü und dann auf "Neue Sendung". Füllen Sie alle erforderlichen Felder aus. Pflichtfelder sind mit einem roten Stern markiert.',
                category: 'Anwendung',
                keywords: ['sendung', 'erstellen', 'neu', 'hinzufügen', 'pflichtfelder']
            },
            {
                id: 'faq-app-2',
                question: 'Welche Dateiformate werden für den Import unterstützt?',
                answer: 'CSV (Komma-getrennt), SSV (Semikolon-getrennt) und TXT-Dateien werden unterstützt. Die maximale Dateigröße beträgt 10MB.',
                category: 'Import',
                keywords: ['csv', 'ssv', 'txt', 'import', 'datei', 'format', 'größe']
            },
            {
                id: 'faq-app-3',
                question: 'Was ist der Unterschied zwischen CSV und SSV Export?',
                answer: 'CSV verwendet Kommas als Trennzeichen, SSV verwendet Semikolons. SSV wird für deutsche Excel-Nutzer empfohlen, da es besser mit deutschen Zahlenformaten funktioniert.',
                category: 'Export',
                keywords: ['csv', 'ssv', 'unterschied', 'komma', 'semikolon', 'excel', 'deutsch']
            },
            {
                id: 'faq-app-4',
                question: 'Wo werden meine Daten gespeichert?',
                answer: 'Alle Daten werden zu 100% lokal in Ihrem Browser gespeichert. Es werden keine Daten an externe Server übertragen. Ihre Daten bleiben vollständig privat.',
                category: 'Datenschutz',
                keywords: ['daten', 'speichern', 'lokal', 'browser', 'privat', 'sicherheit']
            },
            {
                id: 'faq-app-5',
                question: 'Funktioniert die Anwendung ohne Internetverbindung?',
                answer: 'Ja, nach dem ersten Laden funktioniert die Anwendung vollständig offline. Eine Internetverbindung ist nur für den finalen UPS-Upload erforderlich.',
                category: 'Offline',
                keywords: ['offline', 'internetverbindung', 'ohne', 'internet', 'ups', 'upload']
            },
            {
                id: 'faq-app-6',
                question: 'Wie kann ich Sendungen in großen Mengen bearbeiten?',
                answer: 'Wählen Sie mehrere Sendungen mit den Checkboxen aus und verwenden Sie die Bulk-Aktionen. Sie können auch alle Sendungen auf einmal auswählen.',
                category: 'Verwaltung',
                keywords: ['bulk', 'mehrere', 'auswahl', 'checkbox', 'alle', 'bearbeiten']
            },
            {
                id: 'faq-app-7',
                question: 'Was bedeuten die verschiedenen Validierungsfarben?',
                answer: 'Grün = Gültige Sendung, Rot = Fehlerhafte Sendung mit Pflichtfeld-Problemen, Gelb = Warnung (z.B. ungewöhnliche Werte). Nur grüne Sendungen können erfolgreich zu UPS hochgeladen werden.',
                category: 'Validierung',
                keywords: ['farben', 'grün', 'rot', 'gelb', 'gültig', 'fehler', 'warnung']
            },
            {
                id: 'faq-app-8',
                question: 'Kann ich meine eigenen Standard-Werte festlegen?',
                answer: 'Ja, in den Einstellungen können Sie Standard-Werte für Land, Service-Art, Maßeinheiten und andere häufig verwendete Felder festlegen.',
                category: 'Einstellungen',
                keywords: ['standard', 'werte', 'einstellungen', 'land', 'service', 'maßeinheiten']
            },
            {
                id: 'faq-app-9',
                question: 'Wie kann ich meine Arbeit rückgängig machen?',
                answer: 'Verwenden Sie Strg+Z zum Rückgängigmachen oder Strg+Y zum Wiederholen. Die Anwendung merkt sich mehrere Schritte Ihres Verlaufs.',
                category: 'Bedienung',
                keywords: ['rückgängig', 'undo', 'strg+z', 'strg+y', 'wiederholen', 'verlauf']
            },
            {
                id: 'faq-app-10',
                question: 'Was ist bei internationalen Sendungen zu beachten?',
                answer: 'Für internationale Sendungen (außerhalb des Versender-Landes) sind zusätzliche Felder erforderlich: Kontaktname, Telefon, Zollwert und Warenbeschreibung.',
                category: 'International',
                keywords: ['international', 'kontaktname', 'telefon', 'zollwert', 'warenbeschreibung', 'ausland']
            }
        ];

        this.renderFAQs();
    }

    renderFAQs(filteredFAQs = null) {
        const faqList = document.getElementById('faqList');
        if (!faqList) return;

        const faqsToRender = filteredFAQs || this.faqs;

        if (faqsToRender.length === 0) {
            faqList.innerHTML = `
                <div class="faq-empty">
                    <i class="fas fa-search"></i>
                    <p>Keine Hilfe-Artikel gefunden</p>
                    <p>Versuchen Sie andere Suchbegriffe</p>
                </div>
            `;
            return;
        }

        // Group FAQs by category
        const groupedFAQs = faqsToRender.reduce((groups, faq) => {
            const category = faq.category;
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(faq);
            return groups;
        }, {});

        let html = '';
        Object.entries(groupedFAQs).forEach(([category, faqs]) => {
            html += `
                <div class="faq-category">
                    <h4 class="faq-category-title">${category}</h4>
                    <div class="faq-category-items">
            `;
            
            faqs.forEach(faq => {
                html += `
                    <div class="faq-item" data-faq-id="${faq.id}">
                        <div class="faq-question" onclick="toggleFAQ('${faq.id}')">
                            <span class="faq-question-text">${faq.question}</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="faq-answer" id="${faq.id}">
                            <p>${faq.answer}</p>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });

        faqList.innerHTML = html;
    }

    handleHelpSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderFAQs();
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        
        // Search in all content, not just FAQ tab
        if (this.currentTab === 'troubleshooting') {
            // Filter FAQs
            const filteredFAQs = this.faqs.filter(faq => 
                faq.question.toLowerCase().includes(searchLower) ||
                faq.answer.toLowerCase().includes(searchLower) ||
                faq.category.toLowerCase().includes(searchLower) ||
                faq.keywords.some(keyword => keyword.includes(searchLower))
            );
            this.renderFAQs(filteredFAQs);
        } else {
            // Search in other tab content
            this.highlightSearchTerms(searchTerm);
        }
    }

    highlightSearchTerms(searchTerm) {
        // Remove previous highlights
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });

        if (!searchTerm.trim()) return;

        // Add new highlights
        const walker = document.createTreeWalker(
            document.querySelector(`#${this.currentTab}`),
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        const searchRegex = new RegExp(`(${searchTerm})`, 'gi');
        textNodes.forEach(textNode => {
            if (searchRegex.test(textNode.textContent)) {
                const parent = textNode.parentNode;
                const html = textNode.textContent.replace(searchRegex, '<span class="search-highlight">$1</span>');
                const wrapper = document.createElement('div');
                wrapper.innerHTML = html;
                
                while (wrapper.firstChild) {
                    parent.insertBefore(wrapper.firstChild, textNode);
                }
                parent.removeChild(textNode);
            }
        });
    }

    toggleFAQ(faqId) {
        const answer = document.getElementById(faqId);
        const question = answer.previousElementSibling;
        
        if (!answer || !question) return;

        const isActive = answer.classList.contains('active');

        // Close all other FAQs in same category
        const categoryContainer = answer.closest('.faq-category-items');
        if (categoryContainer) {
            categoryContainer.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                if (otherAnswer !== answer) {
                    otherAnswer.classList.remove('active');
                    const otherQuestion = otherAnswer.previousElementSibling;
                    if (otherQuestion) {
                        otherQuestion.classList.remove('active');
                    }
                }
            });
        }

        // Toggle current FAQ
        if (!isActive) {
            answer.classList.add('active');
            question.classList.add('active');
        } else {
            answer.classList.remove('active');
            question.classList.remove('active');
        }
    }

    renderContent() {
        this.renderFAQs();
    }
}

// Global functions for HTML onclick handlers
window.toggleFAQ = (faqId) => {
    if (window.hilfePage) {
        window.hilfePage.toggleFAQ(faqId);
    }
};

// Initialize hilfe page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hilfePage = new HilfePage();
    window.pageManager = window.hilfePage; // Set as global page manager
});