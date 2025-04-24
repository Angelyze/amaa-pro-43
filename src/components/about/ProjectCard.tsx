
import { Card } from "@/components/ui/card";

interface ProjectCardProps {
  name: string;
  role: string;
  image?: string;
  description: string;
  link?: string;
}

export function ProjectCard({ name, role, image, description, link }: ProjectCardProps) {
  const content = (
    <Card className="overflow-hidden">
      <div className="aspect-video relative overflow-hidden">
        {image && (
          <img
            src={`https://images.unsplash.com/${image}`}
            alt={name}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="font-semibold text-lg mb-1">{name}</h3>
        <p className="text-primary mb-3 text-sm">{role}</p>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
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
