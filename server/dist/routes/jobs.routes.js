"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jobs_controller_1 = require("../controllers/jobs.controller");
const router = express_1.default.Router();
router.post("/create", jobs_controller_1.createJob);
router.get("/:jobId/status", jobs_controller_1.getJobStatus);
router.get("/:jobId/download", jobs_controller_1.download);
exports.default = router;
