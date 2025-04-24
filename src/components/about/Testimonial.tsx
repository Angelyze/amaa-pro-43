
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TestimonialProps {
  content: string;
  author: string;
  role: string;
  avatar?: string;
}

export function Testimonial({ content, author, role, avatar }: TestimonialProps) {
  return (
    <Card className="bg-background/50 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <p className="text-muted-foreground italic">{content}</p>
          <div className="flex items-center gap-3">
            <Avatar>
              {avatar && <AvatarImage src={avatar} alt={author} />}
              <AvatarFallback>{author[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{author}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
