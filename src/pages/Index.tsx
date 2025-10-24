import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { GameElement } from "@/components/GameElement";
import { toast } from "sonner";

type GameScreen = "start" | "playing" | "result";

interface GameElementData {
  id: string;
  type: "header" | "list" | "image" | "chart" | "plans" | "useless";
  content: string | string[];
  isRequired: boolean;
  position: { x: number; y: number };
}

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>("start");
  const [timeLeft, setTimeLeft] = useState(10);
  const [elements, setElements] = useState<GameElementData[]>([]);
  const [elementsOnSlide, setElementsOnSlide] = useState<Set<string>>(new Set());
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  const initialElements: Omit<GameElementData, "position">[] = [
    { id: "header", type: "header", content: "Спринт 24 • Итоги", isRequired: true },
    { id: "list", type: "list", content: ["Пофиксили баг с авторизацией", "Доделали фичу экспорта данных", "Начали работу над новым дашбордом"], isRequired: true },
    { id: "image", type: "image", content: "", isRequired: true },
    { id: "chart", type: "chart", content: "", isRequired: true },
    { id: "plans", type: "plans", content: "Закончить дашборд и начать тестирование новой версии API", isRequired: true },
    { id: "useless1", type: "useless", content: "Здесь должен быть текст", isRequired: false },
    { id: "useless2", type: "useless", content: "😺", isRequired: false },
  ];

  const startGame = () => {
    const positioned = initialElements.map((el) => ({
      ...el,
      position: {
        x: Math.random() * 60 + 5,
        y: Math.random() * 60 + 5,
      },
    }));
    setElements(positioned);
    setElementsOnSlide(new Set());
    setTimeLeft(10);
    setScreen("playing");
    setIsSuccess(false);
    setFinalTime(0);
  };

  useEffect(() => {
    if (screen === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [screen, timeLeft]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedElement(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedElement || !slideRef.current) return;

    const slideRect = slideRef.current.getBoundingClientRect();
    const elementRect = document.getElementById(draggedElement)?.getBoundingClientRect();
    
    if (!elementRect) return;

    const isInside =
      e.clientX >= slideRect.left &&
      e.clientX <= slideRect.right &&
      e.clientY >= slideRect.top &&
      e.clientY <= slideRect.bottom;

    if (isInside) {
      setElementsOnSlide((prev) => new Set([...prev, draggedElement]));
      toast.success("Элемент добавлен на слайд!");
    } else {
      setElementsOnSlide((prev) => {
        const newSet = new Set(prev);
        newSet.delete(draggedElement);
        return newSet;
      });
    }
  };

  const handleFinish = () => {
    const requiredElements = elements.filter((el) => el.isRequired);
    const allRequired = requiredElements.every((el) => elementsOnSlide.has(el.id));
    
    setIsSuccess(allRequired);
    setFinalTime(10 - timeLeft);
    setScreen("result");

    if (allRequired) {
      toast.success("Отличная работа! Презентация готова!");
    } else {
      toast.error("Не все элементы на месте!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 p-4">
      {screen === "start" && (
        <div className="flex flex-col items-center justify-center min-h-screen animate-slide-up">
          <div className="text-center space-y-6 max-w-2xl">
            <h1 className="text-6xl font-bold text-foreground mb-2 animate-zoom-in">
              🎯 Спринт-ревью от Стаса
            </h1>
            <p className="text-xl text-muted-foreground italic animate-slide-up" style={{ animationDelay: "0.1s" }}>
              "Время ревью поджимает, а кнопку 'Показать' снова не найти! <br />
              Помоги Стасу быстро накидать слайд, пока все ждут!"
            </p>
            <Button 
              size="lg" 
              onClick={startGame}
              className="text-xl px-12 py-8 rounded-2xl mt-8 animate-pulse-glow"
            >
              🚀 Начать спринт-ревью!
            </Button>
          </div>
        </div>
      )}

      {screen === "playing" && (
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">Собери презентацию!</h2>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold transition-all ${timeLeft <= 3 ? "text-destructive animate-shake" : "text-foreground"}`}>
                ⏱️ {timeLeft}с
              </div>
              <Button 
                onClick={handleFinish}
                variant="secondary"
                className="text-sm"
              >
                ✅ Готово! (Показать презентацию)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7">
              <div
                ref={slideRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="bg-card rounded-2xl border-4 border-primary/30 aspect-[16/10] shadow-2xl p-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative z-10 h-full flex items-center justify-center">
                  {elementsOnSlide.size === 0 ? (
                    <p className="text-muted-foreground text-xl">Перетащите элементы сюда</p>
                  ) : (
                    <div className="text-center">
                      <p className="text-success font-semibold">Элементов на слайде: {elementsOnSlide.size}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {elements.map((element, idx) => (
                <div
                  key={element.id}
                  className="animate-bounce-in"
                  style={{
                    animationDelay: `${idx * 0.1}s`,
                    animationFillMode: "backwards",
                  }}
                >
                  <GameElement
                    id={element.id}
                    type={element.type}
                    content={element.content}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    className={elementsOnSlide.has(element.id) ? "ring-2 ring-success" : ""}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "result" && (
        <div className="flex flex-col items-center justify-center min-h-screen animate-zoom-in">
          <div className={`text-center space-y-6 max-w-2xl p-12 rounded-3xl ${isSuccess ? "bg-success/10 border-4 border-success" : "bg-destructive/10 border-4 border-destructive"}`}>
            <div className="text-8xl mb-4 animate-bounce-in">
              {isSuccess ? "🎉" : "😅"}
            </div>
            <h1 className={`text-5xl font-bold mb-4 ${isSuccess ? "text-success" : "text-destructive"}`}>
              {isSuccess ? "Успех!" : "Время вышло!"}
            </h1>
            <p className="text-2xl text-foreground">
              {isSuccess 
                ? `Презентация готова за ${finalTime} секунд!` 
                : "Вы не смогли быстро составить презентацию."}
            </p>
            <p className="text-xl text-muted-foreground italic">
              {isSuccess 
                ? ["Стас гордится тобой!", "Команда впечатлена!", "Клиенты в восторге!"][Math.floor(Math.random() * 3)]
                : ["Стас опозорился на ревью...", "Придется показывать доску Jira...", "Все ушли на кофе-брейк."][Math.floor(Math.random() * 3)]}
            </p>
            <Button 
              size="lg" 
              onClick={startGame}
              className="text-xl px-12 py-6 rounded-2xl mt-8"
            >
              🔄 Попробовать снова
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
