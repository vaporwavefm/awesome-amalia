import React from "react";
import NavMenu from "@/components/NavMenu";
const layout = ({ children }: { children: React.ReactNode }) => {
  return <div>
    <NavMenu />
    <div className="bg-gradient-to-b from-violet-50 to-white"> {children}</div>
    </div>;
};

export default layout;
