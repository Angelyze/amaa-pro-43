
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <img 
        src="/AMAA.png" 
        alt="AMAA" 
        className="h-24 md:h-32 animate-float" 
      />
    </div>
  );
};

export default Logo;
