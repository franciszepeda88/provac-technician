// Marcador de carga: bloques grises en lugar de un texto "Cargando…" suelto.
export default function Esqueleto({ filas = 3 }) {
  return (
    <div className="esq-lista" aria-busy="true" aria-label="Cargando">
      {Array.from({ length: filas }, (_, i) => <div key={i} className="esq esq-tarjeta" />)}
    </div>
  );
}
