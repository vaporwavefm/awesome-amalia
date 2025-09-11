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

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown } from '@fortawesome/free-solid-svg-icons';

type Queen = {
    id: string;
    name: string;
    placements: { episodeNumber: number | string; placement: string }[];
    wins: number;
    highs: number;
    lows: number;
    bottoms: number;
    isEliminated: boolean;
};

type SeasonTrackRecordTableProps = {
    queens: Queen[];
    episodes: { episodeNumber: number | string; title: string; id?: string }[];
};

const SeasonTrackRecordTable = ({ queens, episodes }: SeasonTrackRecordTableProps) => {

    const finaleEpNum = Math.max(...episodes.map(ep => Number(ep.episodeNumber)));

    const getPlacement = (queen: Queen, episodeNumber: number | string) => {

        const p = queen.placements.find(pl => Number(pl.episodeNumber) === Number(episodeNumber));
        const epNum = Number(episodeNumber);

        if (epNum === finaleEpNum) {
            if (!queen.isEliminated) {
                if (p?.placement === "win") {
                    return "WINNER";
                }
                return "RUNNER-UP";
            }
        }

        if (!p) return " ";

        const lastPlacement = queen.placements.at(-1);
        if (
            queen.isEliminated &&
            lastPlacement &&
            Number(lastPlacement.episodeNumber) === Number(episodeNumber)
        ) {
            return "OUT";
        }

        switch (p.placement) {
            case "win": return "WIN";
            case "high": return "HIGH";
            case "safe": return "SAFE";
            case "low": return "LOW";
            case "bottom": return "BTM2";
            case "eliminated": return "OUT"; // fallback message ?
            case "finale": return "WINNER";
            default: return p.placement;
        }
    };

    const sortedQueens = [...queens].sort((a, b) => { // sort queen rows to show from winner/runnerups/and then elimination order
        const aLast = a.placements.at(-1);
        const bLast = b.placements.at(-1);

        console.log(a.name + ' ' + JSON.stringify(a.placements));
        // Determine final status
        const aFinal = !a.isEliminated && Number(aLast?.episodeNumber) === finaleEpNum ? aLast?.placement : null;
        const bFinal = !b.isEliminated && Number(bLast?.episodeNumber) === finaleEpNum ? bLast?.placement : null;

        if (aFinal === "win") return -1; // Winner first
        if (bFinal === "win") return 1;

        if (!a.isEliminated && aFinal !== "win") return -1; // Runner-ups next
        if (!b.isEliminated && bFinal !== "win") return 1;

        // Get last "bottom" episode
    const aLastBottomEp = Math.max(
  ...a.placements.filter(p => p.placement === "bottom").map(p => Number(p.episodeNumber))
) || 0;

    const bLastBottomEp = Math.max(
        ...b.placements.filter(p => p.placement === "bottom").map(p => Number(p.episodeNumber))
    ) || 0;

    // Sort: later "bottom" comes first
    if (aLastBottomEp !== bLastBottomEp) return bLastBottomEp - aLastBottomEp;

    // Fallback: sort by elimination episode
    const aElimEp = a.isEliminated ? Number(aLast?.episodeNumber) : finaleEpNum;
    const bElimEp = b.isEliminated ? Number(bLast?.episodeNumber) : finaleEpNum;

    return bElimEp - aElimEp;
    });

    const maxWins = Math.max(...queens.map(q => q.wins)); // for mario party-esque stats
    const maxHighs = Math.max(...queens.map(q => q.highs));
    const maxLows = Math.max(...queens.map(q => q.lows));
    const maxBottoms = Math.max(...queens.map(q => q.bottoms));

    return (
        <div className="p-6 mr-6 bg-white rounded-l shadow-md w-full overflow-auto">
            <Table>
                <TableCaption>Contestant Progess</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Queen</TableHead>
                        {episodes.map(ep => (
                            <TableHead
                                key={ep.id}
                                className="text-center px-2 h-20 align-top"
                            >
                                <div className="whitespace-normal break-words h-full flex flex-col justify-center">
                                    <span className="font-bold block">EP{ep.episodeNumber}</span>
                                    {/*<span className="block text-sm">{ep.title}</span>*/}
                                </div>
                            </TableHead>
                        ))}
                        <TableHead className="text-center">Wins</TableHead>
                        <TableHead className="text-center">Highs</TableHead>
                        <TableHead className="text-center">Lows</TableHead>
                        <TableHead className="text-center">Bottoms</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {sortedQueens.map(q => {
                        const elimPlacement = q.isEliminated ? q.placements.at(-1) : null;
                        const elimEpNum = elimPlacement ? Number(elimPlacement.episodeNumber) : null;

                        return (
                            <TableRow key={q.id} className="border-t">
                                <TableCell className="font-medium">
                                    {q.name}
                                    {
                                        /*
                                        <div className="flex flex-col items-center">
                                                <div className="relative w-12 h-12">
                                                  <Image
                                                    src={q.url || "/placeholder.png"}
                                                    alt={q.name}
                                                    fill
                                                    className={`rounded-full border-2 border-purple-300 object-cover grayscale
                                                    }`}
                                                  />
                                                </div>
                                                <span className="line-through">{q.name}</span>
                                              </div>
                                        */
                                    }
                                </TableCell>

                                {episodes.map(ep => {
                                    const placement = getPlacement(q, ep.episodeNumber);
                                    const epNum = Number(ep.episodeNumber);

                                    const isElimEp = elimEpNum !== null && epNum === elimEpNum;
                                    const isAfterElim = elimEpNum !== null && epNum > elimEpNum;

                                    return (
                                        <TableCell
                                            key={ep.id}
                                            className={`text-center 
                                                ${isElimEp
                                                    ? "bg-red-400 font-bold text-black-700" // highlight elimination episode
                                                    : isAfterElim
                                                        ? "text-gray-400 bg-gray-200 italic" // grey out after elimination
                                                        : ""
                                                } 
                                                ${placement == 'HIGH' ? "bg-sky-300 text-black-200" : ''}
                                                ${placement == 'WIN' ? "bg-blue-400 text-black-200" : ''}
                                                ${placement == 'LOW' ? "bg-pink-200 text-black-200" : ''}
                                                ${placement == 'BTM2' ? "bg-red-300 text-black-200" : ''}
                                                ${placement === "WINNER" ? "sparkle-gold" : ""}
                                                ${placement === "RUNNER-UP" ? "bg-green-200 text-black font-medium" : ""}
                                                `}
                                        >
                                            {placement}
                                        </TableCell>
                                    );
                                })}

                                <TableCell className={`text-center" 
                                ${q.wins === maxWins ? "ml-1 bg-yellow-200 font-bold" : ''}
                                    `}>
                                    {q.wins} {q.wins === maxWins && <FontAwesomeIcon icon={faCrown} />}
                                </TableCell>

                                <TableCell className={`text-center" 
                                ${q.highs === maxHighs ? "ml-1 bg-yellow-200 font-bold" : ''}
                                    `}>
                                    {q.highs} {q.highs === maxHighs && <FontAwesomeIcon icon={faCrown} />}
                                </TableCell>

                                <TableCell className={`text-center" 
                                ${q.lows === maxLows ? "ml-1 bg-yellow-200 font-bold" : ''}
                                    `}>
                                    {q.lows} {q.lows === maxLows && <FontAwesomeIcon icon={faCrown} />}
                                </TableCell>

                                <TableCell className={`text-center" 
                                ${q.bottoms === maxBottoms ? "ml-1 bg-yellow-200 font-bold" : ''}
                                    `}>
                                    {q.bottoms} {q.bottoms === maxBottoms && <FontAwesomeIcon icon={faCrown} />}
                                </TableCell>

                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
};

export default SeasonTrackRecordTable;
