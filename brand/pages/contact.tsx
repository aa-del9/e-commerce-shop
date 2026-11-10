import type { ReactNode } from "react";

import { brand } from "@/brand/config";
import { Container } from "@/components/ui/container";
import { Page } from "@/components/ui/page";
import { Sections } from "@/components/ui/sections";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function ContactPageView() {
  const { address, supportEmail, supportPhone, whatsappNumber } = brand.identity;
  const addressLines = [
    address.line1,
    address.line2,
    address.city,
    address.region,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return (
    <Page>
      <Container className="max-w-3xl">
        <Sections>
          <div className="grid gap-2.5">
            <h1 className="text-3xl sm:text-4xl md:text-5xl">Contact us</h1>
            <p className="text-muted-foreground">We usually reply within one working day.</p>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            {brand.features.whatsappButton ? (
              <ContactItem label="WhatsApp">
                <a
                  className="underline underline-offset-4"
                  href={getWhatsAppUrl({
                    message: `Hi ${brand.identity.name}, I have a question.`,
                  })}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {whatsappNumber}
                </a>
              </ContactItem>
            ) : null}
            <ContactItem label="Phone">
              <a className="underline underline-offset-4" href={`tel:${supportPhone}`}>
                {supportPhone}
              </a>
            </ContactItem>
            <ContactItem label="Email">
              <a className="underline underline-offset-4" href={`mailto:${supportEmail}`}>
                {supportEmail}
              </a>
            </ContactItem>
            <ContactItem label="Address">
              <address className="not-italic">{addressLines.join(", ")}</address>
            </ContactItem>
          </dl>
        </Sections>
      </Container>
    </Page>
  );
}

function ContactItem({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="grid gap-1 rounded-lg border p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
