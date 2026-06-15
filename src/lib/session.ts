import type { SessionOptions } from "iron-session";

export interface SessionData {
  isInstructor?: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET ?? "dev-only-change-this-secret-key-32chars",
  cookieName: "lecture-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  },
};
