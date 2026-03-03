const env = require("./config/env");
const { connectDb } = require("./config/db");
const app = require("./app");

async function bootstrap() {
  await connectDb();
  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
