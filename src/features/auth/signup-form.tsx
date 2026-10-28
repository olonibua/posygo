"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type PublicCountry, type SignupInput, signupSchema } from "@/shared";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox, Field, FormAlert, Input, PasswordInput } from "@/components/ui/form-controls";
import { apiRequest } from "@/lib/api/client";
import { applyServerErrors } from "@/lib/forms";

import { CountryPicker } from "@/features/seller-countries/country-picker";

export function SignupForm({ onSubmitted }: { onSubmitted: (credentials: { email: string; password: string }) => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const countries = useQuery({ queryKey: ["countries", "live"], queryFn: () => apiRequest<PublicCountry[]>("/v1/countries", { authenticated: false }) });
  const referred = useSearchParams().get("ref")?.slice(0, 40) ?? "";
  const { register, handleSubmit, setError, setValue, watch, formState } = useForm<SignupInput>({ resolver: zodResolver(signupSchema), defaultValues: { countryCodes: [], referralCode: referred } });
  const { errors, isSubmitting, isSubmitted } = formState;
  const chosen = watch("countryCodes");

  function chooseCountries(next: string[]) {
    setValue("countryCodes", next, { shouldValidate: isSubmitted });
  }

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    try {
      await apiRequest("/v1/auth/signup", { method: "POST", body: values, authenticated: false });
      onSubmitted({ email: values.email, password: values.password });
    } catch (error) {
      setFormError(applyServerErrors(error, setError, ["email", "password", "businessName", "countryCodes"]));
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FormAlert message={formError} />
      <Field label="Business name" error={errors.businessName?.message}>
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete="organization" aria-describedby={describedBy} aria-invalid={invalid} {...register("businessName")} />}
      </Field>
      <fieldset>
        <legend className="mb-2 text-small font-medium">Where do you want to store stock?</legend>
        <p className="mb-3 text-meta font-normal text-ink-faint">Pick every country you sell in. Your first pick is your home country. You can add more later.</p>
        {countries.isLoading ? <span className="text-small text-ink-soft">Loading countries…</span> : null}
        {countries.data?.length === 0 ? <span className="text-small text-ink-soft">No countries are open yet.</span> : null}
        {countries.data?.length ? <CountryPicker countries={countries.data} chosen={chosen} onChange={chooseCountries} invalid={Boolean(errors.countryCodes)} /> : null}
        {errors.countryCodes ? (
          <p role="alert" className="motion-rise mt-1.5 text-meta text-danger">
            {errors.countryCodes.message ?? errors.countryCodes.root?.message}
          </p>
        ) : null}
      </fieldset>
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
