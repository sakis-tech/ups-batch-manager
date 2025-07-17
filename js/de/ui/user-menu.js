/**
 * User Menu System für das UPS Batch Manager Dashboard
 * Verwaltet das Avatar-Dropdown-Menü mit Einstellungen und Aktionen
 */
class UserMenuManager {
    constructor() {
        this.isOpen = false;
        this.menuElement = null;
        this.initialize();
    }

    initialize() {
        this.createUserMenu();
        this.setupEventListeners();
    }

    createUserMenu() {
        // Finde das user-menu Element
        const userMenu = document.querySelector('.user-menu');
        if (!userMenu) return;

        // Erstelle das Dropdown-Menü
        const dropdown = document.createElement('div');
        dropdown.className = 'user-menu-dropdown';
        dropdown.innerHTML = this.getMenuContent();

        userMenu.appendChild(dropdown);
        this.menuElement = dropdown;
    }

    getMenuContent() {
        return `
            <div class="user-menu-header">
                <div class="user-info">
                    <div class="user-avatar-large">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4>UPS Batch Manager</h4>
                        <p>Benutzer</p>
                    </div>
                </div>
            </div>

            <div class="user-menu-section">
                <h5>Einstellungen</h5>
                <div class="user-menu-item" onclick="toggleTheme()">
                    <i class="fas fa-moon"></i>
                    <span>Dunkler Modus</span>
                    <div class="toggle-switch">
                        <input type="checkbox" id="darkModeToggleMenu" class="toggle-input">
                        <label for="darkModeToggleMenu" class="toggle-label"></label>
                    </div>
                </div>
                <div class="user-menu-item" onclick="openGeneralSettings()">
                    <i class="fas fa-cog"></i>
                    <span>Allgemeine Einstellungen</span>
                </div>
                <div class="user-menu-item" onclick="openLanguageSettings()">
                    <i class="fas fa-language"></i>
                    <span>Sprache & Region</span>
                </div>
                <div class="user-menu-item" onclick="openNotificationSettings()">
                    <i class="fas fa-bell"></i>
                    <span>Benachrichtigungen</span>
                </div>
            </div>

            <div class="user-menu-section">
                <h5>Daten & Speicher</h5>
                <div class="user-menu-item" onclick="openDataSettings()">
                    <i class="fas fa-database"></i>
                    <span>Daten verwalten</span>
                </div>
                <div class="user-menu-item" onclick="exportBackup()">
                    <i class="fas fa-download"></i>
                    <span>Backup erstellen</span>
                </div>
                <div class="user-menu-item" onclick="importBackup()">
                    <i class="fas fa-upload"></i>
                    <span>Backup wiederherstellen</span>
                </div>
                <div class="user-menu-item" onclick="clearAllData()">
                    <i class="fas fa-trash"></i>
                    <span>Alle Daten löschen</span>
                </div>
            </div>

            <div class="user-menu-section">
                <h5>Hilfe & Support</h5>
                <div class="user-menu-item" onclick="showFullHelp()">
                    <i class="fas fa-question-circle"></i>
                    <span>Hilfe & Dokumentation</span>
                </div>
                <div class="user-menu-item" onclick="showKeyboardShortcuts()">
                    <i class="fas fa-keyboard"></i>
                    <span>Tastenkürzel</span>
                </div>
                <div class="user-menu-item" onclick="showAboutDialog()">
                    <i class="fas fa-info-circle"></i>
                    <span>Über diese App</span>
                </div>
            </div>

            <div class="user-menu-footer">
                <div class="version-info">
                    UPS Batch Manager v<span id="menuAppVersion">2.2.0</span>
                </div>
                <div class="app-actions">
                    <button class="btn btn-sm btn-ghost" onclick="window.location.reload()">
                        <i class="fas fa-sync"></i> Neu laden
                    </button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Avatar-Button Click Handler
        const avatarButton = document.querySelector('.user-avatar');
        if (avatarButton) {
            avatarButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });
        }

        // Schließen wenn außerhalb geklickt wird
        document.addEventListener('click', (e) => {
            if (this.isOpen && !e.target.closest('.user-menu')) {
                this.closeMenu();
            }
        });

        // ESC-Taste zum Schließen
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeMenu();
            }
        });

        // Theme-Toggle synchronisieren
        this.syncThemeToggle();
    }

    toggleMenu() {
        if (this.isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        if (!this.menuElement) return;

        this.menuElement.classList.add('active');
        this.isOpen = true;
        
        // Andere Dropdowns schließen
        document.querySelectorAll('.dropdown.active').forEach(dropdown => {
            dropdown.classList.remove('active');
        });

        // Theme-Toggle Status aktualisieren
        this.updateThemeToggle();
    }

    closeMenu() {
        if (!this.menuElement) return;

        this.menuElement.classList.remove('active');
        this.isOpen = false;
    }

    syncThemeToggle() {
        const darkModeToggle = document.getElementById('darkModeToggleMenu');
        if (darkModeToggle) {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            darkModeToggle.checked = isDark;
        }
    }

    updateThemeToggle() {
        this.syncThemeToggle();
        
        // App-Version aktualisieren
        const versionElement = document.getElementById('menuAppVersion');
        const appVersionElement = document.getElementById('appVersion');
        if (versionElement && appVersionElement) {
            versionElement.textContent = appVersionElement.textContent;
        }
    }
}

// Globale Funktionen für Menu-Aktionen
window.toggleTheme = () => {
    if (window.darkModeToggle) {
        window.darkModeToggle.click();
    }
    
    // Theme-Toggle in Menu aktualisieren
    setTimeout(() => {
        if (window.userMenuManager) {
            window.userMenuManager.updateThemeToggle();
        }
    }, 100);
};

window.openGeneralSettings = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showModal('settingsModal', { section: 'general' });
    }
};

window.openLanguageSettings = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showModal('settingsModal', { section: 'language' });
    }
};

window.openNotificationSettings = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showModal('settingsModal', { section: 'notifications' });
    }
};

window.openDataSettings = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showModal('settingsModal', { section: 'data' });
    }
};

window.exportBackup = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.storageManager && typeof window.storageManager.exportBackup === 'function') {
        window.storageManager.exportBackup();
    }
};

window.importBackup = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.storageManager && typeof window.storageManager.importBackup === 'function') {
        window.storageManager.importBackup();
    }
};

window.clearAllData = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showConfirmDialog(
            'Alle Daten löschen',
            'Sind Sie sicher, dass Sie alle Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
            () => {
                if (window.storageManager && typeof window.storageManager.clearAllData === 'function') {
                    window.storageManager.clearAllData();
                    window.toastSystem?.showSuccess('Alle Daten wurden erfolgreich gelöscht');
                    setTimeout(() => window.location.reload(), 1000);
                }
            },
            () => {
                // Abbrechen - nichts tun
            }
        );
    }
};

window.showAboutDialog = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        const aboutContent = `
            <div class="about-dialog">
                <div class="about-header">
                    <div class="about-logo">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <h3>UPS Batch Manager</h3>
                    <p>Version 2.2.0</p>
                </div>
                <div class="about-content">
                    <h4>Über diese Anwendung</h4>
                    <p>Der UPS Batch Manager ist ein professionelles Tool zur Erstellung und Verwaltung von UPS Batch-Versanddateien mit bis zu 250 Sendungen.</p>
                    
                    <h4>Features</h4>
                    <ul>
                        <li>✅ 100% Offline-Funktionalität</li>
                        <li>✅ Vollständiger Datenschutz</li>
                        <li>✅ CSV/SSV Import & Export</li>
                        <li>✅ Echtzeit-Validierung</li>
                        <li>✅ Responsive Design</li>
                        <li>✅ Deutsche Lokalisierung</li>
                    </ul>
                    
                    <h4>Technische Informationen</h4>
                    <p><strong>Browser:</strong> ${navigator.userAgent.split(' ')[0]}</p>
                    <p><strong>Plattform:</strong> ${navigator.platform}</p>
                    <p><strong>Sprache:</strong> ${navigator.language}</p>
                    
                    <div class="about-footer">
                        <p>© 2024 UPS Batch Manager - Alle Rechte vorbehalten</p>
                    </div>
                </div>
            </div>
        `;
        
        window.modalSystem.createModal('aboutModal', {
            title: 'Über UPS Batch Manager',
            content: aboutContent,
            size: 'medium',
            buttons: [
                { text: 'OK', class: 'btn-primary', action: 'close' }
            ]
        });
        
        window.modalSystem.showModal('aboutModal');
    }
};

// User Menu Manager initialisieren
document.addEventListener('DOMContentLoaded', () => {
    window.userMenuManager = new UserMenuManager();
});