import React, { useState } from 'react';
import { Settings } from './Settings';

export const BurgerMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Burger Icon */}
      <button 
        onClick={toggleMenu}
        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className={`block w-full h-1 bg-gray-800 dark:bg-gray-200 rounded transition-transform duration-300 ${isOpen ? 'transform rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-full h-1 bg-gray-800 dark:bg-gray-200 rounded transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-full h-1 bg-gray-800 dark:bg-gray-200 rounded transition-transform duration-300 ${isOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></span>
        </div>
      </button>

      {/* Menu Panel */}
      <div 
        className={`absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg overflow-hidden transition-all duration-300 transform ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Settings</h2>
          <Settings />
        </div>
      </div>
    </div>
  );
}; 