import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

const signInSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

const inputClass =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring mt-1';

interface AuthModalProps {
  open: boolean;
  defaultTab?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open, defaultTab = 'signin', onClose, onSuccess }: AuthModalProps) {
  const { signin, signup } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>(defaultTab);
  const [signInError, setSignInError] = useState('');
  const [signUpError, setSignUpError] = useState('');

  const signInForm = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: '', password: '' },
  });
  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (open) {
      setTab(defaultTab);
      setSignInError('');
      setSignUpError('');
      signInForm.reset({ username: '', password: '' });
      signUpForm.reset({ username: '', password: '', confirmPassword: '' });
    }
  }, [open, defaultTab]);

  const handleSignIn = async (values: SignInValues) => {
    setSignInError('');
    try {
      await signin(values.username, values.password);
      toast.success(`Welcome back, ${values.username}!`);
      onSuccess();
    } catch (e: any) {
      setSignInError(e.message || 'Sign in failed. Please try again.');
    }
  };

  const handleSignUp = async (values: SignUpValues) => {
    setSignUpError('');
    try {
      await signup(values.username, values.password);
      toast.success(`Account created! Welcome, ${values.username}!`);
      onSuccess();
    } catch (e: any) {
      setSignUpError(e.message || 'Sign up failed. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🏴‍☠️ Treasure Hunter Account</DialogTitle>
        </DialogHeader>
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as 'signin' | 'signup');
            setSignInError('');
            setSignUpError('');
          }}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          {/* Sign In */}
          <TabsContent value="signin" className="mt-4">
            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
              {signInError && (
                <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-md px-3 py-2">
                  {signInError}
                </div>
              )}
              <div>
                <Label htmlFor="si-username">Username</Label>
                <Controller
                  control={signInForm.control}
                  name="username"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="si-username"
                      placeholder="Enter username"
                      className={inputClass}
                    />
                  )}
                />
                {signInForm.formState.errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {signInForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="si-password">Password</Label>
                <Controller
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="si-password"
                      type="password"
                      placeholder="Enter password"
                      className={inputClass}
                    />
                  )}
                />
                {signInForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {signInForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={signInForm.formState.isSubmitting}
              >
                {signInForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          {/* Sign Up */}
          <TabsContent value="signup" className="mt-4">
            <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
              {signUpError && (
                <div className="bg-red-50 border border-red-300 text-red-700 text-sm rounded-md px-3 py-2">
                  {signUpError}
                </div>
              )}
              <div>
                <Label htmlFor="su-username">Username</Label>
                <Controller
                  control={signUpForm.control}
                  name="username"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="su-username"
                      placeholder="Choose a username (min 3 characters)"
                      className={inputClass}
                    />
                  )}
                />
                {signUpForm.formState.errors.username && (
                  <p className="text-sm text-red-500 mt-1">
                    {signUpForm.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="su-password">Password</Label>
                <Controller
                  control={signUpForm.control}
                  name="password"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="su-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      className={inputClass}
                    />
                  )}
                />
                {signUpForm.formState.errors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {signUpForm.formState.errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="su-confirm">Confirm Password</Label>
                <Controller
                  control={signUpForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <input
                      {...field}
                      id="su-confirm"
                      type="password"
                      placeholder="Re-enter your password"
                      className={inputClass}
                    />
                  )}
                />
                {signUpForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {signUpForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700"
                disabled={signUpForm.formState.isSubmitting}
              >
                {signUpForm.formState.isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
