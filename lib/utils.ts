/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx"
import { stat } from "fs";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LipsyncData {
    id: string;
    title: string;
    artist: string;
    episode: string;
    genre: string;
    season: string;
    franchise: string;
}

export interface SavedLipsync {
    episodeNumber: number;
    lipsync: LipsyncData;
    order: number;
}

const episodeTypeToStats: Record<string, (keyof any)[]> = {
  acting: ["Acting", "Comedy"],
  branding: ["Acting", "Comedy"],
  commercial: ["Acting", "Comedy"],
  comedy: ["Comedy", "Acting"],
  design: ["Design", "Runway"],
  dancing: ["Dance"],
  singing: ["Singing", "Dance"],
  improv: ["Comedy", "Acting"],
  roast: ["Comedy"],
  parody: ["Comedy", "Acting"],
  makeover: ["Design", "Runway"],
  musical: ['Acting', 'Singing', 'Dance', 'Comedy'],
  default: ["Acting", "Comedy", "Dance", "Design", "Singing", "Runway"],
};

export function mainChallenge(
  trackRecord: any[],
  episodeNumber: string | number,
  nonElimination: boolean = false,
  episodeType: string,
  seasonStyle: string
) {

  const isFinale = episodeType.toLowerCase().includes("finale");

  if (isFinale) { // handle finale logic including picking the winner 

    if (seasonStyle.toLowerCase().includes("lsftc")) {
      const activeQueens = trackRecord.filter(q => !q.isEliminated);

      // --- Semi-finals ---
      const shuffled = [...activeQueens].sort(() => Math.random() - 0.5);
      const group1 = [shuffled[0], shuffled[1]];
      const group2 = [shuffled[2], shuffled[3]];

      group1.forEach(q => { q.group = 1; q.isInSemiFinal = true; });
      group2.forEach(q => { q.group = 2; q.isInSemiFinal = true; });
      //console.log('Group1:', group1.map(q => q.name), 'Group2:', group2.map(q => q.name));

      const winner1Id = lipsync(group1);
      const winner2Id = lipsync(group2);

      // --- Final lipsync ---
      const finalPair = activeQueens.filter(q => q.id === winner1Id || q.id === winner2Id);
      finalPair.forEach(q => q.isInFinal = true);
      const crownWinnerId = lipsync(finalPair);

      return trackRecord.map(q => {

        if (q.isEliminated) return q;

        let placement: string;
        let isEliminated = q.isEliminated;

        //let isInLipsync = false;
        //if (group1.find(g => g.id === q.id) || group2.find(g => g.id === q.id)) isInLipsync = true;
        //if (finalPair.find(f => f.id === q.id)) isInLipsync = true;

        if (q.id === crownWinnerId) {
          placement = "win"; // winner of the season
          isEliminated = false;
        } else if (q.id === winner1Id || q.id === winner2Id) {
          placement = "finale"; // made it to final lipsync
          isEliminated = false;
        } else {
          placement = "finale"; // semifinal elimination
          isEliminated = true;
        }

        return {
          ...q,
          isInSemiFinal: q.isInSemiFinal || false,
          isInFinal: q.isInFinal || false,
          isEliminated,
          placements: [
            ...q.placements,
            { episodeNumber, placement },
          ],
        };
      });
    }

    else {

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
  } // end finale 

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
        bias: bias,
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

  let eliminatedId = null;
  if (!nonElimination) {
    if (topCount == 2 && bottomCount == 2) {

      eliminatedId = lipsync(bottomQueens);
    } else eliminatedId = lipsync(bottomQueens.slice(1));
  }

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
  
  if (size === 4) { // Explicit rules for 4 queens left
    return [2, 2]; // Return topCount = 2 (winner + high), bottomCount = 2
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

  for (let b = 0; b < bottomQueens.length; b++) {

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

  //console.log(bottomResults);
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

  const finalScore = (baseStat + statIncrease);
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
