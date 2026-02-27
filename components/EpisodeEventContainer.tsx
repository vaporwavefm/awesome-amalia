/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import QueenCard from "./QueenCard";

const EpisodeEventContainer = ({ relationshipChanges = [], queens = [], episodeNumber }: any,) => {

  const isPremiere = episodeNumber === 1 || episodeNumber === 2;

  if (!relationshipChanges || relationshipChanges.length === 0) {
    return (
      <div className="flex flex-col items-center ">
        <p className="italic font-bold">Everyone kept it cool this week and talked about their placements backstage! </p>
      </div>
    );
  }

  const getStorylineMessage = (change: any) => {
    const oldStrength = change.from?.strength ?? 0;
    const newStrength = change.to?.strength ?? 0;
    const diff = newStrength - oldStrength;
    const oldType = change.from?.type ?? "neutral";
    const newType = change.to?.type ?? "neutral";

    const targetQueen =
      queens.find(
        (q: any) =>
          String(q.id) === String(change.target) ||
          String(q.name) === String(change.target)
      )?.name || change.target;

    if (isPremiere) {

      const drasticStrengthChange = Math.abs(diff) >= 15;
      if (oldType !== newType) {
        return `${change.queen} and ${targetQueen} started to see each other differently.`;
      }
      if (drasticStrengthChange) {
        return `${change.queen} and ${targetQueen} had an unexpectedly strong first impression.`;
      }
      return "";
    }

    if (oldType !== newType)
      return `${change.queen} now sees ${targetQueen} as a ${newType}.`;

    if (newType === "friend") {
      if (diff > 10) return `${change.queen} feels much closer to ${targetQueen}.`;
      if (diff > 0) return `${change.queen} started warming up to ${targetQueen}.`;
      if (diff < -10) return `${change.queen} feels distant from ${targetQueen} now.`;
      if (diff < 0) return `${change.queen} felt slight tension with ${targetQueen}.`;
    }

    if (newType === "rival") {
      if (diff > 10) return `${change.queen} feels seriously threatened by ${targetQueen}.`;
      if (diff > 0) return `${change.queen} threw some light shade at ${targetQueen}.`;
      if (diff < 0) return `${change.queen} is cooling off about ${targetQueen}.`;
    }

    if (newType === "enemy") {
      if (diff > 10) return `${change.queen} wants ${targetQueen} gone.`;
      if (diff > 0) return `${change.queen} started disliking ${targetQueen} even more.`;
      if (diff < 0) return `${change.queen} attempted to make up with ${targetQueen}.`;
    }

    return "";
  };

  const seenDirectional = new Set<string>();
  const uniqueChanges = relationshipChanges.filter((c: any) => {
    const key = `${c.queen}->${c.target}`;
    if (seenDirectional.has(key)) return false;
    seenDirectional.add(key);
    return true;
  });

  const sortedChanges = [...uniqueChanges].sort((a, b) => {
    const diffA = Math.abs((a.to?.strength ?? 0) - (a.from?.strength ?? 0));
    const diffB = Math.abs((b.to?.strength ?? 0) - (b.from?.strength ?? 0));
    return diffB - diffA;
  });

  return (
    <div className="p-4 mb-4 pr-12 pl-12">
      <div className="flex flex-col gap-6">
        {sortedChanges.map((change: any, i: number) => {
          const message = getStorylineMessage(change);
          if (!message) return null;

          const queenA =
            queens.find(
              (q: any) =>
                String(q.id) === String(change.queen) ||
                String(q.name) === String(change.queen)
            ) || { name: change.queen };

          const queenB =
            queens.find(
              (q: any) =>
                String(q.id) === String(change.target) ||
                String(q.name) === String(change.target)
            ) || { name: change.target };

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-3 p-4" >
              <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 w-full">
                <div className="flex justify-center ">
                  <QueenCard q={queenA} viewMode="story" allQueens={queens} />
                </div>
                <div className="flex justify-center ">
                  <QueenCard q={queenB} viewMode="story" allQueens={queens} />
                </div>
              </div>
              <div className="text-center text-base text-gray-700 mt-3 max-w-md bg-gray-50 rounded-xl px-4 py-3 ">
                <p className="italic font-bold">{message}</p>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EpisodeEventContainer;
