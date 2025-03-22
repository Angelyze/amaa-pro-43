
import React from 'react';
import { Badge } from '@/components/ui/badge';

const SubscriptionTab = () => {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center">
        <span className="font-medium">Status</span>
        <Badge className="bg-teal hover:bg-teal">Premium</Badge>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        <span className="font-medium">Next billing</span>
        <span>{new Date().toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default SubscriptionTab;
