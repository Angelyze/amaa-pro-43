
import { Separator } from "@/components/ui/separator";

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

const timeline: TimelineEvent[] = [
  {
    date: "2024",
    title: "AMAA.pro Launch",
    description: "Launched our AI assistant platform with a vision to make AI accessible to everyone."
  },
  {
    date: "2024 Q2",
    title: "Voice Integration",
    description: "Added advanced text-to-speech capabilities with customizable voices."
  },
  {
    date: "2024 Q3",
    title: "Premium Features",
    description: "Introduced premium features including conversation management and priority processing."
  },
  {
    date: "2025",
    title: "Growing Community",
    description: "Reached milestone of 10,000+ active users and expanding feature set."
  }
];

export function JourneyTimeline() {
  return (
    <div className="space-y-8">
      {timeline.map((event, index) => (
        <div key={index} className="relative">
          <div className="flex items-start gap-4">
            <div className="min-w-24 pt-1">
              <span className="text-primary font-semibold">{event.date}</span>
            </div>
            <div>
              <div className="absolute left-[5.5rem] top-2 h-2 w-2 rounded-full bg-primary" />
              <h3 className="font-semibold mb-2">{event.title}</h3>
              <p className="text-muted-foreground">{event.description}</p>
              {index < timeline.length - 1 && (
                <div className="absolute left-[5.85rem] top-4 bottom-0 w-[1px] bg-border h-20" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
