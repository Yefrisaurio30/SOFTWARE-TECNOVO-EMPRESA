import type { Metadata } from "next";
import { LegalNote, LegalPage, LegalSection, LegalWarning } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Derecho de Retracto y Reembolsos | TECNOVO",
  description:
    "Condiciones del derecho de retracto en compras en línea, conforme al artículo 47 de la Ley 1480 de 2011.",
};

export default function RetractoPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Retracto y Reembolsos"
      intro="Tu derecho a desistir de una compra hecha por internet y cómo se devuelve el dinero."
    >
      <LegalSection n={1} title="Qué es el derecho de retracto">
        <p>
          El artículo 47 de la Ley 1480 de 2011 (Estatuto del Consumidor) reconoce el derecho de
          retracto: en compras realizadas fuera de un establecimiento comercial, puedes desistir de
          la compra dentro de los cinco días hábiles siguientes a la entrega del bien o a la
          firma del contrato.
        </p>
        <p>
          <strong>El plazo vence cinco días hábiles después de que el pago queda confirmado.</strong>
          En TECNOVO el pago se confirma cuando Wompi nos notifica que la transacción fue aprobada.
          El tiempo que pasa en la pasarela de pagos no cuenta dentro de ese plazo.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Cómo ejercer el derecho de retracto">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Escríbenos por los canales de atención e indica el número de tu pedido.</li>
          <li>Confirma que no has usado el producto y que lo devuelves en las mismas condiciones.</li>
          <li>Te confirmamos la recepción y el valor a devolver.</li>
          <li>Solicitamos la devolución del dinero a Wompi.</li>
        </ol>
        <p>
          Wompi procesa la devolución al medio de pago original. De acuerdo con la política de la
          pasarela, el plazo de acreditación depende de la entidad financiera y puede tardar varios
          días hábiles después de que aprobamos la devolución.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Qué debe cumplir el producto para poder devolverlo">
        <p>
          Para aceptar el retracto, el producto debe devolverse sin uso, con todos sus accesorios y
          en el mismo estado en que fue entregado, con su documentación y empaque original.
        </p>
        <p>
          Las motos del inventario de la tienda se consideran productos de consumo personal y con
          instalación o puesta en marcha: una vez que la moto fue entregada y el comprador la usó o
          se puso en marcha, no es posible un retracto por cambio de opinión. Si el producto llega
          con defectos de fábrica o no corresponde a lo ofrecido, ese es un reclamo distinto de
          garantía y se tramita con el área de taller.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Motivos por los que una devolución no procede">
        <ul className="list-disc space-y-1 pl-5">
          <li>El producto fue usado, monté o conducido.</li>
          <li>Faltan piezas, accesorios o documentación.</li>
          <li>El producto presenta daños por mal uso.</li>
          <li>Pasaron los cinco días hábiles desde la confirmación del pago.</li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Garantías y reclamos por defectos">
        <p>
          El derecho de retracto es distinto de la garantía. Si un producto tiene un defecto, o no
          corresponde a lo anunciado, tienes derecho a la garantía legal, a la solución o reemplazo
          del bien, o a la reducción del precio, según el caso. Esos trámites los gestionamos con el
          área de taller.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Compras entre particulares">
        <LegalWarning>
          Si compraste una moto publicada por un particular, el derecho de retracto y las
          devoluciones se tramitan directamente con ese vendedor, no con TECNOVO.
        </LegalWarning>
        <p>
          TECNOVO solo aloja y modera el anuncio. El contrato de compraventa lo celebra el
          vendedor contigo. En esas operaciones el obligado frente a ti es el particular que vendió
          la moto. Antes de comprar, verifica la documentación del producto y la identidad del
          vendedor.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Cambios en esta política">
        <p>
          La versión vigente es la publicada en esta página, con su fecha de última actualización.
        </p>
      </LegalSection>

      <LegalNote>
        Para ejercer el retracto escríbenos indicando el número de pedido. Puedes hacerlo por los
        canales de atención de la página principal.
      </LegalNote>
    </LegalPage>
  );
}