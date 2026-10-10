import { fireEvent, render, screen } from '@testing-library/react';
import { Pagination, pageWindow } from './pagination';

describe('pagination', () => {
  it('builds a compact page window', () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageWindow(6, 12)).toEqual([1, null, 5, 6, 7, null, 12]);
    expect(pageWindow(1, 12)).toEqual([1, 2, null, 12]);
  });

  it('marks the current page and disables previous on the first page', () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageCount={3} onPageChange={onChange} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });
});
