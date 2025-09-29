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
};

const SeasonTrackRecordLipsyncs = ({ queens, episodes, lipsyncNames }: Props) => {
  //console.log(lipsyncNames);
  const lipsyncs = episodes
    .map((ep) => {
      const bottoms = queens.filter((q) =>
        q.placements.some(
          (p) =>
            Number(p.episodeNumber) === Number(ep.episodeNumber) &&
            (p.placement === "bottom" || p.placement === "eliminated")
        )
      );

      if (bottoms.length < 2) return null;

      const eliminated = bottoms.find((q) =>
        q.placements.some(
          (p) =>
            Number(p.episodeNumber) === Number(ep.episodeNumber) &&
            (p.placement === "eliminated" ||
              (q.isEliminated &&
                Number(q.placements[q.placements.length - 1]?.episodeNumber) ===
                Number(ep.episodeNumber)))
        )
      );

      return {
        episode: ep,
        queen1: bottoms[0],
        queen2: bottoms[1],
        eliminated,
      };
    })
    .filter(Boolean);

  return (
    <Table className="table-auto border-collapse border border-gray-300 shadow-md">
      <TableCaption className="bg-purple-100 text-purple-900 font-semibold py-2 rounded-t-lg mb-2">
        Season Lipsyncs (Bottom 2 + Eliminations)
      </TableCaption>
      <TableHeader className="bg-gradient-to-r from-purple-100 to-purple-50">
        <TableRow>
          <TableHead className="text-center py-2 px-4 border-b">Episode</TableHead>
          <TableHead className="text-center py-2 px-4 border-b">Song</TableHead>
          <TableHead className="text-center py-2 px-4 border-b">Bottom 2</TableHead>
          <TableHead className="text-center py-2 px-4 border-b">Eliminated</TableHead>
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
                  (l) => Number(l.episodeNumber) === Number(i + 1)
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
                  <span className="mt-1 line-through font-semibold text-red-600">{ls.eliminated.name}</span>
                </div>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SeasonTrackRecordLipsyncs;
