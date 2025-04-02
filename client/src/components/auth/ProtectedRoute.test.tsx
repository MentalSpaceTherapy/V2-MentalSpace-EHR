import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';

// Mock the hooks
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Mock router
vi.mock('wouter', () => ({
  useLocation: () => ['/', vi.fn()],
  Redirect: ({ to }: { to: string }) => <div data-testid="mock-redirect" data-to={to} />,
}));

describe('ProtectedRoute', () => {
  const mockUseAuth = useAuth as unknown as vi.Mock;
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state when authentication is in progress', () => {
    // Setup loading state
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: true,
    });
    
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    // Check that loading indicator is shown
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Protected content should not be shown
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    // Setup unauthenticated state
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
    });
    
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    // Check that we're redirecting to login
    const redirect = screen.queryByTestId('mock-redirect');
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute('data-to', '/login');
    
    // Protected content should not be shown
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    // Setup authenticated state
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'testuser', role: 'therapist' },
      isLoading: false,
    });
    
    render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
    
    // Protected content should be shown
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to dashboard when user does not have required role', () => {
    // Setup authenticated state but without required role
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'testuser', role: 'therapist' },
      isLoading: false,
    });
    
    render(
      <ProtectedRoute requiredRoles={['administrator']}>
        <div data-testid="protected-content">Admin Content</div>
      </ProtectedRoute>
    );
    
    // Check that we're redirecting to dashboard
    const redirect = screen.queryByTestId('mock-redirect');
    expect(redirect).toBeInTheDocument();
    expect(redirect).toHaveAttribute('data-to', '/');
    
    // Protected content should not be shown
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user has one of the required roles', () => {
    // Setup authenticated state with required role
    mockUseAuth.mockReturnValue({
      user: { id: 1, username: 'testuser', role: 'administrator' },
      isLoading: false,
    });
    
    render(
      <ProtectedRoute requiredRoles={['administrator', 'supervisor']}>
        <div data-testid="protected-content">Admin Content</div>
      </ProtectedRoute>
    );
    
    // Protected content should be shown
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
}); 