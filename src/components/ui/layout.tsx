
import React from "react";
import Header from "@/components/Header";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  title?: string;
}

export function Layout({ children, showBackButton, title }: LayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {!showBackButton ? (
        <Header 
          mainSearchVisible={false}
          onSendMessage={() => {}}
          onScrollToTop={() => {}}
          isLoggedIn={true}
          onLogin={async () => {}}
        />
      ) : (
        <div className="border-b border-border relative z-10">
          <div className="container py-4 flex items-center">
            <Button 
              variant="ghost" 
              className="mr-4" 
              size="icon"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={20} />
            </Button>
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
          </div>
        </div>
      )}
      <main className="flex-1 relative z-10">
        {children}
      </main>
    </div>
  );
}
