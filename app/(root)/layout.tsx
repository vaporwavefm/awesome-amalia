import React from "react";
import NavMenu from "@/components/NavMenu";
const layout = ({ children }: { children: React.ReactNode }) => {
  return <div>
    <NavMenu />
    <div className="mt-8"> {children}</div>
    </div>;
};

export default layout;
