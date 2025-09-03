'use client';
import React, { useMemo, useState, useEffect } from "react";
import CardList from "./CardList";
import { mainChallenge } from "@/lib/utils";
import EpisodeList from "./EpisodeList";

const SimLayout = ({ queens, episodes }: { queens: any[]; episodes: any[] }) => {
  const initialTrackRecord = useMemo(() => {
    return queens.map(q => ({
      ...q,
      placements: [],
      scores: [],
      wins: 0,
      bottoms: 0,
      highs: 0,
      lows: 0,
      isEliminated: false
    }));
  }, [queens]);

  const [episodeHistory, setEpisodeHistory] = useState<{ pre: { [key: number]: any[] }, post: { [key: number]: any[] } }>({ pre: {}, post: {} });
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodeEvent, setEpisodeEvent] = useState('');

  // Precompute all episode results
  useEffect(() => {
    let trackRecord = initialTrackRecord.map(q => ({ ...q }));
    let preHistory: { [key: number]: any[] } = {};
    let postHistory: { [key: number]: any[] } = {};

    const sortedEpisodes = episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    // Assign one random non-elimination episode
    const eligible = sortedEpisodes.filter(e => !e.title.toLowerCase().includes("finale"));
    if (eligible.length > 0) {
      const randomIndex =  Math.min(Math.floor(Math.random() * eligible.length), 9 );
      //if(randomIndex === 9 || randomIndex === 10) randomIndex = 8;
      sortedEpisodes[eligible[randomIndex].episodeNumber - 1].nonElimination = true;
    }

    for (let e of sortedEpisodes) {
      preHistory[e.episodeNumber] = trackRecord.map(q => ({ ...q, placements: [...q.placements], scores: [...q.scores] }));
      trackRecord = mainChallenge(trackRecord, e.episodeNumber, e.nonElimination);
      postHistory[e.episodeNumber] = trackRecord.map(q => ({ ...q, placements: [...q.placements], scores: [...q.scores] }));
    }

    setEpisodeHistory({ pre: preHistory, post: postHistory });
  }, [initialTrackRecord, episodes]);

  const handleEpisodeClick = (episodeNumber: number) => {
    setEpisodeEvent('');
    setSelectedEpisode(episodeNumber);
  };

  const handleEpisodeEventClick = (episodeNumber: number, eventType: string) => {
    setSelectedEpisode(episodeNumber);
    setEpisodeEvent(eventType);
  };

  const filteredQueens = selectedEpisode
    ? episodeEvent
      ? episodeHistory.post[selectedEpisode] || []
      : episodeHistory.pre[selectedEpisode] || []
    : initialTrackRecord;

  // Determine which queens to display
  const queensToDisplay = selectedEpisode
    ? filteredQueens.filter(q => {
      const placement = q.placements?.find(p => p.episodeNumber === selectedEpisode);
      const episode = episodes.find(e => e.episodeNumber === selectedEpisode);
      const isNonElim = episode?.nonElimination;

      switch (episodeEvent) {
        case 'announceSafe':
          return placement?.placement === 'safe';
        case 'winner':
          return placement?.placement === 'win';
        case 'high':
          return placement?.placement === 'high';
        case 'bottom':
          return placement?.placement === 'low' || placement?.placement === 'bottom';
        case 'bottom2':
          // Always show both queens in the bottom
          return placement?.placement === 'bottom';
        case 'eliminated':
          // If non-elimination, show both bottom 2 queens
          if (isNonElim) return placement?.placement === 'bottom';
          return q.isEliminated && placement?.placement === 'bottom';
        default:
          return true;
      }
    })
    : filteredQueens;

  // Event message generator
  const generateEventMessage = (queens: any[], event: string, episodeNumber: number) => {
    const names = queens.map(q => q.name);
    if (!names.length) return '';
    const last = names[names.length - 1];
    const others = names.slice(0, names.length - 1);
    const episode = episodes.find(e => e.episodeNumber === episodeNumber);
    const isNonElim = episode?.nonElimination;

    switch (event) {
      case 'announceSafe':
        return names.length === 1 ? `${names[0]} is declared safe.` : `${others.join(', ')}, and ${last} are declared safe.`;
      case 'winner':
        return names.length === 1
          ? `${names[0]} is declared the winner of this week's Maxi Challenge!`
          : `${others.join(', ')}, and ${last} are declared winners!`;
      case 'high':
        return names.length === 1 ? `${names[0]} has placed high.` : `${others.join(', ')}, and ${last} have placed high.`;
      case 'bottom':
        return names.length === 1 ? `${names[0]} has placed low.` : `${others.join(', ')}, and ${last} have placed low.`;
      case 'bottom2':
        return names.length === 1 ? `${names[0]} is up for elimination.` : `${others.join(', ')}, and ${last} are up for elimination.`;
      case 'eliminated':
        if (isNonElim) return 'Both queens have been given a chance to slay another day!';
        return names.length === 1 ? `${names[0]} sashayed away.` : `${others.join(', ')}, and ${last} sashayed away.`;

      default:
        return '';
    }
  };

  const eventMessage = selectedEpisode && episodeEvent
    ? generateEventMessage(queensToDisplay, episodeEvent, selectedEpisode)
    : '';

  const maxWins = Math.max(...queensToDisplay.map(q => q.wins));

  return (
    <div className="flex gap-2">
      <div className="w-1/4 p-4">
        <EpisodeList
          episodes={episodes}
          onEpisodeClick={handleEpisodeClick}
          onEpisodeEventClick={handleEpisodeEventClick}
          episodeHistory={episodeHistory}
          initialTrackRecord={initialTrackRecord}
        />
      </div>
      <div className="w-3/4">
        {episodeEvent ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="inline-block max-w-md bg-gradient-to-r from-pink-300 via-purple-200 to-pink-200 rounded-2xl shadow-xl py-4 px-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-2xl">
                <h2 className="font-extrabold text-2xl text-black tracking-wide drop-shadow-sm">
                  {episodeEvent === 'announceSafe' ? 'Safe Queens' :
                    episodeEvent === 'winner' ? 'Winner' :
                      episodeEvent === 'high' ? 'High Queens' :
                        episodeEvent === 'bottom' ? 'Bottom Queens' :
                          episodeEvent === 'bottom2' ? 'Bottom 2' :
                            episodeEvent === 'eliminated' ? 'Eliminated Queen' :
                              'Queens'}
                </h2>
                {eventMessage && <p className="mt-2 text-sm font-medium text-purple-800">{eventMessage}</p>}
              </div>
            </div>

            <CardList
              queens={queensToDisplay}
              episodeType={episodes.find(e => e.episodeNumber === selectedEpisode)?.type}
              nonElimination={episodes.find(e => e.episodeNumber === selectedEpisode)?.nonElimination || false}
            />
          </>
        ) : (
          <>
            {selectedEpisode && (
              <div className="m-6 p-6 bg-gradient-to-r from-purple-200 via-pink-100 to-purple-100 rounded-2xl shadow-lg border border-purple-300">
                <h2 className="font-extrabold text-2xl text-center text-purple-800 tracking-wide">
                  {episodes.find(e => e.episodeNumber === selectedEpisode)?.title}
                </h2>
                <p className="mt-4 text-md text-gray-800 text-center leading-relaxed">
                  {episodes.find(e => e.episodeNumber === selectedEpisode)?.description}
                </p>
              </div>
            )}

            <CardList queens={filteredQueens} />
          </>
        )}
      </div>
    </div>
  );
};

export default SimLayout;
