/* eslint-disable @typescript-eslint/no-explicit-any */

import { clsx, type ClassValue } from "clsx"
import { stat } from "fs";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const episodeTypeToStats: Record<string, (keyof any)[]> = {
  acting: ["Acting", "Comedy"],
  branding: ["Acting", "Comedy"],
  commercial: ["Acting", "Comedy"],
  comedy: ["Comedy", "Acting"],
  design: ["Design"],
  dance: ["Dance"],
  singing: ["Singing", "Dance"],
  improv: ["Comedy", "Acting"],
  roast: ["Comedy"],
  makeover: ["Design"],
  musical: ['Acting', 'Singing', 'Dance', 'Comedy'],
  default: ["Acting", "Comedy", "Dance", "Design", "Singing"],
};

export function mainChallenge(trackRecord: any[], episodeNumber: string | number, nonElimination: boolean = false, episodeType: string) {
  //const episodeNum = Number(episodeNumber);

  const isFinale = episodeType.toLowerCase().includes("finale");

  if (isFinale) {
    const activeQueens = trackRecord.filter(q => !q.isEliminated); // Only active queens
    const maxWins = Math.max(...activeQueens.map(q => q.wins)); // Max wins among active

    const finalists = activeQueens
      .map((q) => (q.wins === maxWins ? trackRecord.indexOf(q) : -1))
      .filter(idx => idx !== -1);

    const winnerIndex = finalists[Math.floor(Math.random() * finalists.length)]; // Random winner

    return trackRecord.map((q, idx) => {
      //console.log(q);
      if (q.isEliminated) return q; // do nothing
      return {
        ...q,
        placements: [
          ...q.placements,
          {
            episodeNumber,
            placement: idx === winnerIndex ? "win" : "finale", // Only update active queens
          },
        ],
      };
    });
  }

  // --- Normal episode logic ---
  //const tempScores: { id: string; queen: string; episodeNumber: string | number; score: number }[] = [];
  const tempScores: {
    id: string;
    queen: string;
    episodeNumber: string | number;
    baseStat: number;
    score: number;
    randomFactor: number;
    bias: number;
    statIncrease: number;
    relevantStatsLen: number;
    wins: number;
    highs: number;
    lows: number;
    bottoms: number;
  }[] = [];

  const scoredRecord = trackRecord.map(q => {
    if (q.isEliminated) return { ...q };

    //const tempScore = Math.floor(Math.random() * 100) + 1;
    const { baseStat, finalScore, randomFactor, bias, statIncrease, relevantStats } = getEpisodeScore(q, episodeType, Number(episodeNumber));

    tempScores.push({
      id: q.id,
      queen: q.name,
      episodeNumber,
      baseStat: baseStat,
      score: finalScore,
      randomFactor,
      bias,
      statIncrease: statIncrease,
      relevantStatsLen: relevantStats.length,
      wins: q.wins,
      highs: q.highs,
      lows: q.lows,
      bottoms: q.bottoms
    });
    //tempScores.push({ id: q.id, queen: q.name, episodeNumber, score: tempScore });

    return {
      ...q,
      scores: [...q.scores, { 
        episodeNumber, 
        score: finalScore, 
        baseStat: baseStat, 
        statIncrease: statIncrease, 
        relevantStatsLen: relevantStats.length,
        bias:bias,
        wins: q.wins,
        highs: q.highs,
      lows: q.lows,
        bottoms: q.bottoms
       }]
    };
  });

  tempScores.sort((a, b) => b.score - a.score);

  const [topCount, bottomCount] = nittyGritty({ size: tempScores.length });

  const topQueens = tempScores.slice(0, topCount);
  const bottomQueens = tempScores.slice(-bottomCount);
  const regularBottomQueens = bottomQueens.slice(1);

  let eliminatedId = null;
  if(!nonElimination){
    if(topCount == 2 && bottomCount == 2){
      eliminatedId = lipsync(bottomQueens);
    } else eliminatedId = lipsync(bottomQueens.slice(1));
  }
  //const = nonElimination ? null : lipsync(bottomQueens.slice(1));

  /*
  if (topCount == 2 && bottomCount == 2) {
    console.log(JSON.stringify(tempScores) + '\n' + nittyGritty({ size: tempScores.length }));
    console.log('top: ' + JSON.stringify(topQueens));
    console.log('bottom ' + JSON.stringify(bottomQueens));
  } */

  const updatedRecord = scoredRecord.map(q => {
    if (q.isEliminated) return { ...q };

    let placementType: 'win' | 'high' | 'low' | 'bottom' | 'safe';

    if (topQueens[0]?.id === q.id) {
      placementType = 'win';
      return { ...q, wins: q.wins + 1, placements: [...q.placements, { episodeNumber, placement: placementType }] };
    }

    if (topQueens.slice(1).some(t => t.id === q.id)) {
      placementType = 'high';
      return { ...q, highs: q.highs + 1, placements: [...q.placements, { episodeNumber, placement: placementType }] };
    }

    if (bottomQueens[0]?.id === q.id && bottomCount > 2) {
      placementType = 'low';
      return { ...q, lows: q.lows + 1, placements: [...q.placements, { episodeNumber, placement: placementType }] };
    }

    if (bottomQueens.some(b => b.id === q.id)) {
      placementType = 'bottom';
      const isEliminated = q.id === eliminatedId;
      return { ...q, bottoms: q.bottoms + 1, isEliminated, placements: [...q.placements, { episodeNumber, placement: placementType }] };
    }

    placementType = 'safe';
    return { ...q, placements: [...q.placements, { episodeNumber, placement: placementType }] };
  });

  return updatedRecord;
}

function nittyGritty({ size }: { size: number }) {
  // Explicit rules for 4 queens left
  if (size === 4) {
    // Return topCount = 2 (winner + high), bottomCount = 2
    return [2, 2];
  }

  const placementReserve: Record<number, [number, number]> = {
    5: [2, 3],
    6: [3, 3],
    7: [4, 3]
  };

  if (placementReserve[size]) return placementReserve[size];
  return [3, 3]; // default
}

function lipsync(bottomQueens: { id: string; queen: string; wins: number; highs: number; lows: number; bottoms: number }[]) {
  
  const bottomResults = [];
  
  for(let b = 0; b < bottomQueens.length; b++){
    
     bottomResults.push({
      bottomId: bottomQueens[b].id,
      name: bottomQueens[b].queen,
      result: (Math.floor(Math.random() * 10) + 1) 
      + (1 * bottomQueens[b].wins)
      + (.5 * bottomQueens[b].highs) 
      - (.6 * bottomQueens[b].lows)
      - (2 * bottomQueens[b].bottoms),
     }) 
  }

  console.log(bottomResults);
    // Handle empty array case
  if (bottomResults.length === 0) {
    return null;
  }

  let lowestScore = Infinity;
  let lowestId = null;

  // Loop through each queen to find the one with the lowest score
  for (const q of bottomResults) {
    if (q.result < lowestScore) {
      lowestScore = q.result;
      lowestId = q.bottomId;
    }
  }
  return lowestId;

  //const eliminatedQueen = bottomQueens[Math.floor(Math.random() * bottomQueens.length)];
  //return eliminatedQueen.id; // return ID instead of object
}

function getQueenBiasFromStats(queen: any): number {
  let bias = 0;

  bias += queen.wins * 8;
  bias += queen.highs * 5;
  bias -= queen.bottoms * 12;
  bias -= queen.lows * 8;

  return bias;
}

function getEpisodeScore(queen: any, episodeType: string, episodeNumber: number) {
  const typeKeys = episodeType.toLowerCase().split(",");
  let relevantStats: string[] = [];

  typeKeys.forEach(key => {
    if (episodeTypeToStats[key]) {
      relevantStats = [...relevantStats, ...episodeTypeToStats[key] as string[]];
    }
  });

  relevantStats = [...new Set(relevantStats)]; // Remove duplicates
  if (relevantStats.length === 0) {
    console.log(episodeType);
    relevantStats = episodeTypeToStats["default"] as string[];
  }

  const baseStat = Math.floor(Math.random() * 100) + 1;
  let statIncrease = 0;
  for (const r in relevantStats) {
    //console.log('episode ' + episodeNumber + ': ' + queen.name +  ' ' + queen.stats[relevantStats[r]] +  ' ' + relevantStats.length);
    statIncrease += queen.stats[relevantStats[r]];
  }

  statIncrease = statIncrease / relevantStats.length;
  

  //console.log(queen.name + ' ' + baseStat + ' ' + finalScore);
  //relevantStats.reduce((sum, stat) => sum + (queen.stats[stat] || 50), 0) / relevantStats.length;

  const randomFactor = Math.floor(Math.random() * 20) - 10;
  const bias = getQueenBiasFromStats(queen);

  const finalScore = (baseStat + statIncrease) ;
  //const finalScore = Math.min(100, Math.max(1, baseStat + randomFactor + bias));

  return {
    baseStat,
    finalScore,
    randomFactor,
    bias,
    statIncrease,
    relevantStats
  };
}

