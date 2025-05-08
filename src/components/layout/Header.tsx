import React from "react";

const Header: React.FC = () => {
  return (
    <header className="border-b bg-background z-10">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-primary-foreground"
            >
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <path d="M9 15v2" />
              <path d="M15 15v2" />
              <path d="M5 9h14" />
            </svg>
          </div>
          <span className="text-lg font-semibold">Space Styler Visualizer</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
