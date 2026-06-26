import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section page not-found">
      <h1>Página no encontrada</h1>
      <p>El contenido que buscas no está disponible.</p>
      <Link className="btn primary" to="/">Volver al inicio</Link>
    </section>
  );
}
