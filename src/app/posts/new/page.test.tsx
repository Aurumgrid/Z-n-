/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import NewPostPage from './page';

// Mock the useRouter hook
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('NewPostPage', () => {
  it('renders the new post form', () => {
    render(<NewPostPage />);

    // Check for the main title
    expect(screen.getByText('Create a New Post')).toBeInTheDocument();

    // Check for the form fields
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();

    // Check for the submit button
    expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument();
  });
});