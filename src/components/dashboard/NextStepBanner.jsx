import { Link } from 'react-router-dom';

export const NextStepBanner = ({ eyebrow = 'Siguiente paso', title, description, ctaLabel, to, onClick }) => (
  <div className="next-step">
    <div className="next-step-icon" aria-hidden="true">▶</div>
    <div className="next-step-body">
      <span className="eyebrow-mini">{eyebrow}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
    {to ? (
      <Link to={to} className="button button-primary">{ctaLabel}</Link>
    ) : (
      <button type="button" className="button button-primary" onClick={onClick}>{ctaLabel}</button>
    )}
  </div>
);

export default NextStepBanner;
