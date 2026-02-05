const express = require('express');
const {
    executeCode,
    getLanguages
} = require('../controllers/compilerController');

const router = express.Router();

// Execute code
router.post('/execute', executeCode);

// Get supported languages
router.get('/languages', getLanguages);

module.exports = router;
