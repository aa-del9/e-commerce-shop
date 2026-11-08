import { brand } from "@/brand/config";
import { Container } from "@/components/ui/container";
import { getAnnouncements } from "@/lib/store-content/server";

// Content: "Announcement" entries in Shopify admin → Content → Metaobjects. Hidden when none are live.
export async function AnnouncementBar() {
  if (!brand.features.announcementBar) return null;
  const [announcement] = await getAnnouncements();
  if (!announcement) return null;
  return (
    <div className="bg-primary text-primary-foreground" data-slot="announcement-bar">
      <Container className="flex min-h-9 items-center justify-center py-2 text-center text-xs sm:text-sm">
        {announcement.link ? (
          <a className="underline-offset-4 hover:underline" href={announcement.link}>
            {announcement.text}
          </a>
        ) : (
          <p>{announcement.text}</p>
        )}
      </Container>
    </div>
  );
}
