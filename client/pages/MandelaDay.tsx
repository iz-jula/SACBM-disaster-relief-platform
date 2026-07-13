import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";

const MandelaDay = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <main>
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.35),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(234,179,8,0.2),_transparent_38%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                <HeartHandshake className="h-4 w-4" />
                SACBM community event
              </div>
              <h1 className="max-w-3xl text-5xl font-light tracking-tight sm:text-7xl">
                Mandela Day
                <span className="block text-emerald-300">67 minutes for impact.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl">
                Join SACBM members as we turn time, care, and collective action into a day of meaningful service for communities across Mozambique.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="mailto:support@sacbm.co.mz?subject=Mandela Day registration">
                  <Button size="lg" className="w-full bg-emerald-600 text-white hover:bg-emerald-500 sm:w-auto">
                    Register your interest
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="w-full border-slate-600 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto">
                    View all events
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/[0.08] p-6 shadow-2xl backdrop-blur sm:p-8">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200">Save the date</p>
                <div className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">Annual</div>
              </div>
              <div className="space-y-6">
                <EventMeta icon={CalendarDays} label="Date" value="18 July" />
                <EventMeta icon={MapPin} label="Location" value="To be announced" />
                <EventMeta icon={Users} label="Who can join" value="SACBM members and partners" />
              </div>
              <p className="mt-8 rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-slate-300">
                Full programme and venue details will be shared with registered members ahead of the event.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-emerald-50/60">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" />
              <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Members:</span> register your interest now to receive the event briefing and participation details.</p>
            </div>
            <a href="mailto:support@sacbm.co.mz?subject=Mandela Day registration" className="flex-shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              Contact SACBM <ArrowRight className="ml-1 inline h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Make a difference together</p>
            <h2 className="mt-4 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl">A small commitment can create lasting change.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">Mandela Day is an invitation to move from good intentions to practical action. Choose how you would like to contribute and bring your team along.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <ActionCard title="Volunteer your time" description="Join the on-the-ground programme and give 67 minutes or more to a community initiative." />
            <ActionCard title="Bring your expertise" description="Share your skills, networks, and professional experience where they can make a difference." />
            <ActionCard title="Support the programme" description="Contribute supplies or resources that help local partners deliver meaningful impact." />
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-900">Be part of the SACBM story.</h2>
              <p className="mt-3 max-w-2xl text-slate-600">Your participation helps strengthen the relationships between businesses and the communities we call home.</p>
            </div>
            <a href="mailto:support@sacbm.co.mz?subject=Mandela Day registration">
              <Button size="lg" className="bg-emerald-700 text-white hover:bg-emerald-800">Register your interest <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

const EventMeta = ({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-300" />
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg text-white">{value}</p>
    </div>
  </div>
);

const ActionCard = ({ title, description }: { title: string; description: string }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-7 transition-shadow hover:shadow-lg">
    <CheckCircle2 className="h-7 w-7 text-emerald-700" />
    <h3 className="mt-6 text-xl font-medium text-slate-900">{title}</h3>
    <p className="mt-3 leading-relaxed text-slate-600">{description}</p>
  </div>
);

export default MandelaDay;
