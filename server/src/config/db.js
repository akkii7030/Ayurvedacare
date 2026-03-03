const mongoose = require("mongoose");
const env = require("./env");

async function connectDb() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env");
  }
  await mongoose.connect(env.MONGODB_URI);
}

module.exports = {
  connectDb,
};
