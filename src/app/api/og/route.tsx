import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          background: "#1e3a5f",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Shield icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z"
                fill="white"
                opacity="0.9"
              />
            </svg>
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "700",
              color: "rgba(255,255,255,0.9)",
              letterSpacing: "-0.5px",
            }}
          >
            TheyPromised
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "72px",
              fontWeight: "800",
              color: "white",
              lineHeight: "1.1",
              letterSpacing: "-2px",
            }}
          >
            They promised.
            <br />
            <span style={{ color: "#0d9488" }}>You proved it.</span>
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.7)",
              fontWeight: "400",
              maxWidth: "700px",
              lineHeight: "1.4",
            }}
          >
            The UK&apos;s consumer complaint tracker. Log every interaction, draft professional letters,
            and escalate to the ombudsman with confidence.
          </div>
        </div>

        {/* Footer bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <span style={{ fontSize: "20px", color: "rgba(255,255,255,0.5)" }}>
            theypromised.app
          </span>
          <div
            style={{
              display: "flex",
              gap: "24px",
            }}
          >
            {["Free to start", "UK data", "GDPR compliant"].map((tag) => (
              <div
                key={tag}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "16px",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
