const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120),
    phone: z.string().min(8).max(20),
    email: z.string().email().optional(),
    password: z.string().min(6).max(64),
    role: z.enum(["admin", "patient", "doctor", "receptionist", "accountant"]).optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    phone: z.string().min(8).max(20),
    password: z.string().min(6).max(64),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
