import { redirect } from "next/navigation";

/**
 * Legacy synthetic Component Health route.
 * The old demo is preserved in Git history but cannot appear as real robot evidence.
 */
export default function LegacySyntheticComponentHealthRedirect() {
  redirect("/platform/component-health/reports");
}
