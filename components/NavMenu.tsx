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

const NavMenu = () => {

  const { seasons } = useSeasons();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-pink-100/80 to-pink-200/80 backdrop-blur-md border-b border-pink-200/60">
      <NavigationMenu className="max-w-7xl mx-auto px-6 py-3">
        <NavigationMenuList className="flex items-center justify-between w-full">
          <div className="flex items-center gap-8">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className="text-lg font-semibold tracking-tight text-gray-700 hover:text-pink-600 transition-colors">
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <div className="flex items-center gap-6">

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/buildcast"
                    className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                    title="Start building a new simulation"
                  >
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
                  <Link
                    href="/sim"
                    className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                    title="Run the latest simulation configuration and generate a new season"
                  >
                    Run Latest Simulation
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </div>
          </div>
          <div className="flex items-center gap-4">
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
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};

export default NavMenu;
