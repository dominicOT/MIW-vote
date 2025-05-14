"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, KeyRound, BarChart3, ShieldCheck, Settings2, UserPlus } from "lucide-react";

export default function SiteHeader() {
  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary flex items-center">
          <VoteIcon className="h-8 w-8 mr-2" />
          VoteVerify
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/">
              <KeyRound className="mr-2 h-4 w-4" /> OTP Entry
            </Link>
          </Button>
          {/* <Button variant="ghost" asChild>
            <Link href="/admin">
              <Settings2 className="mr-2 h-4 w-4" /> Admin Panel
            </Link>
          </Button> */}
        </nav>
      </div>
    </header>
  );
}

// Inline SVG for VoteIcon as lucide-react might not have a direct match
function VoteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 12H5" />
      <path d="M10 17H5" />
      <path d="M10 7H5" />
      <path d="m15 12-3-3v6l3-3z" />
      <path d="M10.938 5.214a2.5 2.5 0 0 1 4.275.058l3.788 8.058a2.5 2.5 0 0 1-2.138 3.67H7.138a2.5 2.5 0 0 1-2.137-3.67l3.788-8.058a2.5 2.5 0 0 1 2.15-.996z" />
    </svg>
  );
}
