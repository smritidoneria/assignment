const express = require('express');
const router = express.Router();
const ratings=require("../controllers/ratings")

router.route('/movies/:movieId/:userId/rate')
    .post(ratings.rating)

router.route('/recommendationsI/:userId')
    .get(ratings.preferences1)

router.route('/recommendationsII/:userId')
    .get(ratings.preferences2)

router.route('/recommendationsIII/:userId')
    .get(ratings.preferences3)

router.route('/recommendationspop/:userId')
    .get(ratings.popularity)
module.exports = router;