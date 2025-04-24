
import { Award, MessageSquare, Star } from "lucide-react";

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

function StatItem({ icon, value, label }: StatItemProps) {
  return (
    <div className="flex flex-col items-center bg-foreground/5 py-6 px-4 rounded-lg border border-foreground/10">
      <div className="text-primary mb-2">{icon}</div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function Stats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatItem 
        icon={<MessageSquare className="h-6 w-6" />} 
        value="10,000+" 
        label="Active Users" 
      />
      <StatItem 
        icon={<Star className="h-6 w-6" />} 
        value="4.9/5" 
        label="User Rating" 
      />
      <StatItem 
        icon={<Award className="h-6 w-6" />} 
        value="100K+" 
        label="AI Conversations" 
      />
    </div>
  );
}
