import { useTranslations } from 'next-intl';
import Layout from '../components/Layout/Layout';
import './About.css';

function About() {
  const t = useTranslations('About');

  return (
    <Layout>
      <main className="about-page">
        <section className="about-section" aria-labelledby="about-title">
          <h2 id="about-title">{t('title')}</h2>
          <p>{t('intro')}</p>
          <p>{t('author')}</p>
          <a
            href="https://github.com/andreiTsen"
            target="_blank"
            rel="noreferrer"
          >
            {t('githubLink')}
          </a>
          <a
            href="https://rs.school/courses/reactjs"
            target="_blank"
            rel="noreferrer"
          >
            {t('rsSchoolLink')}
          </a>
        </section>
      </main>
    </Layout>
  );
}

export default About;
