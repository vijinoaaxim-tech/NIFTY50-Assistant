import React, { useState, useCallback } from 'react';
import { AnalysisForm } from './components/AnalysisForm';
import { ReportDisplay } from './components/ReportDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AIIcon } from './components/icons/AIIcon';
import { getTradingAnalysis } from './services/geminiService';
import { type AnalysisReport } from './types';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAnalysis = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await getTradingAnalysis();
      setAnalysis(result);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate analysis: ${errorMessage}`);
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-2">
            <AIIcon className="h-10 w-10 text-cyan-400" />
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Nifty 50 Trading Assistant
            </h1>
          </div>
          <p className="text-gray-400">
            AI-powered weekly options strategy analysis using real-time data.
          </p>
          <a className="btn btn-sm btn-danger" href="https://chartnifty.netlify.app/">Chart Analyze</a>
        </header>

        <main>
          <div className="bg-gray-800 rounded-lg shadow-2xl p-6 mb-8 border border-gray-700">
            <AnalysisForm
              onGenerate={handleGenerateAnalysis}
              isLoading={isLoading}
            />
          </div>

          {isLoading && <LoadingSpinner />}
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {analysis && !isLoading && (
            <div className="bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-700 transition-opacity duration-500 animate-fadeIn">
              <ReportDisplay report={analysis.text} sources={analysis.sources} />
            </div>
          )}
          
          {!analysis && !isLoading && !error && (
            <div className="text-center text-gray-500 py-10">
              <p>Click the button to generate your AI-powered trading report.</p>
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
