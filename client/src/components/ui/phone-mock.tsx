import { ReactNode } from "react";

interface PhoneMockProps {
  children: ReactNode;
}

export default function PhoneMock({ children }: PhoneMockProps) {
  return (
    <div className="relative">
      {/* Phone frame for desktop */}
      <div className="hidden md:block relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        <div className="bg-black rounded-[2rem] overflow-hidden relative">
          {/* Phone screen */}
          <div className="relative bg-black text-white rounded-[1.5rem] overflow-hidden">
            {children}
          </div>
          
          {/* Home indicator */}
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full"></div>
        </div>
        
        {/* Side buttons */}
        <div className="absolute left-0 top-20 w-1 h-8 bg-gray-700 rounded-r"></div>
        <div className="absolute left-0 top-32 w-1 h-12 bg-gray-700 rounded-r"></div>
        <div className="absolute left-0 top-48 w-1 h-12 bg-gray-700 rounded-r"></div>
        <div className="absolute right-0 top-24 w-1 h-16 bg-gray-700 rounded-l"></div>
      </div>
      
      {/* Full screen for mobile */}
      <div className="md:hidden bg-black text-white h-full w-full relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
