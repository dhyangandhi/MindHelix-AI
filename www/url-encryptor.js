/* =========================================================
   MINDHELIX AI - URL Encryption Helper System
   ========================================================= */

(function () {
  'use strict';

  const URLEncryptor = {
    // Encrypt path string to base64url token
    encryptPath: function (pathStr) {
      if (!pathStr) return '';
      let clean = pathStr.trim().replace(/^\/+|\/+$/g, '');
      if (clean === '' || clean === 'index.html' || clean === 'home.html') clean = 'home';
      if (clean === 'login.html') clean = 'login';
      if (clean === 'register.html') clean = 'register';
      if (clean === 'ai.html') clean = 'ai';
      if (clean === 'dashbord.html' || clean === 'dashboard.html') clean = 'dashboard';
      if (clean === 'Contact.html' || clean === 'contact.html') clean = 'contact';

      try {
        const encoded = btoa(clean)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
        return '/e/' + encoded;
      } catch (e) {
        return '/' + clean;
      }
    },

    // Decrypt token back to path
    decryptToken: function (token) {
      if (!token) return '';
      try {
        let base64 = token.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return atob(base64);
      } catch (e) {
        return token;
      }
    },

    // Obfuscate current address bar URL smoothly in place without polluting back button history
    encryptAddressBar: function () {
      try {
        const path = window.location.pathname;
        if (path && !path.startsWith('/e/')) {
          const encPath = URLEncryptor.encryptPath(path);
          if (history.replaceState && encPath) {
            history.replaceState(null, '', encPath + window.location.search + window.location.hash);
          }
        }
      } catch (e) {
        console.warn('URL address bar encryption skipped:', e);
      }
    }
  };

  window.URLEncryptor = URLEncryptor;

  document.addEventListener('DOMContentLoaded', function () {
    URLEncryptor.encryptAddressBar();
  });
})();
