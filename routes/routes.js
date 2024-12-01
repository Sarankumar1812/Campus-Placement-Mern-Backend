const express = require('express');
const { signup, signin, forgotPassword } = require('../controllers/Auth');

const router = express.Router();

//Auth
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/forgot-password', forgotPassword);

module.exports = router;
