"use client";
import * as React from "react";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { useSeasons } from "@/components/SeasonsContext";
import { usePathname } from "next/navigation";

const NavMenu = () => {

  const { seasons } = useSeasons();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();
  const getNavLinkClass = (href: string) => {
    const active = pathname === href;
    return ["flex items-center h-9 px-3 rounded-md", "text-sm font-medium", "transition-colors duration-200", active
      ? "bg-pink-600 text-white shadow-sm"
      : "text-slate-700 hover:bg-pink-100 hover:text-pink-700",].join(" ");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-200/70 bg-gradient-to-r from-pink-50 via-rose-50 to-pink-100 shadow-sm backdrop-blur-md">
      <NavigationMenu key={pathname} className="mx-auto max-w-7xl px-6 py-3 overflow-x-auto md:overflow-visible">
        <NavigationMenuList className="flex min-w-max items-center gap-1 whitespace-nowrap">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className={getNavLinkClass("/")}>
                Home
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/buildcast" className={getNavLinkClass("/buildcast")} title="Start building a new simulation" >
                Simulation Builder
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <div
            className="relative"
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <div className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors cursor-pointer select-none">
                  Saved Season Runs
                </div>
              </NavigationMenuLink>
            </NavigationMenuItem>

            {isDropdownOpen && (
              <div className="absolute top-full min-w-[250px] left-0 mt-0.5 bg-white border border-gray-200 shadow-xl rounded-xs z-[9999]">
                {seasons.length > 0 ? (
                  [...seasons].map((season, index, arr) => (
                    <Link
                      key={season.id}
                      href={`/sim?id=${season.id}`}
                      className="group block px-4 py-3 transition hover:bg-pink-50"
                    >
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-pink-500 text-center">
                        {season.title}
                      </div>
                      <div className="text-xs italic text-gray-400 text-center">
                        Generated {season.date}
                      </div>
                    </Link>

                  ))
                ) : (
                  <span className="block px-4 py-2 text-sm italic text-gray-400">
                    No saved seasons!
                  </span>
                )}
              </div>
            )}
          </div>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/sim" className={getNavLinkClass("/sim")} title="Run the latest simulation configuration and generate a new season" >
                Run Simulation
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <div className="mx-2 h-6 w-px bg-pink-200" />
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="https://github.com/vaporwavefm"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Go to my GitHub page"
              >
                <FontAwesomeIcon icon={faGithub} size="lg" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link
                href="https://linkedin.com/in/jorge-juarez-0b0a8a85"
                target="_blank"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                title="Go to my LinkedIn page"
              >
                <FontAwesomeIcon icon={faLinkedin} size="lg" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};

export default NavMenu;
