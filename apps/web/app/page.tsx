"use client";

import Link from "next/link";
import { useState } from "react";
import Ttile from "@/components/ttile";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Ttile>NotDatabase - Home</Ttile>
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Welcome to NotDatabase</h1>
          <p className="text-gray-400">Your simple, fast database solution</p>
        </div>
      </div>
    </>
  );
}
