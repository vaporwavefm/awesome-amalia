/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";

const EpisodeList = ({
  episodes,
  onEpisodeClick,
  onEpisodeEventClick,
  episodeHistory,
  initialTrackRecord,
}: {
  episodes: any[];
  onEpisodeClick: (epNum: number) => void;
  onEpisodeEventClick: (epNum: number, eventType: string, nonElimination: boolean) => void;
  episodeHistory: { pre: { [key: number]: any[] }; post: { [key: number]: any[] } };
  initialTrackRecord: any[];
}) => {
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(0);

  // helper to update selected + fire event
  const handleEventClick = (
    e: React.MouseEvent,
    epNum: number,
    eventType: string,
    nonElimination: boolean
  ) => {
    e.stopPropagation();
    setSelectedEpisode(epNum);
    onEpisodeEventClick(epNum, eventType, nonElimination);
  };

  return (
    <div className="max-h-[calc(100vh-100px)] overflow-y-auto space-y-2 pr-2 pl-2 pb-2 pt-2">
      <div
        onClick={() => {
          setSelectedEpisode(0);
          onEpisodeClick(0);
        }}
        className={`p-5 rounded-2xl border bg-gradient-to-r from-pink-300 to-purple-300 
          shadow-md hover:shadow-lg transition cursor-pointer text-center
          ${selectedEpisode === 0 ? "ring-4 ring-purple-500" : ""}`}
      >
        <h2 className="font-extrabold text-lg text-purple-800">Start Your Engines!</h2>
        <p className="text-sm text-gray-700 mt-1 font-bold">
          Click here or any card to see the season progress!
        </p>
      </div>

      {/* Episode cards */}
      {episodes.map((ep) => {
        const queensSnapshot = episodeHistory.post[ep.episodeNumber] || initialTrackRecord;

        const hasSafeQueens = queensSnapshot.some((q) => {
          const placement = q.placements?.find(
            (p: { episodeNumber: string | number; placement: string }) =>
              Number(p.episodeNumber) === Number(ep.episodeNumber)
          );
          return placement?.placement === "safe";
        });

        const isFinale = ep.title?.toLowerCase().includes("finale");

        return (
          <div
            key={ep.id}
            className={`p-4 rounded-2xl border bg-gradient-to-br from-pink-100 to-purple-100 
              shadow-sm hover:shadow-md transition cursor-pointer
              ${selectedEpisode === ep.episodeNumber ? "ring-4 ring-pink-400" : ""}`}
            onClick={() => {
              setSelectedEpisode(ep.episodeNumber);
              onEpisodeClick(ep.episodeNumber);
            }}
          >
            <div className="font-semibold text-md">
              Episode {ep.episodeNumber}: <span className="font-normal">{ep.title}</span>
            </div>

            <div className="flex flex-wrap gap-1 text-xs mt-2">
              {isFinale ? (
                <>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-blue-600 hover:bg-blue-700 transition text-white"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "winner", ep.nonElimination || "")}
                  >
                    Winner
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-gray-700 hover:bg-gray-800 transition text-white"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "results", false)}
                  >
                    Show Results
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-blue-200 hover:bg-blue-400 transition"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "winner", ep.nonElimination || "")}
                  >
                    Winner
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-blue-100 hover:bg-blue-200 transition"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "high", ep.nonElimination || "")}
                  >
                    High
                  </button>
                  {hasSafeQueens && (
                    <button
                      className="px-3 py-1 text-xs rounded-full bg-gray-200 hover:bg-gray-300 transition"
                      onClick={(e) => handleEventClick(e, ep.episodeNumber, "announceSafe", ep.nonElimination || "")}
                    >
                      Safe
                    </button>
                  )}
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-red-200 hover:bg-red-300 transition"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "bottom", ep.nonElimination || "")}
                  >
                    Bottom
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-red-300 hover:bg-red-400 transition"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "bottom2", ep.nonElimination || "")}
                  >
                    Bottom 2
                  </button>
                  <button
                    className="px-3 py-1 text-xs rounded-full bg-red-600 hover:bg-red-800 transition text-white"
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, "eliminated", ep.nonElimination || "")}
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
