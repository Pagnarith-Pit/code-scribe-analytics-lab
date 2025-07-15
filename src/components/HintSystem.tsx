import { useHintLogic } from '@/hooks/useHintLogic';

interface HintSystemProps {
  weekNumber: string;
  problemIndex: number;
  subproblemIndex: number;
  userId: string;
  runId: string;
}

export const HintSystem = ({ 
  weekNumber, 
  problemIndex, 
  subproblemIndex, 
  userId, 
  runId 
}: HintSystemProps) => {
  const {
    isPopupOpen,
    isLoading,
    hintContent,
    buttonConfig,
    openPopup,
    closePopup,
    handleNextHint,
  } = useHintLogic({ 
    weekNumber, 
    problemIndex, 
    subproblemIndex, 
    userId, 
    runId 
  });

  // Don't render if essential props are missing
  if (!userId || !runId) {
    return null;
  }

  return (
    <>
      <button
        onClick={openPopup}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-colors"
        disabled={!userId || !runId}
      >
        Feeling Stuck? Get AI Hints
      </button>

      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 relative max-w-lg w-full">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              aria-label="Close hint"
            >
              &times;
            </button>
            
            <div className="mb-4">
              <h3 className="text-xl font-bold">Here's a push:</h3>
              <div className="text-sm text-gray-500 mt-1">
                Problem {problemIndex}.{subproblemIndex}
              </div>
            </div>
            
            <div className="text-gray-700 mb-6 min-h-[60px]">
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                  <span>Getting your hint...</span>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{hintContent}</p>
              )}
            </div>
            
            <div className="flex justify-end">
              {buttonConfig.nextLevel && (
                <button
                  onClick={handleNextHint}
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400"
                >
                  {buttonConfig.text}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};