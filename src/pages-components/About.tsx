import { useTranslations } from 'next-intl';
import { Link } from '../i18n/navigation';
import './About.css';

function About() {
  const t = useTranslations('About');

  return (
    <main className="about-page">
      <section className="about-section" aria-labelledby="about-title">
        <h2 id="about-title">{t('title')}</h2>
        <p>{t('intro')}</p>
        <p>{t('author')}</p>
        <Link
          href="https://github.com/andreiTsen"
          target="_blank"
          rel="noreferrer"
        >
          {t('githubLink')}
        </Link>
        <Link
          href="https://rs.school/courses/reactjs"
          target="_blank"
          rel="noreferrer"
        >
          {t('rsSchoolLink')}
        </Link>
      </section>
    </main>
  );
}

export default About;
