"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("better-auth/node");
const auth_1 = require("../modules/auth/auth");
const authMiddleware = async (req, res, next) => {
    try {
        const session = (await auth_1.auth.api.getSession({
            headers: (0, node_1.fromNodeHeaders)(req.headers)
        }));
        const user = session?.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        req.user = user;
        if (!user?.id) {
            return res.status(401).json({ error: "Unauthorized user" });
        }
        req.userId = user.id;
        return next();
    }
    catch (err) {
        return res.status(500).json({ error: "Internal server error" });
    }
};
exports.default = authMiddleware;
