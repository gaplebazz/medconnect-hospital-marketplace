import { useState } from 'react';

export default function FormInput({
  label, type = 'text', value, onChange, name, placeholder, error, required, options, textarea, hint, ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="field">
      {label && (
        <label htmlFor={name}>
          {label} {required && <span style={{ color: 'var(--color-danger)' }}>*</span>}
        </label>
      )}
      {options ? (
        <select
          id={name}
          name={name}
          className="field-select"
          value={value}
          onChange={onChange}
          required={required}
          {...rest}
        >
          <option value="">Select {label?.toLowerCase()}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
      ) : textarea ? (
        <textarea
          id={name}
          name={name}
          className="field-textarea"
          rows={4}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          {...rest}
        />
      ) : (
        <div className={isPassword ? 'password-field' : undefined}>
          <input
            id={name}
            name={name}
            type={inputType}
            className="field-input"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          )}
        </div>
      )}
      {error && <div className="field-error">{error}</div>}
      {hint && !error && <div className="field-hint">{hint}</div>}
    </div>
  );
}
