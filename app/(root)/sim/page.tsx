/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
//import { collection, getDocs } from "firebase/firestore";
//import { db } from "@/lib/firebase";
import SimLayout from "@/components/SimLayout";
//import { lipsyncs } from "@/constants/queenData";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // since you're already using shadcn/ui buttons
import { lipsyncs } from "@/constants/queenData";

const Page = () => {

  const [selectedQueens, setSelectedQueens] = useState<any[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<any[]>([]);
  const [selectedLipsyncs, setSelectedLipsyncs] = useState<any[]>([]);
  const [canSim, setCanSim] = useState(false);
  const [minNonElimEps, setMinNonElimEps] = useState('0');
  const [seasonTitle, setSeasonTitle] = useState('');
  const [seasonMode, setSeasonMode] = useState('');
  const [seasonStyle, setSeasonStyle] = useState('');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("selectedQueens");
    const savedEpisodes = localStorage.getItem("selectedEpisodes");
    const savedLipsyncs = localStorage.getItem("savedLipsyncs");
    const savedSeasonStyle = localStorage.getItem("seasonStyle") || 'osf';

    setMinNonElimEps(localStorage.getItem("minNonElimEps") || '0');
    setSeasonMode(localStorage.getItem("seasonMode") || 'csp');
    setSeasonStyle(savedSeasonStyle);

    const seasonTitle = localStorage.getItem("seasonTitle");
    if (seasonTitle && seasonTitle.trim() !== "") setSeasonTitle(seasonTitle);
    else setSeasonTitle("Rupaul's Drag Race");
    
    if (saved && savedEpisodes && savedLipsyncs) {

      const parsedQueens = JSON.parse(saved) ?? [];
      const parsedEps = JSON.parse(savedEpisodes ?? "[]");
      const parsedLipsyncs = JSON.parse(savedLipsyncs ?? "[]");

      if (savedSeasonStyle === "lsftc") { // grab random lipsyncs for LSFTC
        const usedIds = new Set(parsedLipsyncs.map((l: any) => l.lipsync?.id)); // track used lipsyncs

        for (let i = 0; i < 3; i++) {

          let randomItem;
          const cutoff = 0;
          do {
            const randomIndex = Math.floor(Math.random() * lipsyncs.length);
            randomItem = lipsyncs[randomIndex];
          } while (usedIds.has(randomItem.id) && cutoff < 50);

          usedIds.add(randomItem.id);
          parsedLipsyncs.push({
            episodeNumber: i + 1,
            lipsync: randomItem,
            order: parsedLipsyncs.length,
            lsftcRound: i + 1,
          });
        }
      }

      for (let i = 0; i < parsedLipsyncs.length; i++) {
        parsedLipsyncs[i].order = i;
      }

      console.log(JSON.stringify(parsedLipsyncs));
      if (parsedQueens.length > 0 && parsedEps.length > 0) {

        const sorted = parsedQueens.sort((a: any, b: any) =>
          a.name.localeCompare(b.name)
        ); // sort alphabetically by name

        let i = 1;
        for (const ep in parsedEps) {
          parsedEps[ep].episodeNumber = i;
          i++;
        }
        setSelectedQueens(sorted);
        setSelectedEpisodes(parsedEps);
        setSelectedLipsyncs(parsedLipsyncs);
        setCanSim(true);
      }
    }
  }, []);

  return (
    <>
      {canSim ?
        <SimLayout queens={selectedQueens}
          episodes={selectedEpisodes}
          lipsyncs={selectedLipsyncs}
          minNonElimEps={Number(minNonElimEps)}
          seasonMode={seasonMode}
          seasonStyle={seasonStyle}
          seasonTitle={seasonTitle}
        />
        : (
          <div className="flex flex-col items-center justify-center min-h-100 gap-4">
            <p className="text-lg font-medium text-gray-700">
              No valid simulation built!
            </p>
            <Button
              onClick={() => router.push("/buildcast")}
              className="px-6 py-3 text-lg font-semibold rounded-full shadow-md hover:shadow-lg transition"
            >
              Maybe we can try double-checking our settings?
            </Button>
          </div>
        )
      }
    </>
  )
};

export default Page;

