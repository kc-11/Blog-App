import { cookies } from "next/headers";
import { createHash } from "crypto";

const COOKIE_NAME = "admin_auth";
const SALT = "blog-admin";

/** Compute the admin token from the password (Node only). */
export function getAdminToken(password: string): string {
  return createHash("sha256").update(password + SALT).digest("hex");
}

/** Check if the request has a valid admin cookie. Call from Server Components / API. */
export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return token === getAdminToken(secret);
}

export { COOKIE_NAME, SALT };
