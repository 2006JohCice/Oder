require("dotenv").config({ path: "./.env" });
const mongoose = require("mongoose");
const User = require("./models/user.model");
const ForgotPassword = require("./models/forgot-password.model");
const bcrypt = require("bcryptjs");

async function testOtpPasswordPost() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB");

    const email = "neicjoh@gmail.com";
    const password = "123";
    
    // Create a mock OTP
    const otp = "999999";
    await ForgotPassword.deleteMany({ email, type: "forgot" });
    await ForgotPassword.create({
      email,
      otp,
      type: "forgot",
      expireAt: Date.now() + 5 * 60 * 1000,
    });
    
    console.log("Mock OTP created");

    // Now simulate the exact logic in otpPasswordPost
    const forgotPassword = await ForgotPassword.findOne({
      email,
      otp,
      type: "forgot",
    });

    if (!forgotPassword) {
      console.log("OTP NOT FOUND");
      return;
    }

    console.log("Hashing password...");
    const hashPassword = await bcrypt.hash(password, 10);
    console.log("Hashed:", hashPassword);

    console.log("Updating user...");
    const updateRes = await User.updateOne(
      { email },
      {
        password: hashPassword,
      }
    );
    console.log("Update result:", updateRes);

    console.log("Success!");

  } catch (error) {
    console.error("Crash error:", error);
  } finally {
    mongoose.connection.close();
  }
}

testOtpPasswordPost();
