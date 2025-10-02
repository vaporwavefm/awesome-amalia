/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
//import { collection, getDocs } from "firebase/firestore";
//import { db } from "@/lib/firebase";
import SimLayout from "@/components/SimLayout";
//import { lipsyncs } from "@/constants/queenData";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // since you're already using shadcn/ui buttons

const Page = () => {

  const [selectedQueens, setSelectedQueens] = useState<any[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<any[]>([]);
  const [selectedLipsyncs, setSelectedLipsyncs] = useState<any[]>([]);
  const [canSim, setCanSim] = useState(false);
  const [minNonElimEps, setMinNonElimEps] = useState('0');
  const [seasonMode, setSeasonMode] = useState('');
  const [seasonStyle, setSeasonStyle] = useState('');
  const router = useRouter();

  //async function getUsers() {
  //const querySnapshot = await getDocs(collection(db, "episodes"));
  //const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  //return users;
  //}
  //const users = await getUsers();
  //console.log(users);

  useEffect(() => {
    const saved = localStorage.getItem("selectedQueens");
    const savedEpisodes = localStorage.getItem("selectedEpisodes");
    const savedLipsyncs = localStorage.getItem("savedLipsyncs");

    setMinNonElimEps(localStorage.getItem("minNonElimEps") || '0');
    setSeasonMode(localStorage.getItem("seasonMode") || 'csp');
    setSeasonStyle(localStorage.getItem("seasonStyle") || 'osf');

    if (saved && savedEpisodes && savedLipsyncs) {

      const parsedQueens = JSON.parse(saved) ?? [];
      const parsedEps = JSON.parse(savedEpisodes ?? "[]");
      const parsedLipsyncs = JSON.parse(savedLipsyncs ?? "[]");

      console.log(parsedLipsyncs);
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

