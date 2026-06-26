import { Link, useParams } from 'react-router-dom';
import { plans } from '../data/content.js';
import BookReader from '../components/BookReader.jsx';

export default function PlanDetail() {
  const { slug } = useParams();
  const plan = plans.find((item) => item.slug === slug);

  if (!plan) {
    return <section className="section page"><h1>Plan no encontrado</h1><Link to="/planes">Volver a planes</Link></section>;
  }

  const pages = plan.days.map((day) => `${day.title}\n\nVersículo base: ${day.verse}\n\n${day.text}\n\nOración: ${day.prayer}\n\nAcción del día: ${day.action}`);

  return (
    <section className="section page">
      <Link className="back-link" to="/planes">← Volver a planes</Link>
      <BookReader title={plan.title} subtitle={plan.description} pages={pages} footerLabel="Día" />
    </section>
  );
}
