"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_1 = require("better-auth/node");
const auth_1 = require("./auth");
const authRouter = (0, express_1.Router)();
authRouter.use("/", (0, node_1.toNodeHandler)(auth_1.auth));
exports.default = authRouter;
