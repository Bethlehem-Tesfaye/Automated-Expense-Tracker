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
        className="h-12 w-12 object-contain"
      />
      <span className="text-2xl font-bold">Expense Tracker</span>
    </div>
  );
};

export default Logo;
