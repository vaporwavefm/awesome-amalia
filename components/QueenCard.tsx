import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import * as Flags from 'country-flag-icons/react/3x2';
import { X } from "lucide-react"; 

type Queen = {
  id: string;
  name: string;
  url: string;
  franchise?: string;
  seasons?: string;
  wins?: number;
  highs?: number;
  lows?: number;
  bottoms?: number;
  isEliminated?: boolean;
};

const QueenCard = ({ q, 
  maxWins, 
  viewMode, 
  isWinner, 
  isBuildCast,
  onRemove
 }:
  { q: Queen,
     maxWins?: number, 
     viewMode?: string, 
     isWinner?: boolean, 
     isBuildCast?: boolean,
     onRemove?: (id: string) => void;
     }
) => {

  const isTopWinner = (maxWins != null) ? q.wins === maxWins && maxWins > 0 : false;
  const isMainScreen = viewMode != null && viewMode != 'eliminated';

  return (
    <Card
  className={`relative flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-xl 
    ${q.isEliminated && !isMainScreen ? 'border-2 border-red-400 bg-red-50' : 'border border-gray-200'}
    ${q.isEliminated && !isMainScreen ? 'opacity-40 grayscale' : ''}
    w-48 h-80`}
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
          className={`text-center text-lg font-bold break-words 
          ${isTopWinner ? "text-yellow-500 drop-shadow-lg" : "text-black-500"}`}
        >
          {q.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-between h-full">
        <div className="relative w-24 h-24">
          <Image
            src={q.url || ''}
            alt={q.name}
            fill
            className={`rounded-full border-2 border-purple-300 ${(q.isEliminated && !isMainScreen) ? 'grayscale' : ''
              }`}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700 text-center">
          {q.wins != null && (<p>Wins: {q.wins}</p>)}
          {q.highs != null && (<p>Highs: {q.highs}</p>)}
          {q.lows != null && (<p>Lows: {q.lows}</p>)}
          {q.bottoms != null && (<p>Bottoms: {q.bottoms}</p>)}
        </div>

        {isBuildCast && (
          <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-700 text-center">
            <p className="flex items-center justify-center gap-2">
              Country:{" "}
              {(() => {
                const Flag = Flags[q.franchise as keyof typeof Flags];
                return Flag ? (
                  <Flag className="w-6 h-4 rounded-sm shadow-sm" />
                ) : null;
              })()}
            </p>
            <p>Original Season(s): {q.seasons}</p>
          </div>
        )}

        {(q.isEliminated && !isMainScreen) ? (
          <span className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full self-center animate-pulse">
            Eliminated
          </span>
        ) : ''}
      </CardContent>
    </Card>


  );
};

export default QueenCard;
