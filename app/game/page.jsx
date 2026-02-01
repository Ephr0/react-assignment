import Game from "./game";
import { promises as fs } from "fs"

export default async function GameClient(){
  const stationsFile = await fs.readFile(process.cwd() + "/data/stations.json", "utf-8");
  const stations = JSON.parse(stationsFile);
  const linesFile = await fs.readFile(process.cwd() + "/data/lines.json", "utf-8");
  const lines = JSON.parse(linesFile);
  const cardsFile = await fs.readFile(process.cwd() + "/data/cards.json", "utf-8");
  const cardsData = JSON.parse(cardsFile);
  return <Game stationsData={stations} linesData={lines} cardsData={cardsData}/>}