const WORDS = [
  "Men",
  "Women",
  "Kids",
  "Clothing",
  "Footwear",
  "Accessories",
];

export default function Marquee() {
  const line = (
    <span className="flex shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span className="font-display px-6 text-2xl font-extrabold uppercase tracking-tight md:text-3xl">
            {w}
          </span>
          <span className="text-primary" aria-hidden>
            ✦
          </span>
        </span>
      ))}
    </span>
  );

  return (
    <div className="overflow-hidden border-b border-border bg-ink py-4 text-white">
      <div className="flex w-max animate-marquee" aria-hidden>
        {line}
        {line}
      </div>
      <span className="sr-only">
        Categories: Men, Women, Kids, Clothing, Footwear, Accessories
      </span>
    </div>
  );
}
