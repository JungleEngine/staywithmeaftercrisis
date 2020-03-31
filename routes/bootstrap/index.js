const express = require('express');

const router = new express.Router();


router.get('/', function(req, res) {
  res.json({success: 'True'}).status(200);
});

module.exports = router;
