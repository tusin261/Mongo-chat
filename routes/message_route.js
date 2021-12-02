const message_controller = require('../controllers/message_controller');
const express = require('express');
const message_router = express.Router();

message_router.get("/getMessage",message_controller.getMessage);
module.exports = message_router;

