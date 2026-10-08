import React from "react";
import { logoIcon } from "../assets";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <img
        src={logoIcon as string}
        alt="Expense Tracker logo"
        className="h-11 w-11 rounded-2xl bg-white/15 object-contain p-2 backdrop-blur"
      />
      <span className="text-xl font-bold tracking-tight">Expense Tracker</span>
    </div>
  );
};

export default Logo;
