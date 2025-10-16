const express = require('express');
const router = express.Router();
const { createCategoryController, getAllCategoriesController } = require('../controllers/categories.controller');

router.post('/', createCategoryController);
router.get('/', getAllCategoriesController);

module.exports = router;