import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from './App';

test('home page shows the name and the project list', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <AppRoutes />
    </MemoryRouter>
  );
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Markus\s*Muilu/);
  expect(screen.getByRole('heading', { name: 'Projects' })).toBeInTheDocument();
});
