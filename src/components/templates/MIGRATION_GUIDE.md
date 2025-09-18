# Template Components Migration Guide

This guide helps you migrate from the old template component structure to the new organized structure.

## 🗂️ Old vs New Structure

### Before (Scattered)
```
src/features/template-settings/
├── components/
│   ├── email-templates/
│   ├── shared/
│   └── whatsapp-templates/
src/routes/settings/-components/Template/
├── EmailRichTextEditor.tsx
├── TemplateEditor.tsx
├── TemplatePreview.tsx
└── ...
src/routes/manage-students/.../bulk-actions/
├── template-editor-dialog.tsx
├── template-preview-dialog.tsx
└── template-selection-dialog.tsx
```

### After (Centralized)
```
src/components/templates/
├── shared/                    # All reusable components
├── email/                     # Email-specific components
├── whatsapp/                  # WhatsApp-specific components
└── index.ts                   # Clean exports
```

## 🔄 Import Changes

### Old Imports
```tsx
// ❌ Old scattered imports
import { TemplateEditor } from '@/features/template-settings/components/email-templates/TemplateEditor';
import { EmailRichTextEditor } from '@/routes/settings/-components/Template/EmailRichTextEditor';
import { TemplateEditorDialog } from './template-editor-dialog';
import { TemplatePreviewDialog } from './template-preview-dialog';
```

### New Imports
```tsx
// ✅ New centralized imports
import {
  TemplateEditor,
  EmailRichTextEditor,
  TemplateEditorDialog,
  TemplatePreviewDialog
} from '@/components/templates/shared';

// Or import everything from main index
import {
  TemplateEditor,
  EmailRichTextEditor,
  TemplateEditorDialog,
  TemplatePreviewDialog
} from '@/components/templates';
```

## 📋 Migration Checklist

### 1. Update Settings Page
- [ ] Replace `src/routes/settings/-components/Template/TemplateSettings.tsx`
- [ ] Update imports to use new shared components
- [ ] Test template creation and editing

### 2. Update Bulk Actions
- [ ] Replace local template dialogs with shared components
- [ ] Update import paths in send-email-dialog.tsx
- [ ] Test bulk email functionality

### 3. Update Feature Components
- [ ] Replace `src/features/template-settings/` components
- [ ] Update all import paths
- [ ] Test template management features

### 4. Clean Up Old Files
- [ ] Remove duplicate components
- [ ] Remove old import paths
- [ ] Update any remaining references

## 🔧 Step-by-Step Migration

### Step 1: Update Settings Route
```tsx
// src/routes/settings/-components/Template/TemplateSettings.tsx
// Replace with:
import { TemplateSettings } from '@/components/templates';
```

### Step 2: Update Bulk Actions
```tsx
// src/routes/manage-students/.../bulk-actions/send-email-dialog.tsx
// Replace:
import { TemplateEditorDialog } from './template-editor-dialog';
import { TemplatePreviewDialog } from './template-preview-dialog';

// With:
import { TemplateEditorDialog, TemplatePreviewDialog } from '@/components/templates/shared';
```

### Step 3: Update Feature Components
```tsx
// Any feature using template components
// Replace old imports with:
import { TemplateEditor, EmailTemplatesTab } from '@/components/templates';
```

## ⚠️ Breaking Changes

1. **Import Paths**: All template component imports need to be updated
2. **Component Names**: Some components may have been renamed for consistency
3. **Props**: Some component props may have changed for better reusability

## 🧪 Testing After Migration

1. **Template Creation**: Test creating new templates
2. **Template Editing**: Test editing existing templates
3. **Template Preview**: Test preview functionality
4. **Bulk Actions**: Test bulk email sending
5. **Settings Page**: Test template management

## 🆘 Troubleshooting

### Common Issues

1. **Import Errors**: Make sure all import paths are updated
2. **Missing Components**: Check if components were moved to shared folder
3. **Type Errors**: Update type imports if needed
4. **Styling Issues**: Ensure CSS imports are updated

### Getting Help

If you encounter issues during migration:
1. Check the component documentation in `README.md`
2. Verify import paths match the new structure
3. Test components individually
4. Check for any remaining old imports

## 📈 Benefits of New Structure

1. **Centralized**: All template components in one place
2. **Reusable**: Shared components can be used anywhere
3. **Maintainable**: Easier to update and maintain
4. **Consistent**: Unified API and styling
5. **Scalable**: Easy to add new template types
