import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Send Money</Button>);
    expect(screen.getByRole('button', { name: 'Send Money' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows a loading label and disables itself while loading', () => {
    const onClick = vi.fn();
    render(<Button loading onClick={onClick}>Send</Button>);
    const button = screen.getByRole('button', { name: 'Processing...' });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('respects an explicit disabled prop even when not loading', () => {
    render(<Button disabled>Send</Button>);
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });
});
