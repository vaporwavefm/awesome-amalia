"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

const NavMenu = () => {
  return (
    <header className="w-full border-b bg-pink-100 backdrop-blur-md shadow-sm">
      <NavigationMenu className="max-w-7xl mx-auto px-6 py-3">
        <NavigationMenuList className="flex items-center justify-between w-full">
          {/* Left side (main links) */}
          <div className="flex items-center gap-6">
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/"
                  className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  title="Go back to the homepage"
                >
                  Home
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

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

            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link
                  href="/sim"
                  className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors"
                  title="Run the latest simulation configuration"
                >
                  Run Latest Simulation
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </div>

          {/* Right side (socials / actions) */}
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
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};

export default NavMenu;
