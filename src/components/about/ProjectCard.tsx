
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ProjectCardProps {
  name: string;
  role: string;
  image?: string;
  description: string;
  link?: string;
}

export function ProjectCard({ name, role, image, description, link }: ProjectCardProps) {
  const content = (
    <Card className="overflow-hidden p-6 flex flex-col items-center text-center">
      {image && (
        <Avatar className="h-24 w-24 mb-6">
          <AvatarImage
            src={`https://images.unsplash.com/${image}`}
            alt={name}
            className="object-cover"
          />
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      <h3 className="font-semibold text-lg mb-1">{name}</h3>
      <p className="text-primary mb-3 text-sm">{role}</p>
      <p className="text-muted-foreground text-sm">{description}</p>
    </Card>
  );

  if (link) {
    return (
      <a 
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block transition-transform hover:-translate-y-1 duration-300"
      >
        {content}
      </a>
    );
  }

  return content;
}
