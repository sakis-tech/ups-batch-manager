# 📋 Accordion-System Dokumentation

## 📋 Übersicht

Das Accordion-System des UPS Batch Managers wurde in Version 2.3.0 vollständig überarbeitet und modernisiert. Es ersetzt das traditionelle Tab-System durch eine elegantere, mobil-optimierte Lösung mit aufklappbaren Bereichen.

## 🎯 Design-Philosophie

### **Modern User Experience**
- Fokus auf einen Bereich zur Zeit
- Reduzierte kognitive Belastung
- Intuitive Navigation
- Mobile-First Design

### **Accessibility First**
- WCAG 2.1 AA konform
- Vollständige Tastatur-Navigation
- Screen Reader optimiert
- ARIA-Labels und -States

### **Performance Optimiert**
- Hardware-beschleunigte Animationen
- Efficient DOM-Manipulation
- Memory-conscious Event-Handling
- Smooth 60fps Animationen

## 🏗️ Architektur

### **Kern-Komponenten**

#### **1. AccordionSystem Class**
```javascript
class AccordionSystem {
    constructor() {
        this.accordions = new Map();
        this.initialize();
    }
    
    // Hauptmethoden
    toggleAccordion(id)
    openAccordion(id)
    closeAccordion(id)
    registerAccordion(id, element)
}
```

#### **2. Form Integration**
```javascript
// Form Handler Integration
setupAccordionForm(form) {
    // Auto-Registrierung von Accordion-Elementen
    // Validierung-Integration
    // Error-Handling mit Auto-Open
}
```

#### **3. CSS-Architektur**
```css
.form-accordion {
    /* Container-Styles */
}

.accordion-item {
    /* Individual Accordion Item */
}

.accordion-header {
    /* Clickable Header */
}

.accordion-content {
    /* Collapsible Content */
}
```

## 🎨 Visuelle Struktur

### **Accordion Header**
```html
<div class="accordion-header active" 
     data-accordion="recipient"
     tabindex="0"
     role="button"
     aria-expanded="true">
    <div class="accordion-title">
        <i class="fas fa-user"></i>
        <h3>Empfänger-Informationen</h3>
    </div>
    <i class="fas fa-chevron-down rotated"></i>
</div>
```

### **Accordion Content**
```html
<div class="accordion-content active" 
     id="recipient-content"
     role="region"
     aria-labelledby="recipient">
    <!-- Form Content -->
</div>
```

## ⚡ Funktionalität

### **1. Navigation**

#### **Maus-Interaktion:**
- **Click**: Accordion öffnen/schließen
- **Hover**: Visuelles Feedback

#### **Tastatur-Navigation:**
- **Tab**: Zu nächstem Accordion-Header
- **Enter/Space**: Accordion umschalten
- **Arrow Up/Down**: Zwischen Headers navigieren
- **Escape**: Alle Accordions schließen

### **2. Animation System**

#### **Öffnen-Animation:**
```javascript
openAccordion(id) {
    const { header, content } = accordion;
    
    // 1. Hardware-Beschleunigung aktivieren
    content.style.willChange = 'height';
    content.style.transform = 'translateZ(0)';
    
    // 2. Smooth Height-Transition
    const height = content.scrollHeight;
    content.style.height = '0';
    requestAnimationFrame(() => {
        content.style.height = height + 'px';
    });
    
    // 3. Cleanup nach Animation
    setTimeout(() => {
        content.style.height = '';
        content.style.willChange = '';
    }, 300);
}
```

#### **Performance-Features:**
- **RequestAnimationFrame**: Für smooth Animationen
- **Will-Change**: GPU-Beschleunigung
- **Transform3D**: Hardware-Layer-Erstellung
- **Cubic-Bezier**: Natürliche Easing-Kurven

### **3. State Management**

#### **Accordion States:**
```javascript
{
    element: DOMElement,      // Accordion Container
    header: DOMElement,       // Clickable Header
    content: DOMElement,      // Collapsible Content
    isOpen: Boolean,          // Current State
    cleanupTimeout: Number    // Animation Cleanup
}
```

#### **ARIA States:**
- `aria-expanded`: "true"/"false"
- `aria-controls`: Content-Element ID
- `role="button"`: Header Semantik
- `role="region"`: Content Semantik

## 🔧 Integration in Formulare

### **Modal System Integration**

#### **Vorher (Tab-System):**
```html
<div class="form-tabs">
    <div class="tabs-nav">
        <button class="tab-item">Empfänger</button>
        <button class="tab-item">Paket</button>
    </div>
    <div class="tab-content">
        <div class="tab-pane">Content 1</div>
        <div class="tab-pane">Content 2</div>
    </div>
</div>
```

#### **Nachher (Accordion-System):**
```html
<div class="form-accordion">
    <div class="accordion-group">
        <div class="accordion-item">
            <div class="accordion-header">
                <div class="accordion-title">
                    <i class="fas fa-user"></i>
                    <h3>Empfänger-Informationen</h3>
                </div>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">
                <!-- Form Fields -->
            </div>
        </div>
    </div>
</div>
```

### **Validierung Integration**

#### **Error Handling:**
```javascript
// Bei Validierungsfehlern öffnet sich automatisch 
// das entsprechende Accordion
showValidationErrors(form) {
    const firstError = form.querySelector('.has-error');
    const accordionContent = firstError.closest('.accordion-content');
    
    if (accordionContent) {
        const accordionId = accordionContent.previousElementSibling
            .getAttribute('data-accordion');
        
        // Accordion öffnen und zum Fehler scrollen
        this.openAccordion(accordionId);
        setTimeout(() => {
            firstError.scrollIntoView({ behavior: 'smooth' });
        }, 350);
    }
}
```

## 📱 Responsive Design

### **Desktop (>1024px)**
- Volle Accordion-Funktionalität
- Hover-Effekte
- Große Touch-Targets
- Detaillierte Icons

### **Tablet (768-1024px)**
- Optimierte Touch-Bereiche
- Vereinfachte Animationen
- Größere Schriftarten
- Touch-freundliche Buttons

### **Mobile (<768px)**
- Maximale Touch-Targets
- Reduzierte Animationen
- Stack-Layout
- Thumb-Navigation optimiert

### **CSS Media Queries:**
```css
/* Mobile First */
.form-accordion .accordion-header {
    padding: var(--space-3) var(--space-4);
    min-height: 50px;
}

/* Tablet */
@media (min-width: 768px) {
    .form-accordion .accordion-header {
        padding: var(--space-4) var(--space-5);
        min-height: 60px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .form-accordion .accordion-header {
        padding: var(--space-4) var(--space-6);
        min-height: 60px;
    }
}
```

## 🎨 Theming & Styling

### **Light Mode**
```css
.form-accordion .accordion-header {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-light);
}

.form-accordion .accordion-header.active {
    background: var(--primary-light);
    border-bottom: 1px solid var(--primary);
}
```

### **Dark Mode**
```css
[data-theme="dark"] .form-accordion .accordion-header {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-dark);
}

[data-theme="dark"] .form-accordion .accordion-header.active {
    background: rgba(37, 99, 235, 0.1);
    border-bottom: 1px solid var(--primary);
}
```

### **Accessibility Features**
```css
/* Fokus-Indikatoren */
.form-accordion .accordion-header:focus {
    outline: 2px solid var(--primary);
    outline-offset: -2px;
    z-index: 1;
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    .form-accordion .accordion-header > i,
    .form-accordion .accordion-content {
        transition: none !important;
    }
}
```

## 🧩 Erweiterte Features

### **1. Auto-Registration**
```javascript
// Automatische Erkennung und Registrierung
initializeExistingAccordions() {
    const accordions = document.querySelectorAll('.accordion-item');
    accordions.forEach(accordion => {
        const header = accordion.querySelector('.accordion-header');
        if (header) {
            const id = header.getAttribute('data-accordion') || 
                      this.generateAccordionId();
            this.registerAccordion(id, accordion);
        }
    });
}
```

### **2. Event System**
```javascript
// Custom Events für externe Integration
dispatchAccordionEvent(eventType, accordionId) {
    const event = new CustomEvent(`accordion${eventType}`, {
        detail: { accordionId }
    });
    document.dispatchEvent(event);
}

// Usage
document.addEventListener('accordionopen', (e) => {
    console.log(`Accordion ${e.detail.accordionId} opened`);
});
```

### **3. Bulk Operations**
```javascript
// Alle Accordions schließen
closeAllAccordions() {
    this.accordions.forEach((accordion, id) => {
        if (accordion.isOpen) {
            this.closeAccordion(id);
        }
    });
}

// State Management
getAllAccordionStates() {
    const states = {};
    this.accordions.forEach((accordion, id) => {
        states[id] = accordion.isOpen;
    });
    return states;
}
```

## 🔍 Debugging & Development

### **Debug Information**
```javascript
// Accordion-System Status
console.log('Registered Accordions:', window.accordionSystem.accordions.size);
console.log('All States:', window.accordionSystem.getAllAccordionStates());
```

### **Performance Monitoring**
```javascript
// Animation Performance
const startTime = performance.now();
this.openAccordion('recipient');
requestAnimationFrame(() => {
    const endTime = performance.now();
    console.log(`Animation took ${endTime - startTime} milliseconds`);
});
```

## 🚀 Best Practices

### **1. Performance**
- Verwende `will-change` sparsam
- Cleanup nach Animationen
- Debounce schnelle Interaktionen
- Hardware-Beschleunigung für Animationen

### **2. Accessibility**
- Immer ARIA-Labels setzen
- Keyboard-Navigation testen
- Screen Reader kompatibel
- Focus-Management

### **3. Mobile**
- Touch-Targets mindestens 44px
- Swipe-Gesten für Power-User
- Performance auf schwächeren Geräten
- Reduced Motion berücksichtigen

### **4. Integration**
- Event-basierte Kommunikation
- Loose Coupling zu anderen Systemen
- Graceful Degradation
- Progressive Enhancement

---

*Letzte Aktualisierung: 2024-07-17*  
*Version: 2.3.0*  
*Ersetzt: Tab-basierte Navigation*