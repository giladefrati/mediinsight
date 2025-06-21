"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { SignInButton } from "@/components/auth/SignInButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  IconHeartHandshake,
  IconFileAi,
  IconShield,
  IconBolt,
} from "@tabler/icons-react";
import Link from "next/link";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <IconHeartHandshake className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">MediInsight</h1>
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            {user ? (
              <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        {user ? (
          // Authenticated user view
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold">
              Welcome back, {user.displayName || "User"}!
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Ready to analyze your medical documents?
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        ) : (
          // Unauthenticated user view
          <div className="mx-auto max-w-4xl">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
                Transform Medical Documents into
                <span className="text-primary"> Clear Insights</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
                MediInsight uses AI to analyze your medical documents and
                provide clear summaries, key insights, and suggested questions
                for your doctor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <SignInButton />
                <Button variant="outline" size="lg" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>

            {/* Features Section */}
            <div id="features" className="grid gap-8 md:grid-cols-3 mb-16">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconFileAi className="h-6 w-6 text-primary" />
                    AI-Powered Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Advanced AI technology extracts text and analyzes medical
                    documents to provide comprehensive insights.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconShield className="h-6 w-6 text-primary" />
                    Secure & Private
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Your medical information is encrypted and securely stored.
                    Only you have access to your documents and analysis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBolt className="h-6 w-6 text-primary" />
                    Instant Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get summaries, health cards, timelines, and doctor questions
                    within seconds of uploading your documents.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Sign in with Google to begin analyzing your medical documents.
              </p>
              <SignInButton />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/80">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              &copy; 2024 MediInsight. Empowering patients with AI-powered
              medical insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
