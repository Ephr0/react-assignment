'use client'
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="flex h-fit w-fit flex-col items-center gap-5 py-24 px-16 bg-silver rounded-3xl">
        <h1 className="text-purple font-bold text-5xl">Subways of Budapest</h1>

        <div className="flex flex-col items-center gap-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-purple text-xl text-purple outline-none self-start"
          />
          <Link href={`/game?name=${encodeURIComponent(name || "Player")}`}>
            <button className="bg-purple w-fit h-fit rounded-xl px-5 py-2.5 cursor-pointer">
              <h3 className="text-white font-bold text-3xl">Start Game</h3>
            </button>
          </Link>
          <Link href="/rules">
            <button className="bg-white w-fit h-fit rounded-xl px-5 py-2.5 cursor-pointer border-purple border-2">
              <h3 className="text-purple font-bold text-3xl">Rules</h3>
            </button>
          </Link>
        </div>
      </main>
    </div>
  );
}
