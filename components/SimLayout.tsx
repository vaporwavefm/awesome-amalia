'use client';
import React, { useMemo, useState, useEffect } from "react";
import CardList from "./CardList";
import { mainChallenge } from "@/lib/utils";
import EpisodeList from "./EpisodeList";

type Placement = {
  episodeNumber: number | string;
  placement: string;
};

const SimLayout = ({ queens, episodes, lipsyncs }: { queens: any[]; episodes: any[]; lipsyncs: any[]}) => {
  const initialTrackRecord = useMemo(() => {
    return queens.map(q => ({
      ...q,
      placements: [],
      scores: [],
      wins: 0,
      bottoms: 0,
      highs: 0,
      lows: 0,
      isEliminated: false,
    }));
  }, [queens]);

  const [episodeHistory, setEpisodeHistory] = useState<{ pre: { [key: number]: any[] }, post: { [key: number]: any[] } }>({ pre: {}, post: {} });
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodeEvent, setEpisodeEvent] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Precompute all episode results
  useEffect(() => {
    let trackRecord = initialTrackRecord.map(q => ({ ...q }));
    let preHistory: { [key: number]: any[] } = {};
    let postHistory: { [key: number]: any[] } = {};

    const sortedEpisodes = episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    // Assign one random non-elimination episode
    const eligible = sortedEpisodes.filter(e => !e.title.toLowerCase().includes("finale"));
    if (eligible.length > 0) {
      const randomIndex = Math.min(Math.floor(Math.random() * eligible.length), 9);
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
    setShowResults(false); // reset show results
    setSelectedEpisode(episodeNumber);
  };

  const handleEpisodeEventClick = (episodeNumber: number, eventType: string) => {
    setSelectedEpisode(episodeNumber);

    if (eventType === "results") {
      setEpisodeEvent("results");   // <-- explicitly set it
      setShowResults(true);          // <-- force results view
      return;
    }

    setEpisodeEvent(eventType);
    setShowResults(false);
  };

  const filteredQueens = selectedEpisode
    ? episodeEvent
      ? episodeHistory.post[selectedEpisode] || []
      : episodeHistory.pre[selectedEpisode] || []
    : initialTrackRecord;

  // Determine which queens to display
  const queensToDisplay = selectedEpisode
    ? episodeEvent === "results"
      ? episodeHistory.post[selectedEpisode] || []
      : filteredQueens.filter(q => {
        const placement = (q.placements as Placement[])?.find(
  (p: Placement) => p.episodeNumber === selectedEpisode
);
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
            return placement?.placement === 'bottom';
          case 'eliminated':
            if (isNonElim) return placement?.placement === 'bottom';
            return placement?.placement === 'bottom';
          default:
            return true;
        }
      })
    : filteredQueens;

  // Event message generator
  const generateEventMessage = (queens: any[], event: string, episodeNumber: number) => {
    const names = queens.map(q => q.name);
    const isEliminated = queens.map(q => q.isEliminated);
    if (!names.length) return '';
    const last = names[names.length - 1];
    const others = names.slice(0, names.length - 1);
    const episode = episodes.find(e => e.episodeNumber === episodeNumber);
    const isNonElim = episode?.nonElimination;

    let btmMsg = '';
    if(event == 'eliminated'){
      if(isEliminated[0] == true && isEliminated[1] == false){
        btmMsg = names[1] + ', shantay you stay. ' + names[0] + ', sashay away.';
      }
      if(isEliminated[0] == false && isEliminated[1] == true){
        btmMsg = names[0] + ', shantay you stay. ' + names[1] + ', sashay away.';
      }
    };
    
    switch (event) {
      case 'announceSafe':
        return names.length === 1 ? `${names[0]} is declared safe.` : `${others.join(', ')}, and ${last} are declared safe.`;
      case 'winner':
        if (episode?.title.toLowerCase().includes("finale")) {
          // Finale special case
          return names.length === 1
            ? `${names[0]} is crowned the WINNER of the season! `
            : `${others.join(', ')}, and ${last} are crowned co-winners of the season!`;
        }
        // Normal weekly challenge
        return names.length === 1
          ? `${names[0]} is declared the winner of this week's Maxi Challenge!`
          : `${others.join(', ')}, and ${last} are declared winners!`;
      case 'high':
        return names.length === 1 ? `${names[0]} has placed high.` : `${others.join(', ')}, and ${last} have placed high.`;
      case 'bottom':
        return names.length === 1 ? `${names[0]} has placed low.` : `${others.join(', ')}, and ${last} have placed low.`;
      case 'bottom2':
        return names.length === 1 ? `${names[0]} is up for elimination. They will now have to lipsync to ${lipsyncs[episodeNumber - 1].title} by ${lipsyncs[episodeNumber -1].artist}. Good luck and don't fuck it up!` 
        : `${others.join(', ')}, and ${last} are up for elimination. They will now have to lipsync to ${lipsyncs[episodeNumber - 1].title} by ${lipsyncs[episodeNumber -1].artist}. Good luck and don't fuck it up!`;
      case 'eliminated':
        if (isNonElim) return 'Both queens have been given a chance to slay another day!';
        return names.length === 1 ? `${names[0]} sashayed away.` : btmMsg;
      default:
        return '';
    }
  };

  const eventMessage = selectedEpisode && episodeEvent
    ? generateEventMessage(queensToDisplay, episodeEvent, selectedEpisode)
    : '';

  const maxWins = Math.max(...queensToDisplay.map(q => q.wins));

  return (
    <div className="flex gap-2 pt-2">
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
                              episodeEvent === 'results' ? 'Season Results' :
                                'Queens'}
                </h2>
                {eventMessage && <p className="mt-2 text-sm font-medium text-purple-800">{eventMessage}</p>}
              </div>
            </div>

            <CardList
              queens={queensToDisplay}
              lipsyncs={lipsyncs}
              episodeType={episodes.find(e => e.episodeNumber === selectedEpisode)?.type}
              viewMode={episodeEvent}
              nonElimination={episodes.find(e => e.episodeNumber === selectedEpisode)?.nonElimination || false}
              showResults={showResults}
              episodes={episodes}
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

            <CardList queens={filteredQueens} episodes={episodes} lipsyncs={lipsyncs}/>
          </>
        )}
      </div>
    </div>
  );
};

export default SimLayout;
