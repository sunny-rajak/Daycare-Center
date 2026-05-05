# Sprout & Spark Childcare - Authentication UI System

## Overview

Complete role-based authentication and dashboard UI system for Sprout & Spark Childcare management platform. Includes unified login, parent registration with verification, role-based sidebar navigation, and reusable form components.

---

## Components Overview

### 1. **Login.jsx** - Unified Login Page

**Location:** `frontend/src/pages/admin/Login.jsx`

**Features:**

- Single unified login for all 3 roles (Admin, Teacher, Parent)
- Role selector toggle buttons
- "Forgot Password?" link with modal
- Parent registration CTA button
- Email validation
- Loading state on submit button
- Error message display with icon

**Props:** None (uses AuthContext)

**Example Usage:**

```jsx
import Login from "./pages/admin/Login";

// In App.jsx
<Route path="/login" element={<Login />} />;
```

**Styling:**

- Rounded-2xl/3xl cards
- Gradient backgrounds (blue/emerald)
- Responsive design (mobile & desktop)
- Error alerts in red

---

### 2. **ParentRegister.jsx** - Parent Registration with Features Sidebar

**Location:** `frontend/src/pages/parent/ParentRegister.jsx`

**Features:**

- Two-column layout (features sidebar + form)
- 6 feature cards highlighting benefits:
  - Activity Tracking
  - Progress Reports
  - Billing & Invoices
  - Photo Gallery
  - Event Calendar
  - Teacher Messaging
- Password strength indicator with real-time feedback
- Enrollment verification requirement
- Mobile-responsive (sidebar hidden on mobile)
- Helpful error messages for enrollment issues

**Props:** None (uses AuthContext)

**Password Strength Levels:**

- Weak (0-1 criteria met): Red
- Fair (2 criteria met): Yellow
- Good (3 criteria met): Blue
- Strong (4 criteria met): Green

**Enrollment Verification:**

```
Checks:
1. Child.findOne({parentEmail: email, status: "Enrolled"})
2. Falls back to Parent.findOne({email}) + parentId lookup
3. Returns 403 if no enrolled child found
```

---

### 3. **Sidebar.jsx** - Role-Based Navigation Sidebar

**Location:** `frontend/src/components/Sidebar.jsx`

**Features:**

- Sticky sidebar (collapsible on mobile)
- Role-based menu items:
  - **Admin:** Dashboard, Inquiries, Staff Management, Billing, Classes
  - **Teacher:** My Class, Attendance, Activity Log, Messages
  - **Parent:** My Child, Activity Feed, Invoices, Calendar, Messages
- User info card with avatar and role
- Badge counters for new items (messages, activities, etc.)
- Settings & Logout buttons
- Mobile toggle button
- Gradient background (slate-900 to slate-800)

**Props:** None (uses AuthContext)

**Menu Structure:**

```javascript
{
  icon: "📊",
  label: "Dashboard",
  path: "/admin/dashboard",
  badge: null  // Optional badge count
}
```

---

### 4. **DashboardLayout.jsx** - Authenticated Page Wrapper

**Location:** `frontend/src/components/DashboardLayout.jsx`

**Features:**

- Top header bar with page title
- Right-side user menu with notifications
- Notification icon with badge
- User avatar and role display
- Logout button
- Responsive design with left margin for sidebar
- Sticky header

**Props:**

```jsx
<DashboardLayout title="Dashboard">{/* Your page content */}</DashboardLayout>
```

**Usage Example:**

```jsx
import DashboardLayout from "./components/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div>{/* Dashboard content */}</div>
    </DashboardLayout>
  );
}
```

---

### 5. **FormComponents.jsx** - Reusable Form Utilities

**Location:** `frontend/src/components/FormComponents.jsx`

**Exported Components:**

#### **FormField**

Reusable input component for react-hook-form

```jsx
import { useForm } from "react-hook-form";
import { FormField } from "./components/FormComponents";

export default function MyForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormField
        label="Email"
        name="email"
        type="email"
        register={register}
        errors={errors}
        required={true}
        placeholder="user@example.com"
        helperText="We'll never share your email"
      />
      <FormField
        label="Role"
        name="role"
        type="select"
        register={register}
        errors={errors}
        options={[
          { value: "admin", label: "Administrator" },
          { value: "teacher", label: "Teacher" },
          { value: "parent", label: "Parent" },
        ]}
      />
      <FormField
        label="Bio"
        name="bio"
        type="textarea"
        register={register}
        errors={errors}
        helperText="Tell us about yourself"
      />
    </form>
  );
}
```

**Props:**

- `label` (string): Field label
- `name` (string): Input name
- `type` (string): Input type (text, email, password, select, textarea, etc.)
- `register` (function): react-hook-form register
- `errors` (object): Form errors from react-hook-form
- `required` (boolean): Mark field as required
- `pattern` (RegExp): Validation pattern
- `minLength` (number): Minimum length
- `maxLength` (number): Maximum length
- `options` (array): Options for select type
- `helperText` (string): Helper text below input
- `disabled` (boolean): Disable input

#### **Alert**

Display alert messages

```jsx
import { Alert } from "./components/FormComponents";

<Alert
  type="success"
  title="Success!"
  message="Your changes have been saved."
  onClose={() => setShowAlert(false)}
/>;
```

**Alert Types:** `success`, `error`, `warning`, `info`

#### **LoadingButton**

Button with loading state

```jsx
import { LoadingButton } from "./components/FormComponents";

<LoadingButton
  loading={isSubmitting}
  disabled={!isFormValid}
  variant="primary"
  size="md"
  onClick={handleSubmit}
>
  Save Changes
</LoadingButton>;
```

**Variants:** `primary`, `secondary`, `danger`, `ghost`
**Sizes:** `sm`, `md`, `lg`

#### **Card**

Styled card container

```jsx
import { Card } from "./components/FormComponents";

<Card className="p-8">
  <h2>Card Content</h2>
  <p>Your content here</p>
</Card>;
```

#### **Badge**

Small status badges

```jsx
import { Badge } from "./components/FormComponents";

<Badge variant="success">Active</Badge>
<Badge variant="danger" size="lg">Critical</Badge>
```

**Variants:** `primary`, `success`, `warning`, `danger`

#### **Modal**

Reusable modal dialog

```jsx
import { Modal } from "./components/FormComponents";

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  title="Confirm Action"
  onClose={() => setIsOpen(false)}
  footer={
    <>
      <button onClick={() => setIsOpen(false)}>Cancel</button>
      <button onClick={handleConfirm}>Confirm</button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>;
```

---

## Integration Guide

### Step 1: Update Dashboard Pages to Use DashboardLayout

**Before:**

```jsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* content */}
    </div>
  );
}
```

**After:**

```jsx
import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <div>{/* Your dashboard content */}</div>
    </DashboardLayout>
  );
}
```

### Step 2: Using FormComponents in Forms

```jsx
import { useForm } from "react-hook-form";
import { FormField, LoadingButton, Alert } from "../components/FormComponents";

export default function StaffForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post("/api/staff", data);
      setError("");
      reset();
    } catch (err) {
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {error && (
        <Alert type="error" message={error} onClose={() => setError("")} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Full Name"
          name="name"
          register={register}
          errors={errors}
          required
        />

        <FormField
          label="Email"
          name="email"
          type="email"
          register={register}
          errors={errors}
          required
        />

        <FormField
          label="Role"
          name="role"
          type="select"
          register={register}
          errors={errors}
          options={[
            { value: "teacher", label: "Teacher" },
            { value: "admin", label: "Admin" },
          ]}
          required
        />

        <LoadingButton loading={loading} variant="primary" type="submit">
          Create Staff Member
        </LoadingButton>
      </form>
    </div>
  );
}
```

### Step 3: Install react-hook-form (if not already installed)

```bash
npm install react-hook-form
```

---

## Styling & Design System

### Color Palette

- **Primary:** Blue (600-700)
- **Success:** Emerald (600-700)
- **Danger:** Red (600-700)
- **Warning:** Amber
- **Background:** Slate (50-900)
- **Gradient:** Blue gradients for primary CTAs

### Typography

- **Headings:** Font weight 700-900
- **Labels:** Font weight 600 (semibold)
- **Body:** Font weight 400-500
- **Text sizes:** sm (12px), base (14px), lg (16px), xl (20px), 2xl (24px), 4xl (36px)

### Spacing

- **Padding:** p-4, p-6, p-8
- **Margin:** mb-2, mb-4, mb-6, mb-8
- **Gap:** gap-2, gap-3, gap-6

### Border Radius

- **Inputs:** rounded-2xl
- **Cards:** rounded-3xl
- **Buttons:** rounded-2xl

### Shadows

- **Cards:** shadow-xl
- **Hover:** shadow-lg, shadow-md
- **Default:** shadow-sm

---

## Mobile Responsiveness

All components are fully responsive:

- **Mobile-first** design approach
- **Sidebar:** Collapsible on mobile (toggle button at bottom-right)
- **Grid layouts:** 1 column on mobile, 2+ on tablet/desktop
- **Text sizes:** Scale down on mobile
- **Padding:** Reduced on mobile (p-4) vs desktop (p-8)

---

## Authentication Flow

### Login Process

1. User selects role (Admin, Teacher, Parent)
2. Enters email and password
3. System posts to `/api/users/login`
4. Backend validates credentials
5. System returns user object with role
6. AuthContext stores user data in localStorage
7. App redirects based on role:
   - `admin` → `/admin/dashboard`
   - `teacher` → `/staff/dashboard`
   - `parent` → `/parent-dashboard`

### Parent Registration Process

1. User fills out registration form
2. System checks Child collection for enrolled child with matching parentEmail
3. If found with status "Enrolled" → Creates User and Parent records
4. If not found → Returns 403 with enrollment message
5. On success → Auto-logs in and redirects to `/parent-dashboard`

### Protected Routes

All authenticated pages use ProtectedRoute component:

```jsx
<Route
  path="/admin/dashboard"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## Common Patterns

### Error Handling

```jsx
try {
  const { data } = await axios.post("/api/endpoint", payload);
  login(data);
  navigate("/dashboard");
} catch (err) {
  setError(
    err.response?.data?.message ||
      (err.response?.status === 403 ? "Access Denied" : "Request failed"),
  );
}
```

### Loading States

```jsx
<button disabled={loading} className="disabled:opacity-60">
  {loading ? "Loading..." : "Submit"}
</button>
```

### Form Validation with react-hook-form

```jsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({
  defaultValues: { email: "", password: "" },
});

<input
  {...register("email", {
    required: "Email is required",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
  })}
/>;
{
  errors.email && <p>{errors.email.message}</p>;
}
```

---

## Next Steps

1. **Implement Missing Dashboard Pages:**
   - `/admin/dashboard` - Admin dashboard
   - `/admin/inquiries` - Inquiry management
   - `/admin/staff` - Staff management
   - `/staff/dashboard` - Teacher dashboard
   - `/parent-dashboard` - Parent dashboard

2. **Add More Features:**
   - Password reset flow (backend endpoint needed)
   - User profile settings page
   - Email notifications
   - Activity logging

3. **Testing:**
   - Test all 3 login paths (admin, teacher, parent)
   - Test parent registration with/without enrollment
   - Test protected routes blocking unauthorized access
   - Test sidebar navigation for each role

---

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Android Chrome)
- Responsive to viewport widths from 320px to 2560px

---

## Dependencies

- React 18+
- React Router v6+
- Axios
- Tailwind CSS v3+
- react-hook-form (recommended for forms)

---

## File Structure

```
frontend/src/
├── pages/
│   ├── admin/
│   │   ├── Login.jsx           ✅ Enhanced unified login
│   │   ├── Dashboard.jsx       (needs DashboardLayout)
│   │   └── StaffDashboard.jsx  (needs DashboardLayout)
│   ├── parent/
│   │   ├── ParentRegister.jsx  ✅ Enhanced with sidebar
│   │   └── ParentDashboard.jsx (needs DashboardLayout)
│   └── public/
│       └── Home.jsx
├── components/
│   ├── Sidebar.jsx             ✅ New
│   ├── DashboardLayout.jsx     ✅ New
│   ├── FormComponents.jsx      ✅ New
│   ├── ProtectedRoute.jsx      ✅ Existing
│   ├── Navbar.jsx
│   └── ...others
└── context/
    └── AuthContext.jsx         ✅ Existing
```

---

## Support & Questions

For issues or questions about these components, check:

1. Component prop definitions
2. Example usage sections
3. Tailwind CSS documentation for styling questions
4. react-hook-form docs for form handling questions
