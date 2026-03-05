import { cookies } from "next/headers";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";
import { DeleteAdminButton } from "./AdminItems";
import { ClientTrigger } from "@/app/master/dashboard/ClientTrigger";

interface Admin {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

async function getAdmins() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  const res = await fetch("http://localhost:3001/users/admins", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return [];
  return res.json();
}

export default async function MasterDashboard() {
  const admins = await getAdmins();

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Master Admin{" "}
              <span className="text-slate-500 font-medium">Dashboard</span>
            </h1>
            <p className="text-slate-500 mt-1">
              Manage system administrators and portal settings.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <DashboardActionWrapper />
            <LogoutButton />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin: Admin) => (
                <tr
                  key={admin.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-slate-900 font-medium">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DeleteAdminButton id={admin.id} />
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    No administrators found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Client wrapper for the "Add Admin" trigger
function DashboardActionWrapper() {
  return <ClientTrigger />;
}
