"use client";
import { Send } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { Button } from "../ui/button";
import { Section } from "../section";
import { useApiMutation } from "@/lib/utils";
import FieldInput from "../form/FormInput";
import FieldTextarea from "../form/FieldTextarea";
import { mapServerErrors } from "@/lib/api/error-handlers";

const contactSchema = z
  .object({
    name: z.string().min(1, "Name is required").min(2, "At least 2 characters"),
    phone: z.string().optional(),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address"),
    subject: z.string().min(1, "Subject is required"),
    message: z
      .string()
      .min(1, "Message is required")
      .min(10, "At least 10 characters"),
  })
  .superRefine(({ phone }, ctx) => {
    if (phone && !/^\d{10}$/.test(phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid 10-digit phone number",
        path: ["phone"],
      });
    }
  });

type ContactValues = z.infer<typeof contactSchema>;

const ContactForm = () => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    } satisfies ContactValues,
    validators: { onChange: contactSchema as any },
    onSubmit: async ({ value }) => {
      await sendMessage(value);
      setSubmitted(true);
      form.reset();
    },
  });
  const { mutateAsync: sendMessage } = useApiMutation<ContactValues>({
    apiPath: "/api/feedback/contact/",
    method: "POST",
    queryKey: "contact-form",
    onErrorCallback(err) {
      mapServerErrors(err, form);
    },
  });

  const { canSubmit, isSubmitting } = useStore(form.store, (s) => ({
    canSubmit: s.canSubmit,
    isSubmitting: s.isSubmitting,
  }));

  return (
    <Section className="rounded-2xl border border-border bg-background p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Send us a message
          </h2>
          <p className="text-sm text-muted-foreground">
            Fill out the form and we will respond within 24 hours.
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 12l5 5L19 7"
                stroke="hsl(152, 60%, 42%)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Message sent!
          </h3>
          <p className="text-sm text-muted-foreground">
            Thank you for reaching out. We will get back to you soon.
          </p>
          <Button variant="outline" onClick={() => setSubmitted(false)}>
            Send Another Message
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <form.Field name="name">
              {(field) => (
                <FieldInput
                  field={field}
                  label="Full Name"
                  placeholder="John Doe"
                  required
                />
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <FieldInput
                  field={field}
                  label="Phone Number"
                  placeholder="98XXXXXXXX"
                  type="tel"
                />
              )}
            </form.Field>
          </div>

          <form.Field name="email">
            {(field) => (
              <FieldInput
                field={field}
                label="Email"
                type="email"
                placeholder="n5b5o@example.com"
                required
              />
            )}
          </form.Field>

          <form.Field name="subject">
            {(field) => (
              <FieldInput
                field={field}
                label="Subject"
                placeholder="I need help with..."
                required
              />
            )}
          </form.Field>

          <form.Field name="message">
            {(field) => (
              <FieldTextarea
                field={field}
                label="Message"
                rows={4}
                placeholder="Tell us more about your question or feedback..."
              />
            )}
          </form.Field>

          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Sending…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </form>
      )}
    </Section>
  );
};

export default ContactForm;
