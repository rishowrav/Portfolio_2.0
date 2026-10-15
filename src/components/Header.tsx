"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { portfolioConfig } from "@/config/portfolio";
import { MobileMenu } from "./MobileMenu";

interface HeaderProps {
  activeSection?: string;
}

export const Header: React.FC<HeaderProps> = ({ activeSection = "Home" }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentActive, setCurrentActive] = useState(activeSection);

  const { leftMenu, rightMenu } = portfolioConfig.navigation;

  const handleNavClick = (label: string, href: string) => {
    setCurrentActive(label);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="relative z-30 w-full max-w-[1580px] mx-auto px-6 sm:px-12 lg:px-16 pt-6 sm:pt-7 pb-2 transition-all">
        <nav className="flex items-center justify-between" aria-label="Main Navigation">
          
          {/* Left Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center gap-10 lg:gap-14 flex-1 justify-start">
            {leftMenu.map((item) => {
              const isActive = currentActive.toLowerCase() === item.label.toLowerCase();
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                  className={`group relative py-1 text-[15px] lg:text-[16.5px] tracking-tight transition-colors duration-200 ${
                    isActive ? "font-bold text-[#0F172A]" : "font-medium text-slate-700 hover:text-brand-500"
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Underline indicator matching mockup */}
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-brand-500 transition-all duration-300 ${
                      isActive
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </div>

          {/* Centered RS Logo: Perfectly Centered */}
          <div className="flex-shrink-0 flex items-center justify-center mx-auto md:mx-6">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick("Home", "#home");
              }}
              className="group block transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label="Home"
            >
              <div className="relative w-24 h-11 sm:w-28 sm:h-12 flex items-center justify-center">
                <Image
                  src="/logo.png"
                  alt="RS Logo"
                  width={120}
                  height={54}
                  className="w-auto h-9 sm:h-10 md:h-[42px] object-contain filter drop-shadow-sm"
                  priority
                />
              </div>
            </a>
          </div>

          {/* Right Navigation Items (Desktop) */}
          <div className="hidden md:flex items-center gap-10 lg:gap-14 flex-1 justify-end">
            {rightMenu.map((item) => {
              const isActive = currentActive.toLowerCase() === item.label.toLowerCase();
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.label, item.href);
                  }}
                  className={`group relative py-1 text-[15px] lg:text-[16.5px] tracking-tight transition-colors duration-200 ${
                    isActive ? "font-bold text-[#0F172A]" : "font-medium text-slate-700 hover:text-brand-500"
                  }`}
                >
                  <span>{item.label}</span>
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-brand-500 transition-all duration-300 ${
                      isActive
                        ? "opacity-100 scale-x-100"
                        : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                    }`}
                  />
                </a>
              );
            })}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl text-slate-800 hover:text-brand-500 hover:bg-slate-100/80 transition-colors"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeItem={currentActive}
        onSelect={(href) => {
          const item = [...leftMenu, ...rightMenu].find((n) => n.href === href);
          if (item) setCurrentActive(item.label);
          const element = document.querySelector(href);
          if (element) element.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </>
  );
};
