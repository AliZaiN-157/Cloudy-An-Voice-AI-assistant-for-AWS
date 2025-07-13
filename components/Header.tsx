
import React from 'react';
import { HamburgerIcon } from './icons';

interface HeaderProps {
  toggleSidebar: () => void;
  topic: string;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, topic }) => {
  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="md:hidden p-1 rounded-md hover:bg-gray-100">
          <HamburgerIcon className="h-6 w-6 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold capitalize">{topic}</h2>
      </div>
      <div>
        {/* Placeholder for future actions like search or notifications */}
      </div>
    </header>
  );
};
