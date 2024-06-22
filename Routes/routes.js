const express = require("express");
const router = express.Router();
const authRouter = require("./authRoutes")
const queueRouter = require("./queueRoutes")

router.use("/user", authRouter);
router.use("/queue", queueRouter);
module.exports = router;
