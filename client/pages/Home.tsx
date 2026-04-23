import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";

const Home = () => {

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section with Background Image */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/7156187/pexels-photo-7156187.jpeg"
            alt="Volunteers preparing donation boxes"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-800/75 to-slate-900/80" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
            Making a Difference<br />
            <span className="text-yellow-400">
              Together
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-100 sm:text-xl">
            Discover how South African Chamber members are creating meaningful social impact across Mozambique through disaster relief, humanitarian aid, and community support.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center sm:gap-6">
            <Link to="/gallery">
              <Button size="lg" className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white">
                Explore Actions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-slate-900">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Image Carousel Section (Placeholder for admin-uploaded images) */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Moments of Impact</h2>
          <p className="mt-4 text-lg text-slate-600">
            Visual stories from our community initiatives
          </p>
        </div>

        {/* Carousel Placeholder */}
        <div className="rounded-lg overflow-hidden bg-slate-200 h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">Photo carousel - Admin uploads here</p>
            <p className="text-sm text-slate-500">Featured community impact photos and initiatives</p>
          </div>
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Card className="border-0 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Want to Partner with the Chamber?</CardTitle>
            <CardDescription className="text-emerald-100">
              Interested in becoming a member or partnering with us on social responsibility initiatives? We&apos;d love to hear from you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <a href="mailto:info@southafricanchamber.co.mz" className="flex-1">
              <Button size="lg" className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900">
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </a>
            <Link to="/members" className="flex-1">
              <Button size="lg" variant="secondary" className="w-full bg-white hover:bg-slate-100 text-emerald-700">
                Member Section
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
};

export default Home;
