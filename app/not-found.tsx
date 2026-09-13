import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center px-4 py-20 text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-hero mt-4">Wrong turn.</h1>
      <div className="mt-6 flex items-center gap-2 text-primary" aria-hidden>
        {/* shoe-print motif */}
        {[0, 1, 2].map((i) => (
          <svg
            key={i}
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ opacity: 0.4 + i * 0.3 }}
          >
            <path d="M8 3c1.5 0 3 1.2 3 4 0 2-1 4-1 6H6c0-2-1-4-1-6 0-2.8 1.5-4 3-4Zm8 6c1.2 0 2 .8 2 2.2 0 1.2-.6 2.3-.6 3.4H14c0-1.1-.6-2.2-.6-3.4C13.4 9.8 14.4 9 16 9ZM5 15h4c.5 2 .3 4-2 4s-2.5-2-2-4Zm8.4 2h3.6c.4 1.6.2 3-1.6 3s-2.2-1.4-2-3Z" />
          </svg>
        ))}
      </div>
      <p className="mt-6 max-w-md text-sm text-muted">
        The page you&apos;re looking for has laced up and left. Let&apos;s get
        you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
        <Link href="/shop" className="btn btn-secondary">
          Shop everything
        </Link>
      </div>
    </div>
  );
}
