
import { Card } from "@/components/ui/card";

interface TeamMemberProps {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export function TeamMember({ name, role, avatar, bio }: TeamMemberProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        <img
          src={`https://images.unsplash.com/${avatar}`}
          alt={name}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-primary mb-3 text-sm">{role}</p>
        <p className="text-muted-foreground text-sm">{bio}</p>
      </div>
    </Card>
  );
}
