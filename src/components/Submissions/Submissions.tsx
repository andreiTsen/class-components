import './Submissions.css';
import { useAppSelector } from '../../store/hooks';

function Submissions() {
  const submissions = useAppSelector((state) => state.submissions.items);
  const lastSubmittedId = useAppSelector(
    (state) => state.submissions.lastSubmittedId
  );

  return (
    <section className="submissions">
      <h2 className="submissions__title">Submissions</h2>
      {submissions.length > 0 ? (
        <ul className="submissions__list">
          {submissions.map((submission) => (
            <li
              className={
                submission.id === lastSubmittedId
                  ? 'submissions__item submissions__item--new'
                  : 'submissions__item'
              }
              key={submission.id}
            >
              <img
                alt={`${submission.name} profile`}
                className="submissions__avatar"
                src={submission.avatarBase64}
              />
              <span className="submissions__value">{submission.name}</span>
              <span className="submissions__value">Age: {submission.age}</span>
              <span className="submissions__value">{submission.email}</span>
              <span className="submissions__value">
                Gender: {submission.gender}
              </span>
              <span className="submissions__value">
                Terms accepted: {submission.termsAccepted ? 'yes' : 'no'}
              </span>
              <span className="submissions__value">
                Country: {submission.country}
              </span>
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
