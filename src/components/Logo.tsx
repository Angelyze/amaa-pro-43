
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 text-gradient animate-float">
        AMAA
      </h1>
      <p className="text-xl text-muted-foreground animate-fade-in">
        Ask Me Anything About
      </p>
    </div>
  );
};

export default Logo;
