/**
 * Comprehensive logout utility
 * Clears all client-side storage and triggers server-side session termination
 */
export function performLogout() {
  try {
    // Clear all localStorage items
    localStorage.clear();
    
    // Clear all sessionStorage items
    sessionStorage.clear();
    
    // Clear any indexed DB storage (if used)
    if (window.indexedDB) {
      indexedDB.databases().then((databases) => {
        databases.forEach((db) => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }).catch(err => console.error('IndexedDB cleanup error:', err));
    }
    
    // Clear service worker caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach(name => {
          caches.delete(name);
        });
      }).catch(err => console.error('Cache cleanup error:', err));
    }
    
    // Invalidate TanStack Query cache
    try {
      const { queryClient } = require('@/lib/queryClient');
      queryClient.clear();
    } catch (err) {
      // QueryClient might not be available in all contexts
    }
    
  } catch (error) {
    console.error('Logout cleanup error:', error);
  } finally {
    // Always redirect to logout endpoint regardless of cleanup success
    // This ensures server-side session destruction
    window.location.href = '/api/logout';
  }
}
