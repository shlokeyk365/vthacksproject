import { useEffect, useState } from 'react';

export const useFontScaling = (containerRef: React.RefObject<HTMLElement>) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      
      // More aggressive scaling for very small screens
      let calculatedScale;
      
      if (containerWidth < 400) {
        // For very small screens, use more aggressive scaling
        calculatedScale = Math.max(0.2, containerWidth / 800);
      } else if (containerWidth < 600) {
        // For small screens
        calculatedScale = Math.max(0.3, containerWidth / 1000);
      } else {
        // For larger screens
        calculatedScale = Math.max(0.4, containerWidth / 1200);
      }
      
      setScale(calculatedScale);
    };

    updateScale();
    
    const resizeObserver = new ResizeObserver(updateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [containerRef]);

  return scale;
};
