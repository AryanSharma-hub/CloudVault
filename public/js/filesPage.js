/**
 * public/js/filesPage.js
 * Handles instant client-side search (via /api/files/search) and
 * delete-with-confirmation on the "My Files" page.
 */
(function () {
  const searchInput = document.getElementById('searchInput');
  const tableBody = document.getElementById('filesTableBody');
  const emptyState = document.getElementById('emptyState');
  let debounceTimer = null;

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderRows(files) {
    if (!files.length) {
      tableBody.innerHTML = '';
      emptyState.classList.remove('d-none');
      return;
    }
    emptyState.classList.add('d-none');
    tableBody.innerHTML = files
      .map(
        (file) => `
      <tr data-file-id="${file.id}">
        <td><i class="bi ${file.icon} fs-5 me-2"></i>${escapeHtml(file.originalName)}</td>
        <td>${file.sizeFormatted}</td>
        <td><span class="badge cv-badge">${file.fileType}</span></td>
        <td>${file.uploadedAtFormatted}</td>
        <td>${file.downloadCount}</td>
        <td class="text-end">
          <a href="/files/${file.id}/download" class="btn btn-sm cv-btn-icon" title="Download"><i class="bi bi-download"></i></a>
          <button class="btn btn-sm cv-btn-icon cv-btn-icon-danger btn-delete-file" data-file-id="${file.id}" data-file-name="${escapeHtml(file.originalName)}" title="Delete">
            <i class="bi bi-trash3"></i>
          </button>
        </td>
      </tr>`
      )
      .join('');
  }

  async function runSearch(query) {
    try {
      const res = await fetch(`/api/files/search?q=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        renderRows(data.files);
      }
    } catch (err) {
      console.error('Search failed', err);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();
      debounceTimer = setTimeout(() => runSearch(query), 250);
    });
  }

  // Event delegation for delete buttons (works for both server-rendered
  // and dynamically re-rendered rows).
  if (tableBody) {
    tableBody.addEventListener('click', async (e) => {
      const btn = e.target.closest('.btn-delete-file');
      if (!btn) return;

      const fileId = btn.getAttribute('data-file-id');
      const fileName = btn.getAttribute('data-file-name');

      if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;

      try {
        const res = await fetch(`/files/${fileId}`, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        });
        const data = await res.json();
        if (data.success) {
          const row = tableBody.querySelector(`tr[data-file-id="${fileId}"]`);
          if (row) row.remove();
          if (!tableBody.querySelector('tr')) {
            emptyState.classList.remove('d-none');
          }
        } else {
          alert(data.message || 'Failed to delete file.');
        }
      } catch (err) {
        console.error('Delete failed', err);
        alert('Failed to delete file.');
      }
    });
  }
})();
