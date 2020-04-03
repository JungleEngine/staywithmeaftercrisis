const express = require('express');

const UserController = require('../controllers/users').UserController;

const router = new express.Router();


router.get('/', async function(req, res) {
  try {
    result = await UserController.addUser(req.query);
    res.json({success: 'True', result: result}).status(200);
  } catch (e) {
    console.log('Error in adding user');
    res.json({success: 'False'}).status(400);
  }
});

module.exports = router;
