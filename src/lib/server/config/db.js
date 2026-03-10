const mongoose = require("mongoose");
const env = require("./env");

let connectionPromise = null;

async function connectDb() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to .env");
  }
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGODB_URI);
  }
  await connectionPromise;
  return mongoose.connection;
}

module.exports = {
  connectDb,
};
