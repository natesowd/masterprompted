import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
  className?: string;
}

const TypewriterText = ({ text, delay = 50, onComplete, className = "" }: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = text.split(' ');

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => {
          const nextWord = words[currentWordIndex];
          return prev + (prev ? ' ' : '') + nextWord;
        });
        setCurrentWordIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (onComplete && currentWordIndex === words.length) {
      onComplete();
    }
  }, [currentWordIndex, words, delay, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {currentWordIndex < words.length && (
        <span className="animate-pulse ml-1">|</span>
      )}
    </span>
  );
};

export default TypewriterText;