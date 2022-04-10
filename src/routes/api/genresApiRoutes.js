const express = require('express');
const router = express.Router();
const genresApiController = require('../../controllers/api/genresApiController');

/* endpoint */

router.get('/api/genres', genresApiController.list)
router.get('/api/genresFetch', genresApiController.fetch)
router.get('/api/genresFetch2', genresApiController.fetch2)
router.get('/api/genres/detail/:id', genresApiController.detail);


module.exports = router;