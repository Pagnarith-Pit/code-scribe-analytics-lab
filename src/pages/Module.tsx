import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, BookOpen, Clock, Trophy, LogOut, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Module = () => {
  const navigate = useNavigate();

  const weeklyModules = [
    {
      week: 1,
      title: "Introduction to Python",
      description: "Basic syntax, variables, and data types",
      topics: ["Variables", "Data Types", "Basic Operations"],
      difficulty: "Beginner",
      estimatedTime: "10 min",
      status: "available"
    },
    {
      week: 2,
      title: "Control Structures",
      description: "If statements, loops, and conditional logic",
      topics: ["If/Else", "For Loops", "While Loops"],
      difficulty: "Beginner",
      estimatedTime: "15 min",
      status: "available"
    },
    {
      week: 3,
      title: "Functions and Scope",
      description: "Defining functions, parameters, and return values",
      topics: ["Function Definition", "Parameters", "Return Values"],
      difficulty: "Intermediate",
      estimatedTime: "20 min",
      status: "available"
    },
    {
      week: 4,
      title: "Data Structures: Lists",
      description: "Working with lists, indexing, and list methods",
      topics: ["List Creation", "Indexing", "List Methods"],
      difficulty: "Intermediate",
      estimatedTime: "20 min",
      status: "available"
    },
    {
      week: 5,
      title: "Data Structures: Dictionaries",
      description: "Dictionary creation, manipulation, and iteration",
      topics: ["Dictionary Basics", "Key-Value Pairs", "Dictionary Methods"],
      difficulty: "Intermediate",
      estimatedTime: "20 min",
      status: "available"
    },
    {
      week: 6,
      title: "String Processing",
      description: "String manipulation, formatting, and text analysis",
      topics: ["String Methods", "Text Processing", "Regular Expressions"],
      difficulty: "Intermediate",
      estimatedTime: "25 min",
      status: "available"
    },
    {
      week: 7,
      title: "File Input/Output",
      description: "Reading from and writing to files",
      topics: ["File Reading", "File Writing", "CSV Processing"],
      difficulty: "Intermediate",
      estimatedTime: "25 min",
      status: "available"
    },
    {
      week: 8,
      title: "Error Handling",
      description: "Exception handling and debugging techniques",
      topics: ["Try/Except", "Exception Types", "Debugging"],
      difficulty: "Intermediate",
      estimatedTime: "25 min",
      status: "available"
    },
    {
      week: 9,
      title: "Object-Oriented Programming",
      description: "Classes, objects, and inheritance",
      topics: ["Classes", "Objects", "Inheritance"],
      difficulty: "Advanced",
      estimatedTime: "25 min",
      status: "available"
    },
    // {
    //   week: 10,
    //   title: "Libraries and Modules",
    //   description: "Using external libraries and creating modules",
    //   topics: ["Import Statements", "Popular Libraries", "Module Creation"],
    //   difficulty: "Advanced",
    //   estimatedTime: "30 min",
    //   status: "available"
    // },
    // {
    //   week: 11,
    //   title: "Data Analysis with Pandas",
    //   description: "Introduction to data manipulation with Pandas",
    //   topics: ["DataFrames", "Data Cleaning", "Basic Analysis"],
    //   difficulty: "Advanced",
    //   estimatedTime: "30 min",
    //   status: "available"
    // },
    // {
    //   week: 12,
    //   title: "Final Project",
    //   description: "Comprehensive project combining all concepts",
    //   topics: ["Project Planning", "Implementation", "Code Review"],
    //   difficulty: "Advanced",
    //   estimatedTime: "30 min",
    //   status: "available"
    // }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-100 text-green-800";
      case "Intermediate": return "bg-yellow-100 text-yellow-800";
      case "Advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleSignOut = () => {
    // Add sign out logic here
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2">
                <Code className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Binary Playground</span>
              </Link>
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                COMP90059
              </Badge>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Welcome back!</span>
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome to Binary Playground!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Each module corresponds to the weekly tutorial questions for your COMP90059. Select one to get started.
          </p>
        </div>

        {/* Weekly Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyModules.map((module) => (
            <Card key={module.week} className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Week {module.week}
                  </Badge>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {module.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Topics covered:</p>
                  <div className="flex flex-wrap gap-1">
                    {module.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{module.estimatedTime}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-3" 
                  onClick={() => navigate(`/problem/${module.week}`)}
                >
                  Start Week {module.week}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Module;