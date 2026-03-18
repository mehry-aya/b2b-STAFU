"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { getMeAction } from "@/app/(auth)/actions";
import {
  createAdminAction,
  deleteAdminAction,
  getAdminsAction,
} from "@/app/(auth)/actions";
import {
  Shield,
  Plus,
  Trash2,
  Crown,
  Mail,
  Calendar,
  X,
  Loader2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";

interface Admin {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

export default function MasterAdminsPage() {
  const t = useTranslations("MasterAdmins");
  const tErr = useTranslations("Errors");
  const locale = useLocale();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<number | null>(null);
  const router = useRouter();

  // Role guard: redirect non-master_admin users away
  useEffect(() => {
    getMeAction().then((data) => {
      if (data?.role === "master_admin") {
        setAuthorized(true);
      } else {
        router.replace("/admin/dashboard");
      }
    });
  }, [router]);

  const loadAdmins = useCallback(async () => {
    setLoading(true);
    const result = await getAdminsAction();
    if (result.admins) setAdmins(result.admins as Admin[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authorized) loadAdmins();
  }, [authorized, loadAdmins]);

  // Don't render page content until auth check resolves (prevents flash for unauthorized users)
  if (!authorized) return null;

  async function handleDelete(id: number) {
    setAdminToDelete(id);
    setIsDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (adminToDelete === null) return;
    const result = await deleteAdminAction(adminToDelete);
    if (result.success) {
      setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete));
      toast.success(t("deleteSuccess") || "Admin deleted successfully");
    } else {
      toast.error(tErr(result.error || "deleteAdminFailed"));
    }
    setAdminToDelete(null);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f0f0f] px-8 py-8">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-red-500 via-red-400 to-transparent" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-red-400 text-xs font-semibold tracking-widest uppercase">
              <Crown className="h-3.5 w-3.5" />
              <Link
                href="/master/dashboard"
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {t("master")}
              </Link>
              <span className="text-zinc-600">/</span>
              <span className="text-red-400">{t("adminManagement")}</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {t("title")}
            </h1>
            <p className="text-zinc-400 text-sm max-w-md">
              {t("subtitle")}
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-black text-sm font-bold rounded-xl px-4 py-2.5 transition-colors shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t("addAdmin")}
          </button>
        </div>
      </div>

      {/* Admins List */}
      <div>
        <h2 className="text-xs font-bold tracking-widest uppercase text-zinc-400 mb-4">
          {t("allAdmins")}
        </h2>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100 last:border-0 animate-pulse"
              >
                <div className="w-9 h-9 rounded-full bg-zinc-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4" />
                </div>
                <div className="h-8 bg-zinc-100 rounded w-20" />
              </div>
            ))}
          </div>
        ) : admins.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <Shield className="h-10 w-10 text-zinc-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-500">
              {t("noAdmins")}
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              {t("addAdminPrompt")}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
            {admins.map((admin, i) => (
              <div
                key={admin.id}
                className={`flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors ${
                  i < admins.length - 1 ? "border-b border-zinc-100" : ""
                }`}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {admin.email[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <p className="text-sm font-semibold text-zinc-900 truncate">
                      {admin.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="h-3 w-3 text-zinc-300 shrink-0" />
                    <p className="text-xs text-zinc-400">
                      {t("joined", { 
                        date: new Date(admin.createdAt).toLocaleDateString(locale, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      })}
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600">
                  {t("adminRole")}
                </span>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(admin.id)}
                  className="p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title={t("deleteAdmin")}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddAdminModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadAdmins();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t("deleteModalTitle")}
        description={t("deleteModalDesc")}
        onConfirm={confirmDelete}
        confirmText={t("delete")}
        variant="danger"
      />
    </div>
  );
}

function AddAdminModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const t = useTranslations("MasterAdmins");
  const tErr = useTranslations("Errors");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await createAdminAction(email, password);

    if (result.success) {
      onSuccess();
    } else {
      setError(tErr(result.error || "createAdminFailed"));
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-zinc-900">{t("addNewAdmin")}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t("modalSubtitle")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              {t("email")}
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-700 mb-1.5 uppercase tracking-wider">
              {t("password")}
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 focus:outline-none"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm text-zinc-600 font-bold hover:bg-zinc-50 rounded-xl transition-colors border border-zinc-200"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 text-sm bg-zinc-900 text-white font-bold rounded-xl hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {loading ? t("adding") : t("addAdmin")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
