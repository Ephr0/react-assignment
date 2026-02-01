import Link from "next/link";

export default function Rules() {

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <main className="flex h-fit w-fit flex-col items-center gap-5 py-24 px-16 bg-silver rounded-3xl">
        <h1 className="text-purple font-bold text-5xl">Rules</h1>

        <div className="flex flex-col items-center gap-4">
          <p className="text-black text-lg max-w-[600px] text-center">
          The goal of the game is to build the most efficient metro network by 
          strategically placing stations and connecting them.
          <br /><br />
          The starting position for the turn will be defined by the right side boxs color.
          Each turn, a random Station Card is drawn for you. Connect stations by hovering over 
          stations to see available stations and click to connect.
          <br /><br />
          Once clicked, the station becomes part of your network. Completing a line 
          or connecting multiple districts earns bonus points.
          <br /><br />
          The game ends when all tiles are filled or no more legal moves remain. 
          The score will be shown at the end of the game.
          </p>
        </div>
        <Link href="/">
          <button className="bg-purple w-fit h-fit rounded-xl px-5 py-2.5 cursor-pointer">
            <h3 className="text-white font-bold text-3xl">Okay</h3>
          </button>
        </Link>
      </main>
    </div>
  );
}
