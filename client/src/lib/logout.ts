/**
 * Comprehensive logout utility
 * Clears auth-related client-side storage and triggers server-side session termination
 */
export function performLogout() {
  try {
    // Clear only auth-related localStorage items (preserve user preferences like theme)
    const authKeys = ['auth_token', 'access_token', 'refresh_token', 'user_session', 'replit_auth'];
    authKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear all sessionStorage (temporary session data)
    sessionStorage.clear();
    
    // Clear TanStack Query cache for auth-related data
    try {
      const { queryClient } = require('@/lib/queryClient');
      // Only clear auth-related queries, not all data
      queryClient.removeQueries({ queryKey: ['/api/auth'] });
      queryClient.removeQueries({ queryKey: ['/api/dashboard'] });
    } catch (err) {
      // QueryClient might not be available in all contexts
      console.log('Query cache cleanup skipped');
    }
    
  } catch (error) {
    console.error('Logout cleanup error:', error);
  } finally {
    // Always redirect to logout endpoint regardless of cleanup success
    // This ensures server-side session destruction
    window.location.href = '/api/logout';
  }
}
