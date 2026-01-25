/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";

type CloseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  closeSheet?: () => void;
};

const CloseButton = ({ closeSheet, onClick, ...props }: CloseButtonProps) => {
  return (
    <button
      {...props}
      onClick={(e) => {
        onClick?.(e);
        closeSheet?.();
      }}
    />
  );
};

const EpisodeList = ({
  episodes,
  onEpisodeClick,
  onEpisodeEventClick,
  episodeHistory,
  initialTrackRecord,
  seasonStyle,
  seasonFlow,
  closeSheet,
  selectedEpisode,
  setSelectedEpisode,
}: {
  episodes: any[];
  onEpisodeClick: (epNum: number) => void;
  onEpisodeEventClick: (epNum: number, eventType: string, nonElimination: boolean) => void;
  episodeHistory: { pre: { [key: number]: any[] }; post: { [key: number]: any[] } };
  initialTrackRecord: any[];
  seasonStyle: string;
  seasonFlow?: string;
  closeSheet?: () => void;
  selectedEpisode: number | null;
  setSelectedEpisode: React.Dispatch<React.SetStateAction<number | null>>;
}) => {
  const handleEventClick = (
    e: React.MouseEvent,
    epNum: number,
    eventType: string,
    nonElimination: boolean
  ) => {
    e.stopPropagation();
    setSelectedEpisode(epNum);
    onEpisodeEventClick(epNum, eventType, nonElimination);
    closeSheet?.();
  };

  const handleCardClick = (epNum: number) => {
    setSelectedEpisode(epNum);
    onEpisodeClick(epNum);
    closeSheet?.();
  };

  // Generate event order per episode
  const eventOrderByEpisode = episodes.map((ep) => {
    const type = ep.type?.toLowerCase() ?? "";
    const isFinale = type.includes("finale");
    const isSmackdown = type.includes("lipsyncsmackdown");

    const queensSnapshot = episodeHistory.post[ep.episodeNumber] || initialTrackRecord;

    const hasLowQueens = queensSnapshot.some((q) =>
      q.placements?.some((p: any) => Number(p.episodeNumber) === Number(ep.episodeNumber) && p.placement === "low")
    );

    const hasSafeQueens = queensSnapshot.some((q) =>
      q.placements?.some((p: any) => Number(p.episodeNumber) === Number(ep.episodeNumber) && p.placement === "safe")
    );

    const hasHighQueens = queensSnapshot.some((q) =>
      q.placements?.some((p: any) => Number(p.episodeNumber) === Number(ep.episodeNumber) && p.placement === "high")
    );

    if (isFinale) {
      return seasonStyle === "lsftc"
        ? ["lsftc1", "lsftc1win", "lsftc2", "lsftc2win", "lsftcFinal", "winner", "results"]
        : ["winner", "results"];
    }

    if (isSmackdown) {
      return ["lipsyncsmackdown", "untucked", "bottom2", "eliminated"];
    }

    const events: string[] = [];
    if (hasSafeQueens) events.push("announceSafe");

    if (seasonFlow === "ttwalas") {
      if (hasHighQueens) events.push("high");
      events.push("top2");
      if (hasLowQueens) events.push("bottom");
      events.push("bottomASRecap", "untucked", "top2lipsync", "winner");
    } else {
      events.push("untucked");
      if (hasHighQueens) events.push("high");
      events.push("winner");
      if (hasLowQueens) events.push("bottom");
    }

    events.push("bottom2", "eliminated");
    return events;
  });

  return (
    <div className="max-h-[calc(100vh-100px)] overflow-y-auto space-y-2 pr-2 pl-2 pb-2 pt-2">
      <div
        onClick={() => {
          setSelectedEpisode(0);
          onEpisodeClick(0);
          handleCardClick(0);
        }}
        className={`p-6 rounded-xl border border-gray-200
          bg-gradient-to-r from-purple-100 via-purple-50 to-indigo-100
          shadow-lg hover:shadow-2xl transform hover:scale-102
          transition-all duration-300 cursor-pointer text-center
          ${selectedEpisode === 0 ? "ring-4 ring-purple-400" : ""}`}
      >
        <h2 className="font-bold text-2xl text-purple-600 mb-2">Start Your Engines!</h2>
        <p className="text-sm text-gray-700 font-semibold">
          Click here or any card to see the season progress!
        </p>
      </div>

      {episodes.map((ep, index) => {
        const events = eventOrderByEpisode[index];
        return (
          <div
            key={ep.id}
            className={`p-5 rounded-xl border border-gray-200
              bg-gradient-to-br from-purple-50 via-purple-100 to-indigo-50
              shadow-md hover:shadow-lg transform hover:scale-102
              transition-all duration-300 cursor-pointer
              ${selectedEpisode === ep.episodeNumber ? "ring-4 ring-purple-400" : ""}`}
            onClick={() => {
              setSelectedEpisode(ep.episodeNumber);
              onEpisodeClick(ep.episodeNumber);
              handleCardClick(ep.episodeNumber);
            }}
          >
            <div className="font-semibold text-md">
              Episode {ep.episodeNumber}: <span className="font-normal">{ep.title}</span>
            </div>

            <div className="flex flex-wrap gap-1 text-xs mt-2">
              {events.map((eventType) => {
                let buttonClass = "px-3 py-1 text-xs rounded-full transition";
                let buttonLabel = eventType;

                const isFinale = ep.type?.toLowerCase().includes("finale");
                // Style by event
                switch (eventType) {
                  case "announceSafe":
                    buttonClass += " bg-gray-200 hover:bg-gray-300";
                    buttonLabel = "Safe";
                    break;
                  case "untucked":
                    buttonClass += " bg-emerald-100 hover:bg-emerald-200";
                    buttonLabel = "Untucked";
                    break;
                  case "high":
                    buttonClass += " bg-blue-100 hover:bg-blue-200";
                    buttonLabel = "High";
                    break;
                  case "top2":
                    buttonClass += " bg-yellow-200 hover:bg-yellow-300";
                    buttonLabel = "Top 2";
                    break;
                  case "top2lipsync":
                    buttonClass += " bg-blue-200 hover:bg-blue-300";
                    buttonLabel = "Top 2 Lipsync";
                    break;
                  case "bottomASRecap":
                    buttonClass += " bg-red-200 hover:bg-red-300";
                    buttonLabel = "Bottom Queens";
                    break;
                  case "winner":
                    if (isFinale) {
                      buttonClass += 'px-3 py-1 text-xs rounded-full sparkle-gold transition text-white';
                    } else
                      buttonClass += " bg-blue-300 hover:bg-blue-500";
                    buttonLabel = "Winner";
                    break;
                  case "bottom":
                    buttonClass += " bg-red-200 hover:bg-red-300";
                    buttonLabel = "Low";
                    break;
                  case "bottom2":
                    buttonClass += " bg-red-300 hover:bg-red-400";
                    buttonLabel = "Bottom 2";
                    break;
                  case "eliminated":
                    buttonClass += " bg-red-600 hover:bg-red-800 text-white";
                    buttonLabel = "Elimination";
                    break;
                  case "lipsyncsmackdown":
                    buttonClass += " bg-purple-500 hover:bg-purple-600 text-white";
                    buttonLabel = "Smackdown";
                    break;
                  case "lsftc1":
                    buttonClass += " bg-purple-500 hover:bg-purple-600 text-white";
                    buttonLabel = "Round 1";
                    break;
                  case "lsftc2":
                    buttonClass += " bg-purple-500 hover:bg-purple-600 text-white";
                    buttonLabel = "Round 2";
                    break;
                  case "lsftcFinal":
                    buttonClass += " bg-red-700 hover:bg-red-800 transition text-white";
                    buttonLabel = "Final Lipsync";
                    break;
                  case "lsftc1win":
                    buttonClass += " bg-purple-500 hover:bg-purple-600 text-white";
                    buttonLabel = "Round 1 Results";
                    break;
                  case "lsftc2win":
                    buttonClass += " bg-purple-500 hover:bg-purple-600 text-white";
                    buttonLabel = "Round 2 Results";
                    break;
                  case "results":
                    buttonClass += " bg-gray-700 hover:bg-gray-800 text-white";
                    buttonLabel = "Show Results";
                    break;
                }

                return (
                  <button
                    key={eventType}
                    className={buttonClass}
                    onClick={(e) => handleEventClick(e, ep.episodeNumber, eventType, ep.nonElimination || false)}
                  >
                    {buttonLabel}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EpisodeList;
