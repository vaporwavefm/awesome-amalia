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
    nonElimination
}: {
    queens: Queen[];
    episodeType?: string;
    nonElimination?: boolean;
}) => {
    const maxWins = Math.max(...queens.map(q => q.wins));
    let filteredQueens = queens;

    const normalizedType = episodeType?.toLowerCase() || "";

    // Determine view type
    const isFullCastView = !episodeType;
    const isEventView = !!episodeType;

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

    return (
        <div
            className={`${isFullCastView
                ? "grid grid-cols-4 gap-4 justify-items-center"
                : "flex flex-wrap justify-center gap-6"
                }`}
        >
            {filteredQueens.map((queen) => (
                <div
                    key={queen.id}
                    className={`transition duration-300 ${isEventView
                        ? "inline-flex max-w-xs justify-center"
                        : "flex-1 min-w-[0] basis-[calc(25%-1rem)]"
                        } ${queen.isEliminated ? "opacity-40 grayscale" : ""}`}
                >
                    <QueenCard
                        q={queen}
                        maxWins={maxWins}
                        isBottom={["bottom", "bottom2"].includes(normalizedType)}
                    />
                </div>
            ))}
        </div>
    );
};

export default CardList;
