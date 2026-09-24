import { env } from "./src/config/env.js";
import { createApp } from "./src/app.js";

const app = createApp();

app.listen(env.port, () => {
  console.log(`MeetMid server listening on http://localhost:${env.port}`);
});
