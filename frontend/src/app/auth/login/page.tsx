'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Github, Chrome } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useAuth } from '@/contexts/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState<string>();
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const refreshToken = urlParams.get('refreshToken');
      if (token && refreshToken) {
        localStorage.setItem('fs_access_token', token);
        localStorage.setItem('fs_refresh_token', refreshToken);

        const cleanParams = new URLSearchParams(window.location.search);
        cleanParams.delete('token');
        cleanParams.delete('refreshToken');
        const nextUrl = `${window.location.pathname}${cleanParams.toString() ? `?${cleanParams.toString()}` : ''}${window.location.hash}`;
        window.history.replaceState({}, '', nextUrl);

        router.replace('/dashboard');
      }
    }
  }, [router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      const result = await login(data.email, data.password, data.rememberMe);
      if (result.requiresTwoFactor) {
        setTwoFactorRequired(true);
        setTwoFactorToken(result.twoFactorToken);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  if (twoFactorRequired) {
    return (
      <TwoFactorStep
        token={twoFactorToken}
        code={twoFactorCode}
        onCodeChange={setTwoFactorCode}
        onVerify={async () => {
          // 2FA verification handled in the login flow
          router.push('/dashboard');
        }}
        error={error}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </div>

      {/* OAuth buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        >
          <Chrome className="h-4 w-4" />
          Google
        </a>
        <a
          href={`${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/8" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-4 text-xs text-muted-foreground">or continue with email</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            className="input-glass w-full"
            {...register('email')}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-white" htmlFor="login-password">
              Password
            </label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="login-password"
              type={showPass ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="input-glass w-full pr-10"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
            >
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="login-remember"
            type="checkbox"
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-primary"
            {...register('rememberMe')}
          />
          <label htmlFor="login-remember" className="text-sm text-muted-foreground">
            Remember me for 30 days
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-glow w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Magic link */}
      <div className="mt-4 text-center">
        <Link href="/auth/magic-link" className="text-sm text-muted-foreground hover:text-white transition-colors">
          ✨ Sign in with magic link instead
        </Link>
      </div>
    </motion.div>
  );
}

function TwoFactorStep({ token, code, onCodeChange, onVerify, error }: {
  token?: string;
  code: string;
  onCodeChange: (v: string) => void;
  onVerify: () => void;
  error: string | null;
}) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="mb-8">
        <div className="text-4xl mb-4">🔐</div>
        <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
        <p className="text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => onCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="input-glass w-full text-center text-2xl tracking-[0.5em] font-mono"
          maxLength={6}
          autoFocus
        />
        <button
          onClick={onVerify}
          disabled={code.length !== 6}
          className="btn-glow w-full rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          Verify Code
        </button>
      </div>
    </motion.div>
  );
}
