"use client";

import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, Upload, Video, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/videos");
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/videos" className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg">
              <Video size={24} className="text-white" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Nurhasana&apos;s Video Platform
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-4">
              {pathname !== "/videos" && (
                <Link
                  href="/videos"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
                >
                  <Video size={20} />
                  <span className="font-medium">Videos</span>
                </Link>
              )}

              {isAuthenticated && pathname !== "/upload" && (
                <Link
                  href="/upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
                >
                  <Upload size={20} />
                  <span className="font-medium">Upload</span>
                </Link>
              )}
            </nav>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span className="font-medium">Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                <LogOut size={20} className="rotate-180" />
                <span className="font-medium">Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-2">
              {pathname !== "/videos" && (
                <Link
                  href="/videos"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
                >
                  <Video size={20} />
                  <span className="font-medium">Videos</span>
                </Link>
              )}

              {isAuthenticated && pathname !== "/upload" && (
                <Link
                  href="/upload"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
                >
                  <Upload size={20} />
                  <span className="font-medium">Upload</span>
                </Link>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all text-left"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                >
                  <LogOut size={20} className="rotate-180" />
                  <span className="font-medium">Login</span>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
