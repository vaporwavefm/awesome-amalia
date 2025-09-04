import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function mainChallenge(trackRecord: any[], episodeNumber: string | number, nonElimination: boolean = false) {
  const episodeNum = Number(episodeNumber);

  // Detect finale: 4 or fewer remaining, none eliminated
  const isFinale = trackRecord.every(q => !q.isEliminated) && trackRecord.length <= 4;

  if (isFinale) {
    // Pick a single winner randomly
    const winnerIndex = Math.floor(Math.random() * trackRecord.length);
    return trackRecord.map((q, idx) => ({
      ...q,
      placements: [
        ...q.placements,
        { episodeNumber, placement: idx === winnerIndex ? 'win' : 'finale' }
      ],
      // Do NOT increment wins/highs/lows/bottoms
      // leave other stats unchanged
    }));
  }

  // --- Normal episode logic ---
  let tempScores: { id: string; queen: string; episodeNumber: string | number; score: number }[] = [];

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
  let [topCount, bottomCount] = nittyGritty({ size: tempScores.length });

  const topQueens = tempScores.slice(0, topCount);
  const bottomQueens = tempScores.slice(-bottomCount);
  const eliminatedId = nonElimination ? null : lipsync(bottomQueens.slice(1));

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

    if (bottomQueens[0]?.id === q.id) {
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

