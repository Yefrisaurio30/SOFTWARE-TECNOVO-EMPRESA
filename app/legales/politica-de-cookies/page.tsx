import type { Metadata } from "next";
import { LegalNote, LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Política de Cookies | TECNOVO",
  description: "Qué tecnologías guarda este sitio, para qué y cómo gestionarlas.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de Cookies"
      intro="Qué guarda este sitio en tu navegador, por qué lo hace y cómo puedes controlarlo."
    >
      <LegalSection n={1} title="Qué son cookies y tecnologías similares">
        <p>
          Una cookie es un pequeño archivo que un sitio guarda en tu navegador para recordar
          información entre visitas. En este sitio usamos además el almacenamiento local, que
          cumple la misma función pero no viaja con cada petición.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Lo que realmente usamos hoy">
        <p>
          Para no exagerar nada: <strong>este sitio no usa cookies publicitarias ni de seguimiento
          publicitario</strong>, y tampoco usa herramientas de analítica que registren tu
          navegación. Lo que sí usamos es lo siguiente:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Cookie de sesión (esencial).</strong> La crea el sistema de autenticación para
            mantener tu sesión iniciada. Sin ella no podrías entrar a tu cuenta ni comprar. No
            permite rastrear tu actividad entre sitios.
          </li>
          <li>
            <strong>Almacenamiento local: carrito de compras.</strong> Guardamos los productos que
            agregaste y la cantidad. Sirve para que no pierdas el carrito si cierras el navegador.
            Puedes borrarlo desde tu navegador o con el botón de vaciar carrito.
          </li>
          <li>
            <strong>Almacenamiento local: comparador.</strong> Recordamos qué motos marcaste para
            comparar entre páginas.
          </li>
          <li>
            <strong>Almacenamiento de sesión: pantalla de carga.</strong> Mostramos el logo al
            entrar por primera vez y no lo repetimos en la misma sesión.
          </li>
          <li>
            <strong>Aceptación del aviso de cookies.</strong> Guardamos localmente que ya cerraste el
            aviso, para no mostrártelo en cada visita.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Contenido de terceros">
        <p>
          Algunas partes del sitio incrustan contenido de terceros. Estos proveedores pueden usar
          sus propias tecnologías y sus propias políticas de privacidad:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Mapa de Google Maps, en la sección de ubicaciones y el taller.</li>
          <li>Reproductores de YouTube sin cookies, en la sección de capacitación.</li>
        </ul>
        <p>
          Cuando incrustamos un video de YouTube solo lo cargamos cuando decides reproducirlo. El
          mapa de Google puede cargar recursos de Google en el momento en que se muestra.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Cómo gestionarlas">
        <p>
          Puedes borrar o bloquear las cookies y el almacenamiento local desde la configuración de
          tu navegador. Ten en cuenta que si bloqueas la cookie de sesión no podrás iniciar sesión
          ni completar una compra, porque la pasarela de pago necesita esa sesión para confirmar la
          transacción.
        </p>
        <p>
          Si borras los datos del sitio, tu carrito y el comparador quedarán vacíos.
        </p>
      </LegalSection>

      <LegalNote>
        Esta política refleja lo que el sitio hace en la fecha de última actualización. Si en el
        futuro incorporamos analítica o publicidad, actualizaremos esta página antes de empezar a
        usar esas tecnologías.
      </LegalNote>
    </LegalPage>
  );
}