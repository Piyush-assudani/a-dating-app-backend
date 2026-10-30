const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policy.controller');

// JSON API routes (for mobile app & web frontend)
router.get('/api/all', policyController.getAllPoliciesJson);
router.get('/api/:type', policyController.getPolicyJson);

// HTML web views
router.get('/', policyController.getPolicyIndex);
router.get('/:type', policyController.getPolicy);

module.exports = router;
