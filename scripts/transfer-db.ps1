<#
  Traslada la base de datos local de Docker a Supabase.

  Resuelve dos trampas de Windows que hacen fallar esto a mano:
    1. `pg_dump ... > archivo.sql` en PowerShell 5.1 mete BOM y rompe el
       archivo. Aqui el dump se escribe DENTRO del contenedor y se copia.
    2. La contrasena de Supabase suele traer caracteres que hay que
       percent-encodear en la URL. Aqui se pasa por PGPASSWORD.

  Uso:
    .\scripts\transfer-db.ps1
    .\scripts\transfer-db.ps1 -SkipDump      (solo restaurar, ya tenes el dump)
    .\scripts\transfer-db.ps1 -SkipRestore    (solo volcar)

  Necesita en .env.production.local:
    SUPABASE_POOLER_HOST=aws-0-us-west-2.pooler.supabase.com
    SUPABASE_DB_PASSWORD=<la nueva, ya rotada>
    SUPABASE_DB_USER=postgres
    SUPABASE_DB_NAME=postgres
#>
param(
  [switch]$SkipDump,
  [switch]$SkipRestore,
  [string]$Container = "software-tecnovo-empresa-db-1"
)

$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $PSScriptRoot
$stage = Join-Path $project "_deploy"
$dump = Join-Path $stage "tecnovo.sql"

function Read-DotEnv($path) {
  if (-not (Test-Path $path)) {
    throw "No existe $path. Crealo con las variables SUPABASE_* antes de seguir."
  }
  $vars = @{}
  foreach ($line in Get-Content $path) {
    $t = $line.Trim()
    if (-not $t -or $t.StartsWith("#")) { continue }
    $eq = $t.IndexOf("=")
    if ($eq -lt 1) { continue }
    $vars[$t.Substring(0, $eq).Trim()] = $t.Substring($eq + 1).Trim()
  }
  return $vars
}

$cfg = Read-DotEnv (Join-Path $project ".env.production.local")

foreach ($key in @("SUPABASE_POOLER_HOST", "SUPABASE_DB_PASSWORD")) {
  if (-not $cfg.ContainsKey($key) -or [string]::IsNullOrWhiteSpace($cfg[$key])) {
    throw "Falta $key en .env.production.local"
  }
}

$host_ = $cfg["SUPABASE_POOLER_HOST"]
$pass = $cfg["SUPABASE_DB_PASSWORD"]
$user = if ($cfg.ContainsKey("SUPABASE_DB_USER")) { $cfg["SUPABASE_DB_USER"] } else { "postgres" }
$dbname = if ($cfg.ContainsKey("SUPABASE_DB_NAME")) { $cfg["SUPABASE_DB_NAME"] } else { "postgres" }

# El pooler de transicion (6543) cierra la sesion entre transacciones y no
# sirve para restaurar: para eso el session pooler en 5432.
if ($host_ -match ":") {
  throw "SUPABASE_POOLER_HOST no debe traer el puerto. Dejalo como aws-0-<region>.pooler.supabase.com"
}

New-Item -ItemType Directory -Force -Path $stage | Out-Null

if (-not $SkipDump) {
  Write-Host "`n1/2 Volcando la base local..." -ForegroundColor Cyan

  $running = docker ps --filter "name=$Container" --format "{{.Names}}"
  if ($running -notcontains $Container) {
    throw "El contenedor '$Container' no esta corriendo. Levanta la base con: docker compose up db -d"
  }

  docker exec $Container pg_dump -U tecnovo -d tecnovo --no-owner --format=plain -f /tmp/tecnovo.sql
  if ($LASTEXITCODE -ne 0) { throw "pg_dump fallo" }
  docker cp "$Container`:/tmp/tecnovo.sql" $dump
  if ($LASTEXITCODE -ne 0) { throw "docker cp fallo" }

  $kb = [math]::Round((Get-Item $dump).Length / 1KB, 1)
  Write-Host "   $dump ($kb KB)" -ForegroundColor Green
}

if (-not $SkipRestore) {
  Write-Host "`n2/2 Restaurando en Supabase..." -ForegroundColor Cyan

  # El dump viaja montado en un contenedor: no hace falta psql en Windows.
  docker run --rm `
    -e PGPASSWORD=$pass `
    -v "${stage}:/b" `
    postgres:16-alpine `
    psql -h $host_ -p 5432 -U $user -d $dbname -v ON_ERROR_STOP=1 -f /b/tecnovo.sql

  if ($LASTEXITCODE -ne 0) { throw "El restore fallo. Revisa el error de arriba." }

  Write-Host "`n   Restaurado. Verifica con:" -ForegroundColor Green
  Write-Host "   docker run --rm -e PGPASSWORD=`$pass postgres:16-alpine psql -h $host_ -p 5432 -U $user -d $dbname -c '\dt'"
  Write-Host ""
  Write-Host "   Recuerda: si el proyecto estaba pausado, Reactivalo en el dashboard primero." -ForegroundColor Yellow
}

Write-Host "Listo. _deploy/ esta en .vercelignore, no se sube a Vercel." -ForegroundColor Green