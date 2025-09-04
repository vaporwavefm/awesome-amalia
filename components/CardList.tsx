'use client';
import React from "react";
import QueenCard from "./QueenCard";

type Queen = {
    id: string;
    name: string;
    url: string;
    wins: number;
    highs: number;
    lows: number;
    bottoms: number;
    isEliminated: boolean;
    scores: { episodeNumber: string | number; score: number }[];
    placements: any;
};

const CardList = ({
    queens,
    episodeType,
    viewMode,
    nonElimination,
    showResults
}: {
    queens: Queen[];
    episodeType?: string;
    viewMode?: string;
    nonElimination?: boolean;
    showResults?: boolean;
}) => {
    const maxWins = Math.max(...queens.map(q => q.wins));
    let filteredQueens = queens;
    const normalizedType = episodeType?.toLowerCase() || "";
    const isFullCastView = !episodeType;
    const isEventView = !!episodeType;
    const isRegularEpisodeView = !isEventView;
    /*
    
    // Determine view type
// Filter queens based on event type
    if (normalizedType.includes("finale")) {
        filteredQueens = queens.filter(q => q.wins === maxWins);
    } else if (normalizedType.includes("eliminated")) {
        filteredQueens = queens.filter(q => q.isEliminated);
    } else if (normalizedType.includes("bottom 2") || normalizedType.includes("bottom")) {
        filteredQueens = queens.filter(q =>
            q.placements.some(
                (p: any) =>
                    p.placement === "bottom" &&
                    p.episodeNumber === q.scores.at(-1)?.episodeNumber
            )
        );
    } else if (normalizedType.includes("high")) {
        filteredQueens = queens.filter(q =>
            q.placements.some(
                (p: any) =>
                    p.placement === "high" &&
                    p.episodeNumber === q.scores.at(-1)?.episodeNumber
            )
        );
    } else if (normalizedType.includes("safe")) {
        filteredQueens = queens.filter(q =>
            q.placements.some(
                (p: any) =>
                    p.placement === "safe" &&
                    p.episodeNumber === q.scores.at(-1)?.episodeNumber
            )
        );
    } else if (normalizedType.includes("win")) {
        filteredQueens = queens.filter(q =>
            q.placements.some(
                (p: any) =>
                    p.placement === "win" &&
                    p.episodeNumber === q.scores.at(-1)?.episodeNumber
            )
        );
    }

    // Apply non-elimination adjustment
    if (nonElimination && normalizedType.includes("bottom 2")) {
        
        // Only show Bottom 2 queens in a non-elimination episode
        filteredQueens = filteredQueens.filter(q =>
            q.placements.some(
                (p: any) =>
                    p.placement === "bottom" &&
                    p.episodeNumber === q.scores.at(-1)?.episodeNumber
            )
        );
    }
    */

    const resultsTable = (
        <div className="p-4 bg-white rounded-xl shadow-md col-span-full w-full">
            <h3 className="text-lg font-bold mb-2 text-center">Season Results</h3>
            <table className="table-auto w-full text-sm border-collapse">
                <thead>
                    <tr className="border-b">
                        <th className="px-2 py-1 text-left">Queen</th>
                        <th className="px-2 py-1">Wins</th>
                        <th className="px-2 py-1">Highs</th>
                        <th className="px-2 py-1">Lows</th>
                        <th className="px-2 py-1">Bottoms</th>
                        <th className="px-2 py-1">Eliminated</th>
                    </tr>
                </thead>
                <tbody>
                    {queens.map(q => (
                        <tr key={q.id} className="border-t">
                            <td className="px-2 py-1 font-medium">{q.name}</td>
                            <td className="px-2 py-1 text-center">{q.wins}</td>
                            <td className="px-2 py-1 text-center">{q.highs}</td>
                            <td className="px-2 py-1 text-center">{q.lows}</td>
                            <td className="px-2 py-1 text-center">{q.bottoms}</td>
                            <td className="px-2 py-1 text-center">
                                {q.isEliminated ? "❌" : "✅"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="flex flex-wrap justify-center gap-6">
            {filteredQueens.map((queen) => (
                <div
                    key={queen.id}
                    className={`transition duration-300 inline-flex max-w-xs justify-center 
                        ${queen.isEliminated && (viewMode === 'eliminated' || viewMode == null) ? "opacity-40 grayscale" : ""}`}
                >
                    <QueenCard
                        q={queen}
                        maxWins={maxWins}
                        viewMode={viewMode}
                    />
                </div>
            ))}

            {/* Add results card at the end */}
            {showResults && resultsTable}
        </div>
    );
};

export default CardList;
