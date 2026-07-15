const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const { requireAuth } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/dashboard', requireAuth, fileController.dashboard);
router.get('/files', requireAuth, fileController.listFilesPage);
router.get('/api/files/search', requireAuth, fileController.searchFilesApi);

router.post('/files/upload', requireAuth, upload.single('file'), fileController.uploadFile);
router.get('/files/:id/download', requireAuth, fileController.downloadFile);
router.delete('/files/:id', requireAuth, fileController.deleteFile);

module.exports = router;
