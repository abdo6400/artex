import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="login-page" dir="ltr">
      <div className="login-shell">
        <aside className="login-showcase" aria-label="About Artex Console">
          <div className="login-brand">
            <span className="login-brand-mark" aria-hidden="true">
              A
            </span>
            <div>
              <strong>ARTEX</strong>
              <small>PRODUCTION</small>
            </div>
          </div>

          <div className="login-showcase-copy">
            <span className="login-kicker">ARTEX CONSOLE</span>
            <h2>Everything behind your portfolio, in one place.</h2>
            <p>
              Publish projects, update bilingual content, manage leads, and keep
              the Artex website current.
            </p>
          </div>

          <div className="login-capabilities" aria-label="Dashboard features">
            <span>Projects</span>
            <span>Website</span>
            <span>Leads</span>
          </div>
          <p className="login-showcase-foot">Secure internal workspace</p>
        </aside>

        <section className="login-form-panel">
          <div className="login-mobile-brand" aria-hidden="true">
            <span>A</span>
            <strong>ARTEX CONSOLE</strong>
          </div>
          <LoginForm />
        </section>
      </div>
    </main>
  );
}
