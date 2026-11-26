import type { Metadata } from "next";
import { LegalNote, LegalPage, LegalSection, LegalWarning } from "@/components/legal/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Términos y Condiciones | TECNOVO",
  description:
    "Condiciones de uso de la tienda TECNOVO y alcance de la intermediación en publicaciones entre particulares.",
  path: "/legales/terminos-y-condiciones",
});

export default function TerminosPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Términos y Condiciones"
      intro="Reglas de uso de esta tienda y el alcance exacto de lo que hace TECNOVO."
    >
      <LegalSection n={1} title="Objeto">
        <p>
          Estos términos regulan el acceso y el uso del sitio web de TECNOVO y la compra de motos
          eléctricas, repuestos y accesorios de nuestro inventario. Al usar el sitio aceptas
          íntegramente estas condiciones.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Productos que vendemos nosotros">
        <p>
          TECNOVO es el vendedor directo y el responsable comercial de los productos de su
          inventario: motos nuevas, motos de segunda mano revisadas por nosotros, repuestos y
          accesorios. Para esos productos aplica la Ley 1480 de 2011, también llamada Estatuto del
          Consumidor, incluido el derecho de retracto en las condiciones que explica la página de
          Retracto y Reembolsos.
        </p>
        <p>
          Los precios se muestran en pesos colombianos. El pago se procesa por Wompi. La
          confirmación del pago ocurre únicamente cuando la pasarela nos notifica que la
          transacción fue aprobada. Volver desde la pasarela hacia este sitio no confirma por sí
          mismo un pago.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Marketplace: publicaciones entre particulares">
        <LegalWarning>
          TECNOVO es únicamente un intermediario de publicación. No es el vendedor ni el comprador
          en las transacciones entre particulares.
        </LegalWarning>
        <p>
          Cuando un particular publica una moto usada en este sitio, la compra y la venta ocurre
          directamente entre esa persona y quien la compra. TECNOVO solo aloja el anuncio y lo revisa
          moderadamente antes de publicarlo.
        </p>
        <p>En consecuencia, TECNOVO no responde por:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>El estado real, mecánico o documental de la moto vendida por un particular.</li>
          <li>Lo que el vendedor afirme en su anuncio o en conversaciones privadas.</li>
          <li>El incumplimiento de las obligaciones del vendedor frente al comprador.</li>
          <li>La entrega del producto si el vendedor no la realiza.</li>
          <li>El derecho de retracto y las devoluciones de esas ventas entre particulares.</li>
        </ul>
        <p>
          El contrato de compraventa se celebra directamente entre las partes conforme al Código de
          Comercio. El comprador debe verificar la documentación de la moto, la propiedad y el
          historial de revisión, antes de pagar.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Moderación de anuncios">
        <p>
          Publicamos solo los anuncios que un administrador de TECNOVO revisó y aprobó. Podemos
          rechazar o retirar un anuncio si el producto no corresponde a una moto, si las fotos no
          muestran el producto, si el precio es engañoso o si el anuncio infringe la ley o estos
          términos.
        </p>
        <p>
          Podemos pedir evidencia de propiedad del producto. Publicar un anuncio no garantiza que
          sea aprobado ni que permanezca publicado.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Precios y disponibilidad">
        <p>
          Los precios pueden cambiar sin previo aviso. Si un producto se agota o cambia de precio
          mientras está en tu carrito, el servidor recalcula el total antes del pago. Lo que pagas
          es lo que el servidor confirma al momento de crear el pedido.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Uso del sitio y cuentas">
        <p>
          Debes usar el sitio de forma lícita y tratar correctamente a los demás usuarios. No
          puedes publicar contenido ilegal, ofensivo o que infrinja derechos de terceros, ni usar el
          sitio para spam o fraude.
        </p>
        <p>
          Eres responsable de la confidencialidad de tu contraseña y de toda la actividad que se
          haga con tu cuenta.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Limitación de responsabilidad">
        <p>
          Tomamos medidas razonables para que el sitio funcione, pero no garantizamos que esté
          disponible de forma ininterrumpida ni libre de errores. Respondemos por los daños que sean
          directamente imputables a nuestro incumplimiento, conforme a la ley.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Propiedad intelectual">
        <p>
          El nombre, el logotipo, el diseño y los contenidos del sitio pertenecen a TECNOVO o a
          quienes les licenciaron esos derechos. Las marcas de terceros son de sus respectivos
          dueños. En los anuncios de particulares, quien publica conserva los derechos sobre sus
          fotos y garantiza que tiene autorización para subirlas.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Ley aplicable y solución de controversias">
        <p>
          Estos términos se rigen por la ley colombiana. Las partes procuran resolver sus
          diferencias de forma directa. Si no es posible, se someten a la jurisdicción de los
          jueces y tribunales competentes en Colombia, de acuerdo con las reglas procesales
          vigentes.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Cambios a estos términos">
        <p>
          Podemos modificar estos términos. La versión vigente es la publicada en esta página, con su
          fecha de última actualización. Si el cambio es sustancial, lo anunciaremos de forma
          visible en el sitio.
        </p>
      </LegalSection>

      <LegalNote>
        Para dudas sobre estos términos puedes escribirnos por los canales de contacto indicados en
        la página principal.
      </LegalNote>
    </LegalPage>
  );
}