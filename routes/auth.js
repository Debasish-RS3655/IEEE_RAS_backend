import { Router } from "express";
import passport from "passport";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { upload } from "../lib/storage";

const authRouter = Router();

// Signup Route
authRouter.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input fields
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: { message: "All fields are required." } });
    }

    // Check if the username or email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: { message: "Username or email already exists." } });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res
      .status(201)
      .json({ message: "User created successfully.", user: newUser });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: { message: "Internal Server Error." } });
  }
});

// Login Route
authRouter.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ error: { message: "Internal Server Error." } });
    }
    if (!user) {
      return res
        .status(401)
        .json({ error: { message: info?.message || "Invalid credentials." } });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ error: { message: "Error logging in." } });
      }
      // Send success response with user info
      return res.status(200).json({ message: "Login successful.", user });
    });
  })(req, res, next);
});

// Logout Route
authRouter.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res
        .status(500)
        .json({ error: { message: "Error logging out." } });
    }
    res.status(200).json({ message: "Logout successful." });
  });
});

export { authRouter };
