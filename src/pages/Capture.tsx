import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { leadsApi } from "../api/leads";
import { ApiError } from "../api/client";
import { Button, Input, Textarea } from "../components";
import type { CaptureLeadInput } from "../types/lead";

function Capture() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CaptureLeadInput>();

  const onSubmit = async (data: CaptureLeadInput) => {
    setError(null);
    try {
      await leadsApi.capture(data);
      reset();
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.issues?.[0]?.message ?? err.message
          : "Something went wrong. Please try again."
      );
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[440px] rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-4 text-xl font-semibold">Thanks — we got it</h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
            Someone from our sales team will reach out shortly.
          </p>
          <Button
            variant="secondary"
            className="mt-6"
            onClick={() => setSubmitted(false)}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-[520px] rounded-xl border border-hairline bg-white dark:border-hairline-dark dark:bg-surface-dark p-8">
        <h1 className="text-2xl font-semibold">Get in touch</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          Tell us a little about you and we&apos;ll be in contact.
        </p>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Name *"
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />
          <Input
            label="Email *"
            type="email"
            placeholder="jane@company.com"
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <Input
            label="Phone"
            placeholder="555-0100"
            error={errors.phone?.message}
            {...register("phone")}
          />
          <Input
            label="Company"
            placeholder="Acme Inc"
            error={errors.company?.message}
            {...register("company")}
          />
          <Textarea
            label="How can we help?"
            rows={4}
            placeholder="Tell us what you're looking for…"
            error={errors.message?.message}
            {...register("message", {
              maxLength: { value: 2000, message: "Please keep it under 2000 characters" },
            })}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Submit"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">
          Team member?{" "}
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Capture;
