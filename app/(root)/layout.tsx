import React from "react";
import NavMenu from "@/components/NavMenu";
import { SeasonsProvider } from "@/components/SeasonsContext";
import { Suspense } from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return <Suspense>
    <SeasonsProvider>
      <NavMenu />
      <div className="bg-gradient-to-b from-violet-50 to-white">
        {children}
      </div>
    </SeasonsProvider>
  </Suspense>
};

export default layout;
