import { prisma } from "@/lib/prisma";
import { reviewDistributor, setUserRole } from "@/lib/admin-actions";

export default async function UsuariosPage() {
  const [users, profiles] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
    prisma.distributorProfile.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
  ]);

  const pending = profiles.filter((p) => p.status === "PENDIENTE");

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Usuarios y mayoristas</h1>

      {pending.length > 0 ? (
        <section aria-label="Solicitudes pendientes" className="mt-6 rounded-[24px] border border-steel/40 bg-surface p-6">
          <h2 className="font-semibold">Solicitudes de mayorista ({pending.length})</h2>
          <p className="mt-1 text-sm text-text-muted">
            Al aprobar, el usuario recibe el rol MAYORISTA y acceso al catálogo exclusivo.
          </p>
          <ul className="mt-4 flex flex-col gap-4">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 p-4 text-sm">
                <div className="min-w-52 flex-1">
                  <p className="font-medium">{p.company} · NIT {p.nit}</p>
                  <p className="text-text-muted">{p.user.name} · {p.user.email} · {p.city} · {p.phone}</p>
                </div>
                <form action={async () => { "use server"; await reviewDistributor(p.id, "APROBADO"); }}>
                  <button className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-black">Aprobar</button>
                </form>
                <form action={async () => { "use server"; await reviewDistributor(p.id, "RECHAZADO"); }}>
                  <button className="rounded-full border border-danger/40 px-4 py-1.5 text-xs text-danger">Rechazar</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Perfiles de empresa" className="mt-6">
        <h2 className="font-semibold">Empresas mayoristas ({profiles.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-[24px] border border-white/10">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="px-4 py-3 font-medium">Empresa</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <tr key={p.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{p.company} · {p.city}</td>
                  <td className="px-4 py-3 text-text-muted">{p.user.email}</td>
                  <td className="px-4 py-3">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="Todos los usuarios" className="mt-6">
        <h2 className="font-semibold">Usuarios ({users.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-[24px] border border-white/10">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-text-muted">
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Rol</th>
                <th className="px-4 py-3 font-medium">Cambiar rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5 last:border-0">
                  <td className="px-4 py-3">{u.name ?? "—"} · {u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3">
                    <form action={async (fd: FormData) => {
                      "use server";
                      await setUserRole(u.id, String(fd.get("role")));
                    }} className="flex gap-2">
                      <select name="role" defaultValue={u.role} aria-label={`Rol de ${u.email}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="MAYORISTA">MAYORISTA</option>
                        <option value="DISTRIBUIDOR">DISTRIBUIDOR</option>
                        <option value="SUPERADMIN">SUPERADMIN</option>
                      </select>
                      <button type="submit" className="rounded-full border border-white/15 px-3 py-1 text-xs">OK</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
