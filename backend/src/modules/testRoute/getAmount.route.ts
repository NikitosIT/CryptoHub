import express from "express"
import { getAmount } from "./getAmount.controller.js"

const router = express.Router()
router.get("/balance", getAmount)

export default router