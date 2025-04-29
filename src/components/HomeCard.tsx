import React from 'react';
import ReactDOM from 'react-dom';
import NumberFlow from '@number-flow/react';

type HoverInfoType = string | [string, string][];

interface HomeCardProps {
  value: string | number;
  description: string;
  hoverInfo?: HoverInfoType;
}

export function HomeCard({ value, description, hoverInfo }: HomeCardProps) {
  const numericValue =
    typeof value === 'string'
      ? value.includes('%')
        ? parseFloat(value)
        : isNaN(Number(value))
          ? 0
          : Number(value)
      : value;

  const [isHovered, setIsHovered] = React.useState(false);
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  return (
    <div
      className="relative p-6 py-10 rounded-lg shadow"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {hoverInfo &&
        isHovered &&
        ReactDOM.createPortal(
          <div
            className="fixed bg-white shadow text-black text-xs rounded px-3 py-2 shadow-lg z-[9999] whitespace-pre-line pointer-events-none"
            style={{
              left: mousePos.x + 12,
              top: mousePos.y + 12,
            }}
          >
            {Array.isArray(hoverInfo) ? (
              <div className="flex flex-col gap-1">
                {hoverInfo.map((item, idx) => {
                  // If item[0] is an array, render as a list
                  if (Array.isArray(item[0])) {
                    return (
                      <ul key={idx} className="text-black list-disc list-inside pl-4">
                        {(item[0] as string[]).map((str, i) => (
                          <li key={i} className="text-black">
                            {str}
                          </li>
                        ))}
                      </ul>
                    );
                  } else {
                    // Otherwise render as label-value pair
                    const [label, value] = item;
                    return (
                      <div key={idx} className="flex">
                        <span className="font-semibold text-black mr-2">{label}:</span>
                        <span className="text-black pl-2">{value}</span>
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              <div className="flex items-center justify-center">{hoverInfo}</div>
            )}
          </div>,
          document.body
        )}
      <p className="text-sm text-black font-semibold mt-2">{description}</p>
      {typeof value === 'string' && isNaN(Number(value.replace('%', ''))) ? (
        <div className="text-4xl font-bold text-dark-green">{value}</div>
      ) : (
        <NumberFlow
          className="text-4xl font-semibold text-black"
          value={numericValue}
          suffix={typeof value === 'string' && value.includes('%') ? '%' : undefined}
        />
      )}
    </div>
  );
}
