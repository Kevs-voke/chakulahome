import { authApi, parseApiError } from "../services/api";

export type LoginFormState = {
  errors?: Record<string, string>;
  success?: boolean;
  email?: string;
  username?: string;
  firstName?: string;
  token?: string;
} | null;

export async function LoginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email?.trim()) return { errors: { email: "Email is required" }, email };
  if (!password?.trim()) return { errors: { password: "Password is required" }, email };

  try {
    const res = await authApi.login({ email, password });

    if (!res.ok) {
      const errors = await parseApiError(res);
      return { errors, success: false, email };
    }


    const data = await res.json();
    return {
      success: true,
      email: data.email,
      username: data.username,
      firstName: data.firstName,
      token: data.authToken || "cookie-based"
    };

  } catch (error) {
    console.error("Login error:", error);
    return {
      errors: { form: "Network error. Please check your connection and try again." },
      success: false,
      email,
    };
  }
}