import React, { useMemo } from 'react';
import { type Source } from '../types';
import { ProbabilityTable } from './ProbabilityTable';

interface ReportDisplayProps {
  report: string;
  sources: Source[];
}

// A component to render inline text with special formatting for financial data.
const FormattedInlineText: React.FC<{ text: string }> = React.memo(({ text }) => {
    const parts = useMemo(() => {
        const elements: React.ReactNode[] = [];
        if (!text) return elements;

        let lastIndex = 0;
        // Regex to find bold text, percentages, and Indian Rupee currency values.
        const regex = /(\*\*.*?\*\*)|(\d{1,3}(?:,\d{3})*(?:\.\d+)?%)|(₹\s?[\d,]+(?:\.\d+)?(?:\s?cr)?)/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            // Push the text before the match
            if (match.index > lastIndex) {
                elements.push(text.substring(lastIndex, match.index));
            }
            
            // Determine which pattern matched and push the corresponding styled component
            const [fullMatch, bold, percent, currency] = match;
            if (bold) {
                elements.push(<strong key={lastIndex}>{bold.slice(2, -2)}</strong>);
            } else if (percent) {
                elements.push(<span key={lastIndex} className="font-semibold text-cyan-400">{percent}</span>);
            } else if (currency) {
                elements.push(<span key={lastIndex} className="font-semibold text-green-400">{currency}</span>);
            }
            lastIndex = regex.lastIndex;
        }

        // Push the remaining text after the last match
        if (lastIndex < text.length) {
            elements.push(text.substring(lastIndex));
        }
        
        return elements.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>);
    }, [text]);

    return <>{parts}</>;
});


// A component to render the full report, handling blocks like paragraphs, lists, headings, and tables.
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    const formattedContent = useMemo(() => {
        const lines = text.split('\n');
        const elements: React.ReactNode[] = [];
        let tableRows: string[][] = [];

        const renderTable = (key: string | number) => {
            if (tableRows.length === 0) return null;
            
            // The first row is the header, rows with '---' are separators
            const header = tableRows[0];
            const body = tableRows.slice(1).filter(row => !row.join('').includes('---'));
            
            const tableElement = (
                <div key={`table-${key}`} className="overflow-x-auto my-4 rounded-lg border border-gray-700">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-700">
                            <tr>
                                {header.map((cell, i) => (
                                    <th key={i} className="p-3 font-semibold border-b border-gray-600 text-gray-200">
                                        <FormattedInlineText text={cell.trim()} />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {body.map((row, i) => (
                                <tr key={i} className="bg-gray-800 even:bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
                                    {row.map((cell, j) => (
                                        <td key={j} className="p-3 border-t border-gray-700">
                                            <FormattedInlineText text={cell.trim()} />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = []; // Reset for the next table
            return tableElement;
        };

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            const isTableLine = line.startsWith('|') && line.endsWith('|');

            if (isTableLine) {
                const cells = line.slice(1, -1).split('|');
                tableRows.push(cells);
            } else {
                if (tableRows.length > 0) {
                    elements.push(renderTable(i));
                }

                if (line.startsWith('##')) {
                    elements.push(<h2 key={i} className="text-xl font-bold mt-6 mb-3 text-cyan-400 border-b border-gray-600 pb-2"><FormattedInlineText text={line.replace('##', '').trim()} /></h2>);
                } else if (line.startsWith('###')) {
                    elements.push(<h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-cyan-300"><FormattedInlineText text={line.replace('###', '').trim()} /></h3>);
                } else if (line.startsWith('* ') || line.startsWith('– ')) {
                    elements.push(<li key={i} className="ml-5 list-item list-disc"><FormattedInlineText text={line.substring(2)} /></li>);
                } else if (/^\d+\.\s/.test(line)) {
                    elements.push(<li key={i} className="ml-5 list-item list-decimal"><FormattedInlineText text={line.replace(/^\d+\.\s/, '')} /></li>);
                } else if (line === '') {
                    // FIX: Safely check if the last element is a <br> tag to avoid consecutive breaks.
                    if (elements.length > 0) {
                        const lastElement = elements[elements.length - 1];
                        if (!React.isValidElement(lastElement) || lastElement.type !== 'br') {
                           elements.push(<br key={i} />);
                        }
                    }
                } else {
                    elements.push(<p key={i} className="my-2 leading-relaxed"><FormattedInlineText text={line} /></p>);
                }
            }
        }

        if (tableRows.length > 0) {
            elements.push(renderTable(lines.length));
        }

        return elements;
    }, [text]);

    return <>{formattedContent}</>;
};

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report, sources }) => {
  return (
    <div className="prose prose-invert max-w-none text-gray-300">
      <h2 className="text-2xl font-bold text-cyan-400 mb-4 border-b border-gray-600 pb-2">Analysis Report</h2>
      
      <ProbabilityTable reportText={report} />

      <FormattedText text={report} />

      {sources.length > 0 && (
        <div className="mt-8 pt-4 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-cyan-300 mb-3">Sources</h3>
          <ul className="space-y-2">
            {sources.map((source, index) => (
              <li key={index} className="truncate">
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-500 hover:text-cyan-400 hover:underline transition-colors"
                  title={source.uri}
                >
                  {source.title || source.uri}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
