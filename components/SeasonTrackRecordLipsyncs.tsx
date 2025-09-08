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
  placement: string; // "bottom" | "eliminated" | ...
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
  id: string;
  title: string;
  episode: string;
  artist: string;
};

type SeasonTrackRecordTableProps = {
  queens: Queen[];
  episodes: Episode[];
  lipsyncNames: Lipsync[];
};

const SeasonTrackRecordLipsyncs = ({ queens, episodes, lipsyncNames }: SeasonTrackRecordTableProps) => {
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
    <Table>
      <TableCaption>Season Lipsyncs (Bottom 2 + Eliminations)</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">Episode</TableHead>
          <TableHead className="text-center">Song</TableHead>
          <TableHead className="text-center">Bottom 2</TableHead>    
          <TableHead className="text-center">Eliminated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lipsyncs.map((ls: any, i: number) => (
          <TableRow key={i}>
            <TableCell className="font-medium text-center">
              EP{ls.episode.episodeNumber}: {ls.episode.title}
            </TableCell>

            <TableCell className="font-medium text-center">
              {lipsyncNames[i]?.title} – {lipsyncNames[i]?.artist}
            </TableCell>

            <TableCell className="text-center flex items-center justify-center gap-4">
              {/* Queen 1 */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12">
                  <Image
                    src={ls.queen1.url || "/placeholder.png"}
                    alt={ls.queen1.name}
                    fill
                    className={`rounded-full border-2 border-purple-300 object-cover`}
                  />
                </div>
                <span>{ls.queen1.name}</span>
              </div>

              <span className="mx-2 font-bold">vs</span>

              {/* Queen 2 */}
              <div className="flex flex-col items-center">
                <div className="relative w-12 h-12">
                  <Image
                    src={ls.queen2.url || "/placeholder.png"}
                    alt={ls.queen2.name}
                    fill
                    className={`rounded-full border-2 border-purple-300 object-cover
                    }`}
                  />
                </div>
                <span>{ls.queen2.name}</span>
              </div>
            </TableCell>

            <TableCell className="text-center text-red-600 font-semibold">
              {ls.eliminated ? (

                <div className="flex flex-col items-center">
                <div className="relative w-12 h-12">
                  <Image
                    src={ls.eliminated.url || "/placeholder.png"}
                    alt={ls.eliminated.name}
                    fill
                    className={`rounded-full border-2 border-purple-300 object-cover grayscale
                    }`}
                  />
                </div>
                <span className="line-through">{ls.eliminated.name}</span>
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
