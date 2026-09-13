import { site } from "@/content/site";
import Reveal from "@/components/ui/Reveal";
import { MapPinIcon, ClockIcon, PhoneIcon } from "@/components/ui/icons";

export default function StoreSection() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-16 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="eyebrow">Visit us</p>
            <h2 className="display-section mt-2">Come say hello</h2>
            <p className="mt-4 max-w-md text-sm text-muted">
              Try things on, get sized up, and take it home the same day. Our
              team is happy to help you find the right fit.
            </p>

            <dl className="mt-8 space-y-5">
              <div className="flex gap-3">
                <MapPinIcon className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm font-semibold">Address</dt>
                  <dd className="text-sm text-muted">{site.address}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <ClockIcon className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm font-semibold">Opening hours</dt>
                  <dd className="text-sm text-muted">{site.hours}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <PhoneIcon className="mt-0.5 shrink-0 text-primary" />
                <div>
                  <dt className="text-sm font-semibold">Phone</dt>
                  <dd className="text-sm text-muted">
                    <a href={site.phoneHref} className="hover:text-ink">
                      {site.phone}
                    </a>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={site.mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Get directions
              </a>
              <a href={site.phoneHref} className="btn btn-primary">
                Call the store
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="h-full min-h-[320px] overflow-hidden rounded-card border border-border">
            <iframe
              src={site.mapsEmbed}
              title="Pace & Co. store location"
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
