// Toast System für die deutsche UPS Batch Manager Oberfläche
class ToastSystem {
    constructor() {
        this.toasts = new Map();
        this.toastCounter = 0;
        this.container = null;
        this.initialize();
    }

    initialize() {
        // Toast Container erstellen falls nicht vorhanden
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    // Toast anzeigen
    showToast(message, type = 'info', options = {}) {
        const toastId = ++this.toastCounter;
        const toast = {
            id: toastId,
            message: message,
            type: type,
            title: options.title || this.getDefaultTitle(type),
            duration: options.duration || this.getDefaultDuration(type),
            persistent: options.persistent || false,
            actions: options.actions || [],
            onClose: options.onClose || null,
            onAction: options.onAction || null
        };

        this.toasts.set(toastId, toast);
        this.renderToast(toast);

        // Auto-Hide Timer
        if (!toast.persistent && toast.duration > 0) {
            setTimeout(() => {
                this.hideToast(toastId);
            }, toast.duration);
        }

        return toastId;
    }

    // Toast ausblenden
    hideToast(toastId) {
        const toast = this.toasts.get(toastId);
        if (!toast) return;

        const toastElement = document.getElementById(`toast-${toastId}`);
        if (toastElement) {
            toastElement.classList.add('animate-slideOut');
            setTimeout(() => {
                if (toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                this.toasts.delete(toastId);
                
                // onClose-Callback
                if (toast.onClose) {
                    toast.onClose();
                }
            }, 300);
        }
    }

    // Toast rendern
    renderToast(toast) {
        const toastElement = document.createElement('div');
        toastElement.id = `toast-${toast.id}`;
        toastElement.className = `toast ${toast.type} animate-slideIn`;
        
        toastElement.innerHTML = `
            <div class="toast-header">
                <div class="toast-icon">
                    <i class="fas fa-${this.getToastIcon(toast.type)}"></i>
                </div>
                <h4 class="toast-title">${toast.title}</h4>
                <button class="toast-close" data-toast-id="${toast.id}" aria-label="Schließen">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-body">
                <p>${toast.message}</p>
                ${toast.actions.length > 0 ? this.renderToastActions(toast) : ''}
            </div>
            ${toast.duration > 0 && !toast.persistent ? `<div class="toast-progress"><div class="toast-progress-bar" style="animation-duration: ${toast.duration}ms;"></div></div>` : ''}
        `;

        // Event-Listener
        this.attachToastListeners(toastElement, toast);

        // Toast Container hinzufügen
        this.container.appendChild(toastElement);
    }

    // Toast-Aktionen rendern
    renderToastActions(toast) {
        return `
            <div class="toast-actions">
                ${toast.actions.map(action => `
                    <button class="btn btn-sm ${action.class || 'btn-secondary'}" 
                            data-action="${action.action}" 
                            data-toast-id="${toast.id}">
                        ${action.icon ? `<i class="${action.icon}"></i>` : ''}
                        ${action.text}
                    </button>
                `).join('')}
            </div>
        `;
    }

    // Event-Listener für Toast
    attachToastListeners(toastElement, toast) {
        // Schließen-Button
        const closeBtn = toastElement.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideToast(toast.id);
            });
        }

        // Action-Buttons
        const actionBtns = toastElement.querySelectorAll('.toast-actions button');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                
                if (toast.onAction) {
                    const result = toast.onAction(action, toast);
                    if (result !== false) {
                        this.hideToast(toast.id);
                    }
                } else {
                    this.hideToast(toast.id);
                }
            });
        });

        // Hover-Pause für Auto-Hide
        if (!toast.persistent && toast.duration > 0) {
            let timeoutId;
            
            toastElement.addEventListener('mouseenter', () => {
                const progressBar = toastElement.querySelector('.toast-progress-bar');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'paused';
                }
            });

            toastElement.addEventListener('mouseleave', () => {
                const progressBar = toastElement.querySelector('.toast-progress-bar');
                if (progressBar) {
                    progressBar.style.animationPlayState = 'running';
                }
            });
        }
    }

    // Toast-Icon basierend auf Typ
    getToastIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'times-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'loading': 'spinner'
        };
        return icons[type] || 'info-circle';
    }

    // Standard-Titel basierend auf Typ
    getDefaultTitle(type) {
        if (window.languageManager) {
            return window.languageManager.t(`toast.titles.${type}`);
        }
        
        const titles = {
            'success': 'Erfolgreich',
            'error': 'Fehler',
            'warning': 'Warnung',
            'info': 'Information',
            'loading': 'Lädt...'
        };
        return titles[type] || 'Hinweis';
    }

    // Standard-Dauer basierend auf Typ
    getDefaultDuration(type) {
        const durations = {
            'success': 4000,
            'error': 6000,
            'warning': 5000,
            'info': 4000,
            'loading': 0
        };
        return durations[type] || 4000;
    }

    // Alle Toasts schließen
    hideAllToasts() {
        const toastIds = Array.from(this.toasts.keys());
        toastIds.forEach(id => this.hideToast(id));
    }

    // Toast-Typ-spezifische Methoden
    showSuccess(message, options = {}) {
        return this.showToast(message, 'success', options);
    }

    showError(message, options = {}) {
        return this.showToast(message, 'error', options);
    }

    showWarning(message, options = {}) {
        return this.showToast(message, 'warning', options);
    }

    showInfo(message, options = {}) {
        return this.showToast(message, 'info', options);
    }

    showLoading(message, options = {}) {
        return this.showToast(message, 'loading', { 
            ...options, 
            persistent: true,
            duration: 0
        });
    }

    // Vordefinierte Toast-Nachrichten
    showSaveSuccess(itemName = 'Daten') {
        return this.showSuccess(`${itemName} erfolgreich gespeichert.`);
    }

    showDeleteSuccess(itemName = 'Element') {
        return this.showSuccess(`${itemName} erfolgreich gelöscht.`);
    }

    showImportSuccess(count) {
        return this.showSuccess(`${count} Sendungen erfolgreich importiert.`);
    }

    showExportSuccess(filename) {
        return this.showSuccess(`Datei "${filename}" erfolgreich exportiert.`);
    }

    showValidationError(message) {
        return this.showError(`Validierungsfehler: ${message}`);
    }

    showNetworkError() {
        return this.showError('Netzwerkfehler. Bitte versuchen Sie es später erneut.');
    }

    showStorageWarning() {
        return this.showWarning('Speicherplatz wird knapp. Löschen Sie alte Daten oder exportieren Sie sie.');
    }

    showUnsavedChanges() {
        return this.showWarning('Sie haben ungespeicherte Änderungen. Vergessen Sie nicht zu speichern!', {
            actions: [
                { text: 'Speichern', class: 'btn-primary', action: 'save' },
                { text: 'Verwerfen', class: 'btn-secondary', action: 'discard' }
            ]
        });
    }

    showBatchProcessing(current, total) {
        return this.showLoading(`Verarbeite ${current} von ${total} Sendungen...`);
    }

    showFileUpload(filename) {
        return this.showLoading(`Lade "${filename}" hoch...`);
    }

    showValidationInProgress() {
        return this.showLoading('Validiere Sendungsdaten...');
    }

    // Toast-Konfiguration aktualisieren
    updateToast(toastId, message, type) {
        const toast = this.toasts.get(toastId);
        if (!toast) return;

        toast.message = message;
        if (type) toast.type = type;

        const toastElement = document.getElementById(`toast-${toastId}`);
        if (toastElement) {
            toastElement.className = `toast ${toast.type}`;
            const messageElement = toastElement.querySelector('.toast-body p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            const iconElement = toastElement.querySelector('.toast-icon i');
            if (iconElement) {
                iconElement.className = `fas fa-${this.getToastIcon(toast.type)}`;
            }
        }
    }

    // Toast-Position konfigurieren
    setPosition(position) {
        const positions = {
            'top-right': { top: '20px', right: '20px', left: 'auto', bottom: 'auto' },
            'top-left': { top: '20px', left: '20px', right: 'auto', bottom: 'auto' },
            'bottom-right': { bottom: '20px', right: '20px', left: 'auto', top: 'auto' },
            'bottom-left': { bottom: '20px', left: '20px', right: 'auto', top: 'auto' },
            'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)', right: 'auto', bottom: 'auto' },
            'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)', right: 'auto', top: 'auto' }
        };

        const pos = positions[position] || positions['top-right'];
        Object.assign(this.container.style, pos);
    }

    // Toast-Limit setzen
    setMaxToasts(max) {
        this.maxToasts = max;
        this.cleanupOldToasts();
    }

    // Alte Toasts aufräumen
    cleanupOldToasts() {
        if (!this.maxToasts) return;

        const toastIds = Array.from(this.toasts.keys());
        if (toastIds.length > this.maxToasts) {
            const toastsToRemove = toastIds.slice(0, toastIds.length - this.maxToasts);
            toastsToRemove.forEach(id => this.hideToast(id));
        }
    }

    // Toast-System zurücksetzen
    reset() {
        this.hideAllToasts();
        this.toastCounter = 0;
    }
}

// CSS für Toast-Animationen hinzufügen
const toastStyles = `
    .toast-progress {
        position: relative;
        height: 3px;
        background-color: rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }

    .toast-progress-bar {
        height: 100%;
        background-color: var(--primary);
        width: 100%;
        animation: toast-progress linear;
        transform-origin: left;
    }

    @keyframes toast-progress {
        from { transform: scaleX(1); }
        to { transform: scaleX(0); }
    }

    .toast.animate-slideIn {
        animation: toast-slideIn 0.3s ease-out;
    }

    .toast.animate-slideOut {
        animation: toast-slideOut 0.3s ease-in;
    }

    @keyframes toast-slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes toast-slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .toast-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        margin-right: var(--space-3);
    }

    .toast-actions {
        display: flex;
        gap: var(--space-2);
        margin-top: var(--space-3);
    }

    .toast-container {
        position: fixed;
        top: var(--space-4);
        right: var(--space-4);
        z-index: var(--z-toast);
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        max-width: 400px;
        width: 100%;
    }

    @media (max-width: 480px) {
        .toast-container {
            left: var(--space-2);
            right: var(--space-2);
            max-width: none;
        }
    }
`;

// CSS hinzufügen
const toastStyleSheet = document.createElement('style');
toastStyleSheet.textContent = toastStyles;
document.head.appendChild(toastStyleSheet);

// Toast System initialisieren
window.toastSystem = new ToastSystem();

// Globale Funktionen für Kompatibilität
window.showToast = (message, type, options) => window.toastSystem.showToast(message, type, options);
window.showSuccessToast = (message, options) => window.toastSystem.showSuccess(message, options);
window.showErrorToast = (message, options) => window.toastSystem.showError(message, options);
window.showWarningToast = (message, options) => window.toastSystem.showWarning(message, options);
window.showInfoToast = (message, options) => window.toastSystem.showInfo(message, options);
window.showLoadingToast = (message, options) => window.toastSystem.showLoading(message, options);
window.hideToast = (toastId) => window.toastSystem.hideToast(toastId);
window.hideAllToasts = () => window.toastSystem.hideAllToasts();