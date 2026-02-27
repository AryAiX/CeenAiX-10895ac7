import React from 'react';

export const GeometricBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-ceenai-cyan/20 to-ceenai-blue/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-ceenai-blue/20 to-ceenai-cyan/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

      <svg className="absolute top-20 right-20 w-32 h-32 text-ceenai-cyan/10 animate-float" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,40.1,76.8C26.4,84.6,10,87.6,-6.1,87.1C-22.2,86.6,-44.4,82.6,-58.9,72.4C-73.4,62.2,-80.2,45.8,-83.8,28.6C-87.4,11.4,-87.8,-6.6,-83.7,-23.4C-79.6,-40.2,-71,-55.8,-58.8,-63.5C-46.6,-71.2,-30.8,-71,-15.7,-71.5C-0.6,-72,13.8,-73.2,27.6,-69.8C41.4,-66.4,54.6,-58.4,44.7,-76.4Z" transform="translate(100 100)" />
      </svg>

      <svg className="absolute bottom-40 left-10 w-24 h-24 text-ceenai-blue/10 animate-float" style={{ animationDelay: '3s' }} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="currentColor" d="M39.5,-65.6C51.4,-58.2,61.3,-47.8,67.5,-35.6C73.7,-23.4,76.2,-9.4,75.3,4.3C74.4,18,70.1,31.4,62.2,42.1C54.3,52.8,42.8,60.8,30.1,65.8C17.4,70.8,3.6,72.8,-10.7,72.2C-25,71.6,-39.8,68.4,-51.8,61.2C-63.8,54,-73,42.8,-77.4,29.9C-81.8,17,-81.4,2.4,-77.6,-11.1C-73.8,-24.6,-66.6,-37,-56.3,-46.8C-46,-56.6,-32.6,-63.8,-19.2,-70.5C-5.8,-77.2,7.6,-83.4,20.5,-83.2C33.4,-83,46,-76.4,39.5,-65.6Z" transform="translate(100 100)" />
      </svg>

      <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-ceenai-cyan rounded-full animate-pulse" />
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-ceenai-blue rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/2 w-2 h-2 bg-ceenai-cyan rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
    </div>
  );
};
