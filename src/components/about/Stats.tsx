
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Globe, Users, Sparkles, Clock } from 'lucide-react';

export function Stats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <Users className="h-8 w-8 mb-2 text-primary" />
          <h3 className="text-2xl font-bold">35,000+</h3>
          <p className="text-sm text-muted-foreground">Active Users</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <Sparkles className="h-8 w-8 mb-2 text-primary" />
          <h3 className="text-2xl font-bold">1.2M+</h3>
          <p className="text-sm text-muted-foreground">AI Queries</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <Globe className="h-8 w-8 mb-2 text-primary" />
          <h3 className="text-2xl font-bold">120+</h3>
          <p className="text-sm text-muted-foreground">Countries</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
          <Clock className="h-8 w-8 mb-2 text-primary" />
          <h3 className="text-2xl font-bold">24/7</h3>
          <p className="text-sm text-muted-foreground">Availability</p>
        </CardContent>
      </Card>
    </div>
  );
}
