import React from "react";
import { pages } from "../sidebar-pages";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MobileDrawer: React.FC<MobileDrawerProps> = ({ open, onOpenChange }) => {
  const pathname = usePathname();
  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-drawer"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 z-50 w-screen h-screen bg-black/99 lg:hidden"
          >
            <button
              className="absolute top-4 right-4 p-2 rounded hover:bg-black/10 dark:hover:bg-white/10"
              onClick={() => onOpenChange(false)}
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <nav className="pt-12 px-4">
              {pages.map((page) => (
                <div key={page.group} className="mb-6">
                  <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                    {page.group}
                  </h3>
                  <div className="flex flex-col gap-1">
                    {page.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`${pathname === item.href ? "bg-white text-black" : "hover:bg-white/5"} flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium`}
                        onClick={() => onOpenChange(false)}
                      >
                        <item.icon size={16} />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDrawer;

/**
 * 
 *  <div className="fixed inset-0 -z-10 w-screen h-screen bg-gradient-to-br from-blue-400 via-pink-300 to-yellow-200"></div>
 * <div
        className={`fixed top-0 left-0 z-50 h-full backdrop-blur-lg transform transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-[200%]"}`}
        style={{ willChange: "transform" }}
      >
        <button
          className="absolute top-4 right-4 p-2 rounded hover:bg-black/10 dark:hover:bg-white/10"
          onClick={() => onOpenChange(false)}
          aria-label="Close menu"
        >
          <svg
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <nav className="pt-12 px-4">
          {pages.map((page) => (
            <div key={page.group} className="mb-6">
              <h3 className="text-xs font-medium text-gray-400 uppercase mb-2">
                {page.group}
              </h3>
              <div className="flex flex-col gap-1">
                {page.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-black/10 dark:hover:bg-white/10"
                    onClick={() => onOpenChange(false)}
                  >
                    <item.icon size={16} />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
 */
