const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const base32 = require("thirty-two");
const SuperAdmin = require("../models/superAdminModel");

// --------- Create a Token
const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRETKEY, { expiresIn: "1d" });
};

// --------- Encode a OTP secret to base32
function encodeToBase32() {
  const inputString = process.env.OTP_SECRET_KEY;
  return base32.encode(inputString);
}

// --------- Send otp email
const sendOtpByEmail = async (email, otp) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // You may need to set this to true or false based on your SMTP server configuration
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Your OTP for Login",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f9f9f9;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #333;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 10px;
              }
              .otp {
                font-size: 20px;
                font-weight: bold;
                color: #007bff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Your OTP for Login</h2>
              <p>Hello,</p>
              <p>Your OTP for login is: <span class="otp">${otp}</span></p>
              <p>If you did not request this OTP, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: "OTP email sent successfully" };
  } catch (error) {
    
    throw error; // You may want to handle this error in your application
  }
};

// --------- Register a super admin
const signupSuperAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // validation
    if (!email || !password) {
      throw Error("All fields must be filled");
    }

    // check if email already exists
    const exists = await SuperAdmin.findOne({ email });

    if (exists) {
      throw Error("Email already in use");
    }

    if (!validator.isEmail(email)) {
      throw Error("Email not valid");
    }
    if (!validator.isStrongPassword(password)) {
      throw Error("Password not strong enough");
    }

    // generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const role = "SUPER_ADMIN";

    // create superadmin
    const superadmin = await SuperAdmin.create({ email, password: hash, role });

    // create a token
    //const token = createToken(user._id);

    res.status(200).json({ email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- Login a super admin step 1
const loginSuperAdmin = async (req, res) => {
  const { email, password } = req.body;
  //const secret = process.env.OTP_SECRET_KEY;

  try {
    if (!email || !password) {
      throw Error("All fields must be filled");
    }

    const superadmin = await SuperAdmin.findOne({ email });
    if (!superadmin) {
      throw Error("Incorrect email");
    }

    const match = await bcrypt.compare(password, superadmin.password);
    if (!match) {
      throw Error("Incorrect password");
    }

    const token = speakeasy.totp({
      secret: encodeToBase32(),
      encoding: "base32",
    });

    // Send the OTP via email along with the generated secret
    const otpEmailResult = await sendOtpByEmail(email, token);

    if (!otpEmailResult.success) {
      throw Error("Failed to send OTP email");
    }

    res
      .status(200)
      .json({ success: true, message: otpEmailResult.message, email });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- Login a super admin step 2
const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const superadmin = await SuperAdmin.findOne({ email });
    if (!superadmin) {
      throw Error("Incorrect email");
    }

    // Verify the OTP using the provided secret
    const verified = speakeasy.totp.verify({
      secret: encodeToBase32(),
      encoding: "base32",
      token: otp,
      window: 4,
    });

    if (verified) {
      // OTP is valid, user is successfully authenticated
      const token = createToken(superadmin._id);

      const role = superadmin.role;
      res.status(200).json({ email, role, token });
    } else {
      // Invalid OTP
      res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --------- forgotpassword a admin
const superAdminForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      throw Error("Email field must be filled");
    }

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) {
      throw Error("Incorrect email");
    }
    const exptime = "10m";
    // create a token
    const token = createToken(admin._id, exptime);

    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: "Reset password",
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f9f9f9;
                padding: 20px;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #333;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 10px;
              }
              .reset-link {
                color: #007bff;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Reset password</h2>
              <p>Hello,</p>
              <p>You have requested to reset your password. Please click on the following link to reset your password:</p>
              <p><a href="http://localhost:5173/spresetpassword/${admin._id}/${token}" class="reset-link">Reset Password</a></p>
              <p>If you did not request this, please ignore this email.</p>
            </div>
          </body>
        </html>
      `,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        res.status(500).json({ error: "Failed to send email" });
      } else {
        // Move the response outside the callback
        res.status(200).json({ Status: "Success" });
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// --------- reset password a admin
const superAdminResetPassword = async (req, res) => {
  const { password, adminId } = req.body;

  try {
    // Validation
    if (!password || !adminId) {
      throw Error("All fields must be filled");
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Update the password for the admin with the specified adminId
    const updatedAdmin = await SuperAdmin.findByIdAndUpdate(
      adminId,
      { $set: { password: hash } },
      { new: true } // Return the updated document
    );

    if (!updatedAdmin) {
      throw Error("Admin not found"); // Handle the case where the admin with the given ID is not found
    }

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = {
  signupSuperAdmin,
  loginSuperAdmin,
  verifyLogin,
  superAdminForgotPassword,
  superAdminResetPassword,
};
