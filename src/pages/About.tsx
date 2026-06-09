import Layout from '../components/Layout/Layout';
import './About.css';

function About() {
  return (
    <Layout>
      <main className="about-page">
        <section className="about-section" aria-labelledby="about-title">
          <h2 id="about-title">About this app</h2>
          <p>Pokemons are my love</p>
          <p>Author: andreiTsen. This is a crazy project</p>
          <a
            href="https://github.com/andreiTsen"
            target="_blank"
            rel="noreferrer"
          >
            My name is Andrei, My GitHub
          </a>
          <a
            href="https://rs.school/courses/reactjs"
            target="_blank"
            rel="noreferrer"
          >
            RS School React course
          </a>
        </section>
      </main>
    </Layout>
  );
}

export default About;
