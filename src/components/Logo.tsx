
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-2">AMAA</h1>
      <p className="text-muted-foreground text-sm">Ask Me Almost Anything</p>
    </div>
  );
};

export default Logo;
