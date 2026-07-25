import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Card, CardContent, Typography, TextField, Button, Alert, CircularProgress, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthProvider';
import { API_URL } from '../config';
import { RegisterSchema } from '../schemas';
import type { RegisterFormData } from '../schemas';

const Register = () => {
  const navigate = useNavigate();
  const { login, getHeaders } = useAuth();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
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
    const result = RegisterSchema.safeParse(formData);

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
    const result = RegisterSchema.safeParse(formData);

    if (!result.success) {
      // Extract field errors from Zod issues
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

      const userData = {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password
      };

      const res = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Registration failed');
      }
      const data = await res.json();
      const { token, user } = data;
      login(token, user.id);
      setSuccess(true);

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="max-w-lg mx-auto mt-15">
      <Typography variant="h4" component="h1" className="mb-6 text-center font-bold">
        Create Account
      </Typography>

      <Card variant="outlined">
        <CardContent>
          {success && (
            <Alert severity="success" className="mb-4">
              Account created successfully! Redirecting to Login...
            </Alert>
          )}

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
            />

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
              helperText={fieldErrors.password || 'Must be at least 8 characters with uppercase, lowercase, and number'}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              disabled={loading}
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword || 'Passwords must match'}
            />

            <Button type="submit" variant="contained" fullWidth disabled={loading} size="large" className="bg-primary">
              {loading ? <CircularProgress size={24} className="text-white" /> : 'Create Account'}
            </Button>

            <Typography variant="body2" className="text-center mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Login
              </Link>
            </Typography>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
