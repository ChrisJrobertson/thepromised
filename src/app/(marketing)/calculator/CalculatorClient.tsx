"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "flight" | "energy" | "broadband" | "faulty";

export function CalculatorClient() {
  const [tab, setTab] = useState<Tab>("flight");

  const [flightDistance, setFlightDistance] = useState(1500);
  const [flightDelay, setFlightDelay] = useState(3);
  const flightComp = useMemo(() => {
    if (flightDelay < 3) return 0;
    if (flightDistance < 1500) return 220;
    if (flightDistance <= 3500) return 350;
    return 520;
  }, [flightDistance, flightDelay]);

  const [correctRate, setCorrectRate] = useState(20);
  const [chargedRate, setChargedRate] = useState(30);
  const [monthlyUsage, setMonthlyUsage] = useState(300);
  const [monthsOvercharged, setMonthsOvercharged] = useState(6);
  const energyOvercharge = useMemo(
    () => ((chargedRate - correctRate) / 100) * monthlyUsage * monthsOvercharged,
    [correctRate, chargedRate, monthlyUsage, monthsOvercharged]
  );

  const [guaranteedSpeed, setGuaranteedSpeed] = useState(60);
  const [actualSpeed, setActualSpeed] = useState(30);
  const [monthsAffected, setMonthsAffected] = useState(3);
  const [monthlyPrice, setMonthlyPrice] = useState(35);
  const broadbandRefund = useMemo(() => {
    if (guaranteedSpeed <= 0) return 0;
    const shortfallPct = Math.max(0, (guaranteedSpeed - actualSpeed) / guaranteedSpeed);
    return monthlyPrice * shortfallPct * monthsAffected;
  }, [guaranteedSpeed, actualSpeed, monthsAffected, monthlyPrice]);

  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const daysSincePurchase = useMemo(() => {
    const now = new Date();
    const purchase = new Date(purchaseDate);
    return Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
  }, [purchaseDate]);

  return (
    <main className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl space-y-6 px-4">
        <header>
          <h1 className="text-3xl font-bold">What Am I Owed?</h1>
          <p className="mt-2 text-slate-600">
            Free UK consumer compensation calculator for common complaint types.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {[
            { key: "flight", label: "Flight Delay" },
            { key: "energy", label: "Energy Overcharge" },
            { key: "broadband", label: "Broadband Speed" },
            { key: "faulty", label: "Faulty Product" },
          ].map((t) => (
            <button
              className={`rounded-full border px-3 py-1.5 text-sm ${tab === t.key ? "bg-primary text-white" : "bg-white"}`}
              key={t.key}
              onClick={() => setTab(t.key as Tab)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "flight" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Flight Delay Calculator (UK261)</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Flight distance (km)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setFlightDistance(Number(e.target.value))} type="number" value={flightDistance} />
              </label>
              <label className="text-sm">Delay length (hours)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setFlightDelay(Number(e.target.value))} type="number" value={flightDelay} />
              </label>
            </div>
            <p className="text-lg font-bold">Estimated compensation: £{flightComp}</p>
            <Link
              className="inline-block rounded bg-primary px-4 py-2 text-sm text-white"
              href="/cases/new?template=flight-delay"
            >
              Track this claim with TheyPromised → Start a case
            </Link>
          </section>
        )}

        {tab === "energy" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Energy Overcharge Calculator</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Correct rate (p/kWh)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setCorrectRate(Number(e.target.value))} type="number" value={correctRate} />
              </label>
              <label className="text-sm">Charged rate (p/kWh)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setChargedRate(Number(e.target.value))} type="number" value={chargedRate} />
              </label>
              <label className="text-sm">Monthly usage (kWh)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setMonthlyUsage(Number(e.target.value))} type="number" value={monthlyUsage} />
              </label>
              <label className="text-sm">Months overcharged
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setMonthsOvercharged(Number(e.target.value))} type="number" value={monthsOvercharged} />
              </label>
            </div>
            <p className="text-lg font-bold">Estimated overcharge: £{Math.max(0, energyOvercharge).toFixed(2)}</p>
            <Link
              className="inline-block rounded bg-primary px-4 py-2 text-sm text-white"
              href="/cases/new?template=energy-wrong-tariff"
            >
              Build your case file → Start a case
            </Link>
          </section>
        )}

        {tab === "broadband" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Broadband Speed Shortfall</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Guaranteed speed (Mbps)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setGuaranteedSpeed(Number(e.target.value))} type="number" value={guaranteedSpeed} />
              </label>
              <label className="text-sm">Actual speed (Mbps)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setActualSpeed(Number(e.target.value))} type="number" value={actualSpeed} />
              </label>
              <label className="text-sm">Months affected
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setMonthsAffected(Number(e.target.value))} type="number" value={monthsAffected} />
              </label>
              <label className="text-sm">Monthly price (£)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setMonthlyPrice(Number(e.target.value))} type="number" value={monthlyPrice} />
              </label>
            </div>
            <p className="text-lg font-bold">Estimated refund: £{Math.max(0, broadbandRefund).toFixed(2)}</p>
            <Link
              className="inline-block rounded bg-primary px-4 py-2 text-sm text-white"
              href="/cases/new?template=broadband-speed"
            >
              Document your speed tests → Start a case
            </Link>
          </section>
        )}

        {tab === "faulty" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Faulty Product Rights</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Purchase date
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setPurchaseDate(e.target.value)} type="date" value={purchaseDate} />
              </label>
            </div>
            <div className="rounded border bg-slate-50 p-3 text-sm">
              {daysSincePurchase <= 30 ? (
                <p>Within 30 days: you are usually entitled to a full refund under the Consumer Rights Act 2015.</p>
              ) : daysSincePurchase <= 183 ? (
                <p>Between 30 days and 6 months: retailer normally must offer repair or replacement first.</p>
              ) : (
                <p>After 6 months: you can still claim, but may need to show the fault existed at purchase.</p>
              )}
            </div>
            <Link
              className="inline-block rounded bg-primary px-4 py-2 text-sm text-white"
              href="/cases/new?template=faulty-product"
            >
              Start your refund claim → Start a case
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
