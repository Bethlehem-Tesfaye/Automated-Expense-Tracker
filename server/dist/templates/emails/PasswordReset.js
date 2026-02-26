"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResetPasswordEmail = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const styles = {
    body: {
        margin: 0,
        padding: 0,
        backgroundColor: "#f6f6f6",
        fontFamily: "Arial, sans-serif"
    },
    container: {
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        padding: "20px"
    },
    heading: {
        color: "#333",
        fontSize: "20px",
        margin: "0 0 10px"
    },
    text: {
        color: "#555",
        fontSize: "14px",
        lineHeight: 1.5,
        margin: "0 0 15px"
    },
    button: {
        display: "inline-block",
        padding: "10px 20px",
        backgroundColor: "#1a73e8",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "4px"
    },
    smallText: {
        color: "#999",
        fontSize: "12px",
        margin: "10px 0"
    },
    hr: {
        border: 0,
        borderTop: "1px solid #eee",
        margin: "20px 0"
    },
    footer: {
        color: "#777",
        fontSize: "12px"
    },
    link: {
        wordBreak: "break-all",
        color: "#1a73e8",
        fontSize: "12px"
    }
};
const ResetPasswordEmail = ({ userName, resetUrl }) => {
    return ((0, jsx_runtime_1.jsx)("html", { children: (0, jsx_runtime_1.jsx)("body", { style: styles.body, children: (0, jsx_runtime_1.jsx)("table", { style: styles.container, children: (0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsxs)("td", { children: [(0, jsx_runtime_1.jsx)("h2", { style: styles.heading, children: "Reset your password" }), (0, jsx_runtime_1.jsx)("p", { style: styles.text, children: userName ? `Hi ${userName},` : "Hi," }), (0, jsx_runtime_1.jsx)("p", { style: styles.text, children: "We received a request to reset your password. Click the button below to choose a new one." }), (0, jsx_runtime_1.jsx)("a", { href: resetUrl, style: styles.button, children: "Reset Password" }), (0, jsx_runtime_1.jsx)("p", { style: styles.smallText, children: "This link will expire in 15 minutes. If you didn\u2019t request a password reset, you can safely ignore this email." }), (0, jsx_runtime_1.jsx)("hr", { style: styles.hr }), (0, jsx_runtime_1.jsx)("p", { style: styles.footer, children: "If the button doesn\u2019t work, copy and paste this URL into your browser:" }), (0, jsx_runtime_1.jsx)("p", { style: styles.link, children: resetUrl })] }) }) }) }) }));
};
exports.ResetPasswordEmail = ResetPasswordEmail;
exports.default = exports.ResetPasswordEmail;
