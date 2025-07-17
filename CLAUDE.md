# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **UPS Batch Manager** - a German-language web application for managing UPS shipping batch files. It's a client-side only application (no server required) that handles up to 250 shipments per batch.

**Key characteristics:**
- 100% client-side processing (no server dependencies)
- German language interface (`de` namespace)
- Multi-page application (MPA) architecture
- Progressive Web App (PWA) with offline capabilities
- Modern vanilla JavaScript (ES6+, no frameworks)

## Architecture

### File Structure
```
├── index.html                    # Main entry point
├── html/                         # HTML pages
│   ├── dashboard.html           # Dashboard overview
│   ├── sendungen.html           # Shipment management
│   ├── import.html              # CSV import
│   ├── export.html              # Batch export
│   ├── einstellungen.html       # Settings
│   └── hilfe.html              # Help
├── css/de/                      # German-specific styles
│   ├── modern-base.css          # Base styles & CSS variables
│   ├── components.css           # UI components
│   └── layout.css               # Layout system
├── js/de/                       # German-specific JavaScript
│   ├── core/                    # Core functionality
│   ├── pages/                   # Page-specific modules
│   ├── ui/                      # UI components
│   └── validators/              # Validation modules
└── docs/                        # Documentation
```

### Core Components

1. **Multi-Page Architecture**: Each HTML page has its own JavaScript module (`js/de/pages/`)
2. **Modular Design**: Clear separation between core logic, UI components, and validators
3. **Event-Driven**: Components communicate through custom events
4. **Storage Management**: All data stored locally using `localStorage`

### Key Technologies
- **Vanilla JavaScript**: No frameworks, modern ES6+ syntax
- **CSS Grid/Flexbox**: Responsive layout system
- **LocalStorage**: Client-side data persistence
- **PWA Features**: Web App Manifest, offline capability

## Development Commands

Since this is a client-side only application, there are no build steps or package managers. Development is straightforward:

### Running the Application
```bash
# Option 1: Open directly in browser
open index.html

# Option 2: Use local server (recommended for development)
python -m http.server 8000
# or
npx serve .
```

### No Build Process
- No npm/yarn packages
- No bundling required
- No transpilation needed
- Direct file editing and browser refresh

## Code Conventions

### German Naming
- All user-facing text is in German
- File paths and modules use German names (e.g., `sendungen.html`, `einstellungen.js`)
- CSS classes and IDs follow German naming conventions
- Comments are in German for user-facing components

### JavaScript Patterns
- **ES6 Classes**: Modern class syntax for components
- **Module Pattern**: Each file exports specific functionality
- **Event-Driven**: Use custom events for component communication
- **Debounced Functions**: Performance optimization for user input
- **Error Handling**: Comprehensive try-catch blocks with user-friendly messages

### CSS Architecture
- **CSS Custom Properties**: For theming and consistency
- **Component-based**: Modular CSS for reusable components
- **Responsive-first**: Mobile-first approach
- **Dark/Light Theme**: Full theme support

## Key Features to Understand

### 1. Shipment Management (`shipment-de.js`)
- CRUD operations for shipments
- Real-time validation
- Batch operations (import/export)
- German address validation

### 2. Storage System (`storage-de.js`)
- Intelligent localStorage management
- Automatic cleanup when storage is full
- Backup/restore functionality
- Data compression for large datasets

### 3. UI Components
- **Accordion System**: Collapsible form sections
- **Modal System**: Popup dialogs with form integration
- **Toast Notifications**: User feedback system
- **Table Handler**: Advanced table with sorting/filtering
- **Form Grid System**: Responsive form layouts

### 4. Import/Export System
- CSV import with intelligent field mapping
- Real-time validation during import
- Multiple export formats (CSV, SSV, TXT)
- Template generation for users

## Working with This Codebase

### Adding New Features
1. **Page-specific**: Add modules to `js/de/pages/`
2. **UI Components**: Add reusable components to `js/de/ui/`
3. **Core Logic**: Extend core functionality in `js/de/core/`
4. **Validation**: Add new validators to `js/de/validators/`

### Styling Guidelines
- Use existing CSS custom properties for consistency
- Follow the established grid system
- Ensure dark/light theme compatibility
- Test responsive behavior on all screen sizes

### Data Management
- All data is stored locally (no server calls)
- Use the existing `StorageManagerDE` for data operations
- Implement proper error handling for storage operations
- Consider storage limits and cleanup strategies

### Testing
- Manual testing in multiple browsers (Chrome, Firefox, Safari)
- Test offline functionality
- Verify responsive design on various screen sizes
- Test import/export with various CSV formats

## UPS-Specific Requirements

### Batch File Format
- Support for all official UPS batch fields
- Country-specific validation rules
- Weight and dimension limits
- Service type availability by country

### Validation Rules
- German postal code formats
- International address validation
- Package dimension limits (270cm max per side)
- Weight limits (70kg for KG, 150lbs for LB)

### Export Formats
- CSV: Standard comma-separated
- SSV: Semicolon-separated (German Excel default)
- TXT: Tab-separated

## Performance Considerations

- **Debounced Input**: User input is debounced to avoid excessive processing
- **Virtual Scrolling**: For large datasets
- **Memory Management**: Automatic cleanup of unused data
- **Storage Optimization**: Compression and cleanup when needed
- **Lazy Loading**: Non-critical features loaded on demand

## Browser Compatibility

- Chrome/Edge 70+
- Firefox 65+
- Safari 12+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Important Notes

- **No Server Required**: This is a purely client-side application
- **German Language**: All user-facing content is in German
- **Offline Capable**: Works completely offline after initial load
- **Data Privacy**: No data leaves the user's device
- **UPS Compliance**: Follows official UPS batch file specifications