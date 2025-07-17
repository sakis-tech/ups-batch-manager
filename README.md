# 🚚 UPS Batch-Manager (Deutsche Version)

> **TL;DR**: Professioneller, webbasierter UPS Batch-Manager für bis zu 250 Sendungen. 100% client-side, keine Installation nötig, vollständige deutsche Lokalisierung mit UPS-konformen Export-Formaten.

[![Version](https://img.shields.io/badge/Version-2.2.0-blue)](#changelog)
[![Browser](https://img.shields.io/badge/Browser-Chrome%20%7C%20Firefox%20%7C%20Safari-green)](#browser-unterstützung)
[![Offline](https://img.shields.io/badge/Offline-Capable-orange)](#offline-funktionalität)
[![Language](https://img.shields.io/badge/Sprache-Deutsch-red)](#lokalisierung)

Ein professioneller, webbasierter Manager für UPS Batch-Versanddateien mit modernster Benutzeroberfläche, intelligenter Validierung und robuster Fehlerbehandlung.

## 🚀 Quick Start

1. **Öffnen**: `index.html` im Browser (leitet automatisch zum Dashboard weiter)
2. **Erstellen**: Neue Sendung über Dashboard → "Neue Sendung"
3. **Importieren**: CSV-Datei per Drag & Drop in Import-Bereich
4. **Exportieren**: UPS-kompatible Batch-Datei über "Batch Exportieren"

**Fertig!** Keine Installation, keine Server, keine Registrierung erforderlich.

## 🆕 Aktuelle Version (v2.2.0)

### **Neue Architektur**
- **Multi-Page Application**: Getrennte HTML-Seiten für bessere Performance
- **Modulare Struktur**: Organisierte JavaScript-Module nach Funktionalität
- **Deutsche Fokussierung**: Vollständig deutsche Anwendung ohne Sprachenwechsel

### **Letzte Verbesserungen**
- ✅ **CORS-Problem gelöst**: Sprachdateien eingebettet für offline Nutzung
- ✅ **Dateistruktur optimiert**: HTML in `html/`, Dokumentation in `docs/`
- ✅ **Modal-System repariert**: Context-Binding für Formulare korrigiert
- ✅ **Pfade aktualisiert**: Alle relativen Pfade nach Umstrukturierung angepasst

## ✨ Funktionen

### 🎯 **Dashboard & Übersicht**
- 📊 **Live-Statistiken**: Gesamt, gültig, fehlerhaft, Gesamtgewicht
- ⚡ **Schnellaktionen**: Neue Sendung, CSV Import, Batch Export, Vorlage Download
- 📈 **Aktivitätsverlauf**: Chronologische Aufzeichnung aller Benutzeraktionen
- 🔔 **Smart Notifications**: Toast-Nachrichten für alle Aktionen

### 📦 **Erweiterte Sendungsverwaltung**
- ✅ **Vollständiges CRUD**: Hinzufügen, Bearbeiten, Löschen, Duplizieren
- 🔍 **Intelligente Suche & Filter**: Nach Service, Land, Status, Empfänger
- ⚡ **Echtzeit-Validierung**: Sofortige Rückmeldung bei Eingabefehlern
- 📋 **Massenaktionen**: Mehrere Sendungen gleichzeitig bearbeiten
- 🗂️ **Sortierung & Paginierung**: Alle Spalten sortierbar, 10/25/50 pro Seite

### 🔄 **Professioneller Import/Export**
- 📥 **3-Schritt Import**: Datei → Vorschau → Validierung → Import
- 🎯 **Intelligente Feld-Zuordnung**: Automatische Erkennung von CSV-Spalten
- ⚠️ **Erweiterte Fehlerbehandlung**: Kritische Fehler vs. Warnungen
- 📤 **Flexible Export-Optionen**: CSV, SSV, TXT mit Feldauswahl
- 📋 **Template-Downloads**: 4 vorgefertigte Vorlagen mit Beispieldaten
- 🔧 **Robuste Validierung**: Fortsetzung bei partiellen Fehlern

### ⚙️ **Intelligente Einstellungen**
- 🎨 **Persönliche Anpassung**: Standardwerte, Theme, Sprache
- 💾 **Erweiterte Datenverwaltung**: Backup, Wiederherstellung, Bereinigung
- 📊 **Speicher-Monitoring**: Live-Überwachung mit proaktiven Warnungen
- 🔒 **Datenschutz**: 100% offline, keine Datenübertragung

### 🎨 **Moderne Benutzeroberfläche**
- 🎯 **UPS-Corporate Design**: Original UPS Farben und Branding
- 📱 **Responsive Design**: Optimiert für Desktop, Tablet, Mobile
- 🌓 **Dark/Light Mode**: Automatische oder manuelle Umschaltung
- 🧩 **Moderne Komponenten**: Modals, Tooltips, Akkordeons, Toast-Nachrichten
- ♿ **Barrierefreiheit**: WCAG 2.1 AA konform, Tastatur-Navigation

## 📖 Detaillierte Anleitung

### 🏁 Installation & Start
```bash
# Option 1: Direkt öffnen
# index.html in Browser öffnen (leitet automatisch zum Dashboard weiter)

# Option 2: Lokaler Server (empfohlen für Entwicklung)
npx serve .
# oder
python -m http.server 8000
```

### 🎯 Grundlegende Nutzung

#### 1. **Neue Sendung erstellen**
- Dashboard → "Neue Sendung" → Formulardaten eingeben
- **Echtzeit-Validierung** prüft Eingaben sofort
- **Länderspezifische Felder** werden automatisch angepasst

#### 2. **CSV-Import durchführen**
- Datei per **Drag & Drop** in Import-Bereich
- **Automatische Spalten-Erkennung** und Feld-Zuordnung
- **Validierung mit Vorschau** vor dem Import
- **Intelligente Fehlerbehandlung** für problematische Daten

#### 3. **Batch-Export erstellen**
- **Erweiterte Export-Optionen** über Modal
- **Feldauswahl** für individuellen Export
- **UPS-kompatible Formate**: CSV, SSV (empfohlen), TXT
- **Sortierung** nach Land oder Service

#### 4. **Vorlagen nutzen**
- **4 Template-Typen**: Basis, Erweitert, International, Beispieldaten
- **Automatische Formatierung** für deutsche Excel-Versionen
- **Integrierte Beispieldaten** zum Testen

## 🌐 Offline-Funktionalität

### ✅ **Vollständig Offline-Fähig**
- **Erste Nutzung**: Einmalig online öffnen, dann vollständig offline nutzbar
- **Kein Internet erforderlich**: Alle Funktionen arbeiten client-side
- **Lokale Speicherung**: Alle Daten bleiben auf Ihrem Gerät
- **Cache-Strategie**: Browser-Cache hält Anwendung permanent verfügbar

### 🔒 **Datenschutz & Sicherheit**
- **100% Client-Side**: Keine Datenübertragung an externe Server
- **Lokale Verarbeitung**: Alle Berechnungen und Validierungen vor Ort
- **Kein Tracking**: Keine Analytik, keine Cookies, keine Verfolgung
- **HTTPS-kompatibel**: Funktioniert mit sicheren Verbindungen

### 💾 **Speicher-Management**
- **Intelligente Bereinigung**: Automatische Optimierung bei Platzmangel
- **Proaktive Warnungen**: Benachrichtigungen bei niedrigem Speicherstand
- **Backup-Funktionen**: Datenexport für Sicherheit und Portabilität
- **Wiederherstellung**: Import von Backup-Dateien

## 🎯 Erweiterte Features

### 🔄 **Import/Export im Detail**

#### **CSV-Import Workflow**
1. **Datei-Upload**: Drag & Drop oder Datei-Auswahl
2. **Format-Erkennung**: Automatische Delimiter-Erkennung (CSV, SSV, TXT)
3. **Spalten-Mapping**: Intelligente Zuordnung zu UPS-Feldern
4. **Validierung**: Echtzeit-Prüfung mit Fehler-Kategorisierung
5. **Import-Optionen**: Nur gültige Daten, Duplikat-Behandlung
6. **Ergebnis-Report**: Detaillierte Statistiken und Empfehlungen

#### **Batch-Export Optionen**
- **Format-Auswahl**: CSV (Standard), SSV (Deutschland), TXT (Tab-getrennt)
- **Feld-Selektion**: Basis-, Erweiterte-, oder Internationale Felder
- **Sortierung**: Nach Land, Service-Typ, oder Empfänger
- **Filterung**: Nur gültige, alle, oder ausgewählte Sendungen
- **Zeitstempel**: Automatische Datums- und Versionsangaben

### ⚡ **Echtzeit-Validierung**
- **Sofortige Rückmeldung**: Fehler werden während der Eingabe angezeigt
- **Kontextabhängig**: Postleitzahlen werden nach ausgewähltem Land validiert
- **Visuelle Hinweise**: Farbkodierung für gültige/ungültige Felder
- **Pflichtfeld-Prüfung**: Formulare können nur mit vollständigen Daten gespeichert werden

### 🛠️ **Robuste Fehlerbehandlung**
- **Kategorisierte Fehler**: Kritisch (blockierend) vs. Warnungen (informativ)
- **Wiederherstellungsstrategien**: Automatische Daten-Komprimierung bei Speichermangel
- **Graceful Degradation**: Teilweise Imports möglich bei gemischten Datenqualitäten
- **Detaillierte Berichte**: Zeilengenaue Fehleranalyse mit Korrektur-Hinweisen

## 📁 Projektstruktur

```
ups-batch-manager/
├── index.html                          # Root-Redirect zur Anwendung
├── html/                               # HTML-Seiten (Multi-Page Application)
│   ├── dashboard.html                  # Dashboard mit Statistiken
│   ├── sendungen.html                  # Sendungsverwaltung
│   ├── import.html                     # CSV Import
│   ├── export.html                     # Batch Export
│   ├── einstellungen.html              # Einstellungen
│   └── hilfe.html                      # Hilfe-System
├── docs/                               # Dokumentation
│   ├── CHANGELOG.md                    # Versionshistorie
│   ├── DEPLOYMENT.md                   # Deployment-Anleitung
│   └── FEATURES.md                     # Feature-Beschreibungen
├── css/de/                             # Stylesheets (Deutsch)
│   ├── modern-base.css                 # Basis-Styles & CSS-Variablen
│   ├── components.css                  # UI-Komponenten
│   └── layout.css                      # Layout-System & Responsive Design
├── js/de/                              # JavaScript-Module (Deutsch)
│   ├── core/                           # Kernfunktionalität
│   │   ├── ups-fields.js               # UPS Felddefinitionen
│   │   ├── shipment-de.js              # Sendungsverwaltung (CRUD)
│   │   ├── storage-de.js               # Speicherverwaltung & Backup
│   │   ├── language-manager.js         # Übersetzungsmanagement (Deutsch)
│   │   ├── activity-logger.js          # Aktivitätsverfolgung
│   │   ├── user-manager.js             # Benutzerverwaltung
│   │   ├── undo-manager.js             # Rückgängig-Funktionen
│   │   └── unsaved-changes-manager.js  # Ungespeicherte Änderungen
│   ├── pages/                          # Seitenspezifische Logik
│   │   ├── dashboard.js                # Dashboard-Funktionalität
│   │   ├── sendungen.js                # Sendungsseite
│   │   ├── import.js                   # Import-Seite
│   │   ├── export.js                   # Export-Seite
│   │   ├── einstellungen.js            # Einstellungsseite
│   │   ├── hilfe.js                    # Hilfe-Seite
│   │   └── shared.js                   # Geteilte Funktionen
│   ├── ui/                             # Benutzeroberfläche
│   │   ├── modal-system.js             # Modal-Dialoge
│   │   ├── toast-system.js             # Toast-Benachrichtigungen
│   │   ├── accordion.js                # Akkordeon-Komponenten
│   │   ├── pagination.js               # Tabellen-Pagination
│   │   ├── import-handler.js           # CSV Import mit 3-Schritt-Prozess
│   │   ├── export-handler.js           # Erweiterte Export-Optionen
│   │   ├── template-handler.js         # Template-Download-System
│   │   ├── form-handler-de.js          # Formular-Management
│   │   ├── table-handler-de.js         # Tabellen-Management
│   │   ├── help-system.js              # Kontextsensitive Hilfe
│   │   ├── keyboard-shortcuts.js       # Tastaturkürzel
│   │   └── activity-ui.js              # Aktivitätsanzeige
│   └── validators/                     # Validierung & Datenqualität
│       ├── field-validators-de.js      # Deutsche Feldvalidatoren
│       └── real-time-validator.js      # Echtzeit-Validierung
├── lang/                               # Sprachdateien (eingebettet in JS)
│   ├── de.json                         # Deutsche Übersetzungen
│   └── en.json                         # [Veraltet] Englische Übersetzungen
├── manifest.json                       # PWA Manifest
├── ups-batch-file.json                # UPS Feldspezifikationen
└── README.md                           # Diese Datei
```

## 📋 UPS Batch-Format

Die Anwendung exportiert UPS-kompatible Dateien mit allen offiziellen Feldern:

### Empfänger-Informationen
- Kontaktname, Firmenname, Adresse (1-3)
- Stadt, Bundesland, Postleitzahl, Land
- Telefon, Durchwahl, E-Mail
- Privatadresse (Ja/Nein)

### Paket-Informationen
- Gewicht, Abmessungen (L×B×H)
- Verpackungsart, Maßeinheit
- Warenbeschreibung, Zollwert

### Service-Optionen
- Service-Typ (Standard, Express, etc.)
- Zustellbestätigung, Samstag-Zustellung
- Zusätzliche Behandlung, Klimaneutral
- Referenznummern (1-3)

### Spezialfelder
- UPS Premium Care
- Lithium-Batterien-Kennzeichnung
- Elektronische Paket-Freigabe
- Versender-Freigabe

## ✅ Validierungsregeln

### Adress-Validierung
- **Postleitzahlen**: Länderspezifische Formate
- **Telefonnummern**: Internationale Formate unterstützt
- **E-Mail**: Standard RFC-konforme Validierung

### Paket-Validierung
- **Gewicht**: 0,1 - 70 kg (KG) / 0,1 - 150 lbs (LB)
- **Abmessungen**: 1 - 270 cm pro Dimension
- **Umfang**: Länge + 2×(Breite + Höhe) ≤ 400 cm

### Internationale Sendungen
- **Zollwert**: Erforderlich für Nicht-EU Länder
- **Warenbeschreibung**: Pflicht für Zollanmeldung
- **Service-Typ**: Länderspezifische Verfügbarkeit

## ⌨️ Tastaturkürzel & Barrierefreiheit

### **Globale Shortcuts**
- **Strg/Cmd + S**: Sendung speichern
- **Strg/Cmd + I**: Import-Bereich öffnen
- **Strg/Cmd + E**: Export-Bereich öffnen
- **Strg/Cmd + D**: Vorlage herunterladen
- **Esc**: Modale schließen / Filter zurücksetzen
- **Entf**: Ausgewählte Sendungen löschen

### **Navigation**
- **Tab**: Zwischen Eingabefeldern navigieren
- **Shift + Tab**: Rückwärts navigieren
- **Leertaste**: Checkboxen umschalten
- **Enter**: Schaltflächen aktivieren
- **Pfeiltasten**: Durch Tabellen und Listen navigieren

### **Barrierefreiheit**
- **Screen Reader**: Vollständige ARIA-Labels und Beschreibungen
- **Kontrast**: WCAG 2.1 AA konform für alle Farben
- **Fokus-Management**: Sichtbare Fokus-Indikatoren
- **Tastatur-Navigation**: Alle Funktionen ohne Maus nutzbar

## 🌐 Browser-Unterstützung

- **Chrome/Edge**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Mobile**: iOS Safari, Chrome Mobile

## 📊 Technische Spezifikationen

- **Maximale Sendungen**: 250 pro Batch
- **Dateigröße Import**: 10MB Maximum
- **Lokaler Speicher**: 5MB Kapazität
- **Performance**: <3s Ladezeit, <100ms Interaktionen

## 💾 Datenspeicherung

Alle Daten werden lokal im Browser gespeichert. Keine Datenübertragung an externe Server.

### Gespeicherte Daten
- Sendungsdaten mit Validierungsstatus
- Aktivitätsverlauf (letzte 50 Aktionen)
- Adressverlauf für Autovervollständigung
- Benutzereinstellungen und Präferenzen

### Backup & Wiederherstellung
- **Automatisches Backup**: JSON-Download
- **Wiederherstellung**: Drag & Drop Import
- **Speicher-Bereinigung**: Automatisch bei Platzmangel

## 🔒 Sicherheit & Datenschutz

- **100% Client-Side**: Keine Server-Kommunikation
- **Lokale Daten**: Bleiben auf Ihrem Gerät
- **Kein Tracking**: Keine Analytik oder Verfolgung
- **HTTPS-kompatibel**: Funktioniert mit sicheren Verbindungen

## 🛠️ Entwicklung & Anpassung

### Architektur
- **Vanilla JavaScript**: Keine Framework-Abhängigkeiten
- **Modulares Design**: Getrennte Verantwortlichkeiten
- **Progressive Enhancement**: Grundfunktionen ohne JavaScript
- **Responsive First**: Mobile-optimiert

### Erweiterbarkeit
- Neue UPS-Felder einfach hinzufügbar
- Zusätzliche Validierungsregeln
- Neue Import/Export-Formate
- Weitere Sprachen

## 🐛 Fehlerbehebung

### Häufige Probleme
1. **Import schlägt fehl**: CSV-Format und Dateigröße prüfen
2. **Export leer**: Gültige Sendungen vorhanden prüfen
3. **Validierungsfehler**: Pflichtfelder und Formate kontrollieren
4. **Speicher voll**: Backup erstellen und alte Daten löschen

### Browser-Probleme
- **Cache leeren** bei Styling-Problemen
- **JavaScript aktivieren** für volle Funktionalität
- **Konsole prüfen** für Fehlermeldungen

## 📈 Changelog

### **v2.2.0** (Aktuell) - Architektur & Stabilität
- ✅ **Multi-Page Application**: Umstrukturierung zu getrennten HTML-Seiten
- ✅ **Dateiorganisation**: HTML in `html/`, Dokumentation in `docs/`
- ✅ **Deutsche Fokussierung**: Entfernung der Sprachenwechsel-Funktion
- ✅ **CORS-Lösung**: Sprachdateien direkt in JavaScript eingebettet
- ✅ **Modal-System Fix**: Context-Binding für Formular-Funktionen repariert
- ✅ **Pfad-Optimierung**: Alle relativen Pfade nach Umstrukturierung aktualisiert
- ✅ **Root-Redirect**: index.html leitet automatisch zum Dashboard weiter
- 🔧 **Bugfixes**: Modal-Funktionen, Pfad-Referenzen, JavaScript-Kontexte

### **v2.1.0** - Stabilität & Features
- ✅ **Echtzeit-Validierung**: Sofortige Feldprüfung während der Eingabe
- ✅ **Erweiterte Import-Funktionen**: 3-Schritt-Import mit intelligenter Fehlerbehandlung
- ✅ **Professioneller Export**: Modal mit Feldauswahl und Formatoptionen
- ✅ **Template-Downloads**: 4 vorgefertigte Vorlagen mit Beispieldaten
- ✅ **Robuste Speicher-Verwaltung**: Automatische Bereinigung und Wiederherstellung
- ✅ **Verbesserte Fehlerbehandlung**: Kategorisierte Fehler vs. Warnungen

### **v2.0.0** - Deutsche Vollversion
- ✅ **Vollständige deutsche Lokalisierung** mit UPS-Corporate Design
- ✅ **Moderne UI-Komponenten**: Modals, Toast-Nachrichten, Akkordeons
- ✅ **Responsive Design**: Optimiert für alle Gerätegrößen
- ✅ **Erweiterte Sendungsverwaltung**: CRUD-Operationen mit Validierung

### **v1.0.0** - Erste Version
- ✅ **Grundlegende UPS Batch-Funktionalität**
- ✅ **Englische Benutzeroberfläche**
- ✅ **CSV Import/Export**

## 🤝 Beitragen

Dieses Projekt ist als eigenständige Anwendung für Einfachheit und Zuverlässigkeit konzipiert.

## 📄 Lizenz

Dieses Projekt wird "wie besehen" für UPS Batch-Datei-Management bereitgestellt. 
Verwenden Sie es verantwortungsbewusst und stellen Sie die Einhaltung der UPS-Versandanforderungen sicher.

## 📞 Support

Bei Fragen zur UPS Batch-Datei-Spezifikation wenden Sie sich an die UPS WorldShip-Dokumentation.

---

**Entwickelt für professionelle UPS Batch-Verarbeitung mit deutscher Benutzeroberfläche** 🇩🇪# ups-batch-manager
