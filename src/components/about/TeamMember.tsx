
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMemberProps {
  name: string;
  role: string;
  avatar?: string;
  bio: string;
}

export function TeamMember({ name, role, avatar, bio }: TeamMemberProps) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <Avatar className="h-24 w-24 mb-4">
        {avatar && <AvatarImage src={avatar} alt={name} />}
        <AvatarFallback className="text-xl">{name[0]}</AvatarFallback>
      </Avatar>
      <h3 className="font-semibold text-lg mb-1">{name}</h3>
      <p className="text-primary mb-2 text-sm">{role}</p>
      <p className="text-muted-foreground text-sm">{bio}</p>
    </div>
  );
}
