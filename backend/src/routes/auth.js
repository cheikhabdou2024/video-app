const router = require('express').Router();
const register = require('../controllers/authController').register;
const login = require('../controllers/authController').login;

router.post('/register', register);
router.post('/login', login);

module.exports = router;