import express from "express";
import { 
    register, 
    sendOTP, 
    verifyOTP, 
    login, 
    getProfile, 
    logout 
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/login", login);
router.get("/profile", isLoggedIn, getProfile);
router.post("/logout", isLoggedIn, logout);

export default router;