import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function AccountLinks() {
  const session = await auth();
  if (!session?.user) {
    return (
      <Link href="/login" className="text-text-muted hover:text-text">
        Entrar
      </Link>
    );
  }
  return (
    <span className="flex items-center gap-4">
      <span className="text-text-faint">Hola, {session.user.name ?? session.user.email}</span>
      {session.user.role === "SUPERADMIN" ? (
        <Link href="/admin" className="text-text-muted hover:text-text">
          Admin
        </Link>
      ) : null}
      {session.user.role === "MAYORISTA" || session.user.role === "DISTRIBUIDOR" ? (
        <Link href="/distribuidores/catalogo" className="text-text-muted hover:text-text">
          Mayorista
        </Link>
      ) : null}
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button type="submit" className="text-text-muted hover:text-text">
          Salir
        </button>
      </form>
    </span>
  );
}
