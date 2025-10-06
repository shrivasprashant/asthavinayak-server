import User from "../model/User.model.js"
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import twilio from 'twilio'
import dotenv from 'dotenv';
dotenv.config();
import OTP from "../model/OTP.model.js"
import ErrorHandler from "../utils/ErrorHandler.js";


const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);


const register = async (req, res, next) => {
    const { username, mobile, password, otp } = req.body;

    if (!username || !mobile || !password || !otp) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    try {
        // Verify OTP first
        const otpRecord = await OTP.findOne({ 
            mobile,
            otp,
            verified: true,
            otpExpire: { $gt: Date.now() } 
        });

        if (!otpRecord) {
            return next(new ErrorHandler('Invalid OTP or OTP not verified', 400));
        }

        // Check if user already exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return next(new ErrorHandler('User already exists', 400));
        }

        // Create user
        const user = await User.create({ username, mobile, password });

        // Clear OTP record
        await OTP.deleteOne({ mobile });

        res.status(201).json({
            user,
            message: "User registered successfully",
            success: true,
        });

    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

const sendOTP = async (req, res, next) => {
    console.log(req.body);
    
    const { mobile } = req.body;
    
    if (!mobile) {
        return next(new ErrorHandler('Mobile number is required', 400));
    }

    try {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create or update OTP record
        await OTP.findOneAndUpdate(
            { mobile },
            { otp, otpExpire, verified: false },
            { upsert: true, new: true }
        );

        // Send OTP via WhatsApp
        await twilioClient.messages.create({
            body: `Your OTP for registration is: ${otp}`,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${mobile}`
        });

        res.status(200).json({ 
            message: 'OTP sent successfully',
            success: true 
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};


const verifyOTP = async (req, res, next) => {
    const { mobile, otp } = req.body;
    
    if (!mobile || !otp) {
        return next(new ErrorHandler('Mobile and OTP are required', 400));
    }

    try {
        const otpRecord = await OTP.findOne({ 
            mobile,
            otpExpire: { $gt: Date.now() } 
        });

        if (!otpRecord || otpRecord.otp !== otp) {
            return next(new ErrorHandler('Invalid OTP or OTP expired', 400));
        }

        // Mark OTP as verified
        otpRecord.verified = true;
        await otpRecord.save();

        res.status(200).json({ 
            message: 'OTP verified successfully', 
            success: true 
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
};

const login = async (req, res, next) => {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
        return next(new ErrorHandler('Please enter all fields', 400));
    }

    try {
        const user = await User.findOne({ mobile });
        if (!user) {
            return next(new ErrorHandler('User not found', 400));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return next(new ErrorHandler('Invalid credentials', 400));
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        const cookieoption = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            sameSite: 'none',
            secure: true
        }
        res.cookie('token', token, cookieoption);
        res.status(200).json({ 
            user, 
            token, 
            message: 'Login successful', 
            success: true 
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
}


const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password'); 
        if (!user) {
            return res.status(400).json({ 
                message: 'User not found', 
                success: false 
            });
        }
        res.status(200).json({ 
            user, 
            message: 'Profile fetched successfully', 
            success: true 
        });
    } catch (error) {
        console.error(error);
        return next(new ErrorHandler(error.message, 500));
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: new Date(0)
        });

        return res.status(200).json({
            message: 'Logout successful',
            success: true
        });
    } catch (error) {
        console.error("Logout error:", error);
        return next(new ErrorHandler(error.message, 500));
    }
};

export { 
    register, 
    sendOTP, 
    verifyOTP, 
    login, 
    getProfile, 
    logout 
}