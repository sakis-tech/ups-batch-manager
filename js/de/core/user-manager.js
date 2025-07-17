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
        this.loadUserData();
        this.setupSessionStorage();
        this.checkLoginRequired();
        this.setupEventListeners();
    }

    /**
     * Session-Storage für Browser-übergreifende Persistenz einrichten
     */
    setupSessionStorage() {
        // Session-ID für Browser-Tab generieren
        this.sessionId = this.generateSessionId();
        
        // Session in sessionStorage speichern (überlebt Browser-Refresh)
        if (this.currentUser) {
            const sessionData = {
                userId: this.currentUser.id,
                userName: this.currentUser.name,
                sessionId: this.sessionId,
                timestamp: Date.now()
            };
            sessionStorage.setItem('ups_batch_session', JSON.stringify(sessionData));
        }
    }

    /**
     * Session-ID generieren
     * 
     * @returns {string} Eindeutige Session-ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
        
        // Nur Login-Screen zeigen wenn noch nie eingeloggt war
        // oder Session abgelaufen ist
        if (this.loginRequired && this.shouldShowLogin()) {
            this.showLoginScreen();
        }
    }

    /**
     * Prüft ob Login-Screen angezeigt werden soll
     * Verhindert mehrfache Anzeige bei Navigation
     * 
     * @returns {boolean} true wenn Login-Screen gezeigt werden soll
     */
    shouldShowLogin() {
        // Prüfe ob Login-Screen bereits aktiv ist
        if (document.getElementById('loginOverlay')) {
            return false;
        }
        
        // Prüfe aktive Session in sessionStorage
        const sessionData = this.getActiveSession();
        if (sessionData && this.validateSessionData(sessionData)) {
            // Aktive Session gefunden - kein Login erforderlich
            this.loginRequired = false;
            return false;
        }
        
        // Prüfe ob bereits ein globaler UserManager existiert
        if (window.userManagerInstance && window.userManagerInstance.isLoggedIn()) {
            // Synchronisiere mit existierender Instanz
            this.currentUser = window.userManagerInstance.currentUser;
            this.userProfile = window.userManagerInstance.userProfile;
            this.loginRequired = false;
            return false;
        }
        
        // Prüfe Session-Gültigkeit
        return this.isSessionValid();
    }

    /**
     * Aktive Session aus sessionStorage abrufen
     * 
     * @returns {Object|null} Session-Daten oder null
     */
    getActiveSession() {
        try {
            const sessionData = sessionStorage.getItem('ups_batch_session');
            return sessionData ? JSON.parse(sessionData) : null;
        } catch (error) {
            console.error('Fehler beim Laden der Session-Daten:', error);
            return null;
        }
    }

    /**
     * Session-Daten validieren
     * 
     * @param {Object} sessionData - Session-Daten
     * @returns {boolean} true wenn Session gültig
     */
    validateSessionData(sessionData) {
        if (!sessionData || !sessionData.userId || !sessionData.userName) {
            return false;
        }
        
        // Session-Timeout prüfen (1 Stunde für sessionStorage)
        const sessionAge = Date.now() - sessionData.timestamp;
        const maxSessionAge = 60 * 60 * 1000; // 1 Stunde
        
        if (sessionAge > maxSessionAge) {
            sessionStorage.removeItem('ups_batch_session');
            return false;
        }
        
        // Prüfe ob User-Daten in localStorage übereinstimmen
        if (this.currentUser && this.currentUser.id === sessionData.userId) {
            return true;
        }
        
        return false;
    }

    /**
     * Prüft ob die aktuelle Session noch gültig ist
     * 
     * @returns {boolean} true wenn neue Session erforderlich
     */
    isSessionValid() {
        if (!this.currentUser || !this.currentUser.lastLogin) {
            return true; // Neuer Login erforderlich
        }
        
        // Session-Timeout prüfen (24 Stunden)
        const lastLogin = new Date(this.currentUser.lastLogin);
        const now = new Date();
        const sessionDuration = now - lastLogin;
        const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 Stunden
        
        if (sessionDuration > maxSessionDuration) {
            // Session abgelaufen - logout ohne Login-Screen
            this.logout(false);
            return true;
        }
        
        // Session erneuern
        this.refreshSession();
        return false; // Kein neuer Login erforderlich
    }

    /**
     * Session erneuern
     */
    refreshSession() {
        if (this.currentUser) {
            // Nur lastLogin aktualisieren, nicht loginCount
            // (loginCount wird nur bei echtem Login erhöht)
            this.currentUser.lastLogin = new Date().toISOString();
            this.saveUserData();
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

        // Storage-Events für Cross-Tab-Synchronisation
        window.addEventListener('storage', (e) => {
            this.handleStorageChange(e);
        });

        // Seitenwechsel-Events
        window.addEventListener('beforeunload', () => {
            this.handlePageUnload();
        });

        // Seitenfokus-Events
        window.addEventListener('focus', () => {
            this.handlePageFocus();
        });
    }

    /**
     * Storage-Änderungen behandeln (Cross-Tab-Synchronisation)
     * 
     * @param {StorageEvent} event - Storage Event
     */
    handleStorageChange(event) {
        if (event.key === this.userStorageKey) {
            // User-Daten in anderem Tab geändert
            this.loadUserData();
            this.checkLoginRequired();
        } else if (event.key === 'ups_batch_logout_signal') {
            // Logout-Signal von anderem Tab
            this.logout(false);
        }
    }

    /**
     * Seite wird verlassen
     */
    handlePageUnload() {
        // Session-Timestamp aktualisieren
        if (this.currentUser) {
            this.refreshSession();
        }
    }

    /**
     * Seite erhält Fokus
     */
    handlePageFocus() {
        // Session-Gültigkeit prüfen
        if (this.currentUser) {
            this.isSessionValid();
        }
    }
    
    /**
     * Login-Screen anzeigen
     */
    showLoginScreen() {
        // Overlay erstellen
        const overlay = document.createElement('div');
        overlay.id = 'loginOverlay';
        overlay.className = 'login-overlay';
        overlay.innerHTML = this.getLoginScreenHTML();
        
        // Zum Body hinzufügen
        document.body.appendChild(overlay);
        
        // Focus auf Name-Eingabe
        setTimeout(() => {
            const nameInput = document.getElementById('loginNameInput');
            if (nameInput) {
                nameInput.focus();
            }
        }, 100);
        
        // Prevent body scroll
        document.body.classList.add('login-active');
    }
    
    /**
     * Login-Screen HTML generieren
     * 
     * @returns {string} HTML für Login-Screen
     */
    getLoginScreenHTML() {
        const welcome = window.languageManager?.t('login.welcome') || 'Willkommen im UPS Batch-Manager';
        const subtitle = window.languageManager?.t('login.subtitle') || 'Bitte geben Sie Ihren Namen ein, um fortzufahren.';
        const namePlaceholder = window.languageManager?.t('login.namePlaceholder') || 'Ihr Name';
        const loginButton = window.languageManager?.t('login.button') || 'Anmelden';
        const nameRequired = window.languageManager?.t('login.nameRequired') || 'Name ist erforderlich';
        
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
            this.showLoginError(window.languageManager?.t('login.nameRequired') || 'Name ist erforderlich');
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
        // Session Storage aktualisieren
        this.setupSessionStorage();
        
        // Globale Instanz setzen
        window.userManagerInstance = this;
        
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
                `${window.languageManager?.t('login.welcomeMessage') || 'Willkommen'}, ${this.currentUser.name}!`
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
            window.toastSystem.showSuccess(
                window.languageManager?.t('settings.nameUpdated') || 'Name wurde aktualisiert'
            );
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
     * 
     * @param {boolean} showLogin - Ob Login-Screen gezeigt werden soll (default: true)
     */
    logout(showLogin = true) {
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
        sessionStorage.removeItem('ups_batch_session');
        
        // Globale Instanz zurücksetzen
        if (window.userManagerInstance === this) {
            window.userManagerInstance = null;
        }
        
        // Login-Screen nur anzeigen wenn gewünscht
        if (showLogin) {
            this.showLoginScreen();
        }
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
                <h4>${window.languageManager?.t('settings.user.title') || 'Benutzer-Einstellungen'}</h4>
                <div class="setting-item">
                    <label class="form-label">${window.languageManager?.t('settings.user.name') || 'Name'}:</label>
                    <input type="text" 
                           id="userNameInput" 
                           class="form-input" 
                           value="${currentName}"
                           maxlength="50"
                           placeholder="${window.languageManager?.t('settings.user.namePlaceholder') || 'Ihr Name'}">
                    <div class="form-help">${window.languageManager?.t('settings.user.nameHelp') || 'Dieser Name wird für alle Ihre Aktivitäten verwendet.'}</div>
                </div>
                
                <div class="user-info">
                    <div class="info-item">
                        <span class="info-label">${window.languageManager?.t('settings.user.created') || 'Erstellt am'}:</span>
                        <span class="info-value">${createdAt}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${window.languageManager?.t('settings.user.lastLogin') || 'Letzter Login'}:</span>
                        <span class="info-value">${lastLogin}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">${window.languageManager?.t('settings.user.loginCount') || 'Anzahl Logins'}:</span>
                        <span class="info-value">${this.currentUser.loginCount || 1}</span>
                    </div>
                </div>
                
                <div class="user-actions">
                    <button class="btn btn-warning btn-sm" onclick="window.userManager.logout()">
                        <i class="fas fa-sign-out-alt"></i>
                        ${window.languageManager?.t('settings.user.logout') || 'Abmelden'}
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
        
        return `${window.languageManager?.t('activities.performedBy') || 'Aktion durchgeführt von'}: ${this.currentUser.name}`;
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

// Singleton-Pattern für globale UserManager-Instanz
function initializeUserManager() {
    // Prüfe ob bereits eine globale Instanz existiert
    if (window.userManagerInstance && window.userManagerInstance.isLoggedIn()) {
        // Verwende existierende Instanz
        window.userManager = window.userManagerInstance;
        return;
    }
    
    // Erstelle neue Instanz falls noch keine existiert
    if (!window.userManagerInstance) {
        window.userManagerInstance = new UserManager();
    }
    
    // Setze lokale Referenz
    window.userManager = window.userManagerInstance;
}

// Initialisierung nach DOM Load
document.addEventListener('DOMContentLoaded', initializeUserManager);

// Initialisierung auch bei schneller Navigation ohne DOM-Reload
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUserManager);
} else {
    // DOM bereits geladen
    initializeUserManager();
}