'use client';

import { useEffect, useRef, useState } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'div';
}

export function GlitchText({ text, className = '', as: Component = 'div' }: GlitchTextProps) {
  const textRef = useRef<HTMLElement>(null);
  const [displayText, setDisplayText] = useState(text);
  const glitchChars = '!<>-_\\/[]{}—=+*^?#';

  useEffect(() => {
    if (!textRef.current) return;

    let iteration = 0;
    let interval: NodeJS.Timeout;
    let isAnimating = false;

    const scramble = () => {
      if (isAnimating) return;
      isAnimating = true;
      iteration = 0;

      interval = setInterval(() => {
        const newText = text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '; // Keep spaces
            if (index < iteration) {
              return text[index];
            }
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          })
          .join('');

        setDisplayText(newText);

        if (iteration >= text.length) {
          clearInterval(interval);
          setDisplayText(text);
          isAnimating = false;
        }

        iteration += 1 / 3;
      }, 30);
    };

    // Initial animation
    const timeout = setTimeout(scramble, 500);

    // Hover effect
    const element = textRef.current;
    const handleMouseEnter = () => {
      clearInterval(interval);
      isAnimating = false;
      scramble();
    };

    element.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      element.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [text]);

  return (
    <Component
      ref={textRef as React.RefObject<HTMLHeadingElement & HTMLSpanElement & HTMLDivElement>}
      className={`${className}`}
      data-text={text}
      style={{
        fontFamily: 'var(--font-display)',
        cursor: 'default',
        display: 'inline-block',
      }}
    >
      {displayText}
    </Component>
  );
}
