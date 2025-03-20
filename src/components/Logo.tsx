
import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <img src="/AMAA.png" alt="AMAA" className="h-16 md:h-24 mb-2" />
      <p className="text-muted-foreground text-sm">Ask Me Almost Anything</p>
    </div>
  );
};

export default Logo;
