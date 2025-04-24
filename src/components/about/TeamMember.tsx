
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface TeamMemberProps {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export function TeamMember({ name, role, avatar, bio }: TeamMemberProps) {
  return (
    <Card className="overflow-hidden p-6 flex flex-col items-center text-center">
      <Avatar className="h-24 w-24 mb-6">
        <AvatarImage
          src={`https://images.unsplash.com/${avatar}`}
          alt={name}
          className="object-cover"
        />
        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
      </Avatar>
      <h3 className="font-semibold text-lg mb-1">{name}</h3>
      <p className="text-primary mb-3 text-sm">{role}</p>
      <p className="text-muted-foreground text-sm">{bio}</p>
    </Card>
  );
}
