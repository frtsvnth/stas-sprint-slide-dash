import { useState } from "react";
import { cn } from "@/lib/utils";

interface GameElementProps {
  id: string;
  type: "header" | "list" | "image" | "chart" | "plans" | "useless";
  content: string | string[];
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  className?: string;
}

export const GameElement = ({ id, type, content, onDragStart, onDragEnd, className }: GameElementProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(e, id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const renderContent = () => {
    switch (type) {
      case "header":
        return <h2 className="text-2xl font-bold text-foreground">{content as string}</h2>;
      
      case "list":
        return (
          <ul className="space-y-2 text-sm">
            {(content as string[]).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        );
      
      case "image":
        return (
          <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/30">
            <div className="text-primary text-xs font-semibold mb-2">ИНТЕРФЕЙС</div>
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded flex items-center justify-center">
              <span className="text-primary/60 text-sm">Скриншот продукта</span>
            </div>
          </div>
        );
      
      case "chart":
        return (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Прогресс</div>
            <div className="h-8 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success w-[75%] flex items-center justify-end pr-2">
                <span className="text-xs text-success-foreground font-bold">75%</span>
              </div>
            </div>
          </div>
        );
      
      case "plans":
        return (
          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">В следующем спринте...</div>
            <p className="text-xs text-muted-foreground">{content as string}</p>
          </div>
        );
      
      case "useless":
        return (
          <div className="text-center opacity-60">
            <span className="text-4xl">🤔</span>
            <p className="text-xs text-muted-foreground mt-1">{content as string}</p>
          </div>
        );
    }
  };

  return (
    <div
      id={id}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        "bg-card rounded-xl p-4 cursor-move select-none transition-all duration-300",
        "shadow-element hover:shadow-element-hover",
        isDragging && "opacity-50 scale-95",
        !isDragging && "hover:scale-105 hover:-rotate-2",
        className
      )}
    >
      {renderContent()}
    </div>
  );
};
