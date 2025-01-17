import express from "express";
import { getHelloMessage } from "./controllers/helloController";

const helloRouter = express.Router();

helloRouter.get("/hello", getHelloMessage);

export { helloRouter };
