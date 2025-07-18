/**
 * User Manager für deutsche UPS Batch Manager Oberfläche
 * 
 * Verwaltet Benutzer-Authentifizierung und -Tagging:
 * - Einfacher Login-Screen beim ersten Start
 * - Nutzer-Name Speicherung im localStorage
 * - User-Tagging für alle Aktivitäten
 * - Nutzer-Einstellungen und Name-Änderung
 * 
 * @class UserManager
 * @version 2.1.0
 * @author UPS Batch Manager Team
 */
class UserManager {
    /**
     * Initialisiert den User Manager
     * 
     * @constructor
     */
    constructor() {
        /** @type {string} Speicherschlüssel für localStorage */
        this.userStorageKey = 'ups_batch_current_user';
        
        /** @type {string} Speicherschlüssel für User-Profil */
        this.profileStorageKey = 'ups_batch_user_profile';
        
        /** @type {Object|null} Aktueller Nutzer */
        this.currentUser = null;
        
        /** @type {Object} Nutzer-Profil */
        this.userProfile = null;
        
        /** @type {boolean} Ob Login erforderlich ist */
        this.loginRequired = false;
        
        /** @type {Array<Function>} Callbacks für Login-Events */
        this.loginCallbacks = [];
        
        this.initialize();
    }
    
    /**
     * Initialisiert das User-System
     */
    initialize() {
        console.log('UserManager wird initialisiert...');
        this.loadUserData();
        console.log('Aktueller Benutzer:', this.currentUser);
        this.checkLoginRequired();
        this.setupEventListeners();
    }
    
    /**
     * Benutzer-Daten aus localStorage laden
     */
    loadUserData() {
        try {
            // Aktueller Nutzer
            const storedUser = localStorage.getItem(this.userStorageKey);
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
            }
            
            // Nutzer-Profil
            const storedProfile = localStorage.getItem(this.profileStorageKey);
            if (storedProfile) {
                this.userProfile = JSON.parse(storedProfile);
            } else {
                // Standard-Profil erstellen
                this.userProfile = {
                    preferences: {
                        language: 'de',
                        theme: 'auto',
                        notifications: true
                    },
                    settings: {
                        showWelcomeMessage: true,
                        autoSave: true,
                        activityLogEnabled: true
                    }
                };
            }
        } catch (error) {
            console.error('Fehler beim Laden der Benutzer-Daten:', error);
            this.currentUser = null;
            this.userProfile = null;
        }
    }
    
    /**
     * Prüft ob Login erforderlich ist
     */
    checkLoginRequired() {
        this.loginRequired = !this.currentUser || !this.currentUser.name;
        
        console.log('Login erforderlich:', this.loginRequired);
        
        if (this.loginRequired) {
            // Sicherstellen, dass DOM bereit ist
            if (document.readyState === 'loading') {
                console.log('DOM lädt noch, warte auf DOMContentLoaded...');
                document.addEventListener('DOMContentLoaded', () => {
                    console.log('DOM ist bereit, zeige Login-Screen...');
                    this.showLoginScreen();
                });
            } else {
                // DOM ist bereits bereit, Login-Screen sofort anzeigen
                console.log('DOM ist bereit, zeige Login-Screen in 100ms...');
                setTimeout(() => this.showLoginScreen(), 100);
            }
        }
    }
    
    /**
     * Event-Listener einrichten
     */
    setupEventListeners() {
        // Login-Form Submit
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin(e);
            }
        });
        
        // Settings Name Change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'userNameInput') {
                this.updateUserName(e.target.value);
            }
        });
    }
    
    /**
     * Login-Screen anzeigen
     */
    showLoginScreen() {
        // Überprüfen, ob bereits ein Login-Overlay existiert
        const existingOverlay = document.getElementById('loginOverlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // Sicherstellen, dass DOM bereit ist
        if (!document.body) {
            console.error('DOM ist noch nicht bereit für Login-Screen');
            return;
        }
        
        // Overlay erstellen
        const overlay = document.createElement('div');
        overlay.id = 'loginOverlay';
        overlay.className = 'login-overlay';
        overlay.innerHTML = this.getLoginScreenHTML();
        
        // Zum Body hinzufügen
        document.body.appendChild(overlay);
        
        // Focus auf Name-Eingabe mit längerer Verzögerung
        setTimeout(() => {
            const nameInput = document.getElementById('loginNameInput');
            if (nameInput) {
                nameInput.focus();
            }
        }, 200);
        
        // Prevent body scroll
        document.body.classList.add('login-active');
        
        // Debug-Ausgabe
        console.log('Login-Screen wurde angezeigt');
    }
    
    /**
     * Login-Screen HTML generieren
     * 
     * @returns {string} HTML für Login-Screen
     */
    getLoginScreenHTML() {
        const welcome = 'Willkommen';
        const subtitle = 'Bitte gib deinen Namen ein';
        const namePlaceholder = 'Name eingeben';
        const loginButton = 'Anmelden';
        const nameRequired = 'Name ist erforderlich';
        
        return `
            <div class="login-container">
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">
                            <i class="fas fa-shipping-fast"></i>
                        </div>
                        <h1 class="login-title">${welcome}</h1>
                        <p class="login-subtitle">${subtitle}</p>
                    </div>
                    
                    <form id="loginForm" class="login-form">
                        <div class="form-group">
                            <label for="loginNameInput" class="form-label">Name *</label>
                            <input type="text" 
                                   id="loginNameInput" 
                                   name="userName" 
                                   class="form-input login-input" 
                                   placeholder="${namePlaceholder}"
                                   required
                                   maxlength="50"
                                   autocomplete="name">
                            <div class="form-help">Dieser Name wird für alle Ihre Aktivitäten verwendet.</div>
                        </div>
                        
                        <button type="submit" class="btn btn-primary login-button">
                            <i class="fas fa-user"></i>
                            ${loginButton}
                        </button>
                    </form>
                    
                    <div class="login-footer">
                        <div class="login-info">
                            <i class="fas fa-lock"></i>
                            <span>Alle Daten werden nur lokal gespeichert</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Login-Prozess behandeln
     * 
     * @param {Event} event - Form Submit Event
     */
    handleLogin(event) {
        const formData = new FormData(event.target);
        const userName = formData.get('userName')?.trim();
        
        if (!userName) {
            this.showLoginError('Name ist erforderlich');
            return;
        }
        
        // Nutzer erstellen
        this.createUser(userName);
        
        // Login erfolgreich
        this.onLoginSuccess();
    }
    
    /**
     * Nutzer erstellen
     * 
     * @param {string} name - Nutzer-Name
     */
    createUser(name) {
        this.currentUser = {
            id: this.generateUserId(),
            name: name,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            loginCount: 1
        };
        
        // Nutzer-Profil aktualisieren
        if (!this.userProfile) {
            this.userProfile = {
                preferences: {
                    language: 'de',
                    theme: 'auto',
                    notifications: true
                },
                settings: {
                    showWelcomeMessage: true,
                    autoSave: true,
                    activityLogEnabled: true
                }
            };
        }
        
        // Speichern
        this.saveUserData();
        
        // Activity Logger - Nutzer erstellt
        if (window.activityLogger) {
            window.activityLogger.logUserCreated(this.currentUser);
        }
    }
    
    /**
     * Login erfolgreich behandeln
     */
    onLoginSuccess() {
        // Login-Screen entfernen
        this.hideLoginScreen();
        
        // Callbacks benachrichtigen
        this.loginCallbacks.forEach(callback => {
            try {
                callback(this.currentUser);
            } catch (error) {
                console.error('Fehler bei Login-Callback:', error);
            }
        });
        
        // UI-Update für Settings-Bereich
        if (window.appDE && typeof window.appDE.updateUserSettings === 'function') {
            window.appDE.updateUserSettings();
        }
        
        // Welcome Toast
        if (window.toastSystem) {
            window.toastSystem.showSuccess(
                `Willkommen zurück, ${this.currentUser.name}!`
            );
        }
        
        // Activity Logger - Login
        if (window.activityLogger) {
            window.activityLogger.logUserLogin(this.currentUser);
        }
    }
    
    /**
     * Login-Screen verstecken
     */
    hideLoginScreen() {
        const overlay = document.getElementById('loginOverlay');
        if (overlay) {
            overlay.remove();
        }
        
        document.body.classList.remove('login-active');
        this.loginRequired = false;
    }
    
    /**
     * Login-Fehler anzeigen
     * 
     * @param {string} message - Fehlermeldung
     */
    showLoginError(message) {
        const existingError = document.querySelector('.login-error');
        if (existingError) {
            existingError.remove();
        }
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'login-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;
        
        const form = document.getElementById('loginForm');
        if (form) {
            form.insertBefore(errorDiv, form.firstChild);
        }
    }
    
    /**
     * Nutzer-Name aktualisieren
     * 
     * @param {string} newName - Neuer Name
     */
    updateUserName(newName) {
        if (!this.currentUser || !newName?.trim()) {
            return false;
        }
        
        const oldName = this.currentUser.name;
        this.currentUser.name = newName.trim();
        this.currentUser.lastUpdated = new Date().toISOString();
        
        // Speichern
        this.saveUserData();
        
        // Activity Logger - Name geändert
        if (window.activityLogger) {
            window.activityLogger.logUserNameChanged(oldName, newName);
        }
        
        // Toast Notification
        if (window.toastSystem) {
            window.toastSystem.showSuccess('Name erfolgreich geändert');
        }
        
        // UI-Update für Settings-Bereich
        if (window.appDE && typeof window.appDE.updateUserSettings === 'function') {
            window.appDE.updateUserSettings();
        }
        
        return true;
    }
    
    /**
     * Aktuellen Nutzer abrufen
     * 
     * @returns {Object|null} Aktueller Nutzer
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Nutzer-Name abrufen
     * 
     * @returns {string} Nutzer-Name
     */
    getUserName() {
        return this.currentUser?.name || 'Unbekannt';
    }
    
    /**
     * Nutzer-ID abrufen
     * 
     * @returns {string} Nutzer-ID
     */
    getUserId() {
        return this.currentUser?.id || 'unknown';
    }
    
    /**
     * Prüft ob Nutzer eingeloggt ist
     * 
     * @returns {boolean} true wenn eingeloggt
     */
    isLoggedIn() {
        return !this.loginRequired && this.currentUser && this.currentUser.name;
    }
    
    /**
     * Nutzer-Daten speichern
     */
    saveUserData() {
        try {
            localStorage.setItem(this.userStorageKey, JSON.stringify(this.currentUser));
            localStorage.setItem(this.profileStorageKey, JSON.stringify(this.userProfile));
        } catch (error) {
            console.error('Fehler beim Speichern der Benutzer-Daten:', error);
        }
    }
    
    /**
     * Login-Callback registrieren
     * 
     * @param {Function} callback - Callback-Funktion
     */
    onLogin(callback) {
        if (typeof callback === 'function') {
            this.loginCallbacks.push(callback);
        }
    }
    
    /**
     * Nutzer abmelden (für Debugging/Testing)
     */
    logout() {
        // Activity Logger - Logout
        if (window.activityLogger) {
            window.activityLogger.logUserLogout(this.currentUser);
        }
        
        this.currentUser = null;
        this.userProfile = null;
        this.loginRequired = true;
        
        // Daten löschen
        localStorage.removeItem(this.userStorageKey);
        localStorage.removeItem(this.profileStorageKey);
        
        // Login-Screen anzeigen
        this.showLoginScreen();
    }
    
    /**
     * Login-Screen manuell anzeigen (für Debugging/Testing)
     */
    forceShowLogin() {
        console.log('Login-Screen wird manuell angezeigt...');
        this.loginRequired = true;
        this.showLoginScreen();
    }
    
    /**
     * Nutzer-Statistiken abrufen
     * 
     * @returns {Object} Nutzer-Statistiken
     */
    getUserStats() {
        if (!this.currentUser) return null;
        
        const stats = {
            name: this.currentUser.name,
            createdAt: this.currentUser.createdAt,
            lastLogin: this.currentUser.lastLogin,
            loginCount: this.currentUser.loginCount || 1,
            sessionDuration: this.getSessionDuration()
        };
        
        return stats;
    }
    
    /**
     * Session-Dauer berechnen
     * 
     * @returns {number} Session-Dauer in Minuten
     */
    getSessionDuration() {
        if (!this.currentUser || !this.currentUser.lastLogin) return 0;
        
        const loginTime = new Date(this.currentUser.lastLogin);
        const now = new Date();
        const durationMs = now - loginTime;
        
        return Math.floor(durationMs / (1000 * 60)); // Minuten
    }
    
    /**
     * Eindeutige Nutzer-ID generieren
     * 
     * @returns {string} Eindeutige Nutzer-ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Nutzer-Einstellungen für Settings-Bereich generieren
     * 
     * @returns {string} HTML für Nutzer-Einstellungen
     */
    getUserSettingsHTML() {
        if (!this.currentUser) return '';
        
        const currentName = this.currentUser.name;
        const createdAt = new Date(this.currentUser.createdAt).toLocaleDateString();
        const lastLogin = new Date(this.currentUser.lastLogin).toLocaleDateString();
        
        return `
            <div class="user-settings-section">
                <h4>Benutzer-Einstellungen</h4>
                <div class="setting-item">
                    <label class="form-label">Name:</label>
                    <input type="text" 
                           id="userNameInput" 
                           class="form-input" 
                           value="${currentName}"
                           maxlength="50"
                           placeholder="Dein Name">
                    <div class="form-help">Änderungen werden automatisch gespeichert</div>
                </div>
                
                <div class="user-info">
                    <div class="info-item">
                        <span class="info-label">Registriert:</span>
                        <span class="info-value">${createdAt}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Letzter Login:</span>
                        <span class="info-value">${lastLogin}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Logins:</span>
                        <span class="info-value">${this.currentUser.loginCount || 1}</span>
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="btn btn-warning btn-sm" onclick="window.userManager.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        Abmelden
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Nutzer-Tag für Aktivitäten generieren
     * 
     * @returns {string} Nutzer-Tag
     */
    getUserTag() {
        if (!this.currentUser) return '';
        
        return `Benutzer: ${this.currentUser.name}`;
    }
    
    /**
     * Export der Nutzer-Daten
     * 
     * @returns {Object} Exportierte Nutzer-Daten
     */
    exportUserData() {
        return {
            user: this.currentUser,
            profile: this.userProfile,
            stats: this.getUserStats(),
            exportedAt: new Date().toISOString()
        };
    }
}

// UserManager global verfügbar machen
window.UserManager = UserManager;

// Initialisierung nach DOM Load - sicherstellen, dass es nur einmal passiert
if (!window.userManager) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (!window.userManager) {
                console.log('UserManager wird initialisiert...');
                window.userManager = new UserManager();
            }
        });
    } else {
        // DOM ist bereits bereit
        console.log('UserManager wird sofort initialisiert...');
        window.userManager = new UserManager();
    }
}