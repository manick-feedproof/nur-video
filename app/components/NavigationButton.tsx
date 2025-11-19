import React from "react";
interface NavigationButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  children: React.ReactNode;
}
const NavigationButton = ({
  icon,
  onClick,
  active,
  children,
}: NavigationButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex cursor-pointer items-center gap-2 bg-white text-lg font-bold px-8 py-4 rounded-full ${
        active ? "text-[#4a90e2]" : "text-white bg-white/20"
      } hover:scale-105 transition-all duration-300 hover:shadow-lg`}
    >
      {icon}
      {children}
    </button>
  );
};

export default NavigationButton;
