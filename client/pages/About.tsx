import { Heart, Users, Target, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PublicNavbar from "@/components/PublicNavbar";

const About = () => {
  const values = [
    {
      icon: Heart,
      title: "Community Care",
      description: "We believe in supporting those who need it most during times of crisis and need.",
    },
    {
      icon: Users,
      title: "Member Engagement",
      description: "Our members are the heart of our social responsibility efforts, contributing time and resources.",
    },
    {
      icon: Target,
      title: "Measurable Impact",
      description: "We track and celebrate the real, tangible difference our actions make in the community.",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for the highest standards in everything we do for our community.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="border-b bg-gradient-to-r from-slate-50 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            About Our <span className="text-emerald-700">Mission</span>
          </h1>
          <p className="mt-6 text-xl text-slate-600">
            The South African Chamber of Business in Mozambique is dedicated to fostering social responsibility across our business community and making lasting positive impact through disaster relief, humanitarian aid, and community support.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-4 text-lg text-slate-600">
              To unite our chamber members in meaningful social responsibility initiatives that create measurable, positive impact on individuals and communities affected by disasters and humanitarian challenges.
            </p>
            <p className="mt-4 text-lg text-slate-600">
              We believe that businesses have a responsibility to give back, and that collective action amplifies our ability to help those in need.
            </p>
          </div>
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F1856f84030a242f78ae906b091ce2e3e?format=webp&width=800&height=1200"
              alt="Community members working together"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 bg-slate-50">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Our Values</h2>
          <p className="mt-4 text-lg text-slate-600">
            These principles guide everything we do
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => (
            <Card key={value.title} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardHeader>
                <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3">
                  <value.icon className="h-6 w-6 text-emerald-700" />
                </div>
                <CardTitle className="text-xl text-slate-900">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How We Work Section */}
      <section className="border-t bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How We Work</h2>
          <div className="mt-10 space-y-8">
            {[
              {
                number: "01",
                title: "Members Submit Actions",
                description:
                  "Our members contribute their social responsibility initiatives, from disaster relief efforts to community support programs.",
              },
              {
                number: "02",
                title: "We Document Impact",
                description:
                  "We track and measure the real impact of each action, including people helped, resources mobilized, and outcomes achieved.",
              },
              {
                number: "03",
                title: "We Celebrate Together",
                description:
                  "We share success stories and celebrate collective achievements, inspiring more members to take action.",
              },
              {
                number: "04",
                title: "We Drive Change",
                description:
                  "Using data and stories from our community, we advocate for policies and initiatives that create systemic positive change.",
              },
            ].map((step) => (
              <div key={step.number} className="flex gap-8">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                  <span className="text-2xl font-bold text-emerald-700">{step.number}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-slate-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
