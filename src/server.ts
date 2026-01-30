import { createApp } from "./infrastructure/http/app.js";
import { env } from "./shared/config/env.js";

const app = createApp();

app.listen(env.PORT, () => {
  process.stdout.write(`Server listening on port ${env.PORT}\n`);
});
