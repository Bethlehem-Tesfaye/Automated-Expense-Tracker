"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSupportRequestStatusAdmin = exports.getAllSupportRequestsAdmin = exports.getSupportRequests = exports.createSupportRequest = exports.getSupportResources = void 0;
const supportService = __importStar(require("./support.service"));
const getSupportResources = async (_req, res, next) => {
    try {
        const resources = await supportService.getSupportResources();
        return res.status(200).json(resources);
    }
    catch (error) {
        return next(error);
    }
};
exports.getSupportResources = getSupportResources;
const createSupportRequest = async (req, res, next) => {
    try {
        const userId = req.userId;
        const request = await supportService.createSupportRequest({
            userId,
            subject: req.body.subject,
            message: req.body.message,
            category: req.body.category
        });
        return res.status(201).json(request);
    }
    catch (error) {
        return next(error);
    }
};
exports.createSupportRequest = createSupportRequest;
const getSupportRequests = async (req, res, next) => {
    try {
        const userId = req.userId;
        const requests = await supportService.getSupportRequests({
            userId,
            limit: req.query.limit
        });
        return res.status(200).json(requests);
    }
    catch (error) {
        return next(error);
    }
};
exports.getSupportRequests = getSupportRequests;
const getAllSupportRequestsAdmin = async (req, res, next) => {
    try {
        const requests = await supportService.getAllSupportRequests({
            limit: req.query.limit,
            status: req.query.status
        });
        return res.status(200).json(requests);
    }
    catch (error) {
        return next(error);
    }
};
exports.getAllSupportRequestsAdmin = getAllSupportRequestsAdmin;
const updateSupportRequestStatusAdmin = async (req, res, next) => {
    try {
        const updated = await supportService.updateSupportRequestStatus({
            id: req.params.id,
            status: req.body.status
        });
        return res.status(200).json(updated);
    }
    catch (error) {
        return next(error);
    }
};
exports.updateSupportRequestStatusAdmin = updateSupportRequestStatusAdmin;
