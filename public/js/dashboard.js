/**
 * public/js/dashboard.js
 * Handles the upload modal's drag-and-drop dropzone and filename preview.
 */
(function () {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const preview = document.getElementById('fileNamePreview');

  if (!dropzone || !fileInput) return;

  function showPreview() {
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      preview.innerHTML = `<i class="bi bi-file-earmark-check-fill text-success me-1"></i> ${file.name} (${sizeMb} MB)`;
    } else {
      preview.innerHTML = '';
    }
  }

  fileInput.addEventListener('change', showPreview);

  ['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('cv-dragover');
    });
  });

  ['dragleave', 'drop'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('cv-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      fileInput.files = dt.files;
      showPreview();
    }
  });
})();
