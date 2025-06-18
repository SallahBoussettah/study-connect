const { Subject } = require('../models');

/**
 * @desc    Get all subjects
 * @route   GET /api/subjects
 * @access  Public
 */
exports.getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.findAll({
      attributes: ['id', 'name', 'category', 'description', 'icon'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    next(error);
  }
};

/**
 * @desc    Get a single subject
 * @route   GET /api/subjects/:id
 * @access  Public
 */
exports.getSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      attributes: ['id', 'name', 'category', 'description', 'icon']
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        error: 'Subject not found'
      });
    }

    res.status(200).json({
      success: true,
      data: subject
    });
  } catch (error) {
    console.error('Error fetching subject:', error);
    next(error);
  }
}; 