# Kit TECNOVO para OpenCode

1. Descomprime este zip en la raíz de tu proyecto (deben quedar `.opencode/skills/`, `assets/brand/`, `AGENTS.md`, etc.).
2. Instala los skills de ECC:
   - Mac/Linux/Git Bash: `bash install-ecc.sh`
   - Windows PowerShell: `.\install-ecc.ps1`
   Requiere `git`. Si algún skill no existe en tu versión de ECC, el script lo salta y sigue.
3. Abre OpenCode en la carpeta y pega el contenido de `PROMPT_MAESTRO.md`.
4. Si se desvía: "Relee el skill tecnovo-design-system y corrige".
5. Para pagos: "Implementa Wompi siguiendo wompi-payments/reference.md".

Pide al cliente el logo en SVG o PNG transparente y reemplaza los de `assets/brand/`.
Revisa los skills de terceros antes de usarlos: son instrucciones que el agente va a seguir.
