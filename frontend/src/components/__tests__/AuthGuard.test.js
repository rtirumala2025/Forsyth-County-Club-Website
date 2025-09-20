import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthGuard from '../auth/AuthGuard';
import { auth } from '../../config/firebaseConfig';

// Mock the auth hook
jest.mock('react-firebase-hooks/auth', () => ({
  useAuthState: jest.fn()
}));

// Mock Firebase
jest.mock('../../config/firebaseConfig', () => ({
  auth: {
    currentUser: null
  },
  db: {
    collection: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn()
  }
}));

import { useAuthState } from 'react-firebase-hooks/auth';

const TestComponent = () => <div>Protected Content</div>;

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('AuthGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render children when user is authenticated', async () => {
    useAuthState.mockReturnValue([
      { uid: '123', email: 'test@example.com' },
      false,
      null
    ]);

    // Mock successful role fetch
    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'user' })
    });
    
    const { db } = require('../../config/firebaseConfig');
    db.getDoc.mockImplementation(mockGetDoc);

    renderWithRouter(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should redirect to login when user is not authenticated', async () => {
    useAuthState.mockReturnValue([null, false, null]);

    renderWithRouter(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  it('should show loading state while checking authentication', () => {
    useAuthState.mockReturnValue([null, true, null]);

    renderWithRouter(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show error state when authentication fails', async () => {
    useAuthState.mockReturnValue([null, false, new Error('Auth failed')]);

    renderWithRouter(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Authentication Error')).toBeInTheDocument();
      expect(screen.getByText('There was an error with authentication.')).toBeInTheDocument();
    });
  });

  it('should show access denied for insufficient role', async () => {
    useAuthState.mockReturnValue([
      { uid: '123', email: 'test@example.com' },
      false,
      null
    ]);

    // Mock role fetch returning insufficient role
    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'user' })
    });
    
    const { db } = require('../../config/firebaseConfig');
    db.getDoc.mockImplementation(mockGetDoc);

    renderWithRouter(
      <AuthGuard requiredRole="admin">
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText("You don't have permission to access this page.")).toBeInTheDocument();
    });
  });

  it('should render children when user has required role', async () => {
    useAuthState.mockReturnValue([
      { uid: '123', email: 'test@example.com' },
      false,
      null
    ]);

    // Mock role fetch returning admin role
    const mockGetDoc = jest.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({ role: 'admin' })
    });
    
    const { db } = require('../../config/firebaseConfig');
    db.getDoc.mockImplementation(mockGetDoc);

    renderWithRouter(
      <AuthGuard requiredRole="admin">
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should handle role fetch error gracefully', async () => {
    useAuthState.mockReturnValue([
      { uid: '123', email: 'test@example.com' },
      false,
      null
    ]);

    // Mock role fetch error
    const mockGetDoc = jest.fn().mockRejectedValue(new Error('Role fetch failed'));
    
    const { db } = require('../../config/firebaseConfig');
    db.getDoc.mockImplementation(mockGetDoc);

    renderWithRouter(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should use fallback component when provided', async () => {
    useAuthState.mockReturnValue([null, false, null]);

    const FallbackComponent = () => <div>Custom Fallback</div>;

    renderWithRouter(
      <AuthGuard fallback={<FallbackComponent />}>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });
});
