"use client";
import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown, faDownload } from "@fortawesome/free-solid-svg-icons";
import { toPng } from "html-to-image";
import { Spinner } from "./ui/spinner";

type Queen = {
  id: string;
  name: string;
  placements: { episodeNumber: number | string; placement: string }[];
  url: string;
  wins: number;
  highs: number;
  lows: number;
  bottoms: number;
  isEliminated: boolean;
};

type SeasonTrackRecordTableProps = {
  queens: Queen[];
  episodes: { episodeNumber: number | string; title: string; id?: string }[];
  isMinified?: boolean;
  seasonStyle: string;
};

const SeasonTrackRecordTable = ({
  queens,
  episodes,
  isMinified = false,
  seasonStyle,
}: SeasonTrackRecordTableProps) => {

  const [isExporting, setIsExporting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const finaleEpNum = Math.max(
    ...episodes.map((ep) => Number(ep.episodeNumber))
  );

  const handleExport = async () => {
    if (!tableRef.current) return;

    document.querySelectorAll(".export-temp-wrapper").forEach((w) => w.remove());

    setIsExporting(true);

    const originalNode = tableRef.current;

    const wrapper = document.createElement("div");
    wrapper.className = "export-temp-wrapper";
    wrapper.style.position = "fixed";
    wrapper.style.left = "0";
    wrapper.style.top = "0";
    wrapper.style.opacity = "0";
    wrapper.style.pointerEvents = "none";
    wrapper.style.zIndex = "-1";
    wrapper.style.background = "white";
    wrapper.style.padding = "12px";
    document.body.appendChild(wrapper);

    const clone = originalNode.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".export-temp-wrapper").forEach((w) => w.remove());
    clone.style.overflow = "visible";
    clone.style.maxWidth = "none";
    clone.style.maxHeight = "none";
    wrapper.appendChild(clone);

    clone.querySelectorAll("span,img").forEach((node) => {
      if (node.tagName === "SPAN" && node.querySelector("img")) {
        node.replaceWith(...node.childNodes);
      }
    });

    clone.querySelectorAll("img").forEach((imgTag) => {
      if (!(imgTag instanceof HTMLImageElement)) return;

      let container = imgTag.parentElement;

      while (
        container &&
        container !== clone &&
        container.tagName !== "TD" &&
        container.tagName !== "TH"
      ) {
        container = container.parentElement;
      }

      const newImg = document.createElement("img");
      newImg.src = imgTag.src;
      newImg.width = imgTag.width;
      newImg.height = imgTag.height;
      newImg.style.cssText = `
      width: ${imgTag.width}px;
      height: ${imgTag.height}px;
      object-fit: cover;
      border-radius: 4px;
  `;

      imgTag.parentElement?.replaceWith(newImg);
    });

    clone.querySelectorAll(".min-w-max, .overflow-x-auto").forEach((el) => {
      el.classList.remove("min-w-max", "overflow-x-auto");
      // @ts-expect-error idkkk
      el.style.width = "auto";
      // @ts-expect-error idkkk
      el.style.minWidth = "0";
      // @ts-expect-error idkkk
      el.style.maxWidth = "none";
    });

    const maxExportWidth = 1200;
    const scale = Math.min(1, maxExportWidth / clone.scrollWidth);
    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = "top left";
    clone.style.width = clone.scrollWidth + "px";
    clone.style.height = clone.scrollHeight + "px";

    await new Promise((r) => requestAnimationFrame(r));

    try {
      const dataUrl = await toPng(clone, {
        cacheBust: true,
        pixelRatio: 2,
        style: {
          width: clone.scrollWidth + "px",
          height: clone.scrollHeight + "px",
          transform: "none",
        },
      });

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "track-record.png";
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      wrapper.remove();
      setIsExporting(false);
    }
  };

  const getPlacement = (queen: Queen, episodeNumber: number | string) => {
    const p = queen.placements.find(
      (pl) => Number(pl.episodeNumber) === Number(episodeNumber)
    );
    const epNum = Number(episodeNumber);

    if (epNum === finaleEpNum) {
      if (seasonStyle.toLowerCase().includes("lsftc")) {
        if (p?.placement === "win") return "WINNER";
        if (p?.placement === "finale" && !queen.isEliminated) return "RUNNER-UP";
        if (p?.placement === "finale" && queen.isEliminated) return "OUT";
      } else {
        if (p?.placement === "win") return "WINNER";
        if (p?.placement === "finale") return "RUNNER-UP";
      }
    }

    if (!p) return " ";

    const lastPlacement = queen.placements.at(-1);
    if (
      queen.isEliminated &&
      lastPlacement &&
      Number(lastPlacement.episodeNumber) === epNum
    ) {
      return "OUT";
    }

    switch (p.placement) {
      case "win":
        return "WIN";
      case "high":
        return "HIGH";
      case "top2":
        return "TOP2";
      case "safe":
        return "SAFE";
      case "low":
        return "LOW";
      case "bottom":
        return "BTM2";
      case "bottomAS":
        return "BTM";
      case "eliminated":
        return "OUT";
      default:
        return p.placement;
    }
  };

  const sortedQueens = [...queens].sort((a, b) => {
    const getCategory = (q: Queen) => {
      const last = q.placements.at(-1);
      const pFinal =
        !last || Number(last.episodeNumber) !== finaleEpNum
          ? null
          : last.placement;

      if (pFinal === "win") return 0; // winner
      if (pFinal === "finale" && !q.isEliminated) return 1; // runner-up
      if (pFinal === "finale" && q.isEliminated) return 2; // elim lsftc
      return 3; // everyone else
    };

    const catA = getCategory(a);
    const catB = getCategory(b);
    if (catA !== catB) return catA - catB;

    const elimEpA = a.isEliminated
      ? Number(a.placements.at(-1)?.episodeNumber)
      : finaleEpNum;
    const elimEpB = b.isEliminated
      ? Number(b.placements.at(-1)?.episodeNumber)
      : finaleEpNum;

    return elimEpB - elimEpA;
  });

  const maxWins = Math.max(...queens.map((q) => q.wins));
  const maxHighs = Math.max(...queens.map((q) => q.highs));
  const maxLows = Math.max(...queens.map((q) => q.lows));
  const maxBottoms = Math.max(...queens.map((q) => q.bottoms));

  return (
    <div className="relative">
      <div className="overflow-x-auto mt-4">
        <div className="min-w-max">
          <div
            ref={tableRef}
            className="p-6 bg-white rounded-md shadow-lg border border-gray-200 inline-block"
            style={{ overflow: "visible" }}
          >
            <Table>
              <TableCaption className="bg-purple-100 text-purple-900 font-semibold py-2 rounded-t-lg mb-2">
                Contestant Progress
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Queen</TableHead>
                  {!isMinified && (
                    <TableHead className="text-center">Picture</TableHead>
                  )}
                  {episodes.map((ep) => (
                    <TableHead
                      key={ep.id || ep.episodeNumber}
                      className="text-center px-2 h-16 ">
                      <div className="whitespace-normal break-words text-center leading-tight max-w-[80px]">
                        <span className="font-bold block">
                          EP{ep.episodeNumber}
                          {!isMinified && ":"}
                        </span>
                        {!isMinified && (
                          <span className="text-sm font-normal mt-1">
                            {ep.title}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Wins</TableHead>
                  <TableHead className="text-center">Highs</TableHead>
                  <TableHead className="text-center">Lows</TableHead>
                  <TableHead className="text-center">Bottoms</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedQueens.map((q) => {
                  const elimPlacement = q.isEliminated ? q.placements.at(-1) : null;
                  const elimEpNum = elimPlacement
                    ? Number(elimPlacement.episodeNumber)
                    : null;

                  return (
                    <TableRow key={q.id} className="border-t">
                      <TableCell className="font-medium">{q.name}</TableCell>

                      {!isMinified && (
                        <TableCell className="p-0 w-24 h-24">
                          <div className="relative w-full h-full aspect-square">
                            <Image
                              src={q.url || "/placeholder.png"}
                              alt={q.name}
                              fill
                              className="object-cover border-2"
                            />
                          </div>
                        </TableCell>
                      )}

                      {episodes.map((ep) => {
                        const placement = getPlacement(q, ep.episodeNumber);
                        const epNum = Number(ep.episodeNumber);

                        const isElimEp =
                          elimEpNum !== null && epNum === elimEpNum;
                        const isAfterElim =
                          elimEpNum !== null && epNum > elimEpNum;

                        return (
                          <TableCell
                            key={ep.id || ep.episodeNumber}
                            className={`text-center 
                          ${isElimEp ? "bg-red-400 font-bold text-black-700" : ""}
                          ${isAfterElim ? "text-gray-400 bg-gray-200 italic" : ""}
                          ${placement == " " ? "text-gray-400 bg-gray-200 italic" : ""}
                          ${placement === "TOP2" ? "bg-yellow-200 font-bold text-black-200" : ""}
                          ${placement === "HIGH" ? "bg-sky-300 text-black-200" : ""}
                          ${placement === "WIN" ? "bg-blue-400 font-bold text-black-700" : ""}
                          ${placement === "LOW" ? "bg-pink-200 text-black-200" : ""}
                          ${placement === "BTM2" ? "bg-red-300 text-black-200" : ""}
                          ${placement === "BTM" ? "bg-red-300 text-black-200" : ""}
                          ${placement === "WINNER" ? "sparkle-gold" : ""}
                          ${placement === "RUNNER-UP" ? "bg-green-200 text-black font-medium" : ""}
                        `}
                          >
                            {placement}
                          </TableCell>
                        );
                      })}

                      <TableCell
                        className={`text-center ${q.wins === maxWins ? "ml-1 bg-yellow-200 font-bold" : ""
                          }`}
                      >
                        {q.wins}{" "}
                        {q.wins === maxWins && <FontAwesomeIcon icon={faCrown} />}
                      </TableCell>

                      <TableCell
                        className={`text-center ${q.highs === maxHighs ? "ml-1 bg-yellow-200 font-bold" : ""
                          }`}
                      >
                        {q.highs}{" "}
                        {q.highs === maxHighs && <FontAwesomeIcon icon={faCrown} />}
                      </TableCell>

                      <TableCell
                        className={`text-center ${q.lows === maxLows ? "ml-1 bg-yellow-200 font-bold" : ""
                          }`}
                      >
                        {q.lows}{" "}
                        {q.lows === maxLows && <FontAwesomeIcon icon={faCrown} />}
                      </TableCell>

                      <TableCell
                        className={`text-center ${q.bottoms === maxBottoms
                          ? "ml-1 bg-yellow-200 font-bold"
                          : ""
                          }`}
                      >
                        {q.bottoms}{" "}
                        {q.bottoms === maxBottoms && (
                          <FontAwesomeIcon icon={faCrown} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <div className="mt-6">
        {/* Export button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="mb-4 px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white font-semibold rounded-lg shadow-md
    hover:from-purple-700 hover:to-purple-600 transition-colors duration-200 flex items-center gap-2
    focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed" >
          {isExporting ? (
            <>
              <Spinner className="w-4 h-4" />
              Generating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} /> Export
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SeasonTrackRecordTable;
