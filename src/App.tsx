import './App.css';
import FormActions from './components/FormActions';
import Submissions from './components/Submissions';

function App() {
  return (
    <main className="app">
      <h1 className="app__title">React Forms</h1>
      <FormActions />
      <Submissions />
    </main>
  );
}

export default App;
