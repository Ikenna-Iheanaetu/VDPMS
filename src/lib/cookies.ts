import { cookies } from "next/headers";
import { decrypt } from "./jwt";
import { Role } from "@prisma/client";

interface CookieReturnType {
  userId: number;
  name: string;
  role: Role
  roleSpecificId: string
  email: string
  exp: number;
}

export async function getCookies(): Promise<CookieReturnType | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    return null;
  }

  try {
    const decoded = await decrypt(session.value);
    return decoded;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}
