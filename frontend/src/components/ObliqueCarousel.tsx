"use client";

import Image from "next/image";

interface ObliqueCarouselProps {
  images: string[];
}

export default function ObliqueCarousel({ images }: ObliqueCarouselProps) {
  if (!images || images.length === 0) {
    return <div className="fixed inset-0 bg-slate-900" />;
  }

  const fill = (arr: string[], times = 8) =>
    Array.from({ length: times }, () => arr).flat();

  const third = Math.ceil(images.length / 3);
  const group1 = images.slice(0, third);
  const group2 = images.slice(third, third * 2);
  const group3 = images.slice(third * 2);

  const lanes = [
    { imgs: fill(group1), cls: "animate-scroll-left" },
    { imgs: fill(group2), cls: "animate-scroll-right" },
    { imgs: fill(group3), cls: "animate-scroll-left-slow" },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-black/80 z-0">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-15deg] flex flex-col gap-3 items-start justify-center w-[250vw] h-[250vh]">
        {lanes.map((lane, li) => (
          <div key={li} className={`flex gap-2 shrink-0 w-max ${lane.cls}`}>
            {lane.imgs.map((url, i) => (
              <div
                key={i}
                className="relative shrink-0 overflow-hidden w-[140px] h-[200px] sm:w-[200px] sm:h-[280px] md:w-[240px] md:h-[340px] lg:w-[280px] lg:h-[380px]"
              >
                <Image
                  src={url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 140px, (max-width: 768px) 200px, (max-width: 1024px) 240px, 280px"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="absolute inset-0 bg-black/40 z-10" />
    </div>
  );
}