
import { useActionState, useEffect, useState } from "react";
import { LoginAction } from "../Actions/loginAction";
import { motion } from "framer-motion";
import RegInput from "../ui/RegInput";
import ErrorBanner from "../ui/ErrorBanner";
import { useAuthStore } from "../store/useOrderStore";
import type { LoginFormState } from "../Actions/loginAction";
export default function Login({
  onGoToRegister,
  onSuccess,
}: {
  onGoToRegister?: () => void;
  onSuccess?: () => void;
}) {
  const [state, action, isPending] = useActionState<LoginFormState, FormData>(
    LoginAction,
    null
  );
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const errors = submitted ? state?.errors ?? {} : {};


  useEffect(() => {
    if (state?.success) {

      setAuth(
        state.email ?? "",
        state.username ?? "",
        state.token ?? "cookie-based"

      );
      onSuccess?.();
    }
  }, [state?.success]);

  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      {submitted && errors.form && <ErrorBanner message={errors.form} />}

      <div className="flex flex-col gap-3">
        <RegInput
          label="Email"
          type="email"
          name="email"
          placeholder="johndoe@mail.com"
          defaultValue={state?.email}
          error={errors.email}
        />
        <div>
          <RegInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Your password"
            error={errors.password}
          />
          <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer select-none w-fit mt-2">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword((p) => !p)}
              className="accent-amber-500"
            />
            Show password
          </label>
        </div>
      </div>

      {submitted && errors.form === undefined && state?.errors?.form === undefined && state?.errors && (
        <ErrorBanner message="Invalid email or password. Please try again." />
      )}

      <button
        type="submit"
        onClick={() => setSubmitted(true)}
        disabled={isPending}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50
          text-stone-900 font-bold rounded-xl text-sm tracking-wide transition-all shadow-lg shadow-amber-500/20"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            Signing in…
          </span>
        ) : (
          "Sign In"
        )}
      </button>

      <p className="text-center text-sm text-stone-500">
        No account yet?{" "}
        <button
          type="button"
          onClick={onGoToRegister}
          className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          Create one
        </button>
      </p>
    </motion.form>
  );
}
