import { jwtVerify, SignJWT } from "jose";

const secretKey = process.env.JWT_SECRET_KEY!;
const key = new TextEncoder().encode(secretKey);

// interface DecryptReturnType {
//   id: number;
//   fullName: string;
//   role: "SUPER_ADMIN" | "ADMIN" | "STAFF" | "STUDENT";
// }

export const encrypt = async (payload: any) => {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key);
};


export async function decrypt(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] })
    return payload;
  } catch (error) {
    console.error("Verification error:", error);
    return null;
  }
}
