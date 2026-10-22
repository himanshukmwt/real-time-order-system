import "dotenv/config";
import app from "./src/app.js";
import { connectRabbitMQ,scheduleReconnect } from "./src/config/rabbitmq.js";

connectRabbitMQ().catch((err) =>{
  console.error("RabbitMQ connect failed:", err.message);
  scheduleReconnect();
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});