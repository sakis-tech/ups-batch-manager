# 👤 Avatar-Menü-System Dokumentation

## 📋 Übersicht

Das Avatar-Menü-System wurde in Version 2.3.0 eingeführt und stellt eine moderne, zentrale Anlaufstelle für alle Benutzereinstellungen und -aktionen dar. Es ersetzt die traditionelle Sidebar-Navigation für Settings durch ein elegantes Dropdown-Menü im Header.

## 🎯 Design-Philosophie

### **Modern Dashboard UX**
- Zentrale Benutzer-Aktionen im Header
- Platzsparende Sidebar ohne redundante Settings
- Konsistente Navigation auf allen Seiten
- Professional Corporate Design

### **User-Centric Design**
- Alle persönlichen Einstellungen an einem Ort
- Intuitive Gruppierung von Funktionen
- Schneller Zugriff auf häufige Aktionen
- Kontextuelle Hilfe und Support

### **Responsive & Accessible**
- Mobile-optimierte Bedienung
- Touch-freundliche Targets
- ARIA-konforme Implementation
- Keyboard-Navigation Support

## 🏗️ Architektur

### **Kern-Komponente: UserMenuManager**

```javascript
class UserMenuManager {
    constructor() {
        this.isOpen = false;
        this.menuElement = null;
        this.initialize();
    }
    
    // Hauptmethoden
    toggleMenu()
    openMenu()
    closeMenu()
    createUserMenu()
    setupEventListeners()
}
```

### **HTML-Struktur**

#### **Header Integration:**
```html
<div class="header-right">
    <button id="darkModeToggle" class="btn btn-ghost">
        <i class="fas fa-moon"></i>
    </button>
    <button id="fullscreenToggle" class="btn btn-ghost">
        <i class="fas fa-expand"></i>
    </button>
    <div class="user-menu">
        <button class="btn btn-ghost user-avatar">
            <i class="fas fa-user"></i>
        </button>
        <!-- Dropdown wird dynamisch erstellt -->
    </div>
</div>
```

#### **Dropdown-Menü-Struktur:**
```html
<div class="user-menu-dropdown active">
    <!-- User Info Header -->
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

    <!-- Settings Section -->
    <div class="user-menu-section">
        <h5>Einstellungen</h5>
        <!-- Settings Items -->
    </div>

    <!-- Data & Storage Section -->
    <div class="user-menu-section">
        <h5>Daten & Speicher</h5>
        <!-- Data Management Items -->
    </div>

    <!-- Help & Support Section -->
    <div class="user-menu-section">
        <h5>Hilfe & Support</h5>
        <!-- Help Items -->
    </div>

    <!-- Footer -->
    <div class="user-menu-footer">
        <div class="version-info">
            UPS Batch Manager v<span id="menuAppVersion">2.3.0</span>
        </div>
        <div class="app-actions">
            <button class="btn btn-sm btn-ghost">
                <i class="fas fa-sync"></i> Neu laden
            </button>
        </div>
    </div>
</div>
```

## 🎨 Menü-Bereiche

### **1. Einstellungen**

#### **Dark Mode Toggle:**
```javascript
<div class="user-menu-item" onclick="toggleTheme()">
    <i class="fas fa-moon"></i>
    <span>Dunkler Modus</span>
    <div class="toggle-switch">
        <input type="checkbox" id="darkModeToggleMenu" class="toggle-input">
        <label for="darkModeToggleMenu" class="toggle-label"></label>
    </div>
</div>
```

#### **Settings Integration:**
- **Allgemeine Einstellungen**: Modal mit Basis-Konfiguration
- **Sprache & Region**: Lokalisierung-Optionen
- **Benachrichtigungen**: Toast-und Alert-Einstellungen

### **2. Daten & Speicher**

#### **Storage Management:**
```javascript
window.openDataSettings = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showModal('settingsModal', { section: 'data' });
    }
};
```

#### **Backup Operations:**
- **Backup erstellen**: JSON-Export aller Daten
- **Backup wiederherstellen**: Import mit Validierung
- **Alle Daten löschen**: Sichere Bereinigung mit Bestätigung

### **3. Hilfe & Support**

#### **Help Integration:**
```javascript
window.showFullHelp = () => {
    if (window.helpSystem) {
        window.helpSystem.showHelpModal('overview');
    }
};
```

#### **Support Features:**
- **Hilfe & Dokumentation**: Kontextsensitive Hilfe
- **Tastenkürzel**: Vollständige Shortcut-Übersicht
- **Über diese App**: System-Informationen und Credits

## ⚡ Funktionalität

### **1. Menu State Management**

#### **Open/Close Logic:**
```javascript
toggleMenu() {
    if (this.isOpen) {
        this.closeMenu();
    } else {
        this.openMenu();
    }
}

openMenu() {
    this.menuElement.classList.add('active');
    this.isOpen = true;
    
    // Andere Dropdowns schließen
    document.querySelectorAll('.dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
    });
    
    // Theme-Toggle Status aktualisieren
    this.updateThemeToggle();
}
```

### **2. Event Handling**

#### **Click Outside Detection:**
```javascript
document.addEventListener('click', (e) => {
    if (this.isOpen && !e.target.closest('.user-menu')) {
        this.closeMenu();
    }
});
```

#### **Keyboard Navigation:**
```javascript
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && this.isOpen) {
        this.closeMenu();
    }
});
```

### **3. Theme Integration**

#### **Synchronization:**
```javascript
syncThemeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggleMenu');
    if (darkModeToggle) {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        darkModeToggle.checked = isDark;
    }
}

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
```

## 🎨 Styling & Design

### **Dropdown Positioning:**
```css
.user-menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--space-2);
    min-width: 280px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: var(--z-dropdown);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: var(--transition-fast);
}

.user-menu-dropdown.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
```

### **Menu Items:**
```css
.user-menu-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    transition: var(--transition-fast);
    border-radius: var(--radius-md);
    margin: var(--space-1) var(--space-2);
}

.user-menu-item:hover {
    background-color: var(--bg-tertiary);
}

.user-menu-item i {
    width: 20px;
    text-align: center;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}
```

### **Dark Mode Support:**
```css
[data-theme="dark"] .user-menu-dropdown {
    background-color: var(--bg-secondary);
    border-color: var(--border-dark);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .user-menu-item:hover {
    background-color: var(--bg-tertiary);
}

[data-theme="dark"] .user-menu-section h5 {
    color: var(--text-secondary);
    border-bottom-color: var(--border-dark);
}
```

## 📱 Responsive Design

### **Desktop (>1024px)**
- Vollständige Menu-Funktionalität
- Hover-Effekte
- Detaillierte Icons und Labels
- Erweiterte Tooltips

### **Tablet (768-1024px)**
- Touch-optimierte Bereiche
- Größere Touch-Targets
- Vereinfachte Hover-States
- Optimierte Dropdown-Größe

### **Mobile (<768px)**
- Maximale Touch-Freundlichkeit
- Stack-Layout für Menu-Items
- Thumb-Navigation optimiert
- Fullscreen-ähnliche Dropdown

### **CSS Media Queries:**
```css
/* Mobile Optimierungen */
@media (max-width: 768px) {
    .user-menu-dropdown {
        min-width: 260px;
        right: var(--space-2);
        max-height: 80vh;
        overflow-y: auto;
    }
    
    .user-menu-item {
        padding: var(--space-4) var(--space-3);
        font-size: var(--font-size-md);
    }
    
    .user-menu-item i {
        font-size: var(--font-size-md);
    }
}
```

## 🔧 Integration & Setup

### **1. HTML-Integration**

Jede HTML-Seite benötigt:
```html
<!-- User Menu Script -->
<script src="../js/de/ui/user-menu.js"></script>

<!-- Header mit User Menu -->
<div class="user-menu">
    <button class="btn btn-ghost user-avatar">
        <i class="fas fa-user"></i>
    </button>
</div>
```

### **2. Automatic Initialization**
```javascript
// Auto-Initialisierung bei DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    window.userMenuManager = new UserMenuManager();
});
```

### **3. Settings Modal Integration**
```javascript
// Integration mit Modal-System
window.openGeneralSettings = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showModal('settingsModal', { section: 'general' });
    }
};
```

## 🔍 Advanced Features

### **1. Dynamic Content**
```javascript
// Version-Synchronisation
updateThemeToggle() {
    this.syncThemeToggle();
    
    // App-Version aktualisieren
    const versionElement = document.getElementById('menuAppVersion');
    const appVersionElement = document.getElementById('appVersion');
    if (versionElement && appVersionElement) {
        versionElement.textContent = appVersionElement.textContent;
    }
}
```

### **2. Storage Integration**
```javascript
window.exportBackup = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.storageManager && typeof window.storageManager.exportBackup === 'function') {
        window.storageManager.exportBackup();
    }
};
```

### **3. Confirmation Dialogs**
```javascript
window.clearAllData = () => {
    if (window.userMenuManager) {
        window.userMenuManager.closeMenu();
    }
    
    if (window.modalSystem) {
        window.modalSystem.showConfirmDialog(
            'Alle Daten löschen',
            'Sind Sie sicher, dass Sie alle Daten löschen möchten?',
            () => {
                // Bestätigt - Daten löschen
                if (window.storageManager) {
                    window.storageManager.clearAllData();
                    window.toastSystem?.showSuccess('Alle Daten erfolgreich gelöscht');
                }
            },
            () => {
                // Abgebrochen - nichts tun
            }
        );
    }
};
```

## 🧪 Testing & Debugging

### **Debug Tools:**
```javascript
// Menu-Status prüfen
console.log('Menu Open:', window.userMenuManager.isOpen);
console.log('Menu Element:', window.userMenuManager.menuElement);

// Event-Simulation
window.userMenuManager.toggleMenu();
```

### **Performance Monitoring:**
```javascript
// Animation-Performance
const startTime = performance.now();
window.userMenuManager.openMenu();
setTimeout(() => {
    const endTime = performance.now();
    console.log(`Menu animation: ${endTime - startTime}ms`);
}, 300);
```

## 🚀 Best Practices

### **1. Performance**
- Event-Delegation verwenden
- Debounce für schnelle Klicks
- Cleanup bei Navigation
- Memory-Leaks vermeiden

### **2. Accessibility**
- ARIA-Labels für alle Aktionen
- Keyboard-Navigation testen
- Focus-Management
- Screen Reader Kompatibilität

### **3. Mobile UX**
- Touch-Targets mindestens 44px
- Smooth Scroll-Verhalten
- Viewport-aware Positioning
- Fast-Click Prevention

### **4. Integration**
- Loose Coupling zu anderen Systemen
- Event-basierte Kommunikation
- Graceful Degradation
- Error-Handling

---

*Letzte Aktualisierung: 2024-07-17*  
*Version: 2.3.0*  
*Ersetzt: Sidebar-Settings-Navigation*