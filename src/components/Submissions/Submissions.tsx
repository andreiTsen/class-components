import './Submissions.css';
import { useAppSelector } from '../../store/hooks';

function Submissions() {
  const submissions = useAppSelector((state) => state.submissions.items);

  return (
    <section className="submissions">
      <h2 className="submissions__title">Submissions</h2>
      {submissions.length > 0 ? (
        <ul className="submissions__list">
          {submissions.map((submission) => (
            <li className="submissions__item" key={submission.id}>
              <span className="submissions__value">{submission.name}</span>
              <span className="submissions__value">{submission.email}</span>
              <span className="submissions__badge">{submission.formType}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="submissions__empty-message">No submissions yet</p>
      )}
    </section>
  );
}

export default Submissions;
