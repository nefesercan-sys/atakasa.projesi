"use client";
import { signOut } from "next-auth/react";
export default function CikisButonu() {
  return <button className="text-gray-500 hover:text-gray-800" onClick={() => signOut({ callbackUrl: "/" })}>Çıkış</button>;
}
