/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import * as Flags from "country-flag-icons/react/3x2";

type SearchProps = {
  entity: any[];
  field: string;
  onSelect?: (item: any) => void; // callback to parent
  type: string;
};

const Search = ({ entity, field, onSelect, type }: SearchProps) => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery] = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = entity.filter((en) =>
      en[field].toLowerCase().includes(debouncedQuery.toLowerCase())
    );

    setResults(filtered);
    setIsOpen(true);
  }, [debouncedQuery, entity, field]);

  const handleClickItem = (queen: any) => {
    setIsOpen(false);
    setResults([]);
    setQuery(""); // clear search box
    onSelect?.(queen); // send queen to parent
  };

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  const placeHolder = type == 'season'
  ? 'Search season (enter a season number)'
  : 'Search ' + type + ' names... (enter at least 2 characters!)';

  return (
    <div className="flex  items-center justify-center  px-4">
      <div className="relative w-full max-w-xl">
        {/* Search Bar */}
        <div className="flex h-[56px] items-center gap-3 rounded-full border border-gray-200 bg-white px-5 shadow-lg transition hover:shadow-xl">
          <Image
            src="/assets/icons/search.svg"
            alt="Search"
            width={24}
            height={24}
          />
          <Input
            value={query}
            placeholder={placeHolder}
            className="border-none focus-visible:ring-0 focus:outline-none text-gray-800"
            onChange={(e) => setQuery(e.target.value)}
          />

        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-3 bg-white shadow-xl rounded-xl border border-gray-200 z-10">
            {results.length === 0 && debouncedQuery ? (
              <p className="p-3 text-gray-500 text-center">No results found</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {results.map((res) => (
                  <li
                    key={res.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => handleClickItem(res)}
                  >
                    {type === "queen" && (
                      <>
                        <Image
                          src={res.url || ""}
                          alt={res.name}
                          width={36}
                          height={36}
                          className="rounded-full mr-3 border border-gray-200 object-cover"
                        />
                        <span className="font-medium text-gray-700">{res.name}</span>
                        {(() => {
                          const Flag = Flags[res.franchise as keyof typeof Flags];
                          return Flag ? (
                            <Flag className="w-6 h-4 ml-auto rounded-sm shadow-sm" />
                          ) : null;
                        })()}
                      </>
                    )}
                    {type === "episode" && (
                      <div className="w-full">
                        <span className="font-medium text-gray-700">{res.title}</span>
                        {res.season && (
                          <div className="ml-4 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const Flag = Flags[res.franchise as keyof typeof Flags];
                                return Flag ? (
                                  <Flag className="w-6 h-4 rounded-sm shadow-sm" />
                                ) : null;
                              })()}
                              <span>
                                Season {res.season}, Episode {res.episodeNumber}
                              </span>
                            </div>
                            <div className="italic text-gray-400">
                              (type: {res.type})
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {type == "season" && (
                      <>
                        <span className="font-medium text-gray-700">Season {res.seasonNumber}</span>
                        {(() => {
                          const Flag = Flags[res.franchise as keyof typeof Flags];
                          return Flag ? (
                            <Flag className="w-6 h-4 ml-auto rounded-sm shadow-sm" />
                          ) : null;
                        })()}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
