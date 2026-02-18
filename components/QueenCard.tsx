/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import * as Flags from 'country-flag-icons/react/3x2';
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Relationship, QueenStats, getQueenNameById, getQueenNameByIdSingle } from "@/lib/utils";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Queen = {
  id: string;
  name: string;
  url: string;
  urls?: string[];
  urlObj?: string[];
  franchise?: string;
  seasons?: string;
  wins?: number;
  highs?: number;
  lows?: number;
  bottoms?: number;
  isEliminated?: boolean;
  stats?: QueenStats;
  relationships?: Relationship[];
};

const QueenCard = ({ q,
  maxWins,
  viewMode,
  isWinner,
  isBuildCast,
  onRemove,
  onUpdateStats,
  onUpdateRelationships,
  allQueens,
  seasonFlow,
}:
  {
    q: Queen,
    maxWins?: number,
    viewMode?: string,
    isWinner?: boolean,
    isBuildCast?: boolean,
    onRemove?: (id: string) => void;
    onUpdateStats?: (id: string, updatedStats: Partial<QueenStats>) => void;
    onUpdateRelationships?: (id: string, updatedRelationships: Relationship[]) => void;
    allQueens?: Queen[];
    seasonFlow?: string;
  }
) => {

  const [open, setOpen] = useState(false);
  const [draftStats, setDraftStats] = useState<QueenStats | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showRelDialog, setShowRelDialog] = useState(false);
  const [draftRelationships, setDraftRelationships] = useState<Relationship[]>(q.relationships || []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && q.stats) {
      setDraftStats({ ...q.stats });
    }
  };

  useEffect(() => {
    if (open && q.stats) {
      setDraftStats({ ...q.stats });
    }
  }, [q.stats, open]);

  useEffect(() => {
    setDraftRelationships(q.relationships || []);
  }, [q.relationships]);


  const isTopWinner = false; /*(maxWins != null) &&
    (seasonFlow &&
      (seasonFlow != 'ttwalas' || (seasonFlow === 'ttwalas' &&
        (viewMode != 'top2'
          && viewMode != 'top2lipsync'))
      )
    )
    ? q.wins === maxWins && maxWins > 0 : false; */
  const isMainScreen = viewMode != null && viewMode != 'eliminated';

  const handlePrev = () => {
    if (q.urls && q.urls.length > 0)
      setCurrentIndex((prev) =>
        prev === 0 && q.urls ? q.urls.length - 1 : prev - 1
      );
  };

  const handleNext = () => {
    if (q.urls && q.urls.length > 0)
      setCurrentIndex((prev) =>
        q.urls && prev === q.urls.length - 1 ? 0 : prev + 1
      );
  };

  return (
    <Card
      className={`relative flex flex-col justify-between rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-1
    ${q.isEliminated && !isMainScreen ? 'border-2 border-red-400 bg-red-50' : 'border border-gray-200'}
    ${q.isEliminated && !isMainScreen ? 'opacity-40 grayscale' : ''}
    w-56 min-h-80`}
    >

      {isBuildCast && (
        <button
          onClick={() => onRemove?.(q.id)}
          className="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white transition"
        >
          <X size={16} />
        </button>
      )}
      <CardHeader>
        <CardTitle
          className={`text-center text-lg font-semibold  drop-shadow-sm
      ${isTopWinner ? "text-yellow-600 drop-shadow-sm" : "text-gray-900"}`}
        >
          {q.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-start space-y-3">
        <div className="relative w-26 h-26 flex items-center justify-center group">
          <Image
            src={q.urls ? q.urls[currentIndex] : q.url}
            alt={q.name}
            fill
            className={`rounded-full border-2 border-purple-300 ${(q.isEliminated && !isMainScreen) ? "grayscale" : ""}`}
          />
          {q.urls && q.urls.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 bg-white rounded-full shadow p-1 hover:bg-purple-100 
                   opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 bg-white rounded-full shadow p-1 hover:bg-purple-100 
                   opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 text-center">
          <p className="flex items-center justify-center gap-2">
            {isBuildCast && (<>Country:{" "} </>)}
            {(() => {
              const Flag = Flags[q.franchise as keyof typeof Flags];
              return Flag ? (
                <Flag className="w-6 h-4 rounded-sm shadow-sm" />
              ) : null;
            })()}
          </p>
          {isBuildCast && (
            <p>Original Season(s): {q.seasons} </p>
          )}
        </div>

        {
          (seasonFlow &&
            (seasonFlow != 'ttwalas' || (seasonFlow === 'ttwalas' &&
              viewMode != 'top2'
              && viewMode != 'bottomASRecap'
              && viewMode != 'top2lipsync')
            )
          ) && (
            <>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 text-center">
                {q.wins != null && (<p>Wins: {q.wins}</p>)}
                {q.highs != null && (<p>Highs: {q.highs}</p>)}
                {q.lows != null && (<p>Lows: {q.lows}</p>)}
                {q.bottoms != null && (<p>Bottoms: {q.bottoms}</p>)}
              </div>
            </>
          )
        }

        {!isBuildCast ? (
          <Accordion
            type="single"
            collapsible
            className="w-full max-w-[13rem] self-center"
          >
            <AccordionItem value="stats">
              <AccordionTrigger className="text-sm font-medium hover:text-purple-900">Stats</AccordionTrigger>
              <AccordionContent className="pt-2 text-sm text-gray-700">
                {q.stats ? (
                  <div className="grid grid-cols-3 gap-2 justify-items-center w-full">
                    {Object.entries(q.stats).map(([statName, statValue]) => {
                      const radius = 20;
                      const circumference = 2 * Math.PI * radius;
                      const offset = circumference - (statValue / 100) * circumference;
                      return (
                        <div key={statName} className="flex flex-col items-center">
                          <svg width="50" height="50" className="transform -rotate-90">
                            <defs>
                              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#a78bfa" />
                                <stop offset="100%" stopColor="#a78bfa" />
                              </linearGradient>
                            </defs>
                            <circle
                              cx="25"
                              cy="25"
                              r={radius}
                              stroke="#e5e7eb"
                              strokeWidth="4"
                              fill="transparent"
                            />
                            <circle
                              cx="25"
                              cy="25"
                              r={radius}
                              stroke="url(#grad1)"
                              strokeWidth="4"
                              fill="transparent"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                              className="transition-all duration-500"
                            />
                          </svg>
                          <span className="text-xs font-medium mt-1 capitalize">{statName}</span>
                          <span className="text-xs text-gray-600">{statValue}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No stats available</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="relationships">
              <AccordionTrigger className="text-sm font-medium hover:text-purple-900">
                Relationships
              </AccordionTrigger>
              <AccordionContent className="pt-2 text-sm text-gray-700">
                {q.relationships && q.relationships.length > 0 ? (
                  <ul className="flex flex-col gap-2">
                    {q.relationships
                      .slice()
                      .sort((a, b) => {
                        const nameA = getQueenNameByIdSingle(a.targetId);
                        const nameB = getQueenNameByIdSingle(b.targetId);
                        return nameA.localeCompare(nameB);
                      })
                      .map((rel) => {
                        const targetName = allQueens ? getQueenNameByIdSingle(rel.targetId) : '';
                        return (
                          <li
                            key={rel.targetId}
                            className={`flex justify-between px-2 py-1 rounded-md border ${rel.type === "friend"
                              ? "bg-green-50 border-green-200 text-green-800"
                              : rel.type === "rival"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : rel.type === "ally"
                                  ? "bg-blue-50 border-blue-200 text-blue-700"
                                  : rel.type === "crush"
                                    ? "bg-pink-50 border-pink-200 text-pink-700"
                                    : "bg-gray-50 border-gray-200 text-gray-700"
                              }`}
                          >
                            <span className="font-medium capitalize">
                              {targetName}: {rel.type}
                            </span>
                          </li>
                        );
                      })}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500">No relationships yet.</p>
                )}
              </AccordionContent>

            </AccordionItem>
          </Accordion>
        ) : (
          <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full max-w-[13rem] self-center rounded-full bg-purple-50 hover:bg-purple-100"
                >
                  Edit Stats
                </Button>
              </DialogTrigger>

              <DialogContent className="max-w-lg">
                <DialogHeader className="flex flex-col items-center">
                  {q.url && (
                    <div className="relative w-24 h-24 mb-2">
                      <Image
                        src={q.urls ? q.urls[currentIndex] : q.url}
                        alt={q.name}
                        className="rounded-full border-2 border-purple-300 object-cover"
                        fill
                      />
                    </div>
                  )}
                  <DialogTitle className="text-center">
                    Edit {q.name ? q.name : 'Queen'}&apos;s Stats
                  </DialogTitle>
                </DialogHeader>


                {draftStats ? (
                  <div className="grid grid-cols-1 gap-5 mt-4">
                    {Object.entries(draftStats).map(([statName, statValue]) => (
                      <div key={statName} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm font-medium text-gray-700">
                          <span className="capitalize">{statName}</span>
                          <span className="text-purple-700 font-semibold">
                            {statValue}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={100}
                          step={1}
                          value={statValue}
                          onChange={(e) =>
                            setDraftStats((prev) =>
                              prev ? { ...prev, [statName]: Number(e.target.value) } : prev
                            )
                          }
                          className="w-full h-2 rounded-full bg-gray-200 accent-purple-600 cursor-pointer transition"
                        />

                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500 italic">
                    No stats available
                  </p>
                )}

                <DialogFooter className="mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() => {
                      if (!draftStats) return;
                      onUpdateStats?.(q.id, draftStats);
                      setOpen(false);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showRelDialog} onOpenChange={setShowRelDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full max-w-[13rem] self-center rounded-full bg-purple-50 hover:bg-purple-100 mt-2"
                >
                  Edit Relationships
                </Button>
              </DialogTrigger>

              <DialogContent
                className="max-w-lg max-h-[85vh] overflow-y-auto rounded-lg p-6"
                style={{ margin: 'auto' }}
              >
                <DialogHeader className="flex flex-col items-center">
                  {q.url && (
                    <div className="relative w-24 h-24 mb-2">
                      <Image
                        src={q.urls ? q.urls[currentIndex] : q.url}
                        alt={q.name}
                        className="rounded-full border-2 border-purple-300 object-cover"
                        fill
                      />
                    </div>
                  )}
                  <DialogTitle className="text-center">
                    Edit {q.name ? q.name : 'Queen'}&apos;s Relationships
                  </DialogTitle>
                </DialogHeader>

                {draftRelationships.length > 0 ? (
                  <div className="mt-4 border rounded-md overflow-hidden">

                    <div className="grid grid-cols-[1fr_1fr_1fr] items-center px-4 py-3 text-sm font-semibold bg-purple-100 text-purple-900 border-b">
                      <span className="truncate text-center">Queen</span>
                      <span className="text-center">Relationship</span>
                      <span className="text-center">Strength</span>
                    </div>


                    <div className="max-h-[45vh] overflow-y-auto divide-y">
                      {draftRelationships.map((rel) => {
                        const targetName = getQueenNameByIdSingle(rel.targetId);

                        return (
                          <div
                            key={rel.targetId}
                            className="grid grid-cols-[1fr_1fr_1fr] items-center gap-4 px-4 py-3 hover:bg-purple-50 transition-colors"
                          >

                            <span className="font-medium truncate text-sm text-center leading-snug">
                              {targetName}
                            </span>

                            <Select
                              value={rel.type}
                              onValueChange={(value) =>
                                setDraftRelationships(prev =>
                                  prev.map(r =>
                                    r.targetId === rel.targetId
                                      ? { ...r, type: value }
                                      : r
                                  )
                                )
                              }
                            >
                              <SelectTrigger className="w-full h-9 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                <SelectGroup>
                                  <SelectLabel>Relationship</SelectLabel>
                                  <SelectItem value="friend">Friend</SelectItem>
                                  <SelectItem value="ally">Ally</SelectItem>
                                  <SelectItem value="neutral">Neutral</SelectItem>
                                  <SelectItem value="rival">Rival</SelectItem>
                                  <SelectItem value="crush">Crush</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>

                            <div className="flex items-center h-9 px-1">
                              <input
                                type="range"
                                min={-50}
                                max={50}
                                step={10}
                                value={rel.strength}
                                onChange={(e) =>
                                  setDraftRelationships(prev =>
                                    prev.map(r =>
                                      r.targetId === rel.targetId
                                        ? { ...r, strength: Number(e.target.value) }
                                        : r
                                    ))}
                                className="w-full h-2 rounded-full bg-gray-200 accent-purple-600 cursor-pointer transition"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500 italic">
                    No relationships available
                  </p>
                )}

                <DialogFooter className="mt-6 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setShowRelDialog(false)}>Cancel</Button>
                  <Button
                    className="bg-purple-600 hover:bg-purple-700"
                    onClick={() => {
                      if (typeof onUpdateRelationships === "function") {
                        onUpdateRelationships(q.id, draftRelationships);
                      }
                      setShowRelDialog(false);
                    }}
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

          </>
        )}

        {(q.isEliminated && !isMainScreen) ? (
          <span className="mt-2 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600  text-white text-xs rounded-full self-center shadow-md animate-pulse tracking-wide">
            Eliminated
          </span>
        ) : ''}

      </CardContent>
    </Card>


  );
};

export default QueenCard;
