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
}

interface SlideElement extends GameElementData {
  position: { x: number; y: number };
}

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>("start");
  const [timeLeft, setTimeLeft] = useState(10);
  const [elements] = useState<GameElementData[]>([
    { id: "header", type: "header", content: "Спринт 24 • Итоги", isRequired: true },
    { id: "list", type: "list", content: ["Пофиксили баг с авторизацией", "Доделали фичу экспорта данных", "Начали работу над новым дашбордом"], isRequired: true },
    { id: "image", type: "image", content: "", isRequired: true },
    { id: "chart", type: "chart", content: "", isRequired: true },
    { id: "plans", type: "plans", content: "Закончить дашборд и начать тестирование новой версии API", isRequired: true },
    { id: "useless1", type: "useless", content: "Здесь должен быть текст", isRequired: false },
    { id: "useless2", type: "useless", content: "😺", isRequired: false },
  ]);
  const [slideElements, setSlideElements] = useState<SlideElement[]>([]);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    setSlideElements([]);
    setTimeLeft(10);
    setScreen("playing");
    setIsSuccess(false);
    setFinalTime(0);
  };

  // Таймер с автоматическим завершением
  useEffect(() => {
    if (screen === "playing") {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        // Автоматически завершаем игру когда время истекло
        handleFinish();
      }
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
    
    const isInside =
      e.clientX >= slideRect.left &&
      e.clientX <= slideRect.right &&
      e.clientY >= slideRect.top &&
      e.clientY <= slideRect.bottom;

    if (isInside) {
      // Проверяем, не добавлен ли уже этот элемент
      const alreadyOnSlide = slideElements.some(el => el.id === draggedElement);
      
      if (!alreadyOnSlide) {
        const element = elements.find(el => el.id === draggedElement);
        if (element) {
          const newSlideElement: SlideElement = {
            ...element,
            position: {
              x: Math.random() * 30 + 10,
              y: Math.random() * 30 + 10,
            }
          };
          setSlideElements(prev => [...prev, newSlideElement]);
          toast.success("Элемент добавлен на слайд!");
        }
      }
    }
  };

  const handleRemoveFromSlide = (id: string) => {
    setSlideElements(prev => prev.filter(el => el.id !== id));
    toast.info("Элемент удален со слайда");
  };

  const handleFinish = () => {
    const requiredElements = elements.filter((el) => el.isRequired);
    const slideElementIds = new Set(slideElements.map(el => el.id));
    const allRequired = requiredElements.every((el) => slideElementIds.has(el.id));
    
    setIsSuccess(allRequired);
    setFinalTime(10 - timeLeft);
    setScreen("result");

    if (allRequired) {
      toast.success("Отличная работа! Презентация готова!");
    } else {
      toast.error("Не все элементы на месте!");
    }
  };

  const renderSlideContent = (element: SlideElement) => {
    switch (element.type) {
      case "header":
        return <div className="text-lg font-bold text-foreground">{element.content as string}</div>;
      
      case "list":
        return (
          <div className="space-y-1 text-xs">
            {(element.content as string[]).map((item, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <span className="text-primary">•</span>
                <span className="text-foreground line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        );
      
      case "image":
        return (
          <div className="bg-primary/10 rounded p-2 border border-primary/30">
            <div className="text-primary text-[8px] font-semibold">ИНТЕРФЕЙС</div>
            <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 rounded mt-1"></div>
          </div>
        );
      
      case "chart":
        return (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">Прогресс</div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-success w-[75%]"></div>
            </div>
          </div>
        );
      
      case "plans":
        return (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-foreground">Планы</div>
            <p className="text-[10px] text-muted-foreground line-clamp-2">{element.content as string}</p>
          </div>
        );
      
      case "useless":
        return (
          <div className="text-center opacity-60">
            <span className="text-2xl">🤔</span>
          </div>
        );
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
                className="bg-card rounded-2xl border-4 border-primary/30 aspect-[16/10] shadow-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                <div className="relative z-10 h-full">
                  {slideElements.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground text-xl">Перетащите элементы сюда</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 h-full">
                      {slideElements.map((element) => (
                        <div
                          key={element.id}
                          className="bg-background/50 rounded-lg p-3 shadow-md border border-primary/20 relative group animate-bounce-in hover:bg-background/70 transition-all"
                          onClick={() => handleRemoveFromSlide(element.id)}
                        >
                          <button className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            ✕
                          </button>
                          {renderSlideContent(element)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
                  Элементов: {slideElements.length}
                </div>
              </div>
            </div>

            <div className="col-span-5 space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <p className="text-sm text-muted-foreground">Перетащите элементы на слайд →</p>
              {elements.map((element, idx) => {
                const isOnSlide = slideElements.some(el => el.id === element.id);
                return (
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
                      className={isOnSlide ? "ring-2 ring-success opacity-50" : ""}
                    />
                  </div>
                );
              })}
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
            <div className="text-lg text-foreground">
              Добавлено элементов: {slideElements.length} / {elements.filter(el => el.isRequired).length} обязательных
            </div>
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
