export interface NavItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface PortfolioConfig {
  personal: {
    greeting: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: string;
    bio: string;
    primaryCta: {
      label: string;
      href: string;
    };
    secondaryCta: {
      label: string;
      href: string;
    };
  };
  navigation: {
    leftMenu: NavItem[];
    rightMenu: NavItem[];
  };
  socialLinks: {
    github: string;
    linkedin: string;
    twitter: string;
    email: string;
  };
  character: {
    totalFrames: number;
    neutralFrame: number;
    leftMaxFrame: number;
    rightMaxFrame: number;
    framePattern: string; // e.g. "/facemovement/frame-{index}.webp"
    tiltFactor: number;
  };
  meta: {
    title: string;
    description: string;
  };
}

export const portfolioConfig: PortfolioConfig = {
  personal: {
    greeting: "Hello, I'm",
    firstName: "Rahimul Islam",
    lastName: "Showrav",
    fullName: "Rahimul Islam Showrav",
    role: "Frontend Developer",
    bio: "I build modern, responsive, and user-friendly web experiences. I love turning ideas into real products with clean code and great design.",
    primaryCta: {
      label: "View My Projects",
      href: "#projects",
    },
    secondaryCta: {
      label: "Contact Me",
      href: "#contact",
    },
  },
  navigation: {
    leftMenu: [
      { label: "Home", href: "#home", isActive: true },
      { label: "About", href: "#about" },
      { label: "Skills", href: "#skills" },
    ],
    rightMenu: [
      { label: "Projects", href: "#projects" },
      { label: "Resume", href: "#resume" },
      { label: "Contact", href: "#contact" },
    ],
  },
  socialLinks: {
    github: "https://github.com/showrav",
    linkedin: "https://linkedin.com/in/showrav",
    twitter: "https://twitter.com/showrav",
    email: "mailto:contact@showrav.dev",
  },
  character: {
    totalFrames: 160,
    neutralFrame: 80, // Frame 80 is looking dead center at the user
    leftMaxFrame: 40, // Frame 40 is looking furthest to our left
    rightMaxFrame: 120, // Frame 120 is looking furthest to our right
    framePattern: "/facemovement/frame-{index}.webp",
    tiltFactor: 8, // Degrees of 3D tilt
  },
  meta: {
    title: "Rahimul Islam Showrav | Frontend Developer",
    description: "Creative frontend developer portfolio of Rahimul Islam Showrav specializing in React, Next.js, WebGL & GSAP animations.",
  },
};
