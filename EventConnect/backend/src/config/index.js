const database = require('./database');
const redis = require('./redis');
const jwt = require('./jwt');
const cloudinary = require('./cloudinary');
const socket = require('./socket');
const validation = require('./validation');
const googleMaps = require('./googleMaps');

module.exports = {
  database,
  redis,
  jwt,
  cloudinary,
  socket,
  validation,
  googleMaps
};