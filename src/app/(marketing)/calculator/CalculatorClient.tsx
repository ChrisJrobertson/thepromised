"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "flight" | "energy" | "broadband" | "faulty" | "deposit" | "parking" | "retail";

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

  // Deposit calculator
  const [depositAmount, setDepositAmount] = useState(1200);
  const [depositDate, setDepositDate] = useState("2025-01-01");
  const [depositReturnDate, setDepositReturnDate] = useState(new Date().toISOString().slice(0, 10));
  const depositCalc = useMemo(() => {
    const start = new Date(depositDate);
    const end = new Date(depositReturnDate);
    const days = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const interestRate = 0.04; // approximate Bank of England base rate
    const interest = depositAmount * interestRate * (days / 365);
    const protectionDeadlineMissed = days > 30;
    const minPenalty = depositAmount;
    const maxPenalty = depositAmount * 3;
    return { days, interest, protectionDeadlineMissed, minPenalty, maxPenalty };
  }, [depositAmount, depositDate, depositReturnDate]);

  // Parking fine calculator
  const [parkingCharge, setParkingCharge] = useState(100);
  const [paidWithin14Days, setPaidWithin14Days] = useState(false);
  const [appealSubmitted, setAppealSubmitted] = useState(false);
  const parkingCalc = useMemo(() => {
    const discountedAmount = paidWithin14Days ? parkingCharge * 0.6 : parkingCharge;
    // Rough appeal success estimates based on common grounds
    const appealSuccessRate = appealSubmitted ? 50 : 0;
    return { discountedAmount, appealSuccessRate };
  }, [parkingCharge, paidWithin14Days, appealSubmitted]);

  // Retail refund calculator
  const [retailPurchasePrice, setRetailPurchasePrice] = useState(250);
  const [retailPurchaseDate, setRetailPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [retailPaidByCredit, setRetailPaidByCredit] = useState(false);
  const retailCalc = useMemo(() => {
    const now = new Date();
    const purchase = new Date(retailPurchaseDate);
    const daysSince = Math.floor((now.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
    const within30Days = daysSince <= 30;
    const within6Months = daysSince <= 183;
    const section75Eligible = retailPaidByCredit && retailPurchasePrice >= 100 && retailPurchasePrice <= 30000;
    return { daysSince, within30Days, within6Months, section75Eligible };
  }, [retailPurchasePrice, retailPurchaseDate, retailPaidByCredit]);

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
            { key: "deposit", label: "Tenant Deposit" },
            { key: "parking", label: "Parking Fine" },
            { key: "retail", label: "Retail Refund" },
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
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Track this claim with TheyPromised → Start Free
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
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Build your case file → Start Free
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
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Document your speed tests → Start Free
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
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Start your refund claim → Start Free
            </Link>
          </section>
        )}

        {tab === "deposit" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Tenant Deposit Calculator</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Deposit amount (£)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setDepositAmount(Number(e.target.value))} type="number" value={depositAmount} />
              </label>
              <label className="text-sm">Date deposit paid
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setDepositDate(e.target.value)} type="date" value={depositDate} />
              </label>
              <label className="text-sm">Date returned / claimed
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setDepositReturnDate(e.target.value)} type="date" value={depositReturnDate} />
              </label>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-lg font-bold">Interest owed: £{depositCalc.interest.toFixed(2)}</p>
              <p>Deposit held for {depositCalc.days} days</p>
              {depositCalc.protectionDeadlineMissed && (
                <div className="rounded border border-amber-200 bg-amber-50 p-3">
                  <p className="font-semibold text-amber-800">30-day protection deadline may have been missed</p>
                  <p className="text-amber-700">If your landlord failed to protect the deposit within 30 days, you may be entitled to a penalty of 1x–3x the deposit amount (£{depositCalc.minPenalty.toFixed(2)} – £{depositCalc.maxPenalty.toFixed(2)}).</p>
                </div>
              )}
            </div>
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Claim your deposit back → Start Free
            </Link>
          </section>
        )}

        {tab === "parking" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Parking Fine Reduction Estimator</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Original charge (£)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setParkingCharge(Number(e.target.value))} type="number" value={parkingCharge} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input checked={paidWithin14Days} onChange={(e) => setPaidWithin14Days(e.target.checked)} type="checkbox" />
                Paid within 14 days (early discount)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input checked={appealSubmitted} onChange={(e) => setAppealSubmitted(e.target.checked)} type="checkbox" />
                Planning to appeal
              </label>
            </div>
            <div className="space-y-2 text-sm">
              {paidWithin14Days ? (
                <p className="text-lg font-bold">Reduced amount: £{parkingCalc.discountedAmount.toFixed(2)} (40% discount)</p>
              ) : (
                <p className="text-lg font-bold">Current charge: £{parkingCharge.toFixed(2)}</p>
              )}
              {appealSubmitted && (
                <div className="rounded border bg-slate-50 p-3">
                  <p>Estimated appeal success rate: ~{parkingCalc.appealSuccessRate}% (based on common grounds like unclear signage, grace periods, and keeper liability challenges).</p>
                  <p className="mt-1 text-xs text-slate-500">Note: actual success depends on your specific circumstances and evidence.</p>
                </div>
              )}
            </div>
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Appeal your parking charge → Start Free
            </Link>
          </section>
        )}

        {tab === "retail" && (
          <section className="space-y-3 rounded-lg border bg-white p-5">
            <h2 className="text-lg font-semibold">Retail Refund Estimator</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-sm">Purchase price (£)
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setRetailPurchasePrice(Number(e.target.value))} type="number" value={retailPurchasePrice} />
              </label>
              <label className="text-sm">Purchase date
                <input className="mt-1 w-full rounded border px-3 py-2" onChange={(e) => setRetailPurchaseDate(e.target.value)} type="date" value={retailPurchaseDate} />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input checked={retailPaidByCredit} onChange={(e) => setRetailPaidByCredit(e.target.checked)} type="checkbox" />
                Paid by credit card
              </label>
            </div>
            <div className="space-y-2 rounded border bg-slate-50 p-3 text-sm">
              {retailCalc.within30Days ? (
                <p><strong>Within 30 days:</strong> You have the short-term right to reject the goods for a full refund under CRA 2015 s.22.</p>
              ) : retailCalc.within6Months ? (
                <p><strong>30 days – 6 months:</strong> The retailer must offer a repair or replacement. If the first repair fails, you can demand a refund. The burden of proof is on the retailer.</p>
              ) : (
                <p><strong>After 6 months:</strong> You can still claim, but you may need to prove the fault was present at purchase (e.g. an independent report).</p>
              )}
              {retailCalc.section75Eligible && (
                <p className="mt-1 font-semibold text-teal-700">Section 75 eligible: Your credit card provider is jointly liable for purchases between £100 and £30,000.</p>
              )}
              {retailPaidByCredit && !retailCalc.section75Eligible && retailPurchasePrice < 100 && (
                <p className="mt-1 text-amber-700">Section 75 requires a purchase of at least £100. You may be able to use chargeback instead.</p>
              )}
            </div>
            <Link className="inline-block rounded bg-primary px-4 py-2 text-sm text-white" href="/register">
              Start your retail claim → Start Free
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
