const express = require('express');
const {
    executeCode,
    getLanguages,
    getExecutionHistory,
    clearExecutionHistory
} = require('../controllers/compilerController');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Execute code (supports optionalAuth to bind execution history to logged-in user)
router.post('/execute', optionalAuth, executeCode);

// Get supported languages
router.get('/languages', getLanguages);

// Execution history routes
router.get('/history', optionalAuth, getExecutionHistory);
router.delete('/history', optionalAuth, clearExecutionHistory);

module.exports = router;

