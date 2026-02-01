'use client'
import Image from "next/image"
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const types = {
  "A" : "/icons/a.svg",
  "B" : "/icons/b.svg",
  "C" : "/icons/c.svg",
  "D" : "/icons/d.svg",
  "Joker": null,
  "Switch": null
}
const river = {
  "6,0" : "l",
  "6,1" : "l",
  "6,2" : "l",
  "5,3" : "cl",
  "5,4" : "l",
  "5,5" : "l",
  "5,6" : 'l',
  "5,7" : "cr",
  "6,8" : "cr",
  "7,9" : "l"
}

const boardSize = 10;

function shuffle(arr){
  let copy = [...arr];
  for (let i=copy.length-1; i>=0; i--){
    let j = Math.floor(Math.random()*(i+1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function initMatrix(stations, lines){
  let arr = Array.from({ length: 10 }, () => Array.from({length: 10}, () => null));

  stations.forEach(s => {
    arr[s.y][s.x] = { ...s};
  })
  lines.forEach(l => {
    arr[l.sy][l.sx] = {...arr[l.sy][l.sx], metro: l.name, color: l.color};
  })
  arr[lines[0].sy][lines[0].sx] = {...arr[lines[0].sy][lines[0].sx], metro: lines[0].name, color: lines[0].color, validity: true};
  
  return arr;
}

function setStartValid(m, lines, turn){
  let copyM = [...m];
  let copyRow = [...copyM[lines[turn].sy]];
  copyRow[lines[turn].sx] = {...copyRow[lines[turn].sx], validity: true};
  copyM[lines[turn].sy] = copyRow;
  return copyM;
}

function calcDeck(deck){
  let copy = shuffle([...deck]);
  let cntS = 0;
  let cntC = 0
  for (let j = 0; j<8; j++){
    if (cntS >= 5 || cntC >= 5){
      let res = copy.slice(0, j);
      return res;
    }
    if (copy[j].platform == "side"){
      cntS += 1;
    }
    else{
      cntC += 1;
    }
  }
  return copy.slice(0, 8);
}

function initLines(lines, stations){
  let copyLines = [...lines];
  copyLines = copyLines.map(l => {
    let station = stations[l["start"]];
    return {...l, "sSet": new Set(), "sLines": [], "sx": station.x, "sy": station.y};
  })
  return copyLines;
}

function Game({stationsData, linesData, cardsData}){
  const params = useSearchParams();
  const name = params.get("name") ?? "Player";
  const [deck, setDeck] = useState(null);
  const [currCard, setCurr] = useState(0);
  const [turn, setTurn] = useState(0);
  const [lines, setLines] = useState(null);
  const [seg, setSeg] = useState(new Set());
  const [valid, setValid] = useState([]);
  const [active, setActive] = useState(null);
  const [matrix, setMatrix] = useState(null);
  const [finished, setFinished] = useState(false);

  useEffect(()=> {
    let l = initLines(shuffle(linesData), stationsData);
    let d = calcDeck(cardsData);
    setDeck(d);
    setLines(l);
    setMatrix(initMatrix(stationsData, l));
  }, []);

  const addTurn = (clicked) => {
    if (currCard >= deck.length - 1) {
      const newTurn = turn + 1;
      if (newTurn >= lines.length){
        setFinished(true);
        return;
      }
      let newDeck = calcDeck(deck);
      let copyM = [...matrix];
      copyM = setActivePoint(copyM, active, false, false);
      copyM = setStationLineValidity(copyM, lines[newTurn - 1], false);
      copyM = setPrevValidity(copyM, valid);
      copyM = setStartValid(copyM, lines, newTurn);
      setMatrix(copyM);
      setTurn(newTurn);
      setDeck(newDeck);
      setCurr(0);
    } 
    else {
      setCurr(currCard + 1);
      if (clicked) reset();
    }
  }

  const handleDeckClick = () => addTurn(true);

  const addInvPoints = (start, end) => {
    const pair = pairXY(start.x, start.y, end.x, end.y);
    if (pair[0] == 0 && pair[1] == 0) return "I made a mistake somehow";
    const copySeg = new Set(seg);
    let i = start.x + pair[1];
    let j = start.y + pair[0];
    copySeg.add(`${j-pair[0]},${i-pair[1]},${j},${i}`);
    if (pair[0] == 0 || pair[1] == 0){ 
      while (i!=end.x || j!=end.y){
        copySeg.add(`${j},${i}`);
        i += pair[1];
        j += pair[0];
      }
    }
    else{
      while (i!=end.x+pair[1] && j!=end.y+pair[0]){
        if (j != start.y && i != start.x && j != end.y && i != end.x){
          copySeg.add(`${j},${i}`)
        }
        copySeg.add(`${j-pair[0]},${i-pair[1]},${j},${i}`);
        i += pair[1];
        j += pair[0];
      }
    }
    setSeg(copySeg);
  }

  const newAddedLine = (sLines, obj, a) => {
    const copy = [...sLines];
    addInvPoints(a, obj);
    if (sLines.length == 0){
      copy.push({
        "x1": a.x,
        "y1": a.y,
        "x2": obj.x,
        "y2": obj.y
      })
      return copy;
    }
    const firstPoint = {"x": sLines[0].x1, "y": sLines[0].y1 };
    const lastPoint = {"x": sLines[sLines.length-1].x2, "y": sLines[sLines.length-1].y2 }; 
    if (a.x == firstPoint.x && a.y == firstPoint.y){
      copy.unshift({
        "x1": obj.x,
        "y1": obj.y,
        "x2": a.x,
        "y2": a.y
      })
    }
    else if (a.x == lastPoint.x && a.y == lastPoint.y){
      copy.push({
        "x1": a.x,
        "y1": a.y,
        "x2": obj.x,
        "y2": obj.y
      })
    }
    return copy;
  }

  const checkDiag = (ey, ex, i, j) => {
    const sy = ey - i;
    const sx = ex - j;
    let res = seg.has(`${sy},${sx},${ey},${ex}`);
    res = res || seg.has(`${ey},${ex},${sy},${sx}`);
    if (i != 0 && j != 0){
      res = res || seg.has(`${ey},${sx},${sy},${ex}`);
      res = res || seg.has(`${sy},${ex},${ey},${sx}`);
    }
    return res;
  }

  const activeMatrix = (m, obj) => {
    const line = lines[turn];
    const card = deck[currCard];
    const sSet = line.sSet;
    let copyM = [...m];
     
    const arr = [[0,1],[1,0],[-1,0],[0,-1], [1,1], [1,-1], [-1, 1], [-1, -1]];
    const validPoints = [];
    for (let i=0; i<arr.length; i++){
      let j = obj.y;
      let k = obj.x;
      j += arr[i][0];
      k += arr[i][1];

      while (j >= 0 && k >= 0 && j<boardSize && k<boardSize){
        if (seg.has(`${j},${k}`) || sSet.has(`${j},${k}`)) break;
        if (checkDiag(j, k, arr[i][0], arr[i][1])) break;
        if (copyM[j][k] && copyM[j][k].type != "?" && card.type != "Joker"  && copyM[j][k].type != card.type) break;
        if (copyM[j][k]){
          console.log('valid here', j, k, seg);
          copyM[j] = [...copyM[j]];
          copyM[j][k] = {...copyM[j][k], "validity": true};
          validPoints.push([j,k]);
          break;
        }
        j += arr[i][0];
        k += arr[i][1];
      }
    }
    setValid(validPoints);
    return copyM;  
  }

  const setStationLineValidity = (m, l, validity) => {
    const copyM = [...m];
    if (l.sLines.length == 0){
      let copyRow = [...copyM[l.sy]];
      copyRow[l.sx] = {...copyRow[l.sx], "validity": validity};
      copyM[l.sy] = copyRow;
    }
    else{
      let end = l.sLines.length - 1;
      const sLines = l.sLines;

      let copyRow = [...copyM[sLines[0].y1]];
      copyRow[sLines[0].x1] = {...copyRow[sLines[0].x1], "validity": validity};
      copyM[sLines[0].y1] = copyRow;

      copyRow = [...copyM[sLines[end].y2]];
      copyRow[sLines[end].x2] = {...copyRow[sLines[end].x2], "validity": validity};
      copyM[sLines[end].y2] = copyRow;
    }
    return copyM
  }

  const setActivePoint = (m, a, aStatus, validity) => {
    if (!a) return m;
    if (!aStatus && !validity){
      console.log("should be working");
    }
    const copyM = [...m];
    let copyRow = [...copyM[a.y]];
    copyRow[a.x] = {...copyRow[a.x], "active": aStatus, "validity": validity };
    copyM[a.y] = copyRow;
    return copyM;
  }

  const setPrevValidity = (m, validPoints) => {
    const copyM = [...m];
    console.log(validPoints);
    validPoints.forEach(valid => {
      let copyRow = [...copyM[valid[0]]]
      copyRow[valid[1]] = {...copyRow[valid[1]], "validity": false};
      copyM[valid[0]] = copyRow;
    })
    return copyM;
  }

  const modifyLine = (line, obj) => {
    if (!line){
      console.error("line is undefined");
      return null
    }
    const copyStationsSet = new Set(line.sSet);
    copyStationsSet.add(`${obj.y},${obj.x}`);
    copyStationsSet.add(`${active.y},${active.x}`);
    const copyStationsLine = newAddedLine(line.sLines, obj, active);
    return {...line, "sSet": copyStationsSet, "sLines": copyStationsLine};
  }

  const reset = () => {
    let copyM = setPrevValidity([...matrix], valid);
    copyM = setStationLineValidity(copyM, lines[turn], true);
    copyM = setActivePoint(copyM, active, false, true);
    setMatrix(copyM);
    setActive(null);
  }

  const handleMetroLine = (obj) => {
    let copyM = matrix.map(row =>
      row.map(cell => (cell ? { ...cell } : null))
    );
    if (!active){
      setActive(obj);
      copyM = setStationLineValidity(copyM, lines[turn], false);
      copyM = setActivePoint(copyM, obj, true, true);
      console.log(seg);
      setMatrix(activeMatrix(copyM, obj));
    }
    else if (active && active.x == obj.x && active.y == obj.y){
      reset();
    }
    else {
      const copyLines = [...lines];
      copyLines[turn] = modifyLine(copyLines[turn], obj);
      copyM = setPrevValidity(copyM, valid); 
      copyM = setActivePoint(copyM, active, false, false);
      copyM = setStationLineValidity(copyM, copyLines[turn], true);
      setMatrix(copyM);
      setValid([]);
      setLines(copyLines)
      setActive(null);
      addTurn();
    }
  }

  return (
    <div className="flex flex-row flex-wrap">
      {
        deck && 
        <div className="flex flex-col">
        <h1 className="text-4xl font-bold">Welcome, {name}!</h1>
        <div className="flex flex-row flex-wrap gap-10">
          <Board matrix={matrix} lines={lines} handleMetroLine={handleMetroLine}
          startingMetros={lines} turn={turn} active={active}/>
          <div className="flex flex-col flex-wrap gap-10">
            <Deck card={deck[currCard]} handleDeckClick={handleDeckClick}/>
            <Turn lines={lines} turn={turn}/>
          </div>

        </div>
        </div>
      }
    </div>
  )
}

function pairXY(sx, sy, ex, ey){
  if (sx == ex && sy < ey){
    return [1, 0];
  }
  else if (sx == ex && sy > ey){
    return [-1, 0];
  }
  else if (sy == ey && sx < ex){
    return [0, 1];
  }
  else if (sy == ey && sx > ex){
    return [0, -1];
  }
  else if (sy < ey && sx < ex){
    return [1, 1];
  }
  else if (sy > ey && sx < ex){
    return [-1, 1];
  }
  else if (sy > ey && sx > ex){
    return [-1, -1];
  }
  else if (sy < ey && sx > ex){
    return [1, -1];
  }
  else{
    return [0,0]
  }
}

function gridToSvg(p) {
  const size = 56;
  return p * size + size / 2;
}

function Board({matrix, handleMetroLine, lines}){
  return (
      <div className="grid grid-cols-10 grid-rows-10 gap-0 w-fit relative">
        { matrix &&
          matrix.map((row, y) => {
            return row.map((cell, x) => {
                return (
                <GridItem key={`${y},${x}`} obj={cell} riverFlow={river[`${x},${y}`]} handleMetroLine={handleMetroLine}/>
              );
            })
          })
        }

        <svg className="w-full h-full absolute">
        { lines.map(line => {
          return line.sLines && line.sLines.map((l, i) => {
            return (
              <line
                key={i}
                x1={gridToSvg(l.x1)}
                y1={gridToSvg(l.y1)}
                x2={gridToSvg(l.x2)}
                y2={gridToSvg(l.y2)}
                stroke={line.color}
                strokeWidth="6"
                strokeLinecap="round"
                className="z-10"
              />
            );
          })
        })}
        </svg>

      </div>
  )
}

function getRiverStyling(riverFlow){
    if (!riverFlow) return null
    switch (riverFlow){
    case "l":
      return "absolute -left-1 -top-0.5 w-2 h-[calc(100%+var(--spacing))] bg-river z-50";
    case "cl":
      return "absolute left-1/2 top-1/2 w-2 h-[calc((100%+var(--spacing))*1.414)] bg-river -translate-x-1/2 -translate-y-1/2 rotate-45 z-50";
    case "cr":
      return "absolute left-1/2 top-1/2 w-2 h-[calc((100%+var(--spacing))*1.414)] bg-river -translate-x-1/2 -translate-y-1/2 -rotate-45 z-50";
    default:
      return "";   
  }
}

function GridItem({obj, riverFlow, handleMetroLine}){
  const riverStyling = getRiverStyling(riverFlow);
  const handleClick = () => {
    if (!obj || !obj.validity) return;
    handleMetroLine(obj);
  }

  return (
    <div className="bg-white w-14 h-14 relative border-2 border-[rgba(236,236,236,10)]"
    onClick={handleClick}>
      {riverFlow && <div className={riverStyling}/>}
      {
        obj &&
        <div className={`${obj.validity ? "hover:cursor-pointer hover:shadow-xl/20" : ""} ${obj.active ? "scale-125" : ""}
        border-white border-2 shadow 
        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-2/3 aspect-square z-20`}
        style={{backgroundColor: obj?.color ?? "black", boxShadow: obj.validity ? "5px 0 purple" : ""}}>
          <img src={types[obj.type]} alt="icon" 
          className="absolute w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          {obj.train && (
            <div className="
              absolute bottom-0 right-0 
              translate-x-1/4 translate-y-1/4
              w-4 h-4 rounded-full 
              bg-yellow-300 text-black 
              flex items-center justify-center 
              text-[10px] font-bold
              border border-black
            ">
              T
            </div>
          )}
        </div>
      }
    </div>
  )
}

function Deck({card, handleDeckClick}) {
  return (
    <div className={`rounded-3xl w-[344px] h-36 ${card["platform"]=="center" ? "bg-silver" : "bg-[#A7A69E]"} relative`}>
      <p className="absolute bottom-0 left-1/2 -translate-x-1/2 text-black font-bold text-xl pointer-events-none">
        {card.platform ==="center" ? "Center Platform" : "Side Platform"}
      </p>
      <div className={`bg-black border-white border-2 shadow cursor-pointer
      absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-2/3 aspect-square`}
      onClick={handleDeckClick}>
        <img src={types[card.type]} alt="Joker" 
        className="absolute w-1/2 h-1/2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}

function Turn({ lines, turn }) {
  return (
    <div
      className="rounded-3xl w-[344px] h-36 relative flex items-center justify-center"
      style={{ backgroundColor: lines[turn] ? lines[turn].color : "bg-purple" }}
    >
      <p className="text-black font-bold text-3xl">
        Turn: {turn + 1}
      </p>
    </div>
  );
}

export default Game;