import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalogue | Fitnest.ma",
  description:
    "Overview of Fitnest meal plans and how the service works. Discover how to subscribe, choose meals, and receive deliveries.",
};

function Step({n, title, desc}:{n:number;title:string;desc:string}){
  return (
    <div className="rounded-xl border p-5 bg-white">
      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-fitnest-green text-white font-bold">{n}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <div className="text-sm text-gray-600">{desc}</div>
    </div>
  );
}

export default function Catalogue(){
  return (
    <div className="container py-10 space-y-10">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">Healthy meals, delivered.</h1>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Choose your plan, select your meals, we cook & deliver. Simple, fresh and tailored to your goals.
        </p>
        <div className="mt-4 flex gap-3 justify-center">
          <a href="/subscribe" className="rounded-full bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-fitnest-green/90">Get started</a>
          <a href="/plans" className="rounded-full border px-4 py-2 text-sm hover:border-fitnest-green hover:text-fitnest-green">See plans</a>
        </div>
      </section>

      {/* Steps */}
      <section>
        <h2 className="text-xl font-semibold mb-3">How it works</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Step n={1} title="Pick your plan" desc="Weight Loss, Stay Fit or Muscle Gain. Change anytime." />
          <Step n={2} title="Choose your meals" desc="Breakfast, lunch, dinner — portioned to your goals." />
          <Step n={3} title="We cook & deliver" desc="Fresh, balanced meals delivered to your door." />
        </div>
      </section>

      {/* Benefits */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Why Fitnest</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-5">
            <div className="font-semibold">Fresh & balanced</div>
            <div className="text-sm text-gray-600">Quality ingredients, macros under control.</div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="font-semibold">Time saver</div>
            <div className="text-sm text-gray-600">No shopping, no cooking, no dishes.</div>
          </div>
          <div className="rounded-xl border p-5">
            <div className="font-semibold">Flexible</div>
            <div className="text-sm text-gray-600">Pause, change meals, adapt days/week anytime.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border p-6 flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <div className="text-lg font-semibold">Ready to start?</div>
          <div className="text-sm text-gray-600">Configure your subscription in a few clicks.</div>
        </div>
        <div className="flex gap-3">
          <a href="/subscribe" className="rounded-full bg-fitnest-green px-4 py-2 text-sm font-medium text-white hover:bg-fitnest-green/90">Subscribe</a>
          <a href="/menu" className="rounded-full border px-4 py-2 text-sm hover:border-fitnest-green hover:text-fitnest-green">View menu</a>
        </div>
      </section>
    </div>
  );
}
