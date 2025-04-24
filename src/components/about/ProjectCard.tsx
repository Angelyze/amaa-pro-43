
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
    <Card className="overflow-hidden p-6 flex flex-col items-center text-center shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] hover:brightness-100">
      {image && (
        <div className="w-24 h-24 mb-6 overflow-hidden rounded-lg">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
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
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}
