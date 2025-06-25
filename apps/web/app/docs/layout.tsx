import Link from "next/link";
import { SiGithub } from "react-icons/si";
import Sidebar from "./components/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark">
      <body>
        <div className="flex justify-between max-w-7xl mx-auto px-4 py-4 sticky top-0 backdrop-blur z-50">
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex gap-x-20 h-screen overflow-y-auto mb-20">
          <div className="fixed top-20 h-full w-64 hidden md:block">
            <Sidebar />
          </div>
          <div className="w-[90%] ml-80 h-full">{children}</div>
        </div>
      </body>
    </html>
  );
}
