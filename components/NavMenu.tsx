"use client";

import * as React from "react"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

import Link from "next/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

function ListItem({
    title,
    children,
    href,
    ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
    return (
        <li {...props}>
            <NavigationMenuLink asChild>
                <Link href={href}>
                    <div className="text-sm leading-none font-medium">{title}</div>
                    <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
                        {children}
                    </p>
                </Link>
            </NavigationMenuLink>
        </li>
    )
}

const NavMenu = () => {
    return <div className="w-full bg-pink-100 shadow-md ">
        <NavigationMenu className="max-w-7xl mx-auto px-6 py-3">
            <NavigationMenuList className="flex justify-between w-full">
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                    >
                        <Link href="/">
                            Home
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                    >
                        <Link href="/buildcast">
                            Simulation Builder
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                    >
                        <Link href="/sim">
                            Latest Simulation
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink
                        asChild
                        className="px-4 py-2 rounded-xl hover:bg-gray-100 transition-all font-semibold"
                    >
                        <Link
                            href="https://github.com/vaporwavefm"
                            target="_blank"
                            className="flex items-center gap-2"
                        >
                            <FontAwesomeIcon icon={faGithub} />
                        </Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

    </div>;
};

export default NavMenu;
