const express = require('express');
const { getAllSubjects, getSubject } = require('../controllers/subjectController');

const router = express.Router();

// Get all subjects route
router.route('/').get(getAllSubjects);

// Get single subject route
router.route('/:id').get(getSubject);

module.exports = router; 