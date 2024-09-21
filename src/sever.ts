import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";

const server = express();
const port = 3000;

server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    optionsSuccessStatus: 200,
  })
);

server.get("/", (req, res) => {
  res.send("Hello World!");
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
