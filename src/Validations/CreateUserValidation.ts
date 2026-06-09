// userValidators.ts
import type { CreateUserDTO } from "../models/User";

export type ValidationErrors = Partial<Record<keyof CreateUserDTO, string>>;

export type PasswordStrength = {
    score: number;
    strength: "Very Weak" | "Weak" | "Fair" | "Good" | "Excellent";
    label: string;
};

// ====================== PASSWORD ======================

export const getPasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
        return { score: 0, strength: "Very Weak", label: "Very Weak" };
    }

    let score = 0;
    const length = password.length;

    if (length >= 8) score += 1;
    if (length >= 12) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let strength: PasswordStrength["strength"] = "Very Weak";
    if (score >= 6) strength = "Excellent";
    else if (score >= 5) strength = "Good";
    else if (score >= 4) strength = "Fair";
    else if (score >= 3) strength = "Weak";

    return { score, strength, label: strength };
};

export const validatePassword = (password?: string): string | null => {
    if (!password?.trim()) return "Password is required";

    const trimmed = password.trim();

    if (trimmed.length < 8) {
        return "Password must be at least 8 characters long";
    }

    const strength = getPasswordStrength(trimmed);
    if (strength.score < 4) {
        return "Password must include uppercase, lowercase, number, and special character";
    }

    return null;
};

// ====================== OTHER VALIDATORS ======================

export const validateUsername = (username?: string): string | null => {
    if (!username?.trim()) return "Username is required";

    const trimmed = username.trim();

    if (trimmed.length < 3) return "Username must be at least 3 characters";
    if (trimmed.length > 30) return "Username must be at most 30 characters";

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return "Username can only contain letters, numbers and underscores";
    }

    return null;
};

export const validateFirstName = (firstName?: string): string | null => {
    if (!firstName?.trim()) return "First name is required";

    const trimmed = firstName.trim();
    if (trimmed.length < 2) return "First name must be at least 2 characters";
    if (trimmed.length > 50) return "First name is too long";

    return null;
};

export const validateLastName = (lastName?: string): string | null => {
    if (!lastName?.trim()) return "Last name is required";

    const trimmed = lastName.trim();
    if (trimmed.length < 2) return "Last name must be at least 2 characters";
    if (trimmed.length > 50) return "Last name is too long";

    return null;
};

export const validateEmail = (email?: string): string | null => {
    if (!email?.trim()) return "Email is required";

    const trimmed = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
        return "Please enter a valid email address";
    }

    return null;
};

export const validatePhoneNumber = (phoneNumber?: string): string | null => {
    if (!phoneNumber?.trim()) return null;
    const trimmed = phoneNumber.trim();


    const phoneRegex = /^\+?[1-9]\d{7,14}$/;
    if (!phoneRegex.test(trimmed)) {
        return "Please enter a valid phone number (e.g., +254712345678)";
    }

    return null;
};

export const validateRoles = (roles?: string[]): string | null => {
    if (!roles || roles.length === 0) {
        return "At least one role must be assigned";
    }
    return null;
};

// ====================== MAIN VALIDATION FUNCTION ======================

export function validateCreateUser(data: CreateUserDTO): ValidationErrors {
    const errors: ValidationErrors = {};

    // Trim and validate each field
    const usernameError = validateUsername(data.username);
    if (usernameError) errors.username = usernameError;

    const firstNameError = validateFirstName(data.firstName);
    if (firstNameError) errors.firstName = firstNameError;

    const lastNameError = validateLastName(data.lastName);
    if (lastNameError) errors.lastName = lastNameError;

    const emailError = validateEmail(data.email);
    if (emailError) errors.email = emailError;

    const phoneError = validatePhoneNumber(data.phoneNumber);
    if (phoneError) errors.phoneNumber = phoneError;

    const rolesError = validateRoles(data.roles);
    if (rolesError) errors.roles = rolesError;

    const passwordError = validatePassword(data.password);
    if (passwordError) errors.password = passwordError;

    return errors;
}

// Optional: Helper to check if form is valid
export const hasValidationErrors = (errors: ValidationErrors): boolean => {
    return Object.keys(errors).length > 0;
};
export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword?.trim()) return "Confirm password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
};