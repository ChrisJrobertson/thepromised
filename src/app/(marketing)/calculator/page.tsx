import { CalculatorClient } from "./CalculatorClient";

export const metadata = {
  title: "What Am I Owed? — UK Consumer Compensation Calculator | TheyPromised",
  description: "Calculate what you're owed for flight delays, energy overcharges, broadband speed issues, and faulty products. Free UK consumer rights calculator.",
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
