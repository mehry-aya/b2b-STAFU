import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  itemsLabel?: string;
}

export function Pagination({ 
  page, 
  totalPages, 
  totalCount, 
  pageSize, 
  onPageChange,
  itemsLabel = "items"
}: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="bg-zinc-50 border-t border-zinc-200 px-6 py-4 flex items-center justify-between">
      <p className="text-sm text-zinc-500 font-medium">
        Showing <span className="font-bold text-zinc-900">{(page - 1) * pageSize + 1}</span> to{" "}
        <span className="font-bold text-zinc-900">{Math.min(page * pageSize, totalCount)}</span> of{" "}
        <span className="font-bold text-zinc-900">{totalCount}</span> {itemsLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1;
            if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                    page === p
                      ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                      : "bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300"
                  }`}
                >
                  {p}
                </button>
              );
            }
            if (p === page - 2 || p === page + 2) {
              return <span key={p} className="px-1 text-zinc-400">...</span>;
            }
            return null;
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}