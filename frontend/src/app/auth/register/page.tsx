'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Github, Chrome, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/contexts/AuthContext';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  agreedToTerms: z.boolean().refine((v) => v, { message: 'You must accept the terms' }),
});

type RegisterForm = z.infer<typeof registerSchema>;

const passwordRules = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      await registerUser(data.name, data.email, data.password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-success/10 border border-success/20">
          <Check className="h-10 w-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Check your email!</h1>
        <p className="text-muted-foreground mb-6">
          We&apos;ve sent a verification link to your email address. Click it to activate your account.
        </p>
        <Link href="/auth/login" className="btn-glow inline-block rounded-xl px-8 py-3 text-sm font-semibold text-white">
          Back to Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      {/* OAuth */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
        >
          <Chrome className="h-4 w-4" />
          Google
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all duration-200"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">or continue with email</span>
        </div>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2" htmlFor="reg-name">Full name</label>
          <input id="reg-name" type="text" autoComplete="name" placeholder="Jane Smith" className="input-glass w-full" {...register('name')} />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2" htmlFor="reg-email">Email address</label>
          <input id="reg-email" type="email" autoComplete="email" placeholder="you@company.com" className="input-glass w-full" {...register('email')} />
          {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2" htmlFor="reg-password">Password</label>
          <div className="relative">
            <input
              id="reg-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className="input-glass w-full pr-10"
              {...register('password')}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {/* Password strength indicators */}
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {passwordRules.map((rule) => (
                <div key={rule.label} className={`flex items-center gap-1.5 text-xs ${rule.test(password) ? 'text-success' : 'text-muted-foreground'}`}>
                  <Check className={`h-3 w-3 ${rule.test(password) ? 'text-success' : 'text-muted-foreground/30'}`} />
                  {rule.label}
                </div>
              ))}
            </div>
          )}
          {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="flex items-start gap-2">
          <input id="reg-terms" type="checkbox" className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 accent-primary" {...register('agreedToTerms')} />
          <label htmlFor="reg-terms" className="text-sm text-muted-foreground">
            I agree to the{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>
        {errors.agreedToTerms && <p className="text-xs text-destructive">{errors.agreedToTerms.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-glow w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </span>
          ) : (
            'Create Free Account'
          )}
        </button>
      </form>
    </motion.div>
  );
}
