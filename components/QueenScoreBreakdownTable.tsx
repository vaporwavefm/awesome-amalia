"use client";
import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Score = {
  episodeNumber: number | string;
  baseStat: number;
  statIncrease: number;
  relevantStatsLen: number;
  score: number;
  randomFactor: number;
  bias: number;
};

type Props = {
  queenName: string;
  scores: Score[];
};

const QueenScoreBreakdownTable = ({ queenName, scores }: Props) => {
  return (
    <div className="my-6">
      <h2 className="font-bold text-lg mb-2">{queenName}</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Episode</TableHead>
              <TableHead className="text-center">Base Score</TableHead>
              <TableHead className="text-center">Stat Boost</TableHead>
              <TableHead className="text-center"># Stats Factored</TableHead>
              <TableHead className="text-center">Bias</TableHead>
              <TableHead className="text-center">Rand</TableHead>
              <TableHead className="text-center">Score</TableHead>   
            </TableRow>
          </TableHeader>
          <TableBody>
            {scores.map((s, i) => (
              <TableRow key={i} className="text-center">
                <TableCell>{s.episodeNumber}</TableCell>
                <TableCell>{s.baseStat}</TableCell>
                <TableCell>{s.statIncrease}</TableCell>
                <TableCell>{s.relevantStatsLen}</TableCell>
                <TableCell>{s.bias}</TableCell>
                <TableCell>{s.randomFactor}</TableCell>
                <TableCell>{s.score.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default QueenScoreBreakdownTable;
