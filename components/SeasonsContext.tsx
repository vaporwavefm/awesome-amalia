'use client';
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";

type Season = { id: string; title: string; date: string };

const SeasonsContext = createContext<{
  seasons: Season[];
  setSeasons: Dispatch<SetStateAction<Season[]>>;
}>({
  seasons: [],
  setSeasons: () => {},
});

/* eslint-disable @typescript-eslint/no-explicit-any */
export const SeasonsProvider = ({ children }: { children: ReactNode }) => {
  
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("allSeasons");
    if (!raw) return;

    const parsed = JSON.parse(raw);
    const seasonsArray = Object.entries(parsed.seasons || {}).map(
      ([id, data]: [string, any]) => ({
        id,
        title: data.title,
        date: data.date,
      })
    );

    setSeasons(seasonsArray);
  }, []);

  return (
    <SeasonsContext.Provider value={{ seasons, setSeasons }}>
      {children}
    </SeasonsContext.Provider>
  );
};

export const useSeasons = () => useContext(SeasonsContext);
