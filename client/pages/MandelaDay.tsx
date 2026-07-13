import { Link } from "react-router-dom";
import { useState } from "react";
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
import { mandelaDayHelpNeeds } from "@/services/eventsService";

const posterUrl = "https://cdn.builder.io/api/v1/image/assets%2Fbd6f78eaf13f40608158a138ec8f1c25%2F2a0976bdc1fd4a44bcf9e5da4fd5fcda?format=webp&width=800&height=1200";

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

const requirementCategories = [
  { title: "Event requirements", needs: mandelaDayHelpNeeds.slice(0, 9) },
  { title: "Medicines and medical consumables", needs: mandelaDayHelpNeeds.slice(9, 17) },
  { title: "Cleaning and disinfecting materials", needs: mandelaDayHelpNeeds.slice(17, 21) },
  { title: "Hygiene products", needs: mandelaDayHelpNeeds.slice(21, 32) },
  { title: "Clothing", needs: mandelaDayHelpNeeds.slice(32, 36) },
  { title: "Beds, chairs, and stretchers", needs: mandelaDayHelpNeeds.slice(36, 41) },
  { title: "Medical and other equipment", needs: mandelaDayHelpNeeds.slice(41, 51) },
  { title: "Maintenance material", needs: mandelaDayHelpNeeds.slice(51) },
] as const;

const MandelaDay = () => {
  return (
    <div className="min-h-screen bg-[#fffdf9]">
      <PublicNavbar />

      <main>
        <section className="relative overflow-hidden bg-[#211510] text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(224,93,38,0.42),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(243,177,82,0.22),_transparent_38%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-200">
                <HeartHandshake className="h-4 w-4" />
                SACBM community event
              </div>
              <h1 className="max-w-3xl text-5xl font-light tracking-tight sm:text-7xl">
                Mandela Day
                <span className="block text-orange-200">67 minutes for impact.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-stone-300 sm:text-xl">
                Vamos-nos envolver. Join SACBM members at Mavalane Hospital for a morning of care, solidarity, and practical support for children in the Paediatrics Department.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <a href="#donate">
                  <Button size="lg" className="w-full bg-orange-600 text-white hover:bg-orange-500 sm:w-auto">
                    Claim a donation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="w-full border-stone-600 bg-transparent text-white hover:bg-[#fffdf9]/10 hover:text-white sm:w-auto">
                    View all events
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative rounded-[1.75rem] border border-orange-200/20 bg-[#fffdf9]/[0.08] p-3 shadow-2xl backdrop-blur sm:p-4">
              <div className="overflow-hidden rounded-2xl bg-[#f3e9dc]">
                <img src={posterUrl} alt="Vamos-nos envolver — Nelson Mandela Day, 18 Julho" className="block max-h-[24rem] sm:max-h-[27rem] lg:max-h-[28rem] w-full object-cover object-top" />
              </div>
              <div className="px-3 pb-3 pt-7 sm:px-4 sm:pb-4">
              <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-orange-200">Save the date</p>
                <div className="rounded-full bg-orange-300 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-950">Annual</div>
              </div>
              <div className="space-y-6">
                <EventMeta icon={CalendarDays} label="Date" value="18 July 2025" />
                <EventMeta icon={MapPin} label="Location" value="Paediatrics, Mavalane Hospital, Maputo" />
                <EventMeta icon={Users} label="Time" value="10:00–11:00" />
                <EventMeta icon={HeartHandshake} label="Beneficiaries" value="107 newborns and children" />
              </div>
              <p className="mt-8 rounded-xl bg-[#fffdf9]/10 p-4 text-sm leading-relaxed text-stone-300">
                Guests arrive from 09:30. The morning includes hospital visits, messages of solidarity, and the delivery of toys, snacks, and other donations.
              </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-orange-50/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-700" />
              <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Vamos-nos envolver:</span> join SACBM at Hospital Mavalane for Nelson Mandela Day.</p>
            </div>
            <a href="mailto:support@sacbm.co.mz?subject=Mandela Day registration" className="flex-shrink-0 text-sm font-semibold text-orange-700 hover:text-orange-900">
              Contact SACBM <ArrowRight className="ml-1 inline h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Programa · 18 Julho</p>
            <h2 className="mt-4 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl">Uma manhã de solidariedade no Hospital Mavalane.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-600">The programme brings together hospital leadership, public health representatives, diplomatic partners, SACBM, and community supporters in service of children.</p>
          </div>

          <div className="mt-14 overflow-hidden rounded-2xl border border-slate-200 bg-[#fffdf9] shadow-sm">
            <div className="grid grid-cols-[7rem_1fr] border-b border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 sm:grid-cols-[9rem_1fr] sm:px-7">
              <span>Time</span>
              <span>Programme</span>
            </div>
            <div className="divide-y divide-slate-100">
              {programme.map(([time, item]) => (
                <div key={time} className="grid grid-cols-[7rem_1fr] gap-4 px-5 py-5 sm:grid-cols-[9rem_1fr] sm:px-7">
                  <p className="font-semibold text-orange-700">{time}</p>
                  <p className="leading-relaxed text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-[#fff4e9]">
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-700">Contribua · Support the hospital</p>
              <h2 className="mt-4 text-4xl font-light tracking-tight text-slate-900 sm:text-5xl">Help us bring practical support to Mavalane Paediatrics.</h2>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">The hospital has identified the needs below for the Mandela Day initiative. Businesses and members can support one category or coordinate a specific donation with SACBM.</p>
            </div>

            <div className="mt-14 space-y-10">
              {requirementCategories.map(({ title, needs }) => (
                <div key={title}>
                  <h3 className="mb-4 text-2xl font-light tracking-tight text-slate-900">{title}</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {needs.map((need) => (
                      <div key={need.name} className="rounded-lg border border-orange-200 bg-[#fffdf9] p-6 shadow-sm transition-all hover:border-orange-300 hover:bg-orange-50">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700">
                            <span className="text-sm font-medium text-white">✓</span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{need.name}</p>
                            {need.quantity && (
                              <p className="mt-1 text-sm font-semibold text-orange-700">
                                Needed: {need.quantity} {need.unit || "items"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-orange-200 bg-[#fffdf9] p-6 text-sm leading-relaxed text-slate-600 sm:p-7">
              <span className="font-semibold text-slate-900">Important:</span> medicines, medical consumables, and technical equipment must be confirmed with the hospital before purchase or delivery. Contact SACBM to coordinate donations and receive the latest specifications.
            </div>
          </div>
        </section>

        <DonationInterestForm />

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-light tracking-tight text-slate-900">Be part of the SACBM story.</h2>
              <p className="mt-3 max-w-2xl text-slate-600">Your participation helps strengthen the relationships between businesses and the communities we call home. Bring your support to the Paediatrics Department at Mavalane Hospital.</p>
            </div>
            <a href="#donate">
              <Button size="lg" className="bg-orange-700 text-white hover:bg-orange-800">Claim a donation <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </a>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};

const DonationInterestForm = () => {
  const [formData, setFormData] = useState({
    donorName: "",
    email: "",
    phone: "",
    membership: "",
    company: "",
    requirement: "",
    quantity: "",
    notes: "",
  });

  const selectedNeed = mandelaDayHelpNeeds.find((need) => need.name === formData.requirement);
  const isMember = formData.membership === "member";

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = [
      "Mandela Day donation claim",
      `Donor: ${formData.donorName}`,
      `Email: ${formData.email}`,
      `Phone: ${formData.phone || "Not provided"}`,
      `SACBM member: ${isMember ? "Yes" : "No"}`,
      ...(isMember ? [`Company represented: ${formData.company}`] : []),
      `Requirement: ${selectedNeed?.name || formData.requirement}`,
      `Quantity offered: ${formData.quantity} ${selectedNeed?.unit || "items"}`,
      `Notes: ${formData.notes || "None"}`,
    ].join("\n");

    window.location.href = `mailto:support@sacbm.co.mz?subject=${encodeURIComponent("Mandela Day donation claim")}&body=${encodeURIComponent(body)}`;
  };

  return (
    <section id="donate" className="border-t border-orange-200 bg-[#211510] text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 sm:px-8 sm:py-24 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
        <div className="lg:sticky lg:top-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Claim a donation</p>
          <h2 className="mt-4 text-4xl font-light tracking-tight sm:text-5xl">Bring something from the list.</h2>
          <p className="mt-5 max-w-lg leading-relaxed text-stone-300">Tell SACBM what you would like to donate. We will confirm availability, coordinate with the hospital, and update the remaining requirements.</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[1.5rem] bg-[#fffdf9] p-6 text-slate-900 shadow-2xl sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField label="Full name" name="donorName" value={formData.donorName} onChange={(value) => updateField("donorName", value)} required />
            <FormField label="Email address" name="email" type="email" value={formData.email} onChange={(value) => updateField("email", value)} required />
            <FormField label="Phone number" name="phone" type="tel" value={formData.phone} onChange={(value) => updateField("phone", value)} />
            <label className="block text-sm font-medium text-slate-700">
              Are you a SACBM member?
              <select required value={formData.membership} onChange={(event) => updateField("membership", event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-200">
                <option value="">Select one</option>
                <option value="member">Yes, I am a member</option>
                <option value="non-member">No, I am not a member</option>
              </select>
            </label>
            {isMember && <FormField label="Company represented" name="company" value={formData.company} onChange={(value) => updateField("company", value)} required />}
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Requirement to claim
              <select required value={formData.requirement} onChange={(event) => updateField("requirement", event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition focus:border-orange-600 focus:ring-2 focus:ring-orange-200">
                <option value="">Select a requirement</option>
                {requirementCategories.map(({ title, needs }) => (
                  <optgroup key={title} label={title}>
                    {needs.map((need) => <option key={need.name} value={need.name}>{need.name}</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <FormField label="Quantity you will provide" name="quantity" type="number" min="1" value={formData.quantity} onChange={(value) => updateField("quantity", value)} required />
            <label className="block text-sm font-medium text-slate-700 sm:col-span-2">
              Additional notes
              <textarea value={formData.notes} onChange={(event) => updateField("notes", event.target.value)} rows={4} placeholder="Add delivery timing, specifications, or questions" className="mt-2 block w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-200" />
            </label>
          </div>
          <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-relaxed text-slate-500">Medical items and equipment are subject to hospital confirmation.</p>
            <Button type="submit" className="bg-orange-700 text-white hover:bg-orange-800">Send claim <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
        </form>
      </div>
    </section>
  );
};

const FormField = ({ label, name, value, onChange, type = "text", min, required = false }: { label: string; name: string; value: string; onChange: (value: string) => void; type?: string; min?: string; required?: boolean }) => (
  <label className="block text-sm font-medium text-slate-700">
    {label}
    <input name={name} type={type} min={min} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-600 focus:ring-2 focus:ring-orange-200" />
  </label>
);

const EventMeta = ({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) => (
  <div className="flex items-start gap-4">
    <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-200" />
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className="mt-1 text-lg text-white">{value}</p>
    </div>
  </div>
);


export default MandelaDay;
