

import type { CreateUserDTO } from "../models/User";
import { validateCreateUser } from "../Validations/CreateUserValidation";
import { authApi, parseApiError } from "../services/api";

export type FormState = {
  data?: CreateUserDTO;
  errors?: Record<string, string>;
  success?: boolean;
  serverSuggestions?: string[];
} | null;

export async function CreateUserAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const rawRoles = formData.getAll("roles") as string[];

  const data: CreateUserDTO = {
    username: formData.get("username") as string,
    firstName: formData.get("firstname") as string,
    lastName: formData.get("lastname") as string,
    email: formData.get("email") as string,
    phoneNumber: formData.get("phonenumber") as string,
    roles: rawRoles,
    password: formData.get("password") as string,
  };


  const clientErrors = validateCreateUser(data);
  const confirmPassword = formData.get("confirmpassword") as string;
  if (confirmPassword !== data.password) {
    clientErrors.password = "Passwords do not match";
  }

  if (Object.keys(clientErrors).length > 0) {
    return { data, errors: clientErrors as Record<string, string>, success: false };
  }
  try {
    const res = await authApi.register(data);

    if (!res.ok) {
      const serverErrors = await parseApiError(res);


      let suggestions: string[] | undefined;
      try {
        const raw = await res.clone().json().catch(() => null);
        if (raw?.errorCode === "USERNAME_TAKEN" && raw?.suggestions) {
          suggestions = raw.suggestions;
          serverErrors.username = raw.message ?? "Username already taken";
        }
      } catch { /* ignore */ }

      return { data, errors: serverErrors, success: false, serverSuggestions: suggestions };
    }

    return { success: true };
  } catch {
    return {
      data,
      errors: { form: "Network error. Please check your connection and try again." },
      success: false,
    };
  }
}
