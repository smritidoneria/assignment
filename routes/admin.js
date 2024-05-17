const express = require('express');
const router = express.Router();
const movies=require("../controllers/movies.js")


router.route('/movies')
    .get(movies.moviereg)

router.route('/getmovies')
    .get(movies.getmovie)

module.exports = router;