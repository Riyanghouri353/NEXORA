'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/fields';
import { Icon } from '@/components/ui/Icon';
import { useToast } from '@/components/providers';
import { simulateMutation } from '@/lib/api';

const initialValues = { name: '', email: '', company: '', message: '' };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  if (!values.email.trim()) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (values.company.trim() && values.company.trim().length < 2) {
    errors.company = 'Company name looks too short.';
  }
  if (!values.message.trim()) {
    errors.message = 'Please tell us how we can help.';
  } else if (values.message.trim().length < 20) {
    errors.message = 'Please add a little more detail (at least 20 characters).';
  }
  return errors;
}

export function ContactForm() {
  const { toast } = useToast();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function set(field) {
    return (e) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
      setErrors((err) => ({ ...err, [field]: undefined }));
      setSent(false);
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSending(true);
    try {
      await simulateMutation(() => ({ ok: true }));
      setSent(true);
      setValues(initialValues);
      toast({
        title: 'Message sent',
        description: "Thanks for reaching out — we'll get back to you within one business day.",
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Something went wrong',
        description: 'We could not send your message. Please try again.',
        variant: 'error',
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {sent && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/60"
        >
          <Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Your message is on its way. Our team will reply within one business day.
          </p>
        </div>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Input
          label="Name"
          required
          placeholder="Ada Lovelace"
          value={values.name}
          onChange={set('name')}
          error={errors.name}
          autoComplete="name"
        />
        <Input
          label="Work email"
          required
          type="email"
          placeholder="ada@company.com"
          value={values.email}
          onChange={set('email')}
          error={errors.email}
          autoComplete="email"
        />
      </div>
      <Input
        label="Company"
        placeholder="Acme Inc. (optional)"
        value={values.company}
        onChange={set('company')}
        error={errors.company}
        autoComplete="organization"
      />
      <Textarea
        label="Message"
        required
        rows={5}
        placeholder="Tell us about your team, your workflows, and what you're hoping Nexora will do for you."
        value={values.message}
        onChange={set('message')}
        error={errors.message}
        hint={values.message ? `${values.message.trim().length} characters` : undefined}
      />
      <Button type="submit" variant="primary" size="lg" loading={sending} disabled={sending} className="w-full sm:w-auto">
        Send message
      </Button>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        By sending this form you agree to be contacted about your inquiry. We never share your details.
      </p>
    </form>
  );
}
