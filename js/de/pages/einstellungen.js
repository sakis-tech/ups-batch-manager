// Einstellungen page specific functionality
class EinstellungenPage {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.setupEventListeners();
        this.updateStats();
        this.loadSettings();
        this.updateStorageInfo();
        this.updateUserSettings();
    }

    setupEventListeners() {
        // Theme selector
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                const theme = e.target.value;
                this.handleThemeChange(theme);
            });
        }

        // Language selector
        const settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
        if (settingsLanguageSelect) {
            settingsLanguageSelect.addEventListener('change', (e) => {
                const language = e.target.value;
                this.handleLanguageChange(language);
            });
        }

        // Default settings
        ['defaultCountry', 'defaultService', 'defaultUnit'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    localStorage.setItem(id, e.target.value);
                    this.showSettingsSaved();
                });
            }
        });

        // Checkbox settings
        ['autoSave', 'addressHistory'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    localStorage.setItem(id, e.target.checked);
                    this.showSettingsSaved();
                });
            }
        });

        // Accordion functionality
        this.setupAccordion();

        // Update stats when shipment manager changes
        if (window.shipmentManager) {
            window.addEventListener('storage', (e) => {
                if (e.key === 'upsShipments') {
                    this.updateStats();
                    this.updateStorageInfo();
                }
            });
        }
    }

    setupAccordion() {
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const accordionId = header.dataset.accordion;
                const content = document.getElementById(`${accordionId}Content`);
                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                
                // Close all other accordions
                document.querySelectorAll('.accordion-header').forEach(otherHeader => {
                    if (otherHeader !== header) {
                        otherHeader.setAttribute('aria-expanded', 'false');
                        otherHeader.classList.remove('active');
                        const otherContent = document.getElementById(`${otherHeader.dataset.accordion}Content`);
                        if (otherContent) {
                            otherContent.classList.remove('active');
                        }
                    }
                });
                
                // Toggle current accordion
                header.setAttribute('aria-expanded', !isExpanded);
                header.classList.toggle('active', !isExpanded);
                
                if (content) {
                    content.classList.toggle('active', !isExpanded);
                }
            });
        });
    }

    handleThemeChange(theme) {
        if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            localStorage.removeItem('theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
        }
        
        // Update dark mode toggle icon
        const darkModeToggle = document.querySelector('#darkModeToggle i');
        if (darkModeToggle) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            darkModeToggle.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        
        this.showSettingsSaved();
    }

    handleLanguageChange(language) {
        if (window.languageManager && typeof window.languageManager.setLanguage === 'function') {
            window.languageManager.setLanguage(language);
        }
        
        // Update language toggle button
        const languageToggle = document.getElementById('languageToggle');
        if (languageToggle) {
            languageToggle.textContent = language === 'de' ? '🇩🇪 Deutsch' : '🇬🇧 English';
        }
        
        this.showSettingsSaved();
    }

    updateStats() {
        if (window.sharedPageManager) {
            window.sharedPageManager.updateStats();
        }
    }

    loadSettings() {
        // Load theme setting
        const savedTheme = localStorage.getItem('theme');
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            themeSelect.value = savedTheme || 'auto';
        }

        // Load language setting
        const savedLanguage = localStorage.getItem('language') || 'de';
        const settingsLanguageSelect = document.getElementById('settingsLanguageSelect');
        if (settingsLanguageSelect) {
            settingsLanguageSelect.value = savedLanguage;
        }

        // Load default settings
        const defaultCountry = localStorage.getItem('defaultCountry') || 'DE';
        const defaultService = localStorage.getItem('defaultService') || '03';
        const defaultUnit = localStorage.getItem('defaultUnit') || 'KG';

        const defaultCountrySelect = document.getElementById('defaultCountry');
        const defaultServiceSelect = document.getElementById('defaultService');
        const defaultUnitSelect = document.getElementById('defaultUnit');
        
        if (defaultCountrySelect) defaultCountrySelect.value = defaultCountry;
        if (defaultServiceSelect) defaultServiceSelect.value = defaultService;
        if (defaultUnitSelect) defaultUnitSelect.value = defaultUnit;

        // Load checkbox settings
        const autoSave = localStorage.getItem('autoSave') !== 'false'; // Default true
        const addressHistory = localStorage.getItem('addressHistory') !== 'false'; // Default true

        const autoSaveCheckbox = document.getElementById('autoSave');
        const addressHistoryCheckbox = document.getElementById('addressHistory');
        
        if (autoSaveCheckbox) autoSaveCheckbox.checked = autoSave;
        if (addressHistoryCheckbox) addressHistoryCheckbox.checked = addressHistory;
    }

    updateStorageInfo() {
        try {
            // Check if localStorage is available
            if (typeof(Storage) === 'undefined') {
                console.warn('localStorage nicht verfügbar');
                return;
            }
            
            let used = 0;
            try {
                const storageData = JSON.stringify(localStorage);
                used = new Blob([storageData]).size;
            } catch (storageError) {
                // Fallback: iterate through individual keys
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
            
            // Update progress bar color based on usage
            if (storageUsage) {
                storageUsage.className = 'storage-used';
                if (percentage > 80) {
                    storageUsage.classList.add('storage-high');
                } else if (percentage > 60) {
                    storageUsage.classList.add('storage-medium');
                }
            }
        } catch (error) {
            console.error('Fehler beim Berechnen der Speicher-Nutzung:', error);
            
            // Fallback UI
            const storageUsage = document.getElementById('storageUsage');
            const storageText = document.getElementById('storageText');
            
            if (storageUsage) storageUsage.style.width = '0%';
            if (storageText) storageText.textContent = 'Unbekannt';
        }
    }

    updateUserSettings() {
        const userSettingsContent = document.getElementById('userSettingsContent');
        if (!userSettingsContent) return;
        
        if (window.userManager && window.userManager.isLoggedIn && window.userManager.isLoggedIn()) {
            if (typeof window.userManager.getUserSettingsHTML === 'function') {
                userSettingsContent.innerHTML = window.userManager.getUserSettingsHTML();
            } else {
                userSettingsContent.innerHTML = `
                    <div class="user-settings">
                        <p>Benutzer-Einstellungen sind verfügbar</p>
                    </div>
                `;
            }
        } else {
            userSettingsContent.innerHTML = `
                <div class="user-settings-placeholder">
                    <i class="fas fa-user-slash"></i>
                    <p>Kein Nutzer angemeldet</p>
                    <p>Lokale Nutzung ohne Benutzerkonto</p>
                </div>
            `;
        }
    }

    showSettingsSaved() {
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Einstellungen gespeichert', { duration: 2000 });
        }
    }

    exportSettings() {
        const settings = {
            theme: localStorage.getItem('theme') || 'auto',
            language: localStorage.getItem('language') || 'de',
            defaultCountry: localStorage.getItem('defaultCountry') || 'DE',
            defaultService: localStorage.getItem('defaultService') || '03',
            defaultUnit: localStorage.getItem('defaultUnit') || 'KG',
            autoSave: localStorage.getItem('autoSave') !== 'false',
            addressHistory: localStorage.getItem('addressHistory') !== 'false',
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(settings, null, 2)], { 
            type: 'application/json;charset=utf-8;' 
        });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'ups-batch-settings.json');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Einstellungen erfolgreich exportiert');
        }
    }

    importSettings(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target.result);
                
                // Apply imported settings
                if (settings.theme) {
                    localStorage.setItem('theme', settings.theme);
                    const themeSelect = document.getElementById('themeSelect');
                    if (themeSelect) themeSelect.value = settings.theme;
                    this.handleThemeChange(settings.theme);
                }
                
                if (settings.language) {
                    this.handleLanguageChange(settings.language);
                }
                
                if (settings.defaultCountry) {
                    localStorage.setItem('defaultCountry', settings.defaultCountry);
                }
                
                if (settings.defaultService) {
                    localStorage.setItem('defaultService', settings.defaultService);
                }
                
                if (settings.defaultUnit) {
                    localStorage.setItem('defaultUnit', settings.defaultUnit);
                }
                
                if (settings.autoSave !== undefined) {
                    localStorage.setItem('autoSave', settings.autoSave);
                }
                
                if (settings.addressHistory !== undefined) {
                    localStorage.setItem('addressHistory', settings.addressHistory);
                }
                
                // Reload settings to update UI
                this.loadSettings();
                
                if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
                    window.toastSystem.showSuccess('Einstellungen erfolgreich importiert');
                }
            } catch (error) {
                console.error('Error importing settings:', error);
                if (window.toastSystem && typeof window.toastSystem.showError === 'function') {
                    window.toastSystem.showError('Fehler beim Importieren der Einstellungen');
                }
            }
        };
        
        reader.readAsText(file);
    }

    resetSettings() {
        // Reset to default values
        localStorage.removeItem('theme');
        localStorage.removeItem('language');
        localStorage.setItem('defaultCountry', 'DE');
        localStorage.setItem('defaultService', '03');
        localStorage.setItem('defaultUnit', 'KG');
        localStorage.setItem('autoSave', 'true');
        localStorage.setItem('addressHistory', 'true');
        
        // Reload settings
        this.loadSettings();
        
        // Reset theme
        document.documentElement.setAttribute('data-theme', 'light');
        
        if (window.toastSystem && typeof window.toastSystem.showSuccess === 'function') {
            window.toastSystem.showSuccess('Einstellungen zurückgesetzt');
        }
    }

    renderContent() {
        this.updateStorageInfo();
        this.updateUserSettings();
    }
}

// Initialize einstellungen page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.einstellungenPage = new EinstellungenPage();
    window.pageManager = window.einstellungenPage; // Set as global page manager
});