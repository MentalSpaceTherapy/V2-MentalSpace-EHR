import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(),
}));

// Mock router
vi.mock('wouter', () => ({
  useLocation: () => ['/login', vi.fn()],
}));

describe('LoginForm', () => {
  const mockLoginMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  const mockUseAuth = useAuth as unknown as vi.Mock;
  const mockUseToast = useToast as unknown as vi.Mock;
  const mockToast = { toast: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockUseAuth.mockReturnValue({
      loginMutation: mockLoginMutation,
      isLoading: false,
    });
    
    mockUseToast.mockReturnValue(mockToast);
  });

  it('renders the login form correctly', () => {
    render(<LoginForm />);
    
    // Check that important elements are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('validates empty fields on submission', async () => {
    render(<LoginForm />);
    
    // Try to submit without filling fields
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    // Wait for validation messages
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
    
    // Login mutation should not be called
    expect(mockLoginMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    render(<LoginForm />);
    
    // Fill username but short password
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'short');
    
    // Try to submit
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    // Wait for validation message about password length
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });
    
    // Login mutation should not be called
    expect(mockLoginMutation.mutateAsync).not.toHaveBeenCalled();
  });

  it('calls login mutation with correct credentials on submit', async () => {
    // Setup successful login
    mockLoginMutation.mutateAsync.mockResolvedValue({ id: 1, username: 'testuser' });
    
    render(<LoginForm />);
    
    // Fill form with valid credentials
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    
    // Submit form
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    // Check that login mutation was called with correct values
    await waitFor(() => {
      expect(mockLoginMutation.mutateAsync).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });
    
    // Check that success toast was shown
    expect(mockToast.toast).toHaveBeenCalledWith({
      title: "Login Successful",
      description: "Welcome back!",
    });
  });

  it('shows error message on login failure', async () => {
    // Setup login failure
    mockLoginMutation.mutateAsync.mockRejectedValue(new Error('Invalid credentials'));
    
    render(<LoginForm />);
    
    // Fill form
    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'wrongpassword');
    
    // Submit form
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(signInButton);
    
    // Check that error toast was shown
    await waitFor(() => {
      expect(mockToast.toast).toHaveBeenCalledWith({
        title: "Login Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    });
  });

  it('disables form during submission', async () => {
    // Setup loading state
    mockUseAuth.mockReturnValue({
      loginMutation: { ...mockLoginMutation, isPending: true },
      isLoading: true,
    });
    
    render(<LoginForm />);
    
    // Check that form elements are disabled
    expect(screen.getByLabelText(/username/i)).toBeDisabled();
    expect(screen.getByLabelText(/password/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    expect(screen.getByLabelText(/remember me/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeDisabled();
  });
}); 