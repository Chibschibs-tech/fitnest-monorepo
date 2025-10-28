"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const routes = [
  { href: "/", label: "Home" },
  { href: "/plans", label: "Meal Plans" },
  { href: "/menu", label: "Meals" },
  { href: "/catalogue", label: "How It Works" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar(){
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (p:string) => pathname === p;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            {/* Logo du repo d'origine */}
            <img
              src="https://obtmksfewry4ishp.public.blob.vercel-storage.com/Logo/Logo-Fitnest-Vert-v412yUnhxctld0VkvDHD8wXh8H2GMQ.png"
              alt="Fitnest.ma Logo"
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden md:flex md:items-center md:space-x-6">
            {routes.map((r)=>(
              <Link
                key={r.href}
                href={r.href}
                className={`text-sm font-medium hover:text-fitnest-green ${isActive(r.href) ? "text-fitnest-green" : "text-gray-600"}`}
              >
                {r.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/subscribe" className="rounded-md bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
            Subscribe
          </Link>
        </div>

        {/* Mobile */}
        <button className="md:hidden rounded-md border p-2" onClick={()=>setOpen(true)} aria-label="Menu">
          <Menu className="h-5 w-5" />
        </button>

        {open && (
          <div className="fixed inset-0 z-50 bg-black/20" onClick={()=>setOpen(false)}>
            <div className="absolute right-0 top-0 h-full w-[80%] max-w-xs bg-white shadow-lg p-6" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-bold">Menu</span>
                <button className="rounded-md p-2" onClick={()=>setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
              </div>
              <nav className="flex flex-col space-y-4">
                {routes.map((r)=>(
                  <Link
                    key={r.href}
                    href={r.href}
                    className={`py-2 text-sm font-medium hover:text-fitnest-green ${isActive(r.href) ? "text-fitnest-green" : "text-gray-600"}`}
                    onClick={()=>setOpen(false)}
                  >
                    {r.label}
                  </Link>
                ))}
                <Link href="/subscribe" className="rounded-md bg-fitnest-green px-4 py-2 text-center text-sm font-medium text-white hover:bg-emerald-600" onClick={()=>setOpen(false)}>
                  Subscribe
                </Link>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
