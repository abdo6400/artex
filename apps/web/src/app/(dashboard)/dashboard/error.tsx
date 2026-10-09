"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Unable to load the dashboard</h1>
        <p>Please try again in a moment.</p>
        <button onClick={reset}>Try again</button>
      </section>
    </main>
  );
}
