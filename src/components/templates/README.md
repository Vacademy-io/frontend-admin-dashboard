# Template Components

Centralized template management components for email and WhatsApp messaging.

## 📁 Structure

```
src/components/templates/
├── index.ts                    # Main exports
├── TemplateSettings.tsx        # Main settings component
├── shared/                     # Reusable components
├── email/                      # Email-specific components
└── whatsapp/                   # WhatsApp-specific components
```

## 🎯 Component Overview

### Shared Components

#### `TemplateEditor`
- **Purpose**: Main template creation/editing component
- **Features**:
  - Rich text editing with variable insertion
  - Template type classification (marketing, utility, transactional)
  - Dynamic variable sidebar
  - Form validation
- **Usage**: Used in both settings and bulk actions

#### `TemplateEditorDialog`
- **Purpose**: Dialog wrapper for TemplateEditor
- **Features**:
  - Modal interface
  - Save & Send functionality
  - Customizable button text
- **Usage**: Used in bulk email actions

#### `TemplatePreview`
- **Purpose**: Template preview with device responsiveness
- **Features**:
  - Mobile, tablet, laptop preview modes
  - Real-time device switching
  - Responsive frame sizing
- **Usage**: Preview templates before sending

#### `TemplatePreviewDialog`
- **Purpose**: Dialog wrapper for TemplatePreview
- **Features**:
  - Modal interface
  - Use Template functionality
- **Usage**: Used in bulk email actions

#### `EmailRichTextEditor`
- **Purpose**: Rich text editor specifically for email content
- **Features**:
  - WYSIWYG editing
  - Variable insertion
  - HTML source view
  - Preview functionality
- **Usage**: Used in template editing

### Email Components

#### `EmailTemplatesTab`
- **Purpose**: Email templates management interface
- **Features**:
  - Template listing with search
  - Create, edit, delete operations
  - Template type classification
  - Status management
- **Usage**: Used in settings page

### WhatsApp Components

#### `WhatsAppTemplatesTab`
- **Purpose**: WhatsApp templates management interface
- **Features**:
  - Meta WhatsApp Business API integration
  - Template syncing and status management
  - Dynamic value mapping to internal data fields
  - Real-time preview with mapped values
  - Category-based field selection
- **Usage**: Used in settings page

## 🔧 Usage Examples

### Basic Template Editor
```tsx
import { TemplateEditor } from '@/components/templates/shared';

<TemplateEditor
  template={selectedTemplate}
  onSave={handleSave}
  onClose={handleClose}
  isSaving={isSaving}
/>
```

### Template Editor Dialog
```tsx
import { TemplateEditorDialog } from '@/components/templates/shared';

<TemplateEditorDialog
  isOpen={showEditor}
  onClose={handleClose}
  onSaveAndSend={handleSaveAndSend}
  template={editingTemplate}
  isSending={isSending}
  primaryButtonText="Save & Send"
/>
```

### Template Preview Dialog
```tsx
import { TemplatePreviewDialog } from '@/components/templates/shared';

<TemplatePreviewDialog
  isOpen={showPreview}
  onClose={handleClose}
  template={selectedTemplate}
  onUseTemplate={handleUseTemplate}
  isSending={isSending}
/>
```

### Email Templates Tab
```tsx
import { EmailTemplatesTab } from '@/components/templates/email';

<EmailTemplatesTab />
```

## 🎨 Styling

All components use:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Radix UI** for base components
- **Custom design system** components where applicable

## 🔄 State Management

Components use:
- **React hooks** for local state
- **Zustand** for global state (dialog management)
- **Template cache service** for data persistence

## 📝 Template Variables

Supported variables include:
- **Student data**: `{{name}}`, `{{email}}`, `{{mobile_number}}`
- **Course data**: `{{course_name}}`, `{{course_description}}`
- **Institute data**: `{{institute_name}}`, `{{institute_address}}`
- **General data**: `{{current_date}}`, `{{current_time}}`

## 🚀 Future Enhancements

- [x] WhatsApp template support ✅
- [ ] Template versioning
- [ ] Template analytics
- [ ] Bulk template operations
- [ ] Template import/export
- [ ] Advanced variable validation

## 🔗 Related Files

- `src/types/message-template-types.ts` - Type definitions
- `src/services/message-template-service.ts` - API services
- `src/services/template-cache-service.ts` - Caching service
