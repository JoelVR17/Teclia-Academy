# Admin Workflows

## Student Management

### Viewing the Student List
1. Navigate to `/admin/students`.
2. The table displays all registered students with photo, name, email, status, plan, registration date, and actions.
3. **Search**: Type in the search bar to filter by name, email, username, or ID — filters client-side on keystroke.
4. **Filter**: Use the status dropdown to show only active, inactive, suspended, with-plan, or without-plan students.
5. **Sort**: Click any column header (Name, Email, Plan, Registration) to sort ascending/descending.
6. **Paginate**: If more than 20 students match the filter, pagination controls appear at the bottom.

### Selecting Students (Bulk Actions)
1. Click the checkbox in the header row to select all visible students, or click individual checkboxes.
2. A bulk actions bar appears with buttons: **Activar**, **Desactivar**, **Eliminar**, **Deseleccionar**.
3. Bulk actions apply immediately with a success/error toast.

### Changing a Student's Plan
1. Click the **Asignar** or **Cambiar** button in the "Asignar plan" column.
2. A modal opens showing the current plan and a dropdown to select a new plan.
3. Select the desired plan from the dropdown.
4. Click **Guardar** to apply the change (explicit save — no auto-save).
5. On success: the modal shows a green success message, then closes automatically after 1.5 seconds. A toast confirms the action.
6. On failure: a red error message appears inside the modal; the modal stays open so you can retry.

### Suspending / Reactivating a Student
1. Click **Suspender** (for active students) or **Reactivar** (for suspended students).
2. A confirmation dialog appears explaining the action.
3. Click the red **Suspender** button to confirm, or **Cancelar** to abort.
4. On success: the row updates immediately without a full page reload. A toast confirms.
5. Suspended students cannot log in until reactivated.

### Deleting a Student
1. Click **Eliminar** in the student row.
2. A confirmation dialog appears: "¿Eliminar la cuenta de [name] ([email])? Esta acción no se puede deshacer."
3. Click the red **Eliminar** button to confirm, or **Cancelar** to abort.
4. On success: the row is removed immediately. A toast confirms.

## Plan Assignment

### Assigning a Plan to a Student
1. From the student list, click **Asignar** in the "Asignar plan" column.
2. The **PlanAssignModal** opens showing:
   - Current plan (or "Sin plan")
   - Dropdown with available plans: Sin plan, Básico, Pro, Master
3. Select a new plan from the dropdown.
4. Click **Guardar** (changes are **not** auto-saved on dropdown change).
5. Wait for the save to complete.
6. **Success**: The modal displays a green "Plan actualizado a..." message and closes automatically.
7. **Error**: The modal displays a red error message; the modal stays open. Fix and try again.
8. Click **Cancelar** at any time to close without saving.

### Available Plan Tiers
| Plan | Badge Color | Description |
|------|-------------|-------------|
| Free | Gray | No plan assigned |
| Básico | Blue | $9.99/month plan |
| Pro | Purple | $24.99/month plan |
| Master | Gold | $49.99/month plan |

## Content Moderation

### Viewing Content
1. Navigate to `/admin/content`.
2. The table displays all content with: title, type badge, publish status, author, plan tier, and actions.
3. Use the filter buttons to show only videos, PDFs, audio, images, or all content.

### Content Type Badges
- **VIDEO** — Red badge
- **PDF** — Yellow badge
- **AUDIO** — Blue badge
- **IMAGE** — Green badge

### Publish Status Badges
- **Publicado** — Green badge (visible to students)
- **Borrador** — Gray badge (not yet published)

### Deleting Content
1. Click **Eliminar** in the content row.
2. A **ConfirmDialog** appears: "¿Eliminar "[title]"? Esta acción no se puede deshacer."
3. Click the red **Eliminar** button to confirm, or **Cancelar** to abort.
4. On success: the row is removed from the list immediately without page reload. A toast confirms.
5. On failure: a red error toast appears with the specific error message.

## Confirmation Dialog (ConfirmDialog)

A reusable modal used for all destructive actions:
- Delete student
- Delete content
- Suspend student account
- Revoke/change plan (via PlanAssignModal)

### Behavior
- **Props**: `title`, `message`, `confirmLabel`, `onConfirm`, `onCancel`, `destructive`
- **Keyboard**: `Enter` confirms the action, `Escape` cancels
- **Focus**: The confirm button receives focus automatically
- **Styling**: The confirm button is styled red when `destructive={true}` (default)

## Status Badges (StatusBadge)

A reusable component for displaying consistent badges.

### Usage
| `type` prop | `status` prop | Output |
|-------------|---------------|--------|
| `"status"` (default) | `active`, `inactive`, `suspended`, `pending`, `graduated` | Color-coded status badge |
| `"plan"` | `free`, `basico`, `pro`, `master` | Color-coded plan tier badge |
| `"content-type"` | `video`, `pdf`, `audio`, `image` | Color-coded type badge |
| `"publish-status"` | `published`, `draft` | Green/gray publish badge |

## Toast Notifications

### Success Toasts
- Green background
- Auto-dismiss after 4 seconds
- Specific message (e.g., "Estudiante eliminado correctamente", "Plan actualizado a Pro")

### Error Toasts
- Red background
- Persist until manually dismissed via ✕ button
- Specific message (e.g., "Failed to suspend account — please try again")
- No generic "Something went wrong" messages

### Usage
```jsx
import { useToast } from '../../context/ToastContext.jsx';

const toast = useToast();
toast.success('Student deleted successfully');
toast.error('Failed to update plan');
```

## Student Profile Detail View

1. Click on a student's name or avatar in the student list.
2. A slide-out panel opens from the right showing:
   - **Personal Info**: Name, email, username, ID, registration date
   - **Plan & Status**: Current plan tier, account status, skill level, progress %
   - **Courses & Assignments**: Enrolled courses count, assigned teachers, completed assignments, attendance rate
   - **Teacher Notes**: Any notes left by teachers about the student
3. Click the **✕** button or click outside the panel to close.

## CSV Export

1. Click the **⬇ CSV** button in the student list toolbar (next to the search bar).
2. A CSV file downloads containing ALL currently filtered/sorted students (not just the current page).
3. The CSV includes: ID, Name, Email, Username, Status, Plan, Registration Date.
4. CSV uses UTF-8 BOM encoding for proper Spanish character display in Excel.

## Keyboard Shortcuts

Available on all admin pages. Press **?** to toggle the shortcuts help overlay.

| Shortcut | Action |
|----------|--------|
| `/` | Focus search bar (student list) |
| `n` | Add student |
| `c` | Create content |
| `g` then `d` | Go to Dashboard |
| `g` then `s` | Go to Students |
| `g` then `c` | Go to Content |
| `?` | Show keyboard shortcuts help |

Shortcuts are disabled when typing in input fields.

## Security Features

### Idle Session Timeout
- After **30 minutes** of inactivity, you'll see a warning modal: "¿Sigues ahí?"
- Click **Seguir aquí** to stay logged in (resets the timer).
- Click **Cerrar sesión** to log out immediately.
- If no response, the session expires automatically.

### CSRF Protection
- All mutating API requests include a `X-CSRF-Token` header.
- The token is generated on login and stored in sessionStorage.
- This prevents cross-site request forgery attacks.

### Content Security Policy
- The site enforces a CSP that restricts:
  - Scripts: Only same-origin and inline (for React)
  - Fonts: Google Fonts only
  - Connections: Backend API and Supabase only
  - Frames and objects: Blocked entirely
  - Form actions: Same-origin only

### Password Security
- Passwords now require: min 8 chars, letters, numbers, **and at least one special character**.
- A **password strength meter** shows real-time feedback (Débil / Media / Fuerte / Muy fuerte).
- The strength meter considers: length, uppercase, lowercase, numbers, and special characters.

## Error States
- Network failures show specific error messages with retry options
- Validation errors appear inline on forms
- Empty states provide guidance and "Limpiar filtros" buttons
- Loading states use skeleton loaders for better perceived performance
