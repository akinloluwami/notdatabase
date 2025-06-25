import Link from "next/link";
import { SiGithub } from "react-icons/si";
import Sidebar from "./components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="max-w-7xl mx-auto px-4 w-full">
      <div className="flex justify-between mx-auto py-4 sticky top-0 backdrop-blur z-50">
        <div className="flex items-center gap-1">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" className="w-6" />
            <p className="font-semibold">NotDatabase</p>
          </Link>
          <p className="text-gray-500">Docs</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center gap-2">
          <Link
            href="https://github.com/akinloluwami/notdatabase"
            className="p-1 hover:bg-white/10 rounded-sm transition-colors"
            target="_blank"
          >
            <SiGithub size={20} />
          </Link>
        </div>
      </div>
      <div className="flex lg:ap-x-10">
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
