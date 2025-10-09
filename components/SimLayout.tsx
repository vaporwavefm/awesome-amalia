/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo, useState, useEffect } from "react";
import CardList from "./CardList";
import { mainChallenge, SavedLipsync } from "@/lib/utils";
import EpisodeList from "./EpisodeList";
import EpisodeMessage from "./EpisodeMessage";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

type Placement = {
  episodeNumber: number | string;
  placement: string;
};

const SimLayout = (
  {
    queens,
    episodes,
    lipsyncs,
    minNonElimEps,
    seasonMode,
    seasonStyle,
    seasonTitle
  }:
    {
      queens: any[];
      episodes: any[];
      lipsyncs: any[];
      minNonElimEps: number;
      seasonMode: string;
      seasonStyle: string;
      seasonTitle: string;
    }) => {

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
      stats: q.stats ?? {
        Acting: Math.floor(Math.random() * 100) + 1,
        Dance: Math.floor(Math.random() * 100) + 1,
        Comedy: Math.floor(Math.random() * 100) + 1,
        Design: Math.floor(Math.random() * 100) + 1,
        Runway: Math.floor(Math.random() * 100) + 1,
        Singing: Math.floor(Math.random() * 100) + 1,
      }
    }));
  }, [queens]);

  const [episodeHistory, setEpisodeHistory] = useState<{ pre: { [key: number]: any[] }, post: { [key: number]: any[] } }>({ pre: {}, post: {} });
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodeEvent, setEpisodeEvent] = useState('');
  const [selectedLipsync, setSelectedLipsync] = useState<SavedLipsync | null>(null);
  const [showResults, setShowResults] = useState(false);
  const lsftcEvents = ["lsftc1", "lsftc2", "lsftcFinal", "lsftc1win", "lsftc2win", "lsftcFinalWin"];
  const [open, setOpen] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);

  useEffect(() => { // Precompute all episode results

    let trackRecord = initialTrackRecord.map(q => ({ ...q }));
    const preHistory: { [key: number]: any[] } = {};
    const postHistory: { [key: number]: any[] } = {};
    const sortedEpisodes = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);

    sortedEpisodes.forEach(e => { e.nonElimination = false; }); // Reset all nonElim flags

    if (seasonMode === "sp") { // for split premiere, shuffle the queens into 2 seperate groups
      const shuffled = [...trackRecord].sort(() => Math.random() - 0.5);
      const half = Math.ceil(shuffled.length / 2);
      const group1 = shuffled.slice(0, half).map(q => ({ ...q, group: 1 }));
      const group2 = shuffled.slice(half).map(q => ({ ...q, group: 2 }));
      trackRecord = [...group1, ...group2];
    }

    const eligible = sortedEpisodes.filter(
      e => !e.title.toLowerCase().includes("finale") &&
        e.episodeNumber < episodes.length - 2
    );

    if (eligible.length > 0 && Number(minNonElimEps) > 0) {
      for (let i = 0; i < Number(minNonElimEps); i++) {
        const randomIndex = Math.floor(Math.random() * eligible.length);
        sortedEpisodes[eligible[randomIndex].episodeNumber - 1].nonElimination = true;
      }
    }

    for (const e of sortedEpisodes) {

      preHistory[e.episodeNumber] = trackRecord.map(q => ({ // snapshot pre-episode
        ...q,
        placements: [...q.placements],
        scores: [...q.scores],
      }));

      let activeGroup = trackRecord;
      if (seasonMode === "sp") {
        if (e.episodeNumber === 1) {
          activeGroup = trackRecord.filter(q => q.group === 1)
        } else if (e.episodeNumber === 2) {
          activeGroup = trackRecord.filter(q => q.group === 2);
        }
      }

      const updatedGroup = mainChallenge(
        activeGroup,
        e.episodeNumber,
        e.nonElimination,
        e.type,
        seasonStyle
      );

      trackRecord = trackRecord.map(q => {
        const updated = updatedGroup.find(u => u.id === q.id);
        return updated ? updated : q;
      });

      postHistory[e.episodeNumber] = trackRecord.map(q => ({ // snapshot post-episode
        ...q,
        placements: [...q.placements],
        scores: [...q.scores],
      }));

    }

    setEpisodeHistory({ pre: preHistory, post: postHistory });

  }, [initialTrackRecord, episodes]);

  const handleEpisodeClick = (episodeNumber: number) => {
    setEpisodeEvent('');
    setShowResults(false); // reset show results
    setSelectedEpisode(episodeNumber);
    setOpen(false);

    const epIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber);
    if (epIndex !== -1) {
      setCurrentEpisodeIndex(epIndex);
      setCurrentEventIndex(0);
    }
  };

  const handleEpisodeEventClick = (episodeNumber: number, eventType: string) => {
    setSelectedEpisode(episodeNumber);

    const epIndex = episodes.findIndex(e => e.episodeNumber === episodeNumber);
    if (epIndex !== -1) {
      setCurrentEpisodeIndex(epIndex);

      const eventOrder = eventOrderByEpisode[epIndex];
      const eventIndex = eventOrder.indexOf(eventType);
      setCurrentEventIndex(eventIndex !== -1 ? eventIndex : 0);
    }

    if (eventType === "results") {
      setEpisodeEvent("results");
      setShowResults(true);
      return;
    }

    if (lsftcEvents.includes(eventType)) {
      setEpisodeEvent(eventType);
      setShowResults(false);
      return;
    }

    setEpisodeEvent(eventType);
    setShowResults(false);
    setOpen(false);
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
            return placement?.placement === 'low';
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
    if (event == 'eliminated') {
      if (isEliminated[0] == true && isEliminated[1] == false) {
        btmMsg = names[1] + ', shantay you stay. ' + names[0] + ', sashay away.';
      }
      if (isEliminated[0] == false && isEliminated[1] == true) {
        btmMsg = names[0] + ', shantay you stay. ' + names[1] + ', sashay away.';
      }
    };

    let lipsyncTitle = '', lipsyncArtist = '';

    if (lipsyncs[episodeNumber - 1]) {
      lipsyncTitle = lipsyncs[episodeNumber - 1]['lipsync'].title;
      lipsyncArtist = lipsyncs[episodeNumber - 1]['lipsync'].artist;
    }

    switch (event) {
      case 'announceSafe':
        return names.length === 1 ? `${names[0]} is declared safe.` : `${others.join(', ')}, and ${last} are declared safe.`;
      case 'winner':
        if (episode?.title.toLowerCase().includes("finale")) { // Finale special case
          return names.length === 1
            ? `${names[0]} is crowned the WINNER of ${seasonTitle}! `
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
        return names.length === 1 ? `${names[0]} is up for elimination. ${(lipsyncTitle && lipsyncArtist) && "They will now have to lipsync to " + lipsyncTitle + " by " + lipsyncArtist + ". Good luck and don't fuck it up!"}`
          : `${others.join(', ')} and ${last} are up for elimination. ${(lipsyncTitle && lipsyncArtist) ? ("They will now have to lipsync to " + lipsyncTitle + " by " + lipsyncArtist + ". Good luck and don't fuck it up!") : ''}`;
      case 'eliminated':
        if (isNonElim) return 'Both queens have been given a chance to slay another day!';
        return names.length === 1 ? `${names[0]} sashayed away.` : btmMsg;
      case 'lsftc1':
        return names.length === 2
          ? `${names[0]} and ${names[1]} must face off for a spot in the final lipsync!`
          : 'The top 4 are split into two pairs for battle!';
      case 'lsftc2':
        return names.length === 2
          ? `${names[0]} and ${names[1]} must face off for a spot in the final lipsync!`
          : 'The second group now battles for a spot in the finale!';
      case 'lsftcFinal':
        return names.length === 2
          ? `${names[0]} and ${names[1]} face off for the title of America's Next Drag Superstar!`
          : "The winners from both rounds face off for the title of America's Next Drag Superstar!";
      case 'lsftc1win':
        return names.length === 1
          ? `${names[0]} wins Round 1 of the Lipsync for the Crown!`
          : `${others.join(', ')} and ${last} win Round 1 of the Lipsync for the Crown!`;

      case 'lsftc2win':
        return names.length === 1
          ? `${names[0]} wins Round 2 of the Lipsync for the Crown!`
          : `${others.join(', ')} and ${last} win Round 2 of the Lipsync for the Crown!`;
      default:
        return '';
    }

  };

  // effect to display the correct lipsync for episode or LSFTC event
  useEffect(() => {

    if (!selectedEpisode || !episodeEvent) return;
    if (seasonStyle == 'lsftc' && lsftcEvents.includes(episodeEvent)) {
      let roundNum = 0;
      if (episodeEvent === 'lsftc1') roundNum = 1;
      else if (episodeEvent === 'lsftc2') roundNum = 2;
      else if (episodeEvent === 'lsftcFinal') roundNum = 3;

      const lipsyncData = lipsyncs.find(ls => ls.lsftcRound === roundNum);

      if (lipsyncData) {
        setSelectedLipsync(lipsyncData);
      } else {
        setSelectedLipsync(null);
      }
      return;
    }

    const episodeIndex = selectedEpisode - 1;
    const lipsyncData = lipsyncs[episodeIndex];
    if (lipsyncData) {
      setSelectedLipsync(lipsyncData);
    }

  }, [selectedEpisode, episodeEvent, lipsyncs]);

  let queensForCardList = [...queensToDisplay].filter(Boolean);

  // logic for navigating through episodes and episode events 
  const eventOrderByEpisode = episodes.map((ep) => {
    const isFinale = ep.type?.toLowerCase().includes("finale");
    const hasSafe = true;

    if (isFinale) {
      return seasonStyle === "lsftc"
        ? ["lsftc1", "lsftc1win", "lsftc2", "lsftc2win", "lsftcFinal", "winner", "results"]
        : ["winner", "results"];
    }
    return hasSafe
      ? ["announceSafe", "high", "winner", "bottom", "bottom2", "eliminated"]
      : ["high", "winner", "bottom", "bottom2", "eliminated"];
  });

  const isAtResults =
    currentEventIndex === eventOrderByEpisode[currentEpisodeIndex].length - 1 &&
    eventOrderByEpisode[currentEpisodeIndex][currentEventIndex] === "results";

  const handleNextButton = () => {
    const currentEvents = eventOrderByEpisode[currentEpisodeIndex];
    const nextEventIndex = currentEventIndex + 1;

    if (nextEventIndex < currentEvents.length) {
      setCurrentEventIndex(nextEventIndex);
      handleEpisodeEventClick(
        episodes[currentEpisodeIndex].episodeNumber,
        currentEvents[nextEventIndex]
      );
    } else if (currentEpisodeIndex + 1 < episodes.length) { // move to next episode
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
      setCurrentEventIndex(0);
      handleEpisodeClick(episodes[currentEpisodeIndex + 1].episodeNumber);
    }
  };

  const handlePrevButton = () => {
    if (currentEventIndex > 0) {
      const currentEvents = eventOrderByEpisode[currentEpisodeIndex];
      const prevEventIndex = currentEventIndex - 1;
      setCurrentEventIndex(prevEventIndex);
      handleEpisodeEventClick(
        episodes[currentEpisodeIndex].episodeNumber,
        currentEvents[prevEventIndex]
      );
    } else if (currentEpisodeIndex > 0) {
      const prevEpisodeIndex = currentEpisodeIndex - 1;
      const prevEvents = eventOrderByEpisode[prevEpisodeIndex];
      setCurrentEpisodeIndex(prevEpisodeIndex);
      setCurrentEventIndex(prevEvents.length - 1);
      handleEpisodeEventClick(
        episodes[prevEpisodeIndex].episodeNumber,
        prevEvents[prevEvents.length - 1]
      );
    } else {
      setSelectedEpisode(null);
      setEpisodeEvent('');
      setCurrentEpisodeIndex(0);
      setCurrentEventIndex(0);
    }
  };


  if (seasonMode === "sp" && selectedEpisode) {
    if (selectedEpisode === 1) {
      queensForCardList = queensToDisplay.filter(q => q.group === 1);
    } else if (selectedEpisode === 2) {
      queensForCardList = queensToDisplay.filter(q => q.group === 2);
    }
  }

  if (lsftcEvents.includes(episodeEvent)) {
    if (episodeEvent === "lsftc1") {
      queensForCardList = queensForCardList.filter(q => q.isInSemiFinal && q.group === 1);
    } else if (episodeEvent === "lsftc2") {
      queensForCardList = queensForCardList.filter(q => q.isInSemiFinal && q.group === 2);
    } else if (episodeEvent === "lsftcFinal") {
      queensForCardList = queensForCardList.filter(q => q.isInFinal);
    } else if (episodeEvent === "lsftc1win") {
      queensForCardList = queensForCardList.filter(q => q.isInFinal && q.group === 1);
    } else if (episodeEvent === "lsftc2win") {
      queensForCardList = queensForCardList.filter(q => q.isInFinal && q.group === 2);
    }
  }

  queensForCardList.sort((a, b) => a.name.localeCompare(b.name)); // sort queens again regardless of filtering
  const eventMessage = selectedEpisode && episodeEvent
    ? generateEventMessage(queensForCardList, episodeEvent, selectedEpisode)
    : '';

  return (
    <div className="md:flex md:justify-center gap-2 pt-2">
      {/* Display episode cards */}
      <div className="hidden md:block w-1/4 p-4"> {/* for regular desktop screens */}
        <EpisodeList
          episodes={episodes}
          onEpisodeClick={handleEpisodeClick}
          onEpisodeEventClick={handleEpisodeEventClick}
          episodeHistory={episodeHistory}
          initialTrackRecord={initialTrackRecord}
          seasonStyle={seasonStyle}
          selectedEpisode={selectedEpisode}
          setSelectedEpisode={setSelectedEpisode}
        />
      </div>
      <div className="block md:hidden p-2">{/* for mobile screens */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Menu className="w-4 h-4" /> View Episodes
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto pt-4">
            <VisuallyHidden>
              <SheetTitle>Episodes</SheetTitle>
            </VisuallyHidden>
            <div className="mt-8">
              <EpisodeList
                episodes={episodes}
                onEpisodeClick={(num) => {
                  handleEpisodeClick(num);
                }}
                onEpisodeEventClick={(num, event) => {
                  handleEpisodeEventClick(num, event);
                }}
                episodeHistory={episodeHistory}
                initialTrackRecord={initialTrackRecord}
                seasonStyle={seasonStyle}
                closeSheet={() => setOpen(false)}
                selectedEpisode={selectedEpisode}
                setSelectedEpisode={setSelectedEpisode}
              />
            </div>
            <SheetClose asChild>
              <Button variant="secondary" className="w-full mt-4">Close</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
      </div>
      {/* Display main screen */}
      <div className="sm:w-full md:w-3/4 pt-2">
        {episodeEvent ? (
          <>
            <EpisodeMessage
              episodeEvent={episodeEvent}
              eventMessage={eventMessage}
              lipsyncObj={selectedLipsync}
              seasonTitle={seasonTitle}
              episodeNumber={episodes.find(e => e.episodeNumber === selectedEpisode)?.episodeNumber}
              episodeType={episodes.find(e => e.episodeNumber === selectedEpisode)?.type}
            />
            <CardList
              queens={queensForCardList}
              lipsyncs={lipsyncs}
              episodeType={episodes.find(e => e.episodeNumber === selectedEpisode)?.type}
              viewMode={episodeEvent}
              nonElimination={episodes.find(e => e.episodeNumber === selectedEpisode)?.nonElimination || false}
              showResults={showResults}
              episodes={episodes}
              seasonStyle={seasonStyle}
            />
          </>
        ) : (
          <>
            {selectedEpisode ? (
              // existing episode preview box
              <div className="e-title-msg">
                <h2 className="e-title-h2"> Episode {episodes.find(e => e.episodeNumber === selectedEpisode)?.episodeNumber}: {episodes.find(e => e.episodeNumber === selectedEpisode)?.title} </h2>
                <p className="e-title-descr"> {episodes.find(e => e.episodeNumber === selectedEpisode)?.description} </p>
              </div>
            ) : (
              // initial message
              <div className="e-title-msg">
                <h2 className="e-title-h2"> Welcome to {seasonTitle}! </h2>
                <p className="e-title-descr">  Who will snatch the crown? Click on any episode or click next below to follow their journey!</p>
              </div>
            )}

            <CardList
              queens={queensForCardList}
              episodes={episodes}
              lipsyncs={lipsyncs}
              seasonStyle={seasonStyle} />
          </>
        )}

        <div className="flex justify-between items-center mb-6 mt-6 gap-4 ml-20 mr-20">
          <Button
            variant="outline"
            onClick={handlePrevButton}
            disabled={selectedEpisode === null && currentEventIndex === 0}
          >
            ← Previous
          </Button>
          <Button variant="outline" onClick={handleNextButton} disabled={isAtResults}>
            Next →
          </Button>
        </div>

      </div>
    </div>
  );
};

export default SimLayout;
