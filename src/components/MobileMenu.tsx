"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { X, ExternalLink, ArrowRight } from "lucide-react";
import { portfolioConfig, NavItem } from "@/config/portfolio";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: string;
  onSelect: (href: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  activeItem = "Home",
  onSelect,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);

  const allNavItems: NavItem[] = [
    ...portfolioConfig.navigation.leftMenu,
    ...portfolioConfig.navigation.rightMenu,
  ];

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      document.body.style.overflow = "hidden";
      const tl = gsap.timeline();
      tl.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: "auto",
        duration: 0.25,
        ease: "power2.out",
      })
      .to(panelRef.current, {
        x: "0%",
        duration: 0.35,
        ease: "power3.out",
      }, "-=0.15")
      .fromTo(
        linksRef.current?.children || [],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, stagger: 0.04, duration: 0.25, ease: "power2.out" },
        "-=0.2"
      );
    } else {
      document.body.style.overflow = "";
      const tl = gsap.timeline();
      tl.to(panelRef.current, {
        x: "100%",
        duration: 0.25,
        ease: "power3.in",
      })
      .to(overlayRef.current, {
        opacity: 0,
        pointerEvents: "none",
        duration: 0.2,
        ease: "power2.in",
      }, "-=0.1");
    }
  }, [isOpen]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl p-6 flex flex-col justify-between translate-x-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header row in mobile menu */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Showrav Logo"
                width={70}
                height={30}
                className="w-auto h-7 object-contain"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <div ref={linksRef} className="mt-8 flex flex-col gap-2">
            {allNavItems.map((item) => {
              const isActive = activeItem.toLowerCase() === item.label.toLowerCase();
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(item.href);
                    onClose();
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-brand-50 text-brand-600 font-semibold"
                      : "text-slate-700 hover:text-brand-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-300 opacity-60" />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Footer info & CTA */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <a
            href={portfolioConfig.personal.primaryCta.href}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full bg-brand-500 text-white font-medium hover:bg-brand-600 shadow-md shadow-brand-500/20 transition-all text-sm"
          >
            {portfolioConfig.personal.primaryCta.label}
            <ArrowRight className="w-4 h-4" />
          </a>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
            <span>© {new Date().getFullYear()} {portfolioConfig.personal.fullName}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
