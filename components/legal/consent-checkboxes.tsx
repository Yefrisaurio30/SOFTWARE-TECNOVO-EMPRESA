"use client";

import { useState } from "react";

const boxCls =
  "mt-1 size-4 shrink-0 accent-steel";

/**
 * Casillas independientes de consentimiento (Ley 1581 y términos).
 *
 * El `required` del HTML es solo de cliente: `lib/consent.ts` vuelve a validar
 * en el servidor, porque si no la prueba sería falsificable.
 */
export function ConsentCheckboxes({ onChange }: { onChange?: (both: boolean) => void }) {
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const emit = (t: boolean, p: boolean) => onChange?.(t && p);

  return (
    <fieldset className="mt-2 flex flex-col gap-3">
      <legend className="sr-only">Consentimientos obligatorios</legend>

      <label htmlFor="terms" className="flex cursor-pointer items-start gap-3 text-sm text-text-muted">
        <input
          id="terms"
          name="terms"
          type="checkbox"
          required
          checked={terms}
          onChange={(e) => {
            setTerms(e.target.checked);
            emit(e.target.checked, privacy);
          }}
          className={boxCls}
        />
        <span>
          Acepto los{" "}
          <a
            href="/legales/terminos-y-condiciones"
            target="_blank"
            rel="noopener noreferrer"
            className="text-steel underline"
          >
            Términos y Condiciones
          </a>
        </span>
      </label>

      <label htmlFor="privacy" className="flex cursor-pointer items-start gap-3 text-sm text-text-muted">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          required
          checked={privacy}
          onChange={(e) => {
            setPrivacy(e.target.checked);
            emit(terms, e.target.checked);
          }}
          className={boxCls}
        />
        <span>
          Autorizo el tratamiento de mis datos personales según la{" "}
          <a
            href="/legales/politica-de-privacidad"
            target="_blank"
            rel="noopener noreferrer"
            className="text-steel underline"
          >
            Política de Privacidad
          </a>{" "}
          (Habeas Data)
        </span>
      </label>
    </fieldset>
  );
}