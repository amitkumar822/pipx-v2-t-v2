// Input validation utilities

export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]{10,}$/,
    message: 'Please enter a valid phone number',
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
  },
  otp: {
    pattern: /^\d{4,6}$/,
    message: 'Please enter a valid OTP',
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: 'Username must be 3-20 characters with letters, numbers, and underscores only',
  },
} as const;

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!ValidationRules.email.pattern.test(email)) {
    return { isValid: false, message: ValidationRules.email.message };
  }
  
  return { isValid: true };
};

export const validatePhone = (phone: string): ValidationResult => {
  if (!phone.trim()) {
    return { isValid: false, message: 'Phone number is required' };
  }
  
  if (!ValidationRules.phone.pattern.test(phone)) {
    return { isValid: false, message: ValidationRules.phone.message };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < ValidationRules.password.minLength) {
    return { isValid: false, message: `Password must be at least ${ValidationRules.password.minLength} characters` };
  }
  
  if (!ValidationRules.password.pattern.test(password)) {
    return { isValid: false, message: ValidationRules.password.message };
  }
  
  return { isValid: true };
};

export const validateOtp = (otp: string): ValidationResult => {
  if (!otp.trim()) {
    return { isValid: false, message: 'OTP is required' };
  }
  
  if (!ValidationRules.otp.pattern.test(otp)) {
    return { isValid: false, message: ValidationRules.otp.message };
  }
  
  return { isValid: true };
};

export const validateUsername = (username: string): ValidationResult => {
  if (!username.trim()) {
    return { isValid: false, message: 'Username is required' };
  }
  
  if (!ValidationRules.username.pattern.test(username)) {
    return { isValid: false, message: ValidationRules.username.message };
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string, fieldName: string): ValidationResult => {
  if (!value || !value.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

// Form validation helper
export const validateForm = (
  fields: Record<string, string>,
  validators: Record<string, (value: string) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(fields).forEach(([fieldName, value]) => {
    const validator = validators[fieldName];
    if (validator) {
      const result = validator(value);
      if (!result.isValid) {
        errors[fieldName] = result.message || 'Invalid input';
        isValid = false;
      }
    }
  });

  return { isValid, errors };
};