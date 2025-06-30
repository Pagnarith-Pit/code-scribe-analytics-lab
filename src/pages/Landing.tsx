
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Brain, BarChart3, Lightbulb, Play, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Binary Playground</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Learn Python with
            <span className="text-blue-600"> AI-Powered Analytics</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Master Python programming through interactive coding exercises with intelligent feedback,
            real-time analytics, and personalized learning insights designed for PhD research.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">Start Learning</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/ide">Try IDE</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Binary Playground?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with proven learning methodologies to accelerate your Python journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Brain className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>AI-Powered Hints</CardTitle>
                <CardDescription>
                  Get intelligent, contextual hints when you're stuck, with three levels of assistance
                  to guide you without giving away the solution.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Real-Time Analytics</CardTitle>
                <CardDescription>
                  Track your learning progress with detailed analytics including coding patterns,
                  time spent, and improvement metrics designed for research insights.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Play className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Interactive IDE</CardTitle>
                <CardDescription>
                  Write and execute Python code instantly in our browser-based IDE with syntax
                  highlighting, auto-completion, and immediate feedback.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Simple steps to start your Python learning journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Exercise</h3>
              <p className="text-gray-600">Select from curated Python coding challenges designed to build your skills progressively.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Code & Learn</h3>
              <p className="text-gray-600">Write code in our IDE, get hints when needed, and receive instant feedback on your solutions.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p className="text-gray-600">Monitor your learning analytics and see detailed insights about your coding journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Focus */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Built for Research</h2>
          <p className="text-xl text-gray-600 mb-8">
            This platform is specifically designed for PhD research in computer science education,
            providing detailed analytics and insights to understand how students learn to code.
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="text-left">
              <Lightbulb className="h-8 w-8 text-yellow-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Learning Analytics</h3>
              <p className="text-gray-600">
                Comprehensive data collection on coding behavior, hint usage, and problem-solving patterns.
              </p>
            </div>
            <div className="text-left">
              <BarChart3 className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="text-xl font-semibold mb-2">Research Insights</h3>
              <p className="text-gray-600">
                Detailed metrics designed to support educational research and improve learning outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our research platform and accelerate your Python programming skills with AI-powered assistance.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/signup">Create Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-blue-600 border-white hover:bg-white" asChild>
              <Link to="/ide">Try Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Binary Playground</span>
          </div>
          <p className="text-gray-400 mb-4">
            AI-powered Python learning platform for educational research
          </p>
          <p className="text-sm text-gray-500">
            Built with React, TypeScript, and powered by Pyodide
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
