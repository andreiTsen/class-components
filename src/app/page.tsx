import { Suspense } from 'react';
import Home from '../pages-components/Home';

export default function Page() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}
