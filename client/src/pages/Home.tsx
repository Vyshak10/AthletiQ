import { Link } from 'react-router-dom'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl font-bold mb-6">Sports Tournament Management</h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Streamline your sports tournaments with our comprehensive management platform.
          Create, manage, and follow tournaments in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/tournaments">
            <Button size="lg">View Tournaments</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg">Get Started</Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>Live score updates and tournament statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Stay updated with live scores, team lineups, and tournament progress in real-time.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tournament Management</CardTitle>
                <CardDescription>Create and manage tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Easily create tournaments, manage teams, and update match details as an admin.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Multi-sport Support</CardTitle>
                <CardDescription>Support for various sports</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Organize tournaments for different sports including football, cricket, and more.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create Account</h3>
              <p>Sign up to get started with tournament management</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Browse Tournaments</h3>
              <p>View available tournaments by sport</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Create or Join</h3>
              <p>Create your own tournament or join existing ones</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">4</div>
              <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
              <p>Follow live updates and tournament statistics</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our platform today and start managing your sports tournaments efficiently.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">Create Account</Button>
          </Link>
        </div>
      </section>
    </div>
  )
} 