import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthProvider';
import { API_URL } from '../config';
import { LoginSchema } from '../schemas';
import type { LoginFormData } from '../schemas';

const Login = () => {
  const navigate = useNavigate();
  const { login, getHeaders } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field error when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!value) return;

    // Validate individual field using safeParse
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
      const error = result.error.issues.find(err => err.path[0] === name);
      if (error) {
        setFieldErrors(prev => ({ ...prev, [name]: error.message }));
      } else {
        setFieldErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate all fields with safeParse
    const result = LoginSchema.safeParse(formData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        if (issue.path) {
          const fieldName = String(issue.path[0]);
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      setError('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFieldErrors({});

      const validatedData = result.data;

      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(validatedData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Invalid email or password');
      }

      const data = await res.json();
      const { token, user } = data;

      login(token, user.id);
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-lg mx-auto mt-15">
      <Typography variant="h4" component="h1" className="mb-6 text-center font-bold">
        Login
      </Typography>

      <Card variant="outlined">
        <CardContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />

            <Button type="submit" variant="contained" className="bg-primary" fullWidth disabled={loading} size="large">
              {loading ? <CircularProgress size={24} className="text-white" /> : 'Login'}
            </Button>

            <Typography variant="body2" className="text-center mt-4">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
