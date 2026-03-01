"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const httpLogger_1 = require("./httpLogger");
const notFound_middleware_1 = require("../middleware/notFound.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const emailRoute_1 = __importDefault(require("../routes/emailRoute"));
const routes_1 = require("../routes/routes");
const app = (0, express_1.default)();
// Core middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: true, credentials: true }));
// Logging
app.use(httpLogger_1.httpLogger);
// Routes
app.get("/", (req, res) => {
    res.send("server is running");
});
app.use("/api/auth", auth_routes_1.default);
app.use("/", emailRoute_1.default);
app.use("/api", routes_1.router);
// Errors
app.use(notFound_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
exports.default = app;
