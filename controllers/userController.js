/**
 * controllers/userController.js
 * Handles the user profile page.
 */

const { metadataService } = require('../services/serviceFactory');
const { formatBytes } = require('../utils/helpers');

exports.profile = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const user = await metadataService.getUserById(userId);
    const stats = await metadataService.getUserStats(userId);

    return res.render('profile', {
      title: 'My Profile',
      user: req.session.user,
      profile: user.toSafeObject(),
      stats: {
        totalFiles: stats.totalFiles,
        totalSizeFormatted: formatBytes(stats.totalSizeBytes),
        totalDownloads: stats.totalDownloads,
      },
    });
  } catch (err) {
    return next(err);
  }
};
