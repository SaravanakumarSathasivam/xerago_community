import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface BackToTopProps {
  scrollContainerRef?: React.RefObject<HTMLElement>;
}

export function BackToTop({ scrollContainerRef }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleScroll = () => {
    const scrollContainer = scrollContainerRef?.current || window;
    const scrollTop = scrollContainer === window ? window.scrollY : (scrollContainer as HTMLElement).scrollTop;
    setIsVisible(scrollTop > 300);
  };

  const scrollToTop = () => {
    const scrollContainer = scrollContainerRef?.current || window;
    if (scrollContainer === window) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      (scrollContainer as HTMLElement).scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef?.current || window;
    scrollContainer.addEventListener("scroll", handleScroll);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, [scrollContainerRef]);

  return (
    <Button
      variant="outline"
      size="icon"
      className={`fixed bottom-8 right-8 rounded-full shadow-lg transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      onClick={scrollToTop}
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  );
}
