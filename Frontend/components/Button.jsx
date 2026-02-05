import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  isLoading,
  className = '',
  ...props
}) => {
  const baseStyles = "btn d-inline-flex align-items-center justify-content-center transition-all fw-bold";

  const variants = {
    primary: "btn-primary shadow-sm",
    secondary: "btn-secondary shadow-sm",
    outline: "btn-outline-primary shadow-none",
    ghost: "btn-link text-decoration-none shadow-none",
    white: "btn-white shadow-sm border"
  };

  const sizes = {
    sm: "btn-sm py-1 px-3",
    md: "py-2 px-4",
    lg: "btn-lg py-3 px-5 rounded-4"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
      ) : icon ? (
        <span className="me-2 d-flex align-items-center">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};