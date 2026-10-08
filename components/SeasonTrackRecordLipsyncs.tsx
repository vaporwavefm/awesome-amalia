/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

type Placement = {
  episodeNumber: number | string;
  placement: string;
};

type Queen = {
  id: string;
  name: string;
  url?: string;
  placements: Placement[];
  wins: number;
  highs: number;
  lows: number;
  bottoms: number;
  isEliminated: boolean;
};

type Episode = {
  episodeNumber: number | string;
  title: string;
};

type Lipsync = {
  episodeNumber: number;
  lsftcRound?: number;
  order: number;
  lipsync: {
    id: string;
    title: string;
    episode: string;
    artist: string;
  }
};

type Props = {
  queens: Queen[];
  episodes: Episode[];
  lipsyncNames: Lipsync[];
  seasonFlow: string;
};

const SeasonTrackRecordLipsyncs = ({ queens, episodes, lipsyncNames, seasonFlow }: Props) => {

  const isClassicAllStars = seasonFlow === "ttwalas";
  const lipsyncs = episodes
    .map((ep) => {

      let bottoms = [],
        eliminated,
        winner;
      if (isClassicAllStars) {

        bottoms = queens.filter((q) => q.placements.some(
          (p) => Number(p.episodeNumber) === Number(ep.episodeNumber) && (p.placement === "top2" || p.placement === "win")));
        if (bottoms.length < 2) return null;

        winner = bottoms.find((q) => q.placements.some(
          (p) => Number(p.episodeNumber) === Number(ep.episodeNumber) && p.placement === "win"));

        const bottomQueens = queens.filter((q) => q.placements.some(
          (p) => Number(p.episodeNumber) === Number(ep.episodeNumber) && (p.placement === "bottomAS" || p.placement === "eliminated"))); 
          if (bottomQueens.length < 2) return null;
           eliminated = bottomQueens.find((q) => q.placements.some(
            (p) => Number(p.episodeNumber) === Number(ep.episodeNumber) && (p.placement === "eliminated" 
              || (q.isEliminated && Number(q.placements[q.placements.length - 1]?.episodeNumber) === Number(ep.episodeNumber)))));

      } else {

        bottoms = queens.filter((q) =>
          q.placements.some(
            (p) =>
              Number(p.episodeNumber) === Number(ep.episodeNumber) &&
              (p.placement === "bottom" || p.placement === "eliminated")
          )
        );

        if (bottoms.length < 2) return null;

        eliminated = bottoms.find((q) =>
          q.placements.some(
            (p) =>
              Number(p.episodeNumber) === Number(ep.episodeNumber) &&
              (p.placement === "eliminated" ||
                (q.isEliminated &&
                  Number(q.placements[q.placements.length - 1]?.episodeNumber) ===
                  Number(ep.episodeNumber)))
          )
        );
      }


      return {
        episode: ep,
        queen1: bottoms[0],
        queen2: bottoms[1],
        eliminated: eliminated,
        winner: winner
      };
    })
    .filter(Boolean);

  console.log(lipsyncs);
  return (
    <Table className="p-6 mr-10 bg-white rounded-md shadow-lg border border-gray-200 w-full overflow-auto">
      <TableCaption className="text-purple-900 font-semibold text-sm tracking-wide py-3 px-4 border-b border-purple-200 text-center">
        Season Lipsyncs
      </TableCaption>
      <TableHeader className="bg-gradient-to-r from-purple-100 to-purple-50">
        <TableRow>
          <TableHead className="text-center py-2 px-4 border-b">Episode</TableHead>
          <TableHead className="text-center py-2 px-4 border-b">Song</TableHead>
          {isClassicAllStars ? (
            <>
              <TableHead className="text-center py-2 px-4 border-b">Top 2</TableHead>
              <TableHead className="text-center py-2 px-4 border-b">Winner</TableHead>
              <TableHead className="text-center py-2 px-4 border-b">Eliminated</TableHead>
            </>
          ) : (
            <>
              <TableHead className="text-center py-2 px-4 border-b">Bottom 2</TableHead>
              <TableHead className="text-center py-2 px-4 border-b">Eliminated</TableHead>
            </>
          )
          }
        </TableRow>
      </TableHeader>
      <TableBody>
        {lipsyncs.map((ls: any, i: number) => (
          <TableRow key={i} className="hover:bg-purple-50 transition-colors">
            <TableCell className="text-center py-3 px-2 font-medium">
              EP{ls.episode.episodeNumber}: {ls.episode.title}
            </TableCell>

            <TableCell className="text-center py-3 px-2 font-medium text-purple-700">
              {(() => {
                const lipsync = lipsyncNames.find(
                  (l) => Number(l.order) === Number(i) && l.lsftcRound != 1 && l.lsftcRound != 2 && l.lsftcRound != 3
                )?.lipsync;
                return lipsync
                  ? `${lipsync.title} – ${lipsync.artist}`
                  : "No Lipsync Assigned";
              })()}
            </TableCell>

            <TableCell className="text-center py-3 px-2 flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-300 shadow-sm">
                  <Image
                    src={ls.queen1.url || "/placeholder.png"}
                    alt={ls.queen1.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="mt-1 font-medium">{ls.queen1.name}</span>
              </div>

              <span className="mx-2 font-bold text-purple-500">vs</span>

              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-300 shadow-sm">
                  <Image
                    src={ls.queen2.url || "/placeholder.png"}
                    alt={ls.queen2.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="mt-1 font-medium">{ls.queen2.name}</span>
              </div>
            </TableCell>

            <TableCell className="text-center py-3 px-2">
              {isClassicAllStars ? (
                ls.winner ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-green-400 shadow-sm">
                      <Image
                        src={ls.winner.url || "/placeholder.png"}
                        alt={ls.winner.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <span className="mt-1 font-semibold">
                      {ls.winner.name}
                    </span>
                  </div>
                ) : (
                  "—"
                )
              ) : (
                ls.eliminated ? (
                  <div className="flex flex-col items-center">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-400 shadow-sm grayscale">
                      <Image
                        src={ls.eliminated.url || "/placeholder.png"}
                        alt={ls.eliminated.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <span className="mt-1 line-through font-semibold text-red-600">
                      {ls.eliminated.name}
                    </span>
                  </div>
                ) : (
                  "—"
                )
              )}
            </TableCell>

            {
              isClassicAllStars && (
                <TableCell className="text-center py-3 px-2">
                  {ls.eliminated ? (
                    <div className="flex flex-col items-center">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-400 shadow-sm grayscale">
                        <Image
                          src={ls.eliminated.url || "/placeholder.png"}
                          alt={ls.eliminated.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <span className="mt-1 line-through font-semibold text-red-600">
                        {ls.eliminated.name}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )
                  }
                </TableCell>
              )
            }

          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SeasonTrackRecordLipsyncs;
