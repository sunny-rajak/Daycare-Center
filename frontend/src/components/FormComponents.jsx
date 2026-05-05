/**
 * Reusable Form Field Component for use with react-hook-form
 * Handles text, email, password, tel, select, and textarea inputs
 */

export function FormField({
  label,
  name,
  type = "text",
  placeholder,
  register,
  errors,
  required = false,
  pattern,
  minLength,
  maxLength,
  options,
  helperText,
  disabled = false,
}) {
  const isError = !!errors?.[name];

  // Validation rules
  const rules = {
    required: required ? `${label} is required` : false,
    ...(pattern && {
      pattern: { value: pattern, message: `Invalid ${label}` },
    }),
    ...(minLength && {
      minLength: {
        value: minLength,
        message: `${label} must be at least ${minLength} characters`,
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `${label} must not exceed ${maxLength} characters`,
      },
    }),
  };

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {type === "textarea" ? (
        <textarea
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition resize-none ${
            isError
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-slate-300 bg-slate-50 focus:border-blue-500 focus:bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          rows="4"
          {...register(name, rules)}
        />
      ) : type === "select" ? (
        <select
          id={name}
          disabled={disabled}
          className={`w-full rounded-2xl border px-4 py-3 text-slate-900 focus:outline-none transition ${
            isError
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-slate-300 bg-slate-50 focus:border-blue-500 focus:bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          {...register(name, rules)}
        >
          <option value="">Select {label?.toLowerCase()}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-2xl border px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none transition ${
            isError
              ? "border-red-400 bg-red-50 focus:border-red-500"
              : "border-slate-300 bg-slate-50 focus:border-blue-500 focus:bg-white"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          {...register(name, rules)}
        />
      )}

      {helperText && !isError && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      {isError && (
        <p className="text-xs text-red-600 font-medium">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
}

/**
 * Alert Component for displaying messages
 */
export function Alert({ type = "info", title, message, onClose }) {
  const bgColor = {
    success: "bg-emerald-50",
    error: "bg-red-50",
    warning: "bg-amber-50",
    info: "bg-blue-50",
  };

  const borderColor = {
    success: "border-emerald-200",
    error: "border-red-200",
    warning: "border-amber-200",
    info: "border-blue-200",
  };

  const textColor = {
    success: "text-emerald-700",
    error: "text-red-700",
    warning: "text-amber-700",
    info: "text-blue-700",
  };

  const icon = {
    success: "✓",
    error: "✕",
    warning: "⚠️",
    info: "ℹ️",
  };

  return (
    <div
      className={`rounded-2xl border ${bgColor[type]} ${borderColor[type]} p-4`}
    >
      <div className="flex gap-3">
        <span className="text-xl shrink-0">{icon[type]}</span>
        <div className="flex-1">
          {title && (
            <p className={`font-semibold text-sm ${textColor[type]}`}>
              {title}
            </p>
          )}
          {message && (
            <p className={`text-sm ${textColor[type]} ${title ? "mt-1" : ""}`}>
              {message}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`shrink-0 font-bold ${textColor[type]} hover:opacity-75`}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Loading Button Component
 */
export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  type = "button",
  variant = "primary",
  size = "md",
  onClick,
  className,
}) {
  const baseStyles =
    "rounded-2xl font-semibold transition-all disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-60",
    secondary:
      "bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-60",
    danger: "bg-red-600 text-white hover:bg-red-700 disabled:opacity-60",
    ghost: "text-slate-700 hover:bg-slate-100 disabled:opacity-60",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ""} flex items-center justify-center gap-2`}
    >
      {loading && <span className="inline-block animate-spin">⟳</span>}
      {children}
    </button>
  );
}

/**
 * Card Component
 */
export function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-6 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Badge Component
 */
export function Badge({ children, variant = "primary", size = "md" }) {
  const variants = {
    primary: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`rounded-full font-semibold ${variants[variant]} ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

/**
 * Modal Component
 */
export function Modal({ isOpen, title, children, onClose, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {children}
        {footer && <div className="mt-6 flex gap-3">{footer}</div>}
      </div>
    </div>
  );
}
