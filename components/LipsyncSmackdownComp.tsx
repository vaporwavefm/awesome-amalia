/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { getQueenNameById, Queen, QueenStats } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import QueenCard from "./QueenCard";

const LipsyncSmackdownComp = ({ rounds, roundsToShow, queens }: { rounds: any; roundsToShow: any; queens: any }) => {

    const songs: string[] = []; // build song list to display

    roundsToShow.map((round: number) => {
        {
            rounds[round].map((pair: any, idx: number) => {
                const lipsyncTitle =
                    pair.lipsync?.lipsync?.title ?
                        pair.lipsync?.lipsync?.title :
                        "Unknown Song";
                const lipsyncArtist =
                    pair.lipsync?.lipsync?.artist ?
                        pair.lipsync?.lipsync?.artist :
                        "Unknown Artist";
                if (lipsyncTitle != "Unknown Song" && lipsyncArtist != "Unknown Artist") {
                    songs.push(lipsyncTitle + ' by ' + lipsyncArtist)
                }
            })
        }
    });

    songs.sort(() => Math.random() - 0.5);

    return <div className="space-y-8">
        {/* 
        <Tabs defaultValue="trackList" className="w-full">
            <TabsList className="tabs-list flex overflow-x-auto whitespace-nowrap scrollbar-hide">
                <TabsTrigger value="trackList" className="tabs-trigger" >Track List</TabsTrigger>
                <TabsTrigger value="smackdown" className="tabs-trigger" >Smackdown Results</TabsTrigger>
            </TabsList> */}

        {/* Song Tab */}
        {/*<TabsContent value="trackList"> */}
        <div className="flex justify-center mb-4 py-4">
            <div className="general-msg">
                <div className="mt-2 p-3">
                    <p className="text-base font-semibold text-purple-800 italic">
                        These are the songs that Ru has selected for this lipsync smackdown!
                    </p>
                    {
                        songs.map((song, idx) => {
                            return (
                                <div key={idx} className="mt-2 p-3" id={Array.from({ length: 20 }, () => Math.random().toString(36)[2]).join('')}>
                                    <span className="text-violet-700 font-bold not-italic">
                                        {song}
                                    </span>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            
        </div>
        {/*</TabsContent>  */}
        {/*<TabsContent value="smackdown">   */}
        <div className="mt-10">
            
            {roundsToShow.map((round: number) => (
                <div key={round} className="pt-6">
                    <div className="flex justify-center pb-4">
                        <h3 className="general-msg text-xl font-bold not-italic">
                            Round {round}
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {rounds[round].map((pair: any, idx: number) => {
                            const pairIds = pair.pair || [];
                            const winnerId = pair.winnerId;
                            const lipsyncTitle =
                                pair.lipsync?.lipsync?.title ?
                                    pair.lipsync?.lipsync?.title :
                                    "Unknown Song";
                            const lipsyncArtist =
                                pair.lipsync?.lipsync?.artist ?
                                    pair.lipsync?.lipsync?.artist :
                                    "Unknown Artist";
                            const queensInPair = pairIds
                                .map((id: string) => queens?.find((q: Queen) => q.id === id))
                                .filter(Boolean);
                            const isThreeWay = queensInPair.length === 3;

                            return (
                                <div key={idx} className="p-4" >
                                    <div className={`flex justify-center items-center gap-6 flex-wrap`} >
                                        {queensInPair.map((queen: Queen) => (
                                            <div key={queen!.id} >
                                                <QueenCard q={queen!} allQueens={queens} />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-center mt-4 text-violet-700 font-bold not-italic">
                                        <span> Song: {lipsyncTitle} by {lipsyncArtist} </span>
                                    </div>
                                    {winnerId && (
                                        <p className="text-center text-violet-700 font-medium mt-2">
                                            <span className="font-bold not-italic"> {getQueenNameById(queens, winnerId)} </span> wins and is declared safe!
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

        </div>
        {/* </TabsContent>
        </Tabs> */}
    </div>;
};

export default LipsyncSmackdownComp;
