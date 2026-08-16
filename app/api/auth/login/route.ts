import { NextResponse } from "next/server";
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5100";
const BACKEND_URL = `${BASE_URL.replace(/\/$/, "")}/api`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Call NestJS Backend Auth API: POST http://localhost:5100/api/auth/login
    const response = await axios.post(`${BACKEND_URL}/auth/login`, {
      username,
      password,
    });

    const { token, user } = response.data;

    // Create Next.js Response with httpOnly Cookie
    const res = NextResponse.json({
      success: true,
      message: "ເຂົ້າສູ່ລະບົບສຳເລັດ",
      user,
      token,
    });

    // Set token in httpOnly Cookie
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 2 * 60 * 60, // 2 hours
    });

    return res;
  } catch (err: unknown) {
    let message = "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ";
    let status = 400;

    if (axios.isAxiosError(err) && err.response) {
      status = err.response.status;
      if (err.response.data?.message) {
        message = Array.isArray(err.response.data.message)
          ? err.response.data.message[0]
          : err.response.data.message;
      }
    }

    return NextResponse.json(
      { success: false, message },
      { status: status }
    );
  }
}
