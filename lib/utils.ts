/* eslint-disable @typescript-eslint/no-explicit-any */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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
  const tempScores: { id: string; queen: string; episodeNumber: string | number; score: number }[] = [];

  const scoredRecord = trackRecord.map(q => {
    if (q.isEliminated) return { ...q };

    const tempScore = Math.floor(Math.random() * 100) + 1;
    tempScores.push({ id: q.id, queen: q.name, episodeNumber, score: tempScore });

    return {
      ...q,
      scores: [...q.scores, { episodeNumber, score: tempScore }]
    };
  });

  tempScores.sort((a, b) => b.score - a.score);

  const [topCount, bottomCount] = nittyGritty({ size: tempScores.length });

  const topQueens = tempScores.slice(0, topCount);
  const bottomQueens = tempScores.slice(-bottomCount);
  const eliminatedId = nonElimination ? null : lipsync(bottomQueens.slice(1));

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

function lipsync(bottomQueens: { id: string; queen: string }[]) {
  const eliminatedQueen = bottomQueens[Math.floor(Math.random() * bottomQueens.length)];
  return eliminatedQueen.id; // return ID instead of object
}

