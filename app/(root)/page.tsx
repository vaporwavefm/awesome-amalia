import Image from "next/image";
import React from "react";

const Page = () => {

  const updates = [
    { date: "2025-09-14", note: "First go-live! Simulator currently has the following queens from these seasons imported: US9, US10, US11, UK2, C1. Also available are episodes from US10, US11. For now, only the old-school style season mode is available. Stats have been implemented to weigh results for placements and lipsync outcomes. Stats are currently being generated at random." },
  ];

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-violet-50 to-white px-6 relative overflow-hidden">

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
              challenge myself with ReactJS
            </span>{" "}
            and build a full application from the ground up.
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

      <section className="max-w-3xl mx-auto mt-10 mb-10 p-6 bg-white shadow-md rounded-2xl space-y-4">
        <h2 className="text-2xl font-bold text-violet-700 mb-4">Update Log</h2>
        <ul className="space-y-2 text-gray-700">
          {updates.map((update, idx) => (
            <li key={idx} className="border-l-4 border-violet-500 pl-3">
              <span className="font-semibold">{update.date}:</span> {update.note}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Page;
