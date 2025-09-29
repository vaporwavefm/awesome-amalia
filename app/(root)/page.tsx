import Image from "next/image";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Page = () => {

  const bugs = [
    { date: '2025-09-25', note: 'Rendering issues in mobile versions will need to be adjusted. TBD' },
    { date: '2025-09-24', note: 'Need to fix issue involving lipsyncs not being synced correctly if certain episodes do not contain lipsyncs (like s9e1) or if seasons starts at episode 2 (like s3) TBD' },
  ]
  const updates = [
    { date: '2025-09-29', note: 'Fixed ID issues with certain queens having empty IDs. Added original seasons in search results for queens. Added queens from UK1,C2,MX1!' },
    { date: "2025-09-24", note: "Imported all US queens from 1-17, episodes and lipsyncs from 1-7! (Noted some bugs that I will have to fix concerning the lipsyncs). Added menu options in general configuration tab for seasons style/mode." },
    { date: "2025-09-17", note: "Fixed issue where buildCast would render huge red Xs on load (will need to fix the sim page too where it render the Not Found button for a second..). Imported queens from seasons 1-8 and episodes from season 9!" },
    { date: "2025-09-16", note: "Updated Simulation Builder page to allow stats to be manually set. Imported ES1 queens! Made the episode lists on the simulation page to be scrollable." },
    { date: "2025-09-14", note: "First go-live! Simulator currently has the following queens from these seasons imported: US9, US10, US11, UK2, C1. Also available are episodes from US10, US11. For now, only the old-school style season mode is available. Stats have been implemented to weigh results for placements and lipsync outcomes. Stats are currently being generated at random." },
  ];

  return (
    <div className="bg-gradient-to-b from-violet-50 to-white">
      <div className="flex justify-center items-center min-h-screen  px-6 relative overflow-hidden">

        <div className="absolute bottom-70 inset-x-0 flex justify-between opacity-20 pointer-events-none">
          {Array.from({ length: 10 }).map((_, idx) => (
            <Image
              key={idx}
              src="/assets/graphics/lipstick.png"
              alt="lipstick"
              width={100}
              height={100}
              className="rotate-12"
            />
          ))}
        </div>

        <section className="relative z-10 max-w-2xl text-center bg-white shadow-xl rounded-2xl p-8 space-y-8">
          <h1 className="text-3xl font-extrabold text-violet-700">
            Welcome to the RuPaul&apos;s Drag Race Simulator!
          </h1>
          <p className="text-gray-700">
            This is a reboot of a project I first built nearly 10 years ago in{" "}
            <span className="font-semibold">Python 2.7</span> (oh lord...I&apos;m that old).
          </p>
          <p className="text-gray-700">
            To see the original source code for <strong>THAT</strong>,{" "}
            <a
              href="https://github.com/vaporwavefm/RupaulsDragRaceSimulator/blob/master/Queen.py"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 font-medium hover:underline"
            >
              see it on GitHub!
            </a> 😗
          </p>
          <p className="text-gray-700">
            The main reason I wanted to bring this project back was to{" "}
            <span className="font-semibold">
              play around with ReactJS
            </span>{" "}
            and build a full application from the ground up.
          </p>

          <p className="text-gray-700">
            With this simulator, you can build your own casts and your own episode lists (you can even influence the outcome by
            setting queens with different stats!).
          </p>

          <p className="text-gray-700">
            I&apos;ll be posting new features and updates here as I continue
            future deployments.
          </p>

          <div className="pt-4 pb-4 bg-violet-100">
            <p className="mb-3 text-gray-800">If you would like to support me (no pressure!), you can:</p>
            <a
              href="https://www.buymeacoffee.com/vaporwavefm"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition-transform hover:scale-105"
            >
              <Image
                src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png"
                alt="Buy Me A Coffee"
                width={150}
                height={50}
                className="rounded-md shadow"
              />
            </a>
          </div>
          <p className="text-gray-700">
            You can use the navigation menu above or just click <a href="/buildcast" className="text-violet-600 font-medium hover:underline"> here </a> to start
            configuring a new simulation!
          </p>
        </section>
      </div>

      <section className="max-w-3xl mx-auto mt-10 mb-10 p-0 shadow-md rounded-2xl overflow-hidden">
        <Tabs defaultValue="updates" className="w-full pt-8">

          <TabsList className="flex space-x-2 bg-violet-100/60 p-2 rounded-xl justify-center mb-6 gap-2 rounded-full p-1 shadow-inner max-w-4xl mx-auto ">
            <TabsTrigger
              value="updates"
              className="px-4 py-2 text-sm font-medium text-violet-700 rounded-lg 
                   data-[state=active]:bg-violet-600 data-[state=active]:text-white 
                   hover:bg-violet-200 transition"
            >
              Updates
            </TabsTrigger>
            <TabsTrigger
              value="bugs"
              className="px-4 py-2 text-sm font-medium text-red-700 rounded-lg 
                   data-[state=active]:bg-red-600 data-[state=active]:text-white 
                   hover:bg-red-200 transition"
            >
              Werk in Progress
            </TabsTrigger>
          </TabsList>

          {/* Updates Tab */}
          <TabsContent value="updates" className="mt-6 space-y-6">
            <h2 className="text-2xl font-bold text-violet-700">Update Log</h2>
            <ul className="space-y-6 pl-4 pr-4 mb-4">
              {updates.map((update, idx) => (
                <li
                  key={idx}
                  className="relative bg-white border-l-4 border-violet-500 rounded-md shadow-sm hover:shadow-md transition p-4"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-violet-700">{update.date}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{update.note}</p>
                </li>
              ))}
            </ul>
          </TabsContent>

          {/* Bugs Tab */}
          <TabsContent value="bugs" className="mt-6 space-y-6">
            <h2 className="text-2xl font-bold text-red-600">Werk in Progress</h2>
            <ul className="space-y-6 pl-4 pr-4 mb-4">
              {bugs.map((bug, idx) => (
                <li
                  key={idx}
                  className="relative bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm hover:shadow-md transition p-4 mb-2"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-red-600">{bug.date}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{bug.note}</p>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
      </section>

    </div>
  );
};

export default Page;
