// Quién entró (nombre y rol). El nombre de la app lo pone la Barra PROVAC; cerrar sesión solo se hace en el Hub.
export default function BarraSesion({ usuario }) {
  if (!usuario) return null;
  return (
    <div className="sesion">
      <div className="quien">
        <div className="nom">{usuario.nombre}</div>
        <div className="rol">{usuario.rol === 'admin' ? 'Administra' : 'Técnico'}</div>
      </div>
    </div>
  );
}
