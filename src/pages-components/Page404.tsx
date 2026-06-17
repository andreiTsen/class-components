import Link from 'next/link';
import './Page404.css';

function Page404() {
  return (
    <main className="page not-found-page">
      <section className="not-found-section" aria-labelledby="not-found-title">
        <span>404</span>
        <h1 id="not-found-title">Page not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link href="/">Back to app</Link>
      </section>
    </main>
  );
}

export default Page404;
