interface WeekTopicsProps {
  className?: string;
}

export const WeekTopics = ({ className }: WeekTopicsProps) => {
  const weekTopics = [
    { week: 1, title: "Python Basics & Variables", status: "completed" },
    { week: 2, title: "Control Structures", status: "completed" },
    { week: 3, title: "Functions & Scope", status: "current" },
    { week: 4, title: "Data Structures", status: "upcoming" },
    { week: 5, title: "Object-Oriented Programming", status: "upcoming" },
    { week: 6, title: "File I/O & Error Handling", status: "upcoming" },
    { week: 7, title: "Libraries & Modules", status: "upcoming" },
    { week: 8, title: "Final Project", status: "upcoming" },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "current":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "✓";
      case "current":
        return "▶";
      default:
        return "○";
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-900">Course Progress</h2>
        <p className="text-gray-600 text-sm">Week by week learning path</p>
      </div>
      
      <div className="p-4 space-y-3 overflow-y-auto">
        {weekTopics.map((topic) => (
          <div
            key={topic.week}
            className={`p-3 rounded-lg border-2 transition-colors ${getStatusStyles(topic.status)}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{getStatusIcon(topic.status)}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">Week {topic.week}</span>
                  {topic.status === "current" && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm mt-1">{topic.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};