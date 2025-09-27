import React from 'react';

interface AnalysisFormProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  onGenerate,
  isLoading,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit}>
       <p className="text-center text-gray-400 mb-4">
          Click the button below to get an up-to-the-minute analysis of the Nifty 50 for the next weekly expiry.
        </p>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
      >
        {isLoading ? 'Analyzing...' : 'Generate Analysis'}
      </button>
    </form>
  );
};