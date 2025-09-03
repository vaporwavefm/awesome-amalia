'use client';
import React from "react";

const EpisodeList = ({
    episodes,
    onEpisodeClick,
    onEpisodeEventClick,
    episodeHistory,
    initialTrackRecord
}: {
    episodes: any[];
    onEpisodeClick: (epNum: number) => void;
    onEpisodeEventClick: (epNum: number, eventType: string, nonElimination: boolean) => void;
    episodeHistory: { pre: { [key: number]: any[] }, post: { [key: number]: any[] } };
    initialTrackRecord: any[];
}) => {
    return (
        <div className="space-y-2 mt-4">
            {episodes.map((ep) => {
                // Use post-episode snapshot to detect safe queens
                const queensSnapshot = episodeHistory.post[ep.episodeNumber] || initialTrackRecord;

                const hasSafeQueens = queensSnapshot.some(q => {
                    const placement = q.placements?.find(
                        p => Number(p.episodeNumber) === Number(ep.episodeNumber)
                    );
                    return placement?.placement === "safe";
                });

                const isFinale = ep.title?.toLowerCase().includes("finale");
                return (
                    <div
                        key={ep.episodeNumber}
                        className="p-1 border rounded cursor-pointer hover:bg-gray-100"
                        onClick={() => onEpisodeClick(ep.episodeNumber)}
                    >
                        {/* Episode header */}
                        <div className="font-bold text-sm mb-1">
                            Episode {ep.episodeNumber}:{" "}
                            <span className="font-normal">{ep.title}</span>
                        </div>

                        {/* Quick links to results */}
                        <div className="flex flex-wrap gap-1 text-xs">
                            {isFinale ? (
                                <button
                                    className="px-2 py-1 rounded bg-blue-500 text-white"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEpisodeEventClick(ep.episodeNumber, "winner", ep.nonElimination || '');
                                    }}
                                >
                                    Winner
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="px-1 py-0.5 rounded bg-blue-100"
                                        onClick={(e) => { e.stopPropagation(); onEpisodeEventClick(ep.episodeNumber, "winner", ep.nonElimination || ''); }}
                                    >
                                        Winner
                                    </button>
                                    <button
                                        className="px-1 py-0.5 rounded bg-yellow-100"
                                        onClick={(e) => { e.stopPropagation(); onEpisodeEventClick(ep.episodeNumber, "high", ep.nonElimination || ''); }}
                                    >
                                        High
                                    </button>
                                    {hasSafeQueens && (
                                        <button
                                            className="px-1 py-0.5 rounded bg-gray-100"
                                            onClick={(e) => { e.stopPropagation(); onEpisodeEventClick(ep.episodeNumber, "announceSafe", ep.nonElimination || ''); }}
                                        >
                                            Safe
                                        </button>
                                    )}
                                    <button
                                        className="px-1 py-0.5 rounded bg-red-100"
                                        onClick={(e) => { e.stopPropagation(); onEpisodeEventClick(ep.episodeNumber, "bottom", ep.nonElimination || ''); }}
                                    >
                                        Bottom
                                    </button>
                                    <button
                                        className="px-1 py-0.5 rounded bg-red-300"
                                        onClick={(e) => { e.stopPropagation(); onEpisodeEventClick(ep.episodeNumber, "bottom2", ep.nonElimination || ''); }}
                                    >
                                        Bottom 2
                                    </button>
                                    <button
                                        className="px-2 py-1 rounded bg-red-500 text-white"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEpisodeEventClick(ep.episodeNumber, "eliminated", ep.nonElimination || '');
                                        }}
                                    >
                                        Elimination
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default EpisodeList;
