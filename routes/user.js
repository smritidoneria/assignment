const express = require('express');
const router = express.Router();
const regitration=require("../controllers/registration")

router.route('/register')
    .post(regitration.register)

module.exports = router;