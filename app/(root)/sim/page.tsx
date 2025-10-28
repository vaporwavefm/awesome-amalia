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
import { Spinner } from "@/components/ui/spinner"

const Page = () => {

  const [selectedQueens, setSelectedQueens] = useState<any[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<any[]>([]);
  const [selectedLipsyncs, setSelectedLipsyncs] = useState<any[]>([]);
  const [canSim, setCanSim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [minNonElimEps, setMinNonElimEps] = useState('0');
  const [seasonTitle, setSeasonTitle] = useState('');
  const [seasonMode, setSeasonMode] = useState('');
  const [seasonStyle, setSeasonStyle] = useState('');
  const router = useRouter();

  function generateRelationships(queens: any[]): any[] {
    const updatedQueens = [...queens];

    for (let i = 0; i < queens.length; i++) {
      const queen = queens[i];
      const relationships = [];

      for (let j = 0; j < queens.length; j++) {
        if (i === j) continue;

        const other = queens[j];
        const weightedTypes = [
          "friend", "friend", "ally", "neutral", "neutral", "rival"
        ];
        const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)]; // try to set initial relationships as friendly or neutral

        let baseStrength = 0; // keep strength not as high and on the positive note
        if (type === "friend" || type === "ally") baseStrength = 20 + Math.random() * 20;
        else if (type === "rival") baseStrength = -10 + Math.random() * 10;
        else baseStrength = Math.random() * 10;

        relationships.push({
          targetId: other.id,
          type,
          strength: Math.round(baseStrength),
        });
      }

      updatedQueens[i] = { ...queen, relationships };
    }

    return updatedQueens;
  }


  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const saved = localStorage.getItem("selectedQueens");
        const savedEpisodes = localStorage.getItem("selectedEpisodes");
        const savedLipsyncs = localStorage.getItem("savedLipsyncs");
        const savedSeasonStyle = localStorage.getItem("seasonStyle") || "osf";

        setMinNonElimEps(localStorage.getItem("minNonElimEps") || "0");
        setSeasonMode(localStorage.getItem("seasonMode") || "csp");
        setSeasonStyle(savedSeasonStyle);

        const seasonTitle = localStorage.getItem("seasonTitle");
        if (seasonTitle && seasonTitle.trim() !== "") setSeasonTitle(seasonTitle);
        else setSeasonTitle("Rupaul's Drag Race");

        if (saved && savedEpisodes && savedLipsyncs) {
          const parsedQueens = JSON.parse(saved) ?? [];
          const parsedEps = JSON.parse(savedEpisodes ?? "[]");
          const parsedLipsyncs = JSON.parse(savedLipsyncs ?? "[]");

          const queensWithRelationships = generateRelationships(parsedQueens);

          if (savedSeasonStyle === "lsftc") {
            const usedIds = new Set(parsedLipsyncs.map((l: any) => l.lipsync?.id));
            for (let i = 0; i < 3; i++) {
              let randomItem, cutoff = 0;
              do {
                const randomIndex = Math.floor(Math.random() * lipsyncs.length);
                randomItem = lipsyncs[randomIndex];
                cutoff++;
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

          if (parsedQueens.length > 0 && parsedEps.length > 0) {
            //const sorted = parsedQueens.sort((a: any, b: any) =>
            //a.name.localeCompare(b.name)
            // );
            const sorted = queensWithRelationships.sort((a: any, b: any) =>
              a.name.localeCompare(b.name)
            );

            let i = 1;
            for (const ep in parsedEps) {
              parsedEps[ep].episodeNumber = i;
              i++;
            }
            //console.log(JSON.stringify(sorted));
            setSelectedQueens(sorted);
            setSelectedEpisodes(parsedEps);
            setSelectedLipsyncs(parsedLipsyncs);
            setCanSim(true);
          }
        }
      } catch (err) {
        console.error("Error loading localStorage data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Spinner />
        <p className="text-lg font-semibold text-gray-700">
          Loading simulation data (please wait!)...
        </p>
      </div>
    );
  }

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

