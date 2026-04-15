const bcrypt = require("bcrypt");
const User = require("../models/User");
const { getSafeUser } = require("../utils/sessionUser");

async function register(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email, and password are required." });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "user"
  });

  const safeUser = getSafeUser(user);
  req.session.user = safeUser;

  return res.status(201).json({
    message: "Registration successful.",
    user: safeUser
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required." });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const safeUser = getSafeUser(user);
  req.session.user = safeUser;

  return res.json({
    message: "Login successful.",
    user: safeUser
  });
}

function logout(req, res) {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ message: "Unable to logout right now." });
    }

    res.clearCookie(process.env.SESSION_NAME || "ids.sid");
    return res.json({ message: "Logout successful." });
  });
}

function me(req, res) {
  return res.json({
    authenticated: Boolean(req.session.user),
    user: req.session.user || null
  });
}

module.exports = { register, login, logout, me };
