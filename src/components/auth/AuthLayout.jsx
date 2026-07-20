import { Logo } from '../common/Logo.jsx';

const defaultBullets = [
  'Lecciones en video paso a paso',
  'Partituras y pistas incluidas',
  'Teclado interactivo y teoría clara',
];

export const AuthLayout = ({ children, title, subtitle, bullets = defaultBullets }) => (
  <div className="auth-page">
    <div className="auth-split">
      <aside className="auth-brand bg-grid">
        <Logo size={48} showTagline />
        <h2>{title || 'Aprende piano con acompañamiento real.'}</h2>
        <p>{subtitle || 'Una academia online diseñada para que practiques con claridad y avances con confianza.'}</p>
        <ul className="auth-brand-list">
          {bullets.map((b) => (
            <li key={b}><span className="lp-check" aria-hidden="true">✓</span>{b}</li>
          ))}
        </ul>
      </aside>
      <div className="auth-container">
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;
