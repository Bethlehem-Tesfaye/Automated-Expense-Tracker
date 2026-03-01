"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyEmail = VerifyEmail;
const jsx_runtime_1 = require("react/jsx-runtime");
const components_1 = require("@react-email/components");
function VerifyEmail({ name, verifyUrl }) {
    return ((0, jsx_runtime_1.jsxs)(components_1.Html, { children: [(0, jsx_runtime_1.jsx)(components_1.Head, {}), (0, jsx_runtime_1.jsx)(components_1.Body, { style: { fontFamily: "Arial, sans-serif" }, children: (0, jsx_runtime_1.jsxs)(components_1.Container, { children: [(0, jsx_runtime_1.jsxs)(components_1.Text, { children: ["Hello ", name, ","] }), (0, jsx_runtime_1.jsx)(components_1.Text, { children: "Please verify your email address:" }), (0, jsx_runtime_1.jsx)(components_1.Button, { href: verifyUrl, children: "Verify Email" })] }) })] }));
}
