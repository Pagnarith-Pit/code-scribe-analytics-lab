
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Brain, BarChart3, Lightbulb, Play, Users, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
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
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Study <span className="text-orange-500">COMP90059</span> with
            <span className="text-blue-600"> AI-Powered Analytics</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Work on your weekly tutorial questions and get AI-powered hints to help you get unstuck. Take part in this exciting research project today!
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link to="/signup">Start Learning</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">What is Binary Playground?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our platform is part of a PhD research project in computer science education, designed to help students learn Python programming through interactive coding exercises and AI-powered hints.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-4">
                <Brain className="h-10 w-10 text-blue-600 mb-3" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
                <CardDescription>
                  Get intelligent, contextual hints when you're stuck, with three levels of assistance
                  to guide you.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <Play className="h-10 w-10 text-purple-600 mb-3" />
                <CardTitle className="text-lg">Interactive IDE</CardTitle>
                <CardDescription>
                  Write and execute Python code instantly in our browser-based IDE with syntax
                  highlighting and error checking. 
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <ShieldCheck className="h-10 w-10 text-green-600 mb-3" />
                <CardTitle className="text-lg">Complete Privacy</CardTitle>
                <CardDescription>
                  Your data is completely private. We do not share your code or pattern of usage, so you can use the platform with confidence. 
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-600">A simple approach to improve your COMP90059 experience</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Integrated Tutorial Exercises</h3>
              <p className="text-gray-600 text-sm">Your weekly tutorial questions all in one place with an interactive IDE as your playground.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Ask Whenever You Want</h3>
              <p className="text-gray-600 text-sm">As you explore the concepts, you can ask our AI bots to help provide hints for you to solve these problems or get a better understanding related topics.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-3">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Hint Progression</h3>
              <p className="text-gray-600 text-sm">Our hints start from simple tips that push you along to detailed explanations for when you need it most.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Research Focus */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Built for Research</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6">
            This platform is specifically designed for PhD research in computer science education,
            providing detailed analytics and insights to understand the effect of AI on student's performance.
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="text-left">
              <Lightbulb className="h-8 w-8 text-yellow-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Learning Analytics</h3>
              <p className="text-gray-600 text-sm">
                Comprehensive data collection on coding behavior, hint usage, and problem-solving patterns. Remember, none of this data will be shared, so participation will have no effect on your grades.
              </p>
            </div>
            <div className="text-left">
              <BarChart3 className="h-8 w-8 text-green-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Research Insights</h3>
              <p className="text-gray-600 text-sm">
                Detailed metrics designed to support educational research and improve learning outcomes. This study will help inform how educational technological developer should design their products to better support students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg md:text-xl mb-6 text-blue-100">
            Join our research platform by creating an account. If you want to try out the features, click "Try Demo" below.
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
      <footer className="bg-gray-900 text-white py-6 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Code className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold">Binary Playground</span>
          </div>
          <p className="text-gray-400 mb-3">
            AI-powered Python learning platform for educational research
          </p>
          <p className="text-sm text-gray-500">
            A University of Melbourne PhD research project
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
