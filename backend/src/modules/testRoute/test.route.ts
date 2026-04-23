import express from "express"
import { transfers } from "./test.controller.js"

const router = express.Router()

router.post('/send', transfers)
export default router