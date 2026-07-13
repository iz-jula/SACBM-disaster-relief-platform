import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MapPin,
  Megaphone,
  Users,
} from "lucide-react";
import PublicNavbar from "@/components/PublicNavbar";
import PublicFooter from "@/components/PublicFooter";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const programme = [
  ["09:30–10:00", "Arrival of guests and welcome by hospital staff"],
  ["10:00–10:05", "Welcome remarks by Dr Mario Jacob, Director of Mavalane Hospital"],
  ["10:05–10:10", "Remarks by Dr Paloma Maripiha, Director of Maputo City Health Services"],
  ["10:10–10:20", "Remarks by Puleng Chaba, Acting High Commissioner of South Africa"],
  ["10:20–10:30", "Remarks by Sonia Matsinhe, Acting CEO of the South African Chamber of Business in Mozambique"],
  ["10:30–10:35", "Remarks by Dr Graça Machel"],
  ["10:35–10:45", "Guided visits to Paediatrics and the Integrated Support Centre for Victims of Violence"],
  ["10:45–10:55", "Delivery of toys, snacks, and other donations to children"],
  ["10:55–11:00", "Family photo and closing address by the hospital director"],
] as const;


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
                Vamos-nos envolver. Join SACBM members at Mavalane Hospital for a morning of care, solidarity, and practical support for children in the Paediatrics Department.
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
                <EventMeta icon={CalendarDays} label="Date" value="18 July 2025" />
                <EventMeta icon={MapPin} label="Location" value="Paediatrics, Mavalane Hospital, Maputo" />
                <EventMeta icon={Users} label="Time" value="10:00–11:00" />
              </div>
              <p className="mt-8 rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-slate-300">
                Guests arrive from 09:30. The morning includes hospital visits, messages of solidarity, and the delivery of toys, snacks, and other donations.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-emerald-50/60">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" />
              <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Vamos-nos envolver:</span> join SACBM at Hospital Mavalane for Nelson Mandela Day.</p>
            </div>
            <a href="mailto:support@sacbm.co.mz?subject=Mandela Day registration" className="flex-shrink-0 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              Contact SACBM <ArrowRight className="ml-1 inline h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Programa · 18 Julho</p>
            <h2 className="mt-4 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl">Uma manhã de solidariedade no Hospital Mavalane.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">The programme brings together hospital leadership, public health representatives, diplomatic partners, SACBM, and community supporters in service of children.</p>
          </div>

          <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-[7rem_1fr] border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 sm:grid-cols-[9rem_1fr] sm:px-7">
              <span>Time</span>
              <span>Programme</span>
            </div>
            <div className="divide-y divide-slate-100">
              {programme.map(([time, item]) => (
                <div key={time} className="grid grid-cols-[7rem_1fr] gap-4 px-5 py-5 sm:grid-cols-[9rem_1fr] sm:px-7">
                  <p className="font-semibold text-emerald-700">{time}</p>
                  <p className="leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-900">Be part of the SACBM story.</h2>
              <p className="mt-3 max-w-2xl text-slate-600">Your participation helps strengthen the relationships between businesses and the communities we call home. Bring your support to the Paediatrics Department at Mavalane Hospital.</p>
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


export default MandelaDay;
