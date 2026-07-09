import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { conflict, unauthorized, notFound, badRequest } from "../utils/errors.js";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

export const authService = {
  async registerUser(data) {
    const { name, email, password } = data;
    
    // Email is already normalized by Zod, but just to be safe
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw conflict("Email is already registered", "EMAIL_EXISTS");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    return sanitizeUser(user);
  },

  async loginUser(data) {
    const { email, password } = data;
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic error message for both cases
    if (!user) {
      throw unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
    }

    // Generate token
    const token = generateToken(user.id);

    return {
      user: sanitizeUser(user),
      token,
    };
  },

  async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw notFound("User not found", "USER_NOT_FOUND");
    }

    return sanitizeUser(user);
  },

  async updateProfile(userId, data) {
    const { name } = data;
    
    // Verify user exists first to be safe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw notFound("User not found", "USER_NOT_FOUND");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
      },
    });

    return sanitizeUser(updatedUser);
  },

  async changePassword(userId, data) {
    const { currentPassword, newPassword } = data;

    if (currentPassword === newPassword) {
      throw badRequest("New password must be different from current password", "SAME_PASSWORD");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw notFound("User not found", "USER_NOT_FOUND");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw unauthorized("Invalid current password", "INVALID_CREDENTIALS");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // We do not return the updated user here because changing password does not alter user shape,
    // and typically we just return a success message.
  },
};
