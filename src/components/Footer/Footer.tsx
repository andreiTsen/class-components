import { useTranslations } from 'next-intl';
import './Footer.css';

function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="page-footer">
      <span>{t('text')}</span>
    </footer>
  );
}

export default Footer;
