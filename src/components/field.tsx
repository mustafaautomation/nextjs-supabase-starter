import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type Common = { name: string; label: string; error?: string; idPrefix?: string };

export function Field({ name, label, error, idPrefix = '', ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const id = `${idPrefix}${name}`;
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextAreaField({
  name,
  label,
  error,
  idPrefix = '',
  ...rest
}: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = `${idPrefix}${name}`;
  const errorId = `${id}-error`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function FormStatus({ error, message }: { error?: string; message?: string }) {
  return (
    <div aria-live="polite" className="form-status">
      {error ? (
        <p role="alert" className="form-error">
          {error}
        </p>
      ) : null}
      {message ? <p className="form-message">{message}</p> : null}
    </div>
  );
}
