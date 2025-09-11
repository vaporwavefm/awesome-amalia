/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
//import { collection, getDocs } from "firebase/firestore";
//import { db } from "@/lib/firebase";
import SimLayout from "@/components/SimLayout";
import { queens, episodes, lipsyncs } from "@/constants/queenData";

const Page = () => {

const [selectedQueens, setSelectedQueens] = useState<any[]>([]);
const [selectedEpisodes, setSelectedEpisodes] = useState<any[]>([]);
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
    if (saved) {
      const parsed = JSON.parse(saved);
      const parsedEps = JSON.parse(savedEpisodes ?? '[]');
      // sort alphabetically by name
      const sorted = parsed.sort((a: any, b: any) =>
        a.name.localeCompare(b.name)
      );

      let i = 1;
      for(const ep in parsedEps){
        //console.log(parsedEps[ep]);
        parsedEps[ep].episodeNumber = i;
        i++;
      }
      setSelectedQueens(sorted);
      setSelectedEpisodes(parsedEps);
    }
  }, []);

  return (
    <>
      <SimLayout queens={selectedQueens}
        episodes={selectedEpisodes}
        lipsyncs={lipsyncs} />
    </>
  )
};

export default Page;

