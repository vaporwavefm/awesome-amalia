/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import SimLayout from "@/components/SimLayout";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { lipsyncs } from "@/constants/queenData";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";

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
  const [seasonFlow, setSeasonFlow] = useState('');

  const router = useRouter();

  const searchParams = useSearchParams();
  const seasonId = searchParams.get("id") ?? "";

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
      setCanSim(false);
      setIsLoading(true);

      try {
        await new Promise((resolve) => setTimeout(resolve, 300));

        const saved = localStorage.getItem("selectedQueens");
        const savedEpisodes = localStorage.getItem("selectedEpisodes");
        const savedLipsyncs = localStorage.getItem("savedLipsyncs");
        const savedSeasonStyle = localStorage.getItem("seasonStyle") || "osf";
        const savedSeasonFlow = localStorage.getItem("seasonFlow") || "osas";

        let overrideLocalStorage = false;
        const DEFAULT_TITLE = "RuPaul's Drag Race";

        if (seasonId) {
          const allSeasonsRaw = localStorage.getItem("allSeasons");

          if (allSeasonsRaw) {
            const parsed = JSON.parse(allSeasonsRaw);
            const savedSeason = parsed?.seasons?.[seasonId];
            overrideLocalStorage = true;
            if (savedSeason?.title?.trim()) {
              setSeasonTitle(savedSeason.title);
            } else {
              setSeasonTitle(DEFAULT_TITLE);
            }

            if (savedSeason?.savedEpisodes) {
              setSelectedEpisodes(savedSeason.savedEpisodes);
            }
            if (savedSeason?.savedQueens) {
              setSelectedQueens(savedSeason.savedQueens);
            }
            if (savedSeason?.savedLipsyncs) {
              setSelectedLipsyncs(savedSeason.savedLipsyncs);
            }
            if (savedSeason?.minNonElimEps) {
              setMinNonElimEps(savedSeason.minNonElimEps);
            }
            if (savedSeason?.seasonMode) {
              setSeasonMode(savedSeason.seasonMode);
            }
            if (savedSeason?.seasonStyle) {
              setSeasonStyle(savedSeason.seasonStyle);
            }
            if (savedSeason?.seasonFlow) {
              setSeasonFlow(savedSeason.seasonFlow);
            }

          } else {
            setSeasonTitle(DEFAULT_TITLE);
          }
        } else {
          const storedTitle = localStorage.getItem("seasonTitle");
          setSeasonTitle(storedTitle?.trim() || DEFAULT_TITLE);
          setMinNonElimEps(localStorage.getItem("minNonElimEps") || "0");
          setSeasonMode(localStorage.getItem("seasonMode") || "csp");
          setSeasonStyle(savedSeasonStyle);
          setSeasonFlow(savedSeasonFlow);
        }

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
            const sorted = queensWithRelationships.sort((a: any, b: any) =>
              a.name.localeCompare(b.name)
            );

            let i = 1;
            for (const ep in parsedEps) {
              parsedEps[ep].episodeNumber = i;
              i++;
            }

            if (!overrideLocalStorage) {
              setSelectedEpisodes(parsedEps);
              setSelectedQueens(sorted);
              setSelectedLipsyncs(parsedLipsyncs);
            }

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
  }, [seasonId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Image
          src="/assets/graphics/lipstickload.gif"
          alt="Description of the GIF"
          width={90}
          height={90}
          unoptimized={true}
        />

        <p className="text-lg font-semibold text-gray-700">
          Loading simulation data (please wait!)...
        </p>
      </div>
    );
  }

  return (
    <>
      {canSim ?
        <SimLayout
          key={seasonId ?? "new-season"}
          queens={selectedQueens}
          episodes={selectedEpisodes}
          lipsyncs={selectedLipsyncs}
          minNonElimEps={Number(minNonElimEps)}
          seasonMode={seasonMode}
          seasonStyle={seasonStyle}
          seasonTitle={seasonTitle}
          seasonFlow={seasonFlow}
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

