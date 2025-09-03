import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

type Queen = {
  id: string;
  name: string;
  url: string;
  wins: number;
  highs: number;
  lows: number;
  bottoms: number;
  isEliminated: boolean;
};

const QueenCard = ({ q, maxWins, isBottom }: { q: Queen, maxWins: number, isBottom?: boolean }) => {

  const isTopWinner = q.wins === maxWins && maxWins > 0;


  return (
    <Card
      className={`flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-xl 
        ${q.isEliminated ? 'border-2 border-red-400 bg-red-50' : 'border border-gray-200'}
        ${isBottom && !q.isEliminated ? 'opacity-40 grayscale' : ''}
        w-48 h-80`} // fixed width and height
    >
      <CardHeader>
        <CardTitle
          className={`text-center text-lg font-semibold break-words ${isTopWinner ? 'text-yellow-500' : ''
            }`}
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
            className={`object-cover rounded-full ${
              (q.isEliminated || isBottom) ? 'grayscale' : ''
            }`}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-gray-700 text-center">
          <p>Wins: {q.wins}</p>
          <p>Highs: {q.highs}</p>
          <p>Lows: {q.lows}</p>
          <p>Bottom: {q.bottoms}</p>
        </div>

        {q.isEliminated && (
          <span className="mt-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full self-center">
            Eliminated
          </span>
        )}
      </CardContent>
    </Card>


  );
};

export default QueenCard;
