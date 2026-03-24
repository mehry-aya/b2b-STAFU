import ObliqueCarousel from "@/components/ObliqueCarousel";
import { LanguageSelector } from "@/components/ui/LanguageSelector";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let images: string[] = [];

  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001/api";
    const url = `${backendUrl}/carousel-images?page=login`;

    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (response.ok) {
      images = await response.json();
    } else {
      const text = await response.text();
      console.error("Response not ok:", text);
    }
  } catch (error) {
    console.error("Failed to fetch carousel images:", error);
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center">
      <ObliqueCarousel images={images} />
      
      {/* Language Switcher */}
      <div className="absolute top-6 left-6 z-20">
        <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-1">
          <LanguageSelector variant="compact" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-4 py-8">
        <div className="backdrop-blur-xl bg-white/25 border border-white/45 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
