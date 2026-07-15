/**
 * public/js/theme.js
 * Handles dark/light mode toggling. Preference is kept in a JS variable +
 * cookie-free in-memory approach is not persistent across reloads, so we
 * use a simple document cookie (not localStorage, which is unavailable in
 * some sandboxed contexts) to remember the choice.
 */
(function () {
  const root = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/; max-age=31536000`;
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-sun-fill"></i>';
    } else {
      root.removeAttribute('data-theme');
      if (toggleBtn) toggleBtn.innerHTML = '<i class="bi bi-moon-stars-fill"></i>';
    }
  }

  const savedTheme = getCookie('cv-theme') || 'light';
  applyTheme(savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      const isDark = root.getAttribute('data-theme') === 'dark';
      const next = isDark ? 'light' : 'dark';
      applyTheme(next);
      setCookie('cv-theme', next);
    });
  }
})();
