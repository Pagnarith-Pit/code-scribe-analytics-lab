import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, CheckCircle, Code } from "lucide-react";
import { Link } from "react-router-dom";

const SignUpConfirmation = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Top Header with Binary Playground branding */}
      <div className="absolute top-0 left-0 p-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <Code className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">Binary Playground</span>
        </Link>
      </div>

      {/* Main content centered */}
      <div className="min-h-screen flex items-center justify-center p-4 pt-20">
        <div className="w-full max-w-md">
          {/* Confirmation Card */}
          <Card className="shadow-lg text-center">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Thank You for Signing Up!</CardTitle>
              <CardDescription className="text-base">
                Your account has been created successfully
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Email confirmation message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Check Your Email</span>
                </div>
                <p className="text-sm text-blue-800 leading-relaxed">
                  We've sent a confirmation email to your university email address. 
                  Please check your inbox and click the confirmation link to activate your account.
                </p>
              </div>

              {/* Additional instructions */}
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Next steps:</strong>
                </p>
                <ul className="text-left space-y-1 ml-4">
                  <li>• Check your email inbox (and spam folder)</li>
                  <li>• Click the confirmation link in the email</li>
                  <li>• Return here to start learning Python!</li>
                </ul>
              </div>

              {/* Return to landing button */}
              <Button asChild className="w-full h-11 text-base">
                <Link to="/">
                  Return to Home Page
                </Link>
              </Button>

              {/* Sign in link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already confirmed your email?{" "}
                  <Link
                    to="/signin"
                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              University of Melbourne PhD Research Project
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpConfirmation;