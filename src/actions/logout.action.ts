"use server";

import { getCookies } from "@/lib/cookies";
import { cookies } from "next/headers";
export default async function logout() {
  try {
    const cookieStore = cookies();
    const cookie = await getCookies();

    if (!cookie) throw new Error("There is no logged in user");

    console.log(cookie);

    (await cookieStore).delete("cookie");
    
    const url = '/'
    console.log(url)

    return {
      success: true,
      data: { redirectUrl: url }
    }
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to logout",
    };
  }
}
