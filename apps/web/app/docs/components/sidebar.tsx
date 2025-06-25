"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { pages } from "./sidebar-pages";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 fixed top-20 h-full hidden md:block">
      <div className="space-y-4 w-full">
        {pages.map((page) => (
          <div key={page.group} className="w-full">
            <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
              {page.group}
            </h3>
            <div className="w-full flex flex-col">
              {page.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${pathname === item.href ? "bg-white text-black" : "hover:bg-white/5"} w-full h-10 rounded-2xl flex items-center px-3 font-medium text-sm gap-x-2`}
                >
                  <item.icon size={14} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
