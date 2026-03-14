import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from '../components/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const defaultProps = {
    title: 'Confirm Action',
    message: 'Are you sure?',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dialog with title and message', () => {
    render(<ConfirmDialog {...defaultProps} />);
    
    expect(screen.getByText('Confirm Action')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });

  it('renders custom button text', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmText="Delete"
        cancelText="Keep"
      />
    );
    
    expect(screen.getByText('Delete')).toBeInTheDocument();
    expect(screen.getByText('Keep')).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    
    const confirmBtn = screen.getByText('Confirm');
    fireEvent.click(confirmBtn);
    
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    
    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);
    
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('calls onCancel when overlay clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);
    
    const overlay = container.querySelector('.dialog-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onCancel).toHaveBeenCalledOnce();
    }
  });

  it('applies dangerous style when isDangerous is true', () => {
    render(<ConfirmDialog {...defaultProps} isDangerous={true} />);
    
    const confirmBtn = screen.getByText('Confirm');
    expect(confirmBtn).toHaveClass('btn-danger');
  });

  it('has proper ARIA attributes for accessibility', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = container.querySelector('[role="alertdialog"]');
    expect(dialog).toHaveAttribute('aria-labelledby');
    expect(dialog).toHaveAttribute('aria-describedby');
  });

  it('prevents click propagation inside dialog', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />);
    
    const dialog = container.querySelector('.dialog');
    const event = new MouseEvent('click', { bubbles: true });
    const stopPropagation = vi.spyOn(event, 'stopPropagation');
    
    dialog?.dispatchEvent(event);
    expect(stopPropagation).toHaveBeenCalled();
  });
});
