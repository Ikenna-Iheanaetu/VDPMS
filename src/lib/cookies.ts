import { cookies } from "next/headers";
import { decrypt } from "./jwt";

interface CookieReturnType {
  id: number;
  name: string;
  role: "DOCTOR" | "NURSE" | "PATIENT";
  exp: number;
}


export async function getCookies(): Promise<CookieReturnType | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("cookie");

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
