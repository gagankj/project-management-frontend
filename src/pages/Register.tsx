import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterInput } from '../schemas/auth';
import { registerSchema } from '../schemas/auth';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterInput) => {
    try {
      // confirmPassword is only for client-side matching, no need to send it to the server
      const { name, email, password } = data;
      await api.post('/auth/register', { name, email, password });
      
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl shadow-slate-100/50">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Create Account
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700  block">
              Full Name
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="Enter your name"
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.name
                    ? 'border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 pl-1 font-medium">{errors.name?.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700  block">
              Email Address
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                {...register('email')}
                placeholder="Enter your email here"
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.email
                    ? 'border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 pl-1 font-medium">{errors.email?.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700  block">
              Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder="••••••••"
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.password
                    ? 'border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655 focus:outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 pl-1 font-medium">{errors.password?.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700  block">
              Confirm Password
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="••••••••"
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-500/10'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-655 focus:outline-none cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1 pl-1 font-medium">{errors.confirmPassword?.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-500/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                Register
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors duration-150 underline decoration-indigo-600/30 underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Register;
