const mongoose = require('mongoose');

/**
 * Connects to MongoDB. Credentials are passed as options (not embedded in the
 * URI) so passwords with special characters need no URL encoding.
 */
const connectMongo = async () => {
  const options = {};
  if (process.env.MONGO_USER) {
    options.user = process.env.MONGO_USER;
    options.pass = process.env.MONGO_PASSWORD;
    options.authSource = process.env.MONGO_AUTH_SOURCE || undefined;
  }
  await mongoose.connect(process.env.MONGO_URI, options);
};

module.exports = connectMongo;
