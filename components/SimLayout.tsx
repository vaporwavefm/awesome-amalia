/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CardList from "./CardList";
import { mainChallenge, SavedLipsync, addNewLipsyncs, getQueenNameByIdSingle } from "@/lib/utils";
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
import { Relationship, getQueenNameById } from "@/lib/utils";
import EpisodeEventContainer from "./EpisodeEventContainer";
import QueenCard from "./QueenCard";
import LipsyncSmackdownComp from "./LipsyncSmackdownComp";
import { useSeasons } from "@/components/SeasonsContext";

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
    seasonTitle,
    seasonFlow
  }:
    {
      queens: any[];
      episodes: any[];
      lipsyncs: any[];
      minNonElimEps: number;
      seasonMode: string;
      seasonStyle: string;
      seasonTitle: string;
      seasonFlow: string;
    }) => {

  const searchParams = useSearchParams();
  const seasonIdFromUrl = searchParams.get("id"); // ?id=unique-season-id
  const seasonId = useMemo(() => {
    if (seasonIdFromUrl) return seasonIdFromUrl; // reuse url ID
    return `season_${seasonTitle.replace(/\s+/g, "_")}_${Date.now()}`; // generate new ID for new version
  }, [seasonIdFromUrl, seasonTitle]);

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

  const [episodeHistory, setEpisodeHistory] = useState<{ pre: { [key: number]: any[] }, post: { [key: number]: any[] }, lipsyncPairs?: { [key: number]: SavedLipsync[] }; }>({ pre: {}, post: {}, lipsyncPairs: {} });
  const [selectedEpisode, setSelectedEpisode] = useState<number | null>(null);
  const [episodeEvent, setEpisodeEvent] = useState('');
  const [selectedLipsync, setSelectedLipsync] = useState<SavedLipsync | null>(null);
  const [showResults, setShowResults] = useState(false);
  const lsftcEvents = ["lsftc1", "lsftc2", "lsftcFinal", "lsftc1win", "lsftc2win", "lsftcFinalWin"];
  const [open, setOpen] = useState(false);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [lssdLipsyncs, setLssdLipsyncs] = useState<Record<number, SavedLipsync[]>>({});
  const { seasons, setSeasons } = useSeasons();

  const getRelationshipChanges = (episodeNumber: number) => {
    const preEpisode = episodeHistory.pre[episodeNumber];
    const postEpisode = episodeHistory.post[episodeNumber];
    if (!preEpisode || !postEpisode) return [];

    const changes: { queen: string; target: string; from: Relationship; to: Relationship }[] = [];

    for (const preQ of preEpisode) {
      const postQ = postEpisode.find((pq) => pq.id === preQ.id);
      if (!postQ) continue;

      const preRel: Relationship[] = preQ.relationships || [];
      const postRel: Relationship[] = postQ.relationships || [];

      for (const postR of postRel) {
        const preR = preRel.find(r => r.targetId === postR.targetId);
        if (!preR) continue;

        // --- ONLY include relationship changes if queens are in the same group for split premiere ---
        if (seasonMode === "sp") {
          const preQueenObj = postEpisode.find(q => q.id === preQ.id);
          const targetQueenObj = postEpisode.find(q => q.id === postR.targetId);
          if (preQueenObj?.group !== targetQueenObj?.group) continue;
        }

        if (preR.strength !== postR.strength || preR.type !== postR.type) {
          const targetQueenName = getQueenNameById(queens, postR.targetId);
          changes.push({
            queen: preQ.name,
            target: targetQueenName,
            from: preR,
            to: postR,
          });
        }
      }
    }

    return changes;
  };

  useEffect(() => { // Precompute all episode results

    let trackRecord = initialTrackRecord.map(q => ({ ...q }));
    const preHistory: { [key: number]: any[] } = {};
    const postHistory: { [key: number]: any[] } = {};
    const sortedEpisodes = [...episodes].sort((a, b) => a.episodeNumber - b.episodeNumber);
    const tempLssdLipsyncs: Record<number, SavedLipsync[]> = {};
    const lipsyncPairsByEpisode: Record<number, any> = {};
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

      const remainingQueens = trackRecord.filter(q => !q.isEliminated).length;
      if (e.type.toLowerCase().includes("lipsyncsmackdown") && !e.type.toLowerCase().includes("finale")) {
        let totalLipsyncs = 0;
        let queensLeft = remainingQueens;
        while (queensLeft > 1) {
          const roundLipsyncs = Math.floor(queensLeft / 2);
          totalLipsyncs += roundLipsyncs;
          queensLeft = roundLipsyncs;
        }

        if (!tempLssdLipsyncs[e.episodeNumber] || tempLssdLipsyncs[e.episodeNumber].length !== totalLipsyncs) {
          tempLssdLipsyncs[e.episodeNumber] = addNewLipsyncs(lipsyncs, totalLipsyncs);
        }

        //console.log('tempLssdLipsyncs[e.episodeNumber]: ' + JSON.stringify(tempLssdLipsyncs[e.episodeNumber]));
      }

      let activeGroup = trackRecord;
      if (seasonMode === "sp") {
        if (e.episodeNumber === 1) {
          activeGroup = trackRecord.filter(q => q.group === 1)
        } else if (e.episodeNumber === 2) {
          activeGroup = trackRecord.filter(q => q.group === 2);
        }
      }

      const result = mainChallenge(
        activeGroup,
        e.episodeNumber,
        e.nonElimination,
        e.type,
        seasonStyle,
        seasonFlow,
        tempLssdLipsyncs
      );

      const pairs = result.lipsyncPairs ?? [];

      if (pairs.length > 0) {
        lipsyncPairsByEpisode[e.episodeNumber] = pairs;
      }

      if (!result || !result.updatedRecord) {
        console.warn(`mainChallenge returned no updatedRecord for episode ${e.episodeNumber}`, result);
        continue; // skip this iteration 
      }

      const updatedGroup = result.updatedRecord;
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

    setEpisodeHistory({ pre: preHistory, post: postHistory, lipsyncPairs: lipsyncPairsByEpisode });

  }, [initialTrackRecord, episodes]);

  useEffect(() => { // scroll back to top for new event
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selectedEpisode, episodeEvent]);

  useEffect(() => {
    if (!episodeHistory || Object.keys(episodeHistory.post).length === 0) return;

    try {
      const existing = localStorage.getItem("allSeasons");
      const allSeasons = existing ? JSON.parse(existing) : { seasons: {} };

      if (!allSeasons.seasons[seasonId]) {
        const newSeason = {
          title: seasonTitle,
          timestamp: Date.now(),
          savedEpisodes: episodes,
          savedQueens: queens,
          savedLipsyncs: lipsyncs,
          minNonElimEps,
          seasonMode,
          seasonStyle,
          date: new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          episodeHistory,
          seasonFlow
        };

        allSeasons.seasons[seasonId] = newSeason;

        const sortedEntries = Object.entries(allSeasons.seasons).sort(
          // @ts-expect-error idkkk
          ([, a], [, b]) => b.timestamp - a.timestamp
        );

        const trimmedEntries = sortedEntries.slice(0, 5);

        allSeasons.seasons = Object.fromEntries(trimmedEntries);

        localStorage.setItem("allSeasons", JSON.stringify(allSeasons));

        setSeasons(
          trimmedEntries.map(([id, data]: any) => ({
            id,
            title: data.title,
            date: data.date,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to save season results:", err);
    }
  }, [episodeHistory, seasonId, seasonTitle]); // save new simulation run to local storage

  useEffect(() => {
    if (!seasonIdFromUrl) return;

    try {
      const saved = localStorage.getItem("allSeasons");
      if (saved) {
        const parsed = JSON.parse(saved);
        const seasonData = parsed.seasons?.[seasonIdFromUrl];
        if (seasonData) {
          setEpisodeHistory(seasonData.episodeHistory || {});
        }
      }
    } catch (err) {
      console.error("Failed to load season results:", err);
    }
  }, [seasonIdFromUrl]); // load simulation run from URL

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

    const epIndex = episodes.findIndex(
      (e) => e.episodeNumber === episodeNumber
    );
    if (epIndex === -1) return;

    setCurrentEpisodeIndex(epIndex);

    const eventOrder = eventOrderByEpisode[epIndex];
    const eventIndex = eventOrder.indexOf(eventType);

    if (eventIndex === -1) return;

    setCurrentEventIndex(eventIndex);

    if (eventType === "lipsyncsmackdown") {
      setEpisodeEvent("lipsyncsmackdown");
      setShowResults(false);
      return;
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
          case 'top2':
            return (placement?.placement === 'top2' || placement?.placement === 'win');
          case 'top2lipsync':
            return (placement?.placement === 'top2' || placement?.placement === 'win');
          case 'high':
            return placement?.placement === 'high';
          case 'bottomASRecap':
            return placement?.placement === 'bottomAS';
          case 'bottom':
            return placement?.placement === 'low';
          case 'bottom2':
            if (seasonFlow === 'ttwalas') {
              return placement?.placement === 'bottomAS' || placement?.placement === 'bottom';
            }
            return placement?.placement === 'bottom';
          case 'eliminated':
            return (placement?.placement === 'bottom' || placement?.placement === 'bottomAS');
          default:
            return true;
        }
      })
    : filteredQueens;

  // Event message generator
  const generateEventMessage = (queens: any[], event: string, episodeNumber: number) => {

    const names = queens.map(q => q.name);
    const isEliminated = queens.map(q => q.isEliminated);
    const episode = episodes.find(e => e.episodeNumber === episodeNumber);
    const isNonElim = episode?.nonElimination;

    if (event === 'eliminated' && isNonElim) {
      return 'Both queens have been given a chance to slay another day!';
    }
    if (!names.length && event !== 'announceSafe') {
      return '';
    }

    const last = names[names.length - 1];
    const others = names.slice(0, names.length - 1);
    const isSmackdown = episode?.type?.toLowerCase().includes('lipsyncsmackdown');

    let winnerName: string | undefined;
    if (seasonFlow === "ttwalas") {
      const episodePost = episodeHistory.post[episodeNumber] || [];
      const top2Winner = episodePost.find(q =>
        q.placements?.some((p: { episodeNumber: string | number; placement: string }) =>
          Number(p.episodeNumber) === Number(episodeNumber) && p.placement.toLowerCase() === "win")
      );
      winnerName = top2Winner?.name;
    }

    let btmMsg = '';
    if (event === 'eliminated') {
      if (seasonFlow === 'ttwalas' && !isSmackdown) {

        const episodePost = episodeHistory.post[episodeNumber] || [];
        const top2Winner = episodePost.find(q =>
          q.placements?.some((p: { episodeNumber: string | number; placement: string }) =>
            Number(p.episodeNumber) === Number(episodeNumber) && p.placement.toLowerCase() === 'win')
        );
        const winnerName = top2Winner?.name;

        let elimQueen = '';
        let safeFromElimQueen = '';
        if (isEliminated[0] && !isEliminated[1]) {
          elimQueen = names[0];
          safeFromElimQueen = names[1];
        } else if (!isEliminated[0] && isEliminated[1]) {
          elimQueen = names[1];
          safeFromElimQueen = names[0];
        }
        if (elimQueen != '' && safeFromElimQueen != '') {
          btmMsg = `${winnerName} has drawn her lipstick and chosen ${elimQueen}! ${safeFromElimQueen} is safe to slay another day.`;
        } else {
          btmMsg = `${names[0]} sashayed away.`;
        }

      } else {
        if (isEliminated[0] && !isEliminated[1]) {
          btmMsg = `${names[1]}, shantay you stay. ${names[0]}, sashay away.`;
        } else if (!isEliminated[0] && isEliminated[1]) {
          btmMsg = `${names[0]}, shantay you stay. ${names[1]}, sashay away.`;
        }
      }
    };

    let lipsyncTitle = '', lipsyncArtist = '';

    if (lipsyncs[episodeNumber - 1]) {
      lipsyncTitle = lipsyncs[episodeNumber - 1]['lipsync'].title;
      lipsyncArtist = lipsyncs[episodeNumber - 1]['lipsync'].artist;
    }

    switch (event) {
      case 'announceSafe':
        if (names.length == 0) {
          return 'All of the queens were asked to remain on the main stage.';
        }
        return names.length === 1 ? `${names[0]} is declared safe.` : `${others.join(', ')} and ${last} are declared safe.`;
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
      case 'top2':
        return names.length === 1 ? `${names[0]} is in the top! They must now decide which of the bottom queens will get the chop.` : `${others.join(', ')} and ${last} are the top 2 queens of the week! They must now decide which of the bottom queens will get the chop.`;
      case 'top2lipsync':
        return names.length === 1 ? `${names[0]} must now lipsync for their legacy. ${(lipsyncTitle && lipsyncArtist) && "They will now have to lipsync to " + lipsyncTitle + " by " + lipsyncArtist + ". Good luck and don't fuck it up!"}`
          : `${others.join(', ')} and ${last} must now lipsync for their legacy. ${(lipsyncTitle && lipsyncArtist) ? ("They will now have to lipsync to " + lipsyncTitle + " by " + lipsyncArtist + ". Good luck and don't fuck it up!") : ''}`;
      case 'high':
        return names.length === 1 ? `${names[0]} received good critiques and placed high.` : `${others.join(', ')} and ${last} received good critiques and placed high.`;
      case 'bottom':
        return names.length === 1 ? `${names[0]} has placed low, but is safe from elimination.` : `${others.join(', ')} and ${last} have placed low, but are safe from elimination.`;
      case 'bottom2':
        return names.length === 1 ? `${names[0]} is up for elimination. ${(lipsyncTitle && lipsyncArtist) && "They will now have to lipsync to " + lipsyncTitle + " by " + lipsyncArtist + ". Good luck and don't fuck it up!"}`
          : `${others.join(', ')} and ${last} are up for elimination. ${(lipsyncTitle && lipsyncArtist) ? ("They will now have to lipsync to " + lipsyncTitle + " by " + lipsyncArtist + ". Good luck and don't fuck it up!") : ''}`;
      case 'bottomASRecap':
        return names.length === 1 ? `${names[0]} is up for elimination.`
          : `${others.join(', ')} and ${last} are up for elimination.`;
      case 'eliminated':
        if (isNonElim) {
          return 'Both queens have been given a chance to slay another day!';
        }
        if (seasonFlow === 'ttwalas') {
          return btmMsg;
        }
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
      case 'untucked': {
        return 'Check out the summary of how relationships changed this episode!';
      }
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

    const type = ep.type?.toLowerCase() ?? "";
    const isFinale = type.includes("finale");
    const isSmackdown = type.includes("lipsyncsmackdown");

    const queensSnapshot = episodeHistory.post[ep.episodeNumber] || initialTrackRecord;

    const hasLowQueens = queensSnapshot.some((q) => {
      const placement = q.placements?.find(
        (p: { episodeNumber: string | number; placement: string }) =>
          Number(p.episodeNumber) === Number(ep.episodeNumber)
      );
      return placement?.placement === "low";
    });

    const hasSafeQueens = queensSnapshot.some((q) => {
      const placement = q.placements?.find(
        (p: { episodeNumber: string | number; placement: string }) =>
          Number(p.episodeNumber) === Number(ep.episodeNumber)
      );
      return placement?.placement === "safe";
    });

    const hasHighQueens = queensSnapshot.some((q) => {
      const placement = q.placements?.find(
        (p: { episodeNumber: string | number; placement: string }) =>
          Number(p.episodeNumber) === Number(ep.episodeNumber)
      );
      return placement?.placement === "high";
    });

    if (isFinale) {
      return seasonStyle === "lsftc"
        ? ["main", "lsftc1", "lsftc1win", "lsftc2", "lsftc2win", "lsftcFinal", "winner", "results"]
        : ["winner", "results"];
    }

    if (isSmackdown) {
      return ["main", "lipsyncsmackdown", "untucked", "bottom2", "eliminated"];
    }

    let events: string[] = ["main"];
    if (hasSafeQueens) events.push("announceSafe");
    events.push("untucked");
    if (hasHighQueens) events.push("high");
    events.push("winner");
    if (hasLowQueens) events.push("bottom");
    events.push("bottom2", "eliminated");

    if (seasonFlow === "ttwalas") { // all stars lipstick override
      events = ["main"];
      if (hasSafeQueens) events.push("announceSafe");
      if (hasHighQueens) events.push("high");
      events.push("top2");
      if (hasLowQueens) events.push("bottom");
      events.push("bottomASRecap", "untucked", "top2lipsync", "winner");
      events.push("bottom2", "eliminated");
    }
    return events;

  });

  const isAtResults =
    currentEventIndex === eventOrderByEpisode[currentEpisodeIndex].length - 1 &&
    eventOrderByEpisode[currentEpisodeIndex][currentEventIndex] === "results";

  const handleNextButton = () => {

    if (selectedEpisode === null) {
      setSelectedEpisode(episodes[0].episodeNumber);
      setCurrentEpisodeIndex(0);
      setCurrentEventIndex(0);
      setEpisodeEvent("");
      return;
    }

    const currentEvents = eventOrderByEpisode[currentEpisodeIndex];

    if (
      episodeEvent &&
      currentEventIndex === 0 &&
      currentEvents[0] === "main"
    ) {
      const firstRealEvent = 1;
      setCurrentEventIndex(firstRealEvent);
      handleEpisodeEventClick(
        episodes[currentEpisodeIndex].episodeNumber,
        currentEvents[firstRealEvent]
      );
      return;
    }

    const nextEventIndex = currentEventIndex + 1;
    if (nextEventIndex < currentEvents.length) {
      setCurrentEventIndex(nextEventIndex);
      handleEpisodeEventClick(
        episodes[currentEpisodeIndex].episodeNumber,
        currentEvents[nextEventIndex]
      );
    } else if (currentEpisodeIndex + 1 < episodes.length) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
      setCurrentEventIndex(0);
      setEpisodeEvent("");
      setSelectedEpisode(episodes[currentEpisodeIndex + 1].episodeNumber);
    }
  };

  const handlePrevButton = () => {
    const currentEvents = eventOrderByEpisode[currentEpisodeIndex];

    if (episodeEvent) {
      if (currentEventIndex > 0) {
        const prevEventIndex = currentEventIndex - 1; // get previous event button in same ep
        setCurrentEventIndex(prevEventIndex);

        const prevEvent = currentEvents[prevEventIndex];
        if (prevEvent === "main") {

          setEpisodeEvent("");
          setShowResults(false);
          return;
        }

        handleEpisodeEventClick(
          episodes[currentEpisodeIndex].episodeNumber,
          currentEvents[prevEventIndex]
        );
      } else {
        setEpisodeEvent(""); // go back to main screen for episode
        setShowResults(false);
      }
    } else {
      if (currentEpisodeIndex > 0) {
        const prevEpisodeIndex = currentEpisodeIndex - 1; // go to last episode before
        const prevEvents = eventOrderByEpisode[prevEpisodeIndex];
        const lastEventIndex = prevEvents.length - 1;

        setCurrentEpisodeIndex(prevEpisodeIndex);
        setCurrentEventIndex(lastEventIndex);
        handleEpisodeEventClick(
          episodes[prevEpisodeIndex].episodeNumber,
          prevEvents[lastEventIndex]
        );
      } else {
        setSelectedEpisode(null); // go to start your engines
        setEpisodeEvent("");
        setCurrentEpisodeIndex(0);
        setCurrentEventIndex(0);
      }
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

  let relationshipChanges: any[] = [];
  if (episodeEvent === "untucked" && selectedEpisode) {
    relationshipChanges = getRelationshipChanges(selectedEpisode);
  }

  const handlePrintEpisodeResults = (episodeNumber: number | null) => {
    if (!episodeNumber) return null;
    const lipsyncPairs = episodeHistory.lipsyncPairs?.[episodeNumber] || [];
    if (!lipsyncPairs.length) return <p>No lipsyncs this episode.</p>;

    const rounds: Record<number, typeof lipsyncPairs> = {}; // group by round
    for (const pair of lipsyncPairs) {
      const round = pair.round ?? 1;
      if (!rounds[round]) rounds[round] = [];
      rounds[round].push(pair);
    }

    const sortedRounds = Object.keys(rounds)
      .map(Number)
      .sort((a, b) => a - b);

    const roundsToShow = sortedRounds.slice(0, -1); // skip final round

    return (
      <LipsyncSmackdownComp
        rounds={rounds}
        roundsToShow={roundsToShow}
        queens={queens} />
    );
  };

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
          seasonFlow={seasonFlow}
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
                seasonFlow={seasonFlow}
                closeSheet={() => setOpen(false)}
                selectedEpisode={selectedEpisode}
                setSelectedEpisode={setSelectedEpisode}

              />
            </div>
            <SheetClose asChild>
              <Button variant="secondary" className="w-full ">Close</Button>
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
              seasonFlow={seasonFlow}
              winnerName={
                selectedEpisode && episodeHistory.post[selectedEpisode]
                  ? episodeHistory.post[selectedEpisode].find((q: any) =>
                    q.placements?.some((p: any) => Number(p.episodeNumber) === Number(selectedEpisode) && p.placement.toLowerCase() === "win")
                  )?.name
                  : "The winner"
              }
            />

            {episodeEvent === "untucked" && (
              (
                <EpisodeEventContainer
                  relationshipChanges={relationshipChanges}
                  queens={queens}
                />
              )
            )}

            {episodeEvent === "lipsyncsmackdown" && selectedEpisode && (
              <div className="mt-4">
                {handlePrintEpisodeResults(selectedEpisode)}
              </div>
            )}

            {
              episodeEvent != 'untucked' && episodeEvent != 'lipsyncsmackdown' && (
                <CardList
                  queens={queensForCardList}
                  lipsyncs={lipsyncs}
                  episodeType={episodes.find(e => e.episodeNumber === selectedEpisode)?.type}
                  viewMode={episodeEvent}
                  nonElimination={episodes.find(e => e.episodeNumber === selectedEpisode)?.nonElimination || false}
                  showResults={showResults}
                  episodes={episodes}
                  seasonStyle={seasonStyle}
                  allQueens={queens}
                  seasonFlow={seasonFlow}
                />
              )
            }
          </>
        ) : (
          <>
            {selectedEpisode ? (
              // existing episode preview box
              <div className="e-title-msg">
                <h2 className="e-title-h2"> Episode {episodes.find(e => e.episodeNumber === selectedEpisode)?.episodeNumber}: {episodes.find(e => e.episodeNumber === selectedEpisode)?.title} </h2>
                <p className="e-title-descr"> In this episode of {seasonTitle.trimEnd()}: {episodes.find(e => e.episodeNumber === selectedEpisode)?.description} </p>
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
              seasonStyle={seasonStyle}
              allQueens={queens}
              seasonFlow={seasonFlow}
            />
          </>
        )}

        <div className="flex justify-between items-center mb-6 mt-6 gap-4 ml-24 mr-24">
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
