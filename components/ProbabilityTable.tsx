import React, { useMemo } from 'react';

interface ProbabilityTableProps {
  reportText: string;
}

interface Probability {
  direction: 'Upside' | 'Downside' | 'Flat/Sideways';
  probability: string;
  value: number;
}

// A more precise regex designed to find the specific markdown table structure.
const PROBABILITY_REGEX = /\|\s*(Upside|Downside|Flat\/Sideways)\s*\|\s*([\d.]+\s*%)\s*\|/gi;

const getBarColor = (direction: Probability['direction']): string => {
  switch (direction) {
    case 'Upside':
      return 'bg-green-500';
    case 'Downside':
      return 'bg-red-500';
    case 'Flat/Sideways':
      return 'bg-gray-500';
    default:
      return 'bg-gray-600';
  }
};

export const ProbabilityTable: React.FC<ProbabilityTableProps> = ({ reportText }) => {
  const probabilities = useMemo<Probability[]>(() => {
    const found: Probability[] = [];
    if (!reportText) return found;
    
    let match;
    while ((match = PROBABILITY_REGEX.exec(reportText)) !== null) {
      const direction = match[1].trim() as Probability['direction'];
      const probability = match[2].trim();
      const value = parseFloat(probability);

      found.push({ direction, probability, value });
    }
    
    // Sort to maintain a consistent order: Upside, Downside, Flat
    found.sort((a, b) => {
        const order = { 'Upside': 1, 'Downside': 2, 'Flat/Sideways': 3 };
        return order[a.direction] - order[b.direction];
    });

    return found;
  }, [reportText]);

  if (probabilities.length === 0) {
    return null; // Don't render anything if the table wasn't found
  }

  return (
    <div className="my-6 bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden shadow-lg animate-fadeIn">
      <h3 className="text-lg font-semibold text-cyan-300 p-4 bg-gray-700/50 border-b border-gray-700">
        Nifty 50 Weekly Close Probabilities
      </h3>
      <div className="p-4 space-y-3">
        {probabilities.map((p) => (
          <div key={p.direction}>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-semibold text-gray-300">{p.direction}</span>
              <span className="font-bold text-cyan-400">{p.probability}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`${getBarColor(p.direction)} h-2.5 rounded-full transition-all duration-500 ease-out`}
                style={{ width: `${p.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};