import type { Metadata } from "next";

import { ContactPageView } from "@/brand/pages/contact";
import { buildAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: buildAlternates({ pathname: "/contact" }),
  title: "Contact",
};

export default function ContactPage() {
  return <ContactPageView />;
}
