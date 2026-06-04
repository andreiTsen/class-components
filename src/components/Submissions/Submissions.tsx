import './Submissions.css';

type SubmissionItem = {
  email: string;
  formType: 'uncontrolled' | 'hook-form';
  id: string;
  name: string;
};

type SubmissionsProperties = {
  submissions: SubmissionItem[];
};

function Submissions({ submissions }: SubmissionsProperties) {
  return (
    <section className="submissions">
      <h2 className="submissions__title">Submissions</h2>
      {submissions.length > 0 ? (
        <ul className="submissions__list">
          {submissions.map((submission) => (
            <li className="submissions__item" key={submission.id}>
              <span>{submission.name}</span>
              <span>{submission.email}</span>
              <span>{submission.formType}</span>
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
