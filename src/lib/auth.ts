import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type SessionData } from "./session";

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function isInstructor() {
  const session = await getSession();
  return session.isInstructor === true;
}

export async function requireInstructor() {
  const instructor = await isInstructor();
  if (!instructor) {
    throw new Error("UNAUTHORIZED");
  }
}
