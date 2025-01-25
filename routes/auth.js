import multer from "multer";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import passport from "passport";
import { isAdmin, isAuthenticated } from "../middlewares/auth";

const authRouter = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Signup Route
authRouter.post("/signup", upload.single("profilePicture"), async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: { message: "All fields are required." } });
    }

    // Check if the username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: { message: "Username or email already exists." } });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Process the profile picture if provided
    let profilePicturePath = null;
    if (req.file) {
      profilePicturePath = `/uploads/${req.file.filename}`; // Save the relative path
    }

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        profilePicture: profilePicturePath || undefined, // Save the path if provided
      },
    });

    return res.status(201).json({
      message: "User created successfully.",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: { message: "Internal Server Error." } });
  }
});

// Other routes (login, logout, update) remain the same
authRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: { message: "Internal Server Error." } });
    }
    if (!user) {
      return res.status(401).json({ error: { message: info?.message || "Invalid credentials." } });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ error: { message: "Error logging in." } });
      }
      return res.status(200).json({ message: "Login successful.", user });
    });
  })(req, res, next);
});

authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: { message: "Error logging out." } });
    }
    res.status(200).json({ message: "Logout successful." });
  });
});

// Update route for admins
authRouter.put("/update", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const userId = req.user.id; // `req.user` is populated by Passport
    const { username, email, password, profilePicture, coverPicture, RASmember, PoR } = req.body;

    const updatedData = {};

    if (username !== undefined) updatedData.username = username;
    if (email !== undefined) updatedData.email = email;
    if (password !== undefined) {
      updatedData.password = await bcrypt.hash(password, 10); // Hash the password if it's provided
    }
    if (profilePicture !== undefined) updatedData.profilePicture = profilePicture;
    if (coverPicture !== undefined) updatedData.coverPicture = coverPicture;
    if (RASmember !== undefined) updatedData.RASmember = RASmember;
    if (PoR !== undefined) updatedData.PoR = PoR;

    updatedData.lastUpdated = new Date();

    if (Object.keys(updatedData).length === 1 && updatedData.lastUpdated) {
      return res.status(400).json({ error: { message: "No fields provided for update." } });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    return res.status(200).json({ message: "User updated successfully.", user: updatedUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: { message: "Internal Server Error." } });
  }
});

export { authRouter };
