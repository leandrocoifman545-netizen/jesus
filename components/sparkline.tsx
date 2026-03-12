"use client";

import { useEffect, useRef, useState, useId } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export default function Sparkline({ data, color = "#7c3aed", height = 24, width = 64 }: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const padding = 2;
  const effectiveHeight = height - padding * 2;
  const effectiveWidth = width - padding * 2;

  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * effectiveWidth;
    const y = padding + effectiveHeight - ((value - min) / range) * effectiveHeight;
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(" L ")}`;

  const firstX = padding;
  const lastX = padding + effectiveWidth;
  const areaD = `${pathD} L ${lastX},${height} L ${firstX},${height} Z`;

  const lastPoint = points[points.length - 1].split(",");
  const dotX = parseFloat(lastPoint[0]);
  const dotY = parseFloat(lastPoint[1]);

  return (
    <SparklineSVG
      width={width}
      height={height}
      pathD={pathD}
      areaD={areaD}
      color={color}
      dotX={dotX}
      dotY={dotY}
    />
  );
}

function SparklineSVG({ width, height, pathD, areaD, color, dotX, dotY }: {
  width: number;
  height: number;
  pathD: string;
  areaD: string;
  color: string;
  dotX: number;
  dotY: number;
}) {
  const uid = useId().replace(/:/g, "");
  const lineRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    const path = lineRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    setPathLength(length);
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          path.style.transition = "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)";
          path.style.strokeDashoffset = "0";
          setTimeout(() => setDrawn(true), 1200);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(path);
    return () => observer.disconnect();
  }, []);

  // Pulse dash values — segment is 15% of line, gap is 85%
  const segmentLen = Math.max(pathLength * 0.15, 4);
  const gap = pathLength - segmentLen;

  return (
    <svg width={width} height={height} className="opacity-60 group-hover:opacity-100 transition-opacity duration-300">
      <defs>
        <linearGradient id={`spark-fill-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path
        d={areaD}
        fill={`url(#spark-fill-${uid})`}
        className="transition-opacity duration-500"
        style={{ opacity: drawn ? 1 : 0 }}
      />

      {/* Main line */}
      <path
        ref={lineRef}
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Traveling light pulse — native SVG animate for seamless loop */}
      {drawn && pathLength > 0 && (
        <path
          ref={pulseRef}
          d={pathD}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.45"
          strokeDasharray={`${segmentLen} ${gap}`}
          strokeDashoffset={pathLength}
        >
          <animate
            attributeName="stroke-dashoffset"
            values={`${pathLength};${-pathLength}`}
            dur="6s"
            repeatCount="indefinite"
            calcMode="linear"
          />
        </path>
      )}

      {/* Glowing dot at the end */}
      <circle
        cx={dotX}
        cy={dotY}
        r="2"
        fill={color}
        className="transition-opacity duration-300"
        style={{ opacity: drawn ? 1 : 0 }}
      >
        <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
      </circle>
      {/* Glow behind dot */}
      <circle
        cx={dotX}
        cy={dotY}
        r="4"
        fill={color}
        className="transition-opacity duration-300"
        style={{ opacity: drawn ? 0.3 : 0 }}
      >
        <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
