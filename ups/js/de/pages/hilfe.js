// Hilfe page specific functionality
class HilfePage {
    constructor() {
        this.faqs = [];
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStats();
        this.loadFAQs();
        this.loadFromStorage();
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
        this.faqs = [
            {
                id: 'faq-1',
                question: 'Wie erstelle ich eine neue Sendung?',
                answer: 'Klicken Sie auf "Neue Sendung" im Dashboard oder in der Sendungen-Übersicht. Füllen Sie alle erforderlichen Felder aus und klicken Sie auf "Speichern". Das System validiert automatisch alle Eingaben.',
                category: 'Grundlagen',
                keywords: ['sendung', 'erstellen', 'neu', 'hinzufügen']
            },
            {
                id: 'faq-2',
                question: 'Welche Dateiformate werden für den Import unterstützt?',
                answer: 'CSV (Comma Separated Values) und SSV (Semicolon Separated Values) Dateien werden unterstützt. Die maximale Dateigröße beträgt 10MB. Stellen Sie sicher, dass die erste Zeile die Spaltenüberschriften enthält.',
                category: 'Import',
                keywords: ['csv', 'ssv', 'import', 'datei', 'format']
            },
            {
                id: 'faq-3',
                question: 'Wie kann ich Sendungen in großen Mengen bearbeiten?',
                answer: 'Wählen Sie mehrere Sendungen in der Tabelle aus, indem Sie die Checkboxen aktivieren. Anschließend können Sie Bulk-Aktionen wie "Auswahl löschen" verwenden. Sie können auch alle Sendungen auf einmal auswählen.',
                category: 'Verwaltung',
                keywords: ['bulk', 'mehrere', 'auswahl', 'löschen', 'bearbeiten']
            },
            {
                id: 'faq-4',
                question: 'Was bedeuten die Validierungsfehler?',
                answer: 'Validierungsfehler zeigen an, dass bestimmte Felder nicht den UPS-Anforderungen entsprechen. Überprüfen Sie Pflichtfelder wie Firmenname, Adresse und Postleitzahl. Achten Sie auf das korrekte Format und die Längenbeschränkungen.',
                category: 'Validierung',
                keywords: ['validierung', 'fehler', 'pflichtfelder', 'format']
            },
            {
                id: 'faq-5',
                question: 'Wo werden meine Daten gespeichert?',
                answer: 'Alle Daten werden lokal in Ihrem Browser gespeichert (localStorage). Es werden keine Daten an externe Server übertragen. Ihre Daten bleiben 100% privat und lokal auf Ihrem Computer.',
                category: 'Datenschutz',
                keywords: ['speichern', 'daten', 'lokal', 'privat', 'sicherheit']
            },
            {
                id: 'faq-6',
                question: 'Wie exportiere ich meine Sendungen?',
                answer: 'Gehen Sie zur Export-Seite und wählen Sie das gewünschte Format (CSV oder SSV). Sie können zwischen allen Sendungen oder nur gültigen Sendungen wählen. Für schnelle Exports verwenden Sie die Schnell-Export Buttons.',
                category: 'Export',
                keywords: ['export', 'exportieren', 'csv', 'ssv', 'download']
            },
            {
                id: 'faq-7',
                question: 'Welche UPS Services werden unterstützt?',
                answer: 'Alle Standard UPS Services werden unterstützt: Next Day Air, 2nd Day Air, Ground, Express, Expedited und Standard. Wählen Sie den passenden Service für Ihre Sendung aus.',
                category: 'Services',
                keywords: ['ups', 'service', 'versand', 'express', 'standard']
            },
            {
                id: 'faq-8',
                question: 'Wie kann ich meine Einstellungen anpassen?',
                answer: 'Öffnen Sie die Einstellungen-Seite über das Menü. Dort können Sie Standard-Werte für Land, Service und Maßeinheiten festlegen, das Thema ändern und Dateneinstellungen verwalten.',
                category: 'Einstellungen',
                keywords: ['einstellungen', 'konfiguration', 'standard', 'thema']
            },
            {
                id: 'faq-9',
                question: 'Was ist bei internationalen Sendungen zu beachten?',
                answer: 'Für internationale Sendungen (außerhalb Deutschlands) sind zusätzliche Felder erforderlich: Zollwert, Warenbeschreibung und ggf. GNIFC-Code. Stellen Sie sicher, dass alle Zollformulare korrekt ausgefüllt sind.',
                category: 'International',
                keywords: ['international', 'zoll', 'zollwert', 'warenbeschreibung']
            },
            {
                id: 'faq-10',
                question: 'Wie kann ich Fehler in meinen Sendungen finden?',
                answer: 'Fehlerhafte Sendungen werden rot markiert. Klicken Sie auf eine Sendung, um Details zu den Validierungsfehlern zu sehen. Sie können auch einen Fehler-Report exportieren, um alle Probleme zu analysieren.',
                category: 'Fehlerbehebung',
                keywords: ['fehler', 'validierung', 'problem', 'rot', 'markiert']
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

        faqList.innerHTML = faqsToRender.map((faq, index) => `
            <div class="faq-item" data-faq-id="${faq.id}">
                <div class="faq-question" onclick="toggleFAQ('${faq.id}')">
                    <span class="faq-category">${faq.category}</span>
                    <span class="faq-question-text">${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer" id="${faq.id}">
                    <p>${faq.answer}</p>
                </div>
            </div>
        `).join('');
    }

    handleHelpSearch(searchTerm) {
        if (!searchTerm.trim()) {
            this.renderFAQs();
            return;
        }

        const searchLower = searchTerm.toLowerCase();
        const filteredFAQs = this.faqs.filter(faq => 
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower) ||
            faq.category.toLowerCase().includes(searchLower) ||
            faq.keywords.some(keyword => keyword.includes(searchLower))
        );

        this.renderFAQs(filteredFAQs);
    }

    toggleFAQ(faqId) {
        const answer = document.getElementById(faqId);
        const question = answer.previousElementSibling;
        
        if (!answer || !question) return;

        // Close all other FAQs
        document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
            if (otherAnswer !== answer) {
                otherAnswer.classList.remove('active');
                const otherQuestion = otherAnswer.previousElementSibling;
                if (otherQuestion) {
                    otherQuestion.classList.remove('active');
                }
            }
        });

        // Toggle current FAQ
        answer.classList.toggle('active');
        question.classList.toggle('active');
    }

    showContactInfo() {
        const contactInfo = `
            <div class="contact-info">
                <h3>Kontakt & Support</h3>
                <div class="contact-item">
                    <i class="fas fa-info-circle"></i>
                    <div>
                        <strong>Lokale Anwendung</strong>
                        <p>Diese Anwendung läuft vollständig lokal in Ihrem Browser. Es wird keine Verbindung zu externen Servern hergestellt.</p>
                    </div>
                </div>
                <div class="contact-item">
                    <i class="fas fa-book"></i>
                    <div>
                        <strong>Dokumentation</strong>
                        <p>Alle Funktionen sind in der integrierten Hilfe dokumentiert. Verwenden Sie die Suchfunktion, um spezifische Informationen zu finden.</p>
                    </div>
                </div>
                <div class="contact-item">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <strong>Datenschutz</strong>
                        <p>Ihre Daten werden zu 100% lokal gespeichert und verlassen niemals Ihren Computer.</p>
                    </div>
                </div>
            </div>
        `;

        if (window.modalSystem && typeof window.modalSystem.createModal === 'function') {
            window.modalSystem.createModal('contactModal', {
                title: 'Kontakt & Support',
                content: contactInfo,
                size: 'medium'
            });
            window.modalSystem.showModal('contactModal');
        }
    }

    showKeyboardShortcuts() {
        const shortcuts = `
            <div class="keyboard-shortcuts">
                <h3>Tastenkombinationen</h3>
                <div class="shortcut-grid">
                    <div class="shortcut-item">
                        <kbd>Strg</kbd> + <kbd>S</kbd>
                        <span>Neue Sendung erstellen</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Strg</kbd> + <kbd>I</kbd>
                        <span>Zur Import-Seite</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Strg</kbd> + <kbd>E</kbd>
                        <span>Zur Export-Seite</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Strg</kbd> + <kbd>D</kbd>
                        <span>Vorlage herunterladen</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>Esc</kbd>
                        <span>Filter zurücksetzen</span>
                    </div>
                    <div class="shortcut-item">
                        <kbd>F11</kbd>
                        <span>Vollbild umschalten</span>
                    </div>
                </div>
            </div>
        `;

        if (window.modalSystem && typeof window.modalSystem.createModal === 'function') {
            window.modalSystem.createModal('shortcutsModal', {
                title: 'Tastenkombinationen',
                content: shortcuts,
                size: 'medium'
            });
            window.modalSystem.showModal('shortcutsModal');
        }
    }

    loadFromStorage() {
        // Load any help-specific settings
        const helpSettings = localStorage.getItem('helpSettings');
        if (helpSettings) {
            try {
                const settings = JSON.parse(helpSettings);
                this.applyHelpSettings(settings);
            } catch (error) {
                console.error('Error loading help settings:', error);
            }
        }
    }

    applyHelpSettings(settings) {
        // Apply help-specific settings
        if (settings.expandedFAQs) {
            settings.expandedFAQs.forEach(faqId => {
                setTimeout(() => {
                    this.toggleFAQ(faqId);
                }, 100);
            });
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

window.showContactInfo = () => {
    if (window.hilfePage) {
        window.hilfePage.showContactInfo();
    }
};

window.showKeyboardShortcuts = () => {
    if (window.hilfePage) {
        window.hilfePage.showKeyboardShortcuts();
    }
};

// Initialize hilfe page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hilfePage = new HilfePage();
    window.pageManager = window.hilfePage; // Set as global page manager
});