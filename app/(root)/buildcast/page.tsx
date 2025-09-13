/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import Search from "@/components/Search";
import { queens, episodes, seasons } from "@/constants/queenData";
import QueenCard from "@/components/QueenCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, GripVertical } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCrown, faPlay, faCheck, faX } from '@fortawesome/free-solid-svg-icons';
import { Info } from "lucide-react";
import { Separator } from "@/components/ui/separator"

import {
  DndContext,
  closestCenter,
  DragEndEvent
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { CSS } from "@dnd-kit/utilities";

const Page = () => {
  const [queenCards, setQueenCards] = useState<typeof queens>([]);
  const [episodeCards, setEpisodeCards] = useState<typeof episodes>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [minQueens, setMinQueens] = useState(0);
  const [minEps, setMinEps] = useState(0);
  const [reqQueensMet, setReqQueensMet] = useState(false);
  const [reqEpsMet, setReqEpsMet] = useState(false);
  const [finaleSet, setFinaleSet] = useState(false);

  const router = useRouter();

  const handleSaveToLocalStorage = () => {
    localStorage.setItem("selectedQueens", JSON.stringify(queenCards));
    localStorage.setItem("selectedEpisodes", JSON.stringify(episodeCards));
    router.push("/sim");
  };

  const handleRemoveQueen = (id: string) => {
    setQueenCards((prev) => prev.filter((queen) => queen.id !== id));
    setMinEps(minEps - 1);
  };

  const handleRemoveEpisode = (id: string) => {
    setEpisodeCards((prev) => prev.filter((episode) => episode.id !== id));
  };

  useEffect(() => {
    const savedQueens = localStorage.getItem("selectedQueens");
    const savedEpisodes = localStorage.getItem("selectedEpisodes");

    let parsedQueens: any[] = [];
    let parsedEps: any[] = [];

    if (savedQueens) {
      parsedQueens = JSON.parse(savedQueens);
      parsedQueens.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setQueenCards(parsedQueens);
    }

    if (savedEpisodes) {
      parsedEps = JSON.parse(savedEpisodes);
      setEpisodeCards(parsedEps);
    }

  }, []);

  useEffect(() => {

    const requiredQueens = episodeCards.length > 0 ? episodeCards.length + 1 : 4;
    const requiredEps = queenCards.length > 0 ? queenCards.length - 1 : 3;

    setMinQueens(requiredQueens);
    setMinEps(requiredEps);
    setReqQueensMet(queenCards.length === requiredQueens);
    setReqEpsMet(episodeCards.length === requiredEps);

    if (episodeCards.length > 0) {
      const lastEp = episodeCards[episodeCards.length - 1];
      setFinaleSet(lastEp.type?.toLowerCase().includes("finale"));
    } else {
      setFinaleSet(false);
    }

  }, [queenCards, episodeCards]);

  function SortableEpisode({
    episode,
    index,
    onRemove,
  }: {
    episode: any;
    index: number;
    onRemove: (id: string) => void;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: episode.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="flex justify-between items-center p-6 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
      >
        <div className="flex items-start gap-3">
          <div {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
            <GripVertical className="w-5 h-5" />
          </div>

          <div>
            <p className="font-medium text-gray-800">
              <span className="text-purple-500 font-bold mr-2">
                Episode {index + 1}:
              </span>
              {episode.type.includes("finale") && <FontAwesomeIcon icon={faCrown} />}{episode.type.includes("premiere") && <FontAwesomeIcon icon={faPlay} />} {episode.title}
            </p>
            <p className="text-sm text-gray-600">Original Season: {episode.season}</p>
            <p className="text-sm text-gray-600">Description: {episode.description}</p>
            <p className="text-sm text-gray-600">Type: {episode.type}</p>
          </div>
        </div>

        <button
          onClick={() => onRemove(episode.id)}
          className="p-1 rounded-full hover:bg-red-100 transition"
        >
          <X className="w-5 h-5 text-red-500" />
        </button>
      </div>
    );
  }

  return (
    <>
      <Tabs
        defaultValue="general"
        value={activeTab}
        onValueChange={(val) => setActiveTab(val)}
        className="w-full"
      >
        <TabsList className="tabs-list">
          <TabsTrigger value="general" className="tabs-trigger" > General Configuration </TabsTrigger>
          <TabsTrigger value="queens" className="tabs-trigger" > Queens </TabsTrigger>
          <TabsTrigger value="episodes" className="tabs-trigger" > Episodes </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <div className="p-6 flex flex-col min-h-screen items-center">
            <div className="p-2 mb-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 general-msg">
                <h2 className="font-extrabold text-2xl text-black tracking-wide">
                  General Configurations and Rules:
                </h2>
                <p className="mt-2 text-sm font-medium text-purple-800">Configure what set of rules are in place for the season! This will change the rules and requirements to start the simulation:</p>
              </div>
            </div>

            <div className="flex flex-col space-y-2 w-[280px]">
              {/* Label + tooltip icon row */}
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800">Select season mode:</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-sm">
                    <p>
                      <strong>Old-School Finale:</strong> The finalists are judged on their overall
                      performance throughout the season, and the winner is chosen based off track record.
                    </p>
                    <p className="mt-2">
                      <strong>Lipsync for the Crown:</strong> The finalists compete in a lipsync smackdown,
                      and the winner is determined by their performance in a final Lipsync for the Crown.
                    </p>
                    <br /><Separator />
                    <p className="mt-2">
                      <strong>Top Two & Lipsticks:</strong> In each episode, the top two All-Stars
                      will Lipsync for their Legacy. The winner earns the power to eliminate one of the bottom queens.
                    </p>
                    <p className="mt-2">
                      <strong>Lipsync Assassins:</strong> The top All-Star faces off against a
                      secret Lipsync Assassin. If the top All-Star wins, they choose a queen to
                      eliminate. If the Lipsync Assassin wins, the group vote decides who goes home. If the vote is a tie,
                      the decision will go back to the top All-Star.
                    </p>
                    <br />
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Select dropdown */}
              <Select defaultValue="osf">
                <SelectTrigger id="seasonMode" className="w-full">
                  <SelectValue placeholder="Select a series type:" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Regular</SelectLabel>
                    <SelectItem value="osf">Old-School Finale</SelectItem>
                    <SelectItem disabled value="lsftc">Lipsync for the Crown (coming soon!)</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>All-Stars</SelectLabel>
                    <SelectItem disabled value="osas">Old-School All-Stars (coming soon!)</SelectItem>
                    <SelectItem disabled value="ttwalas">Top-Two and Lipsticks (coming soon!)</SelectItem>
                    <SelectItem disabled value="laas">Lipsync Assassins (coming soon!)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

        </TabsContent>

        {/* Queens Tab */}
        <TabsContent value="queens">
          <div className="p-6 flex flex-col min-h-screen">
            <div className="p-2 mb-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 general-msg">
                <h2 className="font-extrabold text-2xl text-black tracking-wide">
                  Queens
                </h2>
                <p className="mt-2 text-sm font-medium text-purple-800">Select the queens that you wish you wish to compete in this season:</p>
              </div>
            </div>

            <Search
              entity={queens}
              field="name"
              type="queen"
              onSelect={(queen) => {
                setQueenCards((prev) =>
                  prev.some((q) => q.id === queen.id) ? prev : [...prev, queen]
                )
              }
              }
            />

            <div className="mt-6 flex flex-wrap justify-center gap-4 flex-1">
              {queenCards.map((queen) => (
                <QueenCard
                  key={queen.id}
                  q={queen}
                  isBuildCast={true}
                  onRemove={handleRemoveQueen}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Episodes Tab */}
        <TabsContent value="episodes">
          <div className="pb-6 pl-20 pr-20 flex flex-col min-h-screen">
            <div className="p-2 mb-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 general-msg">
                <h2 className="font-extrabold text-2xl text-black tracking-wide">
                  Episodes
                </h2>
                <p className="mt-2 text-sm font-medium text-purple-800">Select the episodes that you wish to feature! You can rearrange the episode order if needed:</p>
              </div>
            </div>

            <Search
              entity={episodes}
              field="title"
              type="episode"
              onSelect={(episode) => {
                setEpisodeCards((prev) =>
                  prev.some((e) => e.id === episode.id) ? prev : [...prev, episode]
                );
              }}
            />

            {/* 
            <p className="flex justify-center mt-4 mb-4 font-bold">
              OR...import a season!(this will overwrite your current selections)
              </p>
            
            <Search
              entity={seasons}
              field="seasonNumber"
              type="season"
              *
            />/} {/*onSelect={(season) =>
                setEpisodeCards((prev) =>
                  prev.some((e) => e.id === episode.id) ? prev : [...prev, episode]
                )
              } */}

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={(event: DragEndEvent) => {
                const { active, over } = event;
                if (over && active.id !== over.id) {
                  setEpisodeCards((items) => {
                    const oldIndex = items.findIndex((i) => i.id === active.id);
                    const newIndex = items.findIndex((i) => i.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                  });
                }
              }}
            >
              <SortableContext
                items={episodeCards.map((e) => e.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="mt-6 flex flex-col gap-3">
                  {episodeCards.map((e, idx) => (
                    <SortableEpisode
                      key={e.id}
                      episode={e}
                      index={idx}
                      onRemove={handleRemoveEpisode}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <div className="mb-3">
          <p> To generate a brand-new simulation, you&apos;ll need to meet the minimum requirements below. (The will adjust as you add more queens and episodes!)</p>
          <p className={reqQueensMet ? 'text-green-700' : 'text-red-700'}>
            {reqQueensMet ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faX} />}
            <span className="font-bold">Exactly</span> {minQueens} Queens (if season were to have a minimum of {minEps} episodes)
          </p>
          <p className={reqEpsMet ? 'text-green-700' : 'text-red-700'}>
            {reqEpsMet ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faX} />}
            <span className="font-bold">Exactly</span> {minEps} Episodes (if season were to have a minimum of {minQueens} queens)
          </p>
          <p className={finaleSet ? "text-green-700" : "text-red-700"}>
            {finaleSet ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faX} />}
            Finale Episode {finaleSet ? "Set" : "Not Set"}
          </p>
        </div>
        <div className="pb-8 flex justify-center">
          <Button
            onClick={handleSaveToLocalStorage}
            disabled={!(reqEpsMet && reqQueensMet && finaleSet)}
            className="px-8 py-4 text-lg font-semibold rounded-full shadow-lg transition-all 
               disabled:opacity-50 disabled:cursor-not-allowed
               hover:scale-105 hover:shadow-xl"
          >
            Show me the results!
          </Button>
        </div>
      </div>

    </>
  );
};

export default Page;
