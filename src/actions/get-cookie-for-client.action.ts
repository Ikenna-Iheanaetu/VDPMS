"use server";

"use server";

import { getCookies } from "@/lib/cookies";

export default async function getCookieForClient() {
  try {
    const cookie = await getCookies();

    if (!cookie) throw new Error("There is no logged in user");

    return {
      success: true,
      data: cookie,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to logout",
    };
  }
}
