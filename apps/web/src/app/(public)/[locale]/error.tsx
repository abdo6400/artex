"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main style={{ padding: "6rem 2rem", textAlign: "center" }}>
      <h1>Unable to load this page</h1>
      <p>Please try again in a moment.</p>
      <button onClick={reset}>Try again</button>
    </main>
  );
}
