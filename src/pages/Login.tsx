import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button, Input } from "../components";
import { clearError, login } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { Credentials } from "../types/auth";

// Shown in-app on purpose: the assignment ships demo logins for each role.
const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@dhlead.test", password: "Admin@12345" },
  { role: "Member", email: "member@dhlead.test", password: "Member@12345" },
];

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { error, status } = useAppSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Credentials>();

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (credentials: Credentials) => {
    const result = await dispatch(login(credentials));
    if (login.fulfilled.match(result)) {
      navigate(searchParams.get("redirect") || "/leads", { replace: true });
    }
  };

  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setValue("email", account.email, { shouldValidate: true });
    setValue("password", account.password, { shouldValidate: true });
  };

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[440px] rounded-xl border border-hairline bg-white p-8 dark:border-hairline-dark dark:bg-surface-dark">
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Use your team account to manage leads.
        </p>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || status === "loading"}
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <div className="mt-7 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Demo accounts
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-500">
            Click one to fill the form.
          </p>
          <div className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-hairline bg-white px-3 py-2 text-left transition hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-hairline-dark dark:bg-surface-dark dark:hover:border-primary-500 dark:hover:bg-primary-500/10"
              >
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                  {account.role}
                </span>
                <span className="flex-1 truncate font-mono text-xs text-gray-600 dark:text-slate-400">
                  {account.email}
                </span>
                <span className="font-mono text-xs text-gray-400 dark:text-slate-500">
                  {account.password}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
