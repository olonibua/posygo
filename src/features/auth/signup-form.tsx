"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type PublicCountry, type SignupInput, signupSchema } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, PasswordInput, Select } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";

export function SignupForm({ onSubmitted }: { onSubmitted: (credentials: { email: string; password: string }) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const countries = useQuery({ queryKey: ["countries", "live"], queryFn: () => apiRequest<PublicCountry[]>("/v1/countries", { authenticated: false }) });
  const referred = useSearchParams().get("ref")?.slice(0, 40) ?? "";
  const { register, handleSubmit, setError, formState } = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { countryCode: "", referralCode: referred } });
  const { errors, isSubmitting } = formState;

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    try {
      await apiRequest("/v1/auth/signup", { method: "POST", body: values, authenticated: false });
      onSubmitted({ email: values.email, password: values.password });
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email", "password", "businessName", "countryCode"]));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormAlert message={formError} />
      <Field label="Business name" error={errors.businessName?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete="organization" aria-describedby={describedBy} aria-invalid={invalid} {...register("businessName")} />}
      </Field>
      <Field label="Where will your stock live?" hint="You can ship from here to any destination this market has enabled." error={errors.countryCode?.message}>
        {({ id, describedBy, invalid }) => (
          <Select id={id} aria-describedby={describedBy} aria-invalid={invalid} disabled={countries.isLoading} {...register("countryCode")}>
            <option value="" disabled>
              {countries.isLoading ? "Loading markets…" : "Choose a market"}
            </option>
            {countries.data?.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} · {country.currency}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Work email" error={errors.email?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} type="email" autoComplete="email" aria-describedby={describedBy} aria-invalid={invalid} {...register("email")} />}
      </Field>
      <Field
        label="Referral code (optional)"
        hint={referred ? "Thanks for coming via a friend. You'll both get a wallet credit once your first stock arrives." : "If another seller referred you, enter their code."}
        error={errors.referralCode?.message}
      >
        {({ id, describedBy, invalid }) => (
          <Input id={id} autoComplete="off" className="uppercase" maxLength={40} aria-describedby={describedBy} aria-invalid={invalid} {...register("referralCode")} />
        )}
      </Field>
      <Field label="Password" hint="At least 12 characters. A short sentence works well." error={errors.password?.message}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} autoComplete="new-password" aria-describedby={describedBy} aria-invalid={invalid} {...register("password")} />}
      </Field>
      <Checkbox
        label={
          <>
            I agree to the <Link href="/legal/terms">terms</Link> and <Link href="/legal/privacy">privacy policy</Link>.
          </>
        }
        error={errors.acceptTerms?.message}
        {...register("acceptTerms")}
      />
      <div className="flex flex-col-reverse items-start justify-between gap-4 border-t border-line pt-6 sm:flex-row sm:items-center">
        <span className="text-[13px] text-ink-faint">
          Already have an account? <Link href="/login">Sign in</Link>
        </span>
        <Button type="submit" variant="yellow" size="lg" loading={isSubmitting}>
          Create account →
        </Button>
      </div>
    </form>
  );
}
