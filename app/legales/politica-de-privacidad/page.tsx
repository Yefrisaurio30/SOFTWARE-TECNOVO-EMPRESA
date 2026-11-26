import type { Metadata } from "next";
import { LegalNote, LegalPage, LegalSection } from "@/components/legal/legal-page";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Política de Privacidad | TECNOVO",
  description:
    "Tratamiento de datos personales conforme a la Ley 1581 de 2012 (Habeas Data) y al Decreto 1377 de 2013.",
  path: "/legales/politica-de-privacidad",
});

export default function PrivacidadPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Política de Privacidad"
      intro="Cómo tratamos tus datos personales conforme a la Ley 1581 de 2012 (Habeas Data) y al Decreto 1377 de 2013 en Colombia."
    >
      <LegalSection n={1} title="Responsable del tratamiento">
        <p>
          TECNOVO es responsable del tratamiento de los datos personales que tostampa este sitio.
          Puedes contactarnos para cualquier asunto relacionado con tus datos a través de los canales
          de atención publicados en la página principal.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Qué datos recogemos y por qué">
        <p>
          Recogemos únicamente los datos que necesitamos para cada trámite. No solicitamos datos que
          no sean estrictamente necesarios.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Creación de cuenta:</strong> nombre, correo electrónico y contraseña. Son
            necesarios para identificarte y permitirte comprar.
          </li>
          <li>
            <strong>Compra:</strong> nombre, número de celular, correo electrónico, ciudad y
            dirección de entrega. Son necesarios para procesar el pedido y coordinar la entrega.
          </li>
          <li>
            <strong>Publicación de un anuncio de moto usada:</strong> nombre, marca, año,
            kilometraje, precio, ciudad, número de celular y hasta cinco imágenes del producto.
          </li>
          <li>
            <strong>Evidencia de consentimiento:</strong> fecha y hora de aceptación, y la dirección
            IP desde la que aceptaste. No la usamos para rastrearte: la conservamos para demostrar
            ante una autoridad que tú autorizaste el tratamiento.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Finalidades del tratamiento">
        <p>Tratamos tus datos para:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Gestionar tu cuenta y autenticar tu acceso.</li>
          <li>Procesar pedidos, pagos y devoluciones.</li>
          <li>Coordinar la entrega y la atención posventa.</li>
          <li>Moderar los anuncios que publiquen los particulares.</li>
          <li>Cumplir obligaciones legales, contables y tributarias.</li>
          <li>Atender derechos de titulares y requerimientos de la SIC.</li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Datos sensibles">
        <p>
          No solicitamos datos sensibles. No registres información de salud, orientación política,
          religión ni datos de menores de edad. El número de cédula no es obligatorio para comprar.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Imágenes que tú publicas">
        <p>
          Cuando publicas un anuncio de moto usada subes hasta cinco imágenes. Tú garantizas que
          son tuyas o que tienes autorización del fotógrafo, y que no contienen datos personales de
          terceros sin su consentimiento. Podemos retirar un anuncio si encontramos contenido que
          vulnere derechos de terceros.
        </p>
        <p>
          Las imágenes se guardan en nuestros servidores. Si quieres que eliminemos el material de un
          anuncio concreto, solicítalo por los canales de atención.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Con quién compartimos tus datos">
        <p>Solo compartimos con:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Wompi</strong>, como pasarela de pagos, únicamente para procesar la
            transacción. No almacenamos números de tarjeta ni datos financieros.
          </li>
          <li>
            <strong>La empresa de transporte o mensajería</strong> que lleva el pedido: nombre,
            celular, dirección y ciudad.
          </li>
          <li>
            <strong>Autoridades competentes</strong>, cuando exista una obligación legal o una
            orden judicial.
          </li>
        </ul>
        <p>No vendemos ni cedemos tus datos personales a terceros con fines comerciales.</p>
      </LegalSection>

      <LegalSection n={7} title="Cuánto tiempo conservamos los datos">
        <p>
          Conservamos los datos de tu cuenta mientras esté activa. Los datos de los pedidos se
          conservan por los plazos legales y contables aplicables en Colombia. La evidencia de
          consentimiento se conserva para poder atender requerimientos de la SIC.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Tus derechos como titular">
        <p>
          La Ley 1581 de 2012 te garantiza el derecho a conocer, consultar y suprimir tus datos, y a
          solicitar la rectificación o actualización de los que sean inexactos.
        </p>
        <p>Para ejercerlos:</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Escríbenos indicando qué derecho deseas ejercer.</li>
          <li>Verificamos tu identidad para proteger tus datos de terceros.</li>
          <li>
            Atendemos tu solicitud dentro de los plazos legales: cinco días hábiles para
            consultas y cinco días hábiles para la supresión, con prórroga justificada.
          </li>
        </ol>
      </LegalSection>

      <LegalSection n={9} title="Seguridad de la información">
        <p>
          Aplicamos medidas técnicas y administrativas razonables para proteger tus datos contra
          acceso no autorizado, alteración o pérdida. El acceso interno está restringido al personal
          que lo necesita y las contraseñas se almacenan cifradas.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Cambios a esta política">
        <p>
          Podemos actualizar esta política. La versión vigente es la de esta página, con su fecha de
          última actualización. Si el cambio afecta materialmente tus derechos, lo anunciaremos de
          forma visible.
        </p>
      </LegalSection>

      <LegalNote>
        Si consideras que tu tratamiento vulnera la Ley 1581 de 2012, puedes presentar una queja ante
        la Superintendencia de Industria y Comercio, autoridad de protección de datos personales en
        Colombia.
      </LegalNote>
    </LegalPage>
  );
}