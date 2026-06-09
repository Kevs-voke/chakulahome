import { useActionState, useState } from "react";
import { CreateUserAction } from "../Actions/createUserAction";
import type { CreateUserDTO } from "../models/User";
import { motion } from "framer-motion";
import Divider from "../ui/Divider";
import RegInput from "../ui/RegInput";
import ErrorBanner from "../ui/ErrorBanner";
import { getPasswordStrength } from "../Validations/CreateUserValidation";

type FormState = {
  data?: CreateUserDTO;
  errors?: Record<string, string>;
  success?: boolean;
  serverSuggestions?: string[];
} | null;

const ROLES = [
  { value: "ROLE_ADMIN", label: "Admin" },
  { value: "ROLE_STAFF", label: "Staff" },
  { value: "ROLE_CUSTOMER", label: "Customer" },
  { value: "ROLE_MANAGER", label: "Manager" },
] as const;

export default function Register({
  onGoToLogin,
}: {
  onGoToLogin?: () => void;
}) {
  const [state, action, isPending] = useActionState<FormState, FormData>(
    CreateUserAction,
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [password, setPassword] = useState("");
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  const errors = submitted ? state?.errors ?? {} : {};
  const pwStrength = getPasswordStrength(password);

  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-emerald-500"];
  const strengthColor = strengthColors[Math.min(Math.floor(pwStrength.score / 6 * 5), 4)];

  if (state?.success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-amber-400">Account Created!</h2>
        <p className="text-stone-400 text-sm">You can now sign in with your credentials.</p>
        <button
          onClick={onGoToLogin}
          className="mt-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-lg text-sm transition-colors"
        >
          Go to Login
        </button>
      </motion.div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-0">
      {/* Global server error */}
      {submitted && errors.form && <ErrorBanner message={errors.form} />}

      {/* Username taken suggestions */}
      {submitted && state?.serverSuggestions && state.serverSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-amber-900/20 border border-amber-600/40 p-3 text-sm text-amber-300"
        >
          <p className="font-medium mb-2">That username is taken. Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {state.serverSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedUsername(s)}
                className={`px-3 py-1 rounded-md text-xs font-mono border transition-colors ${selectedUsername === s
                  ? "bg-amber-500 text-stone-900 border-amber-500"
                  : "bg-stone-800 border-stone-600 text-stone-300 hover:border-amber-500"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>

          {selectedUsername && (
            <input type="hidden" name="username" value={selectedUsername} />
          )}
        </motion.div>
      )}

      <Divider>Identity</Divider>
      <div className="grid grid-cols-2 gap-4">
        <RegInput
          label="First Name"
          type="text"
          name="firstname"
          placeholder="John"
          defaultValue={state?.data?.firstName}
          error={errors.firstName}
        />
        <RegInput
          label="Last Name"
          type="text"
          name="lastname"
          placeholder="Doe"
          defaultValue={state?.data?.lastName}
          error={errors.lastName}
        />
      </div>
      <div className="mt-3">
        <RegInput
          label="Username"
          type="text"
          name="username"
          placeholder="@johndoe"
          defaultValue={selectedUsername ?? state?.data?.username}
          error={errors.username}
        />
      </div>

      <Divider>Contact</Divider>
      <div className="flex flex-col gap-3">
        <RegInput
          label="Email"
          type="email"
          name="email"
          placeholder="johndoe@mail.com"
          defaultValue={state?.data?.email}
          error={errors.email}
        />
        <RegInput
          label="Phone Number"
          type="text"
          name="phonenumber"
          placeholder="+254700000000"
          defaultValue={state?.data?.phoneNumber}
          error={errors.phoneNumber}
        />
      </div>

      <Divider>Access</Divider>
      <div>
        <p className="text-xs font-medium text-stone-400 mb-2">Select roles</p>
        <div className="grid grid-cols-2 gap-2">
          {ROLES.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-stone-800/60 border border-stone-700 cursor-pointer hover:border-amber-500/60 transition-colors group"
            >
              <input
                type="checkbox"
                name="roles"
                value={role.value}
                defaultChecked={state?.data?.roles?.includes(role.value)}
                className="w-4 h-4 accent-amber-500"
              />
              <span className="text-sm text-stone-300 group-hover:text-amber-400 transition-colors">
                {role.label}
              </span>
            </label>
          ))}
        </div>
        {errors.roles && (
          <p className="text-red-400 text-xs mt-1.5">{errors.roles}</p>
        )}
      </div>

      <Divider>Security</Divider>
      <div className="flex flex-col gap-3">
        <div>
          <RegInput
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Min 8 chars, upper + lower + special"
            error={errors.password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${pwStrength.score / 6 * 5 >= n ? strengthColor : "bg-stone-700"
                      }`}
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500">{pwStrength.label}</p>
            </div>
          )}
        </div>
        <RegInput
          label="Confirm Password"
          type={showPassword ? "text" : "password"}
          name="confirmpassword"
          placeholder="Repeat password"
        />
        <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer select-none w-fit">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword((p) => !p)}
            className="accent-amber-500"
          />
          Show passwords
        </label>
      </div>

      <button
        type="submit"
        onClick={() => setSubmitted(true)}
        disabled={isPending}
        className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed
          text-stone-900 font-bold rounded-xl text-sm tracking-wide transition-all duration-200 shadow-lg shadow-amber-500/20"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="60" strokeDashoffset="20" />
            </svg>
            Creating account…
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      <p className="text-center text-sm text-stone-500 mt-4">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onGoToLogin}
          className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
