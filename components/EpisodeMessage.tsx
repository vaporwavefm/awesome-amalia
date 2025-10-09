import React from "react";
import { SavedLipsync } from "@/lib/utils";

const EVENT_LBLS: Record<string, string> = {
    announceSafe: "Safe Queens",
    winner: "Winner",
    high: "High Queens",
    bottom: "Low",
    bottom2: "Bottom 2",
    eliminated: "Eliminated Queen",
    lsftc1: 'Lipsync For The Crown: Round 1',
    lsftc1win: 'Lipsync For The Crown: Round 1 Results',
    lsftc2: 'Lipsync For The Crown: Round 2',
    lsftc2win: 'Lipsync For The Crown: Round 2 Results',
    lsftcFinal: 'Final Lipsync For the Crown',
    results: "Season Results",
};

const EpisodeMessage = ({ episodeEvent, eventMessage, lipsyncObj, seasonTitle, episodeNumber, episodeType }:
    {
        episodeEvent: string;
        eventMessage: string;
        lipsyncObj: SavedLipsync | null;
        seasonTitle: string;
        episodeNumber: number;
        episodeType: string;
    }) => {

    let label = EVENT_LBLS[episodeEvent] || "Queens";
    if (episodeEvent === 'results') label = seasonTitle + ' Results';
    let mainMessage = eventMessage;
    let lipsyncMessage = "";
    let afterStr = '';
    const isLSFTC = ['lsftc1', 'lsftc2', 'lsftcFinal'].includes(episodeEvent);

    if (episodeEvent === "bottom2" && eventMessage.includes("lipsync to")) {
        const [before, after] = eventMessage.split("They will now have to lipsync to");
        mainMessage = before.trim();
        lipsyncMessage = "They will now have to lipsync to";
        afterStr = lipsyncObj?.lipsync?.title
            ? `${lipsyncObj.lipsync.title} by ${lipsyncObj.lipsync.artist}`
            : "";
    }
    if (isLSFTC) {
        lipsyncMessage = "They will now have to lipsync to" + '';
        afterStr = lipsyncObj?.lipsync?.title
            ? `${lipsyncObj.lipsync.title} by ${lipsyncObj.lipsync.artist}`
            : "";
    } else if (!isLSFTC && episodeEvent != 'results' && !episodeType.includes('finale')) {
        label = 'Episode ' + episodeNumber + ': ' + label;
    }

    return <>
        <div className="flex justify-center mb-4 py-4">
            <div className="general-msg">
                <h2 className="font-extrabold text-2xl text-black tracking-wide">
                    {label}
                </h2>
                {mainMessage && (
                    <p className="mt-2 text-base font-medium text-purple-800">
                        {mainMessage}
                    </p>
                )}
                {lipsyncMessage && (
                    <>
                        <hr className="my-3 border-t border-gray-300" />
                        <div className="mt-2 p-3">
                            <p className="text-base font-semibold text-purple-800 italic">
                                They will now have to lipsync to{" "}
                            </p>
                            <br />
                            <p>
                                <span className="text-violet-700 font-bold not-italic">
                                    {afterStr}.
                                </span>
                            </p> <br />
                            <p className="text-base font-semibold text-purple-800 italic">
                                Good luck and don&apos;t fuck it up!
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    </>;
};

export default EpisodeMessage;
