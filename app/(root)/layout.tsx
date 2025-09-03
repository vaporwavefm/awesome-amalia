import NavMenu from "@/components/NavMenu";
import React from "react";

const layout = async ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <NavMenu />
            <div className="main-content">
                {/*JSON.stringify(users)*/}
                {children}
            </div>
        </>
    )
};

export default layout;
