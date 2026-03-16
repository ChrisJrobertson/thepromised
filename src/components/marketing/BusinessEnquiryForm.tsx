"use client";

import { useState } from "react";

export function BusinessEnquiryForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    role: "",
    message: "",
  });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError("");

    const response = await fetch("/api/business-enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? "Could not submit your enquiry.");
      setStatus("error");
      return;
    }

    setStatus("success");
    setForm({ company_name: "", contact_name: "", email: "", role: "", message: "" });
  }

  const inputClass = "rounded-md border px-3 py-2 text-sm";

  return (
    <form className="space-y-3 rounded-lg border bg-white p-5" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">Request Your Free Scorecard Preview</h2>

      <input
        className={inputClass}
        onChange={(e) => setForm((prev) => ({ ...prev, company_name: e.target.value }))}
        placeholder="Company name"
        required
        value={form.company_name}
      />
      <input
        className={inputClass}
        onChange={(e) => setForm((prev) => ({ ...prev, contact_name: e.target.value }))}
        placeholder="Contact name"
        required
        value={form.contact_name}
      />
      <input
        className={inputClass}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        placeholder="Email"
        required
        type="email"
        value={form.email}
      />
      <input
        className={inputClass}
        onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
        placeholder="Role"
        value={form.role}
      />
      <textarea
        className={`${inputClass} min-h-[120px]`}
        onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
        placeholder="Message"
        value={form.message}
      />

      <button
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        disabled={status === "submitting"}
        type="submit"
      >
        {status === "submitting" ? "Submitting..." : "Request Your Free Scorecard Preview"}
      </button>

      {status === "success" ? <p className="text-sm text-green-700">Thanks — we’ll get back to you shortly.</p> : null}
      {status === "error" ? <p className="text-sm text-red-700">{error}</p> : null}
    </form>
  );
}
