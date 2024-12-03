import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { toast } from "@/hooks/use-toast";
import { SpecificSearch } from '@/app/recipe/components/specific-search';

// Mock the fetch function
global.fetch = vi.fn();

describe('SpecificSearch', () => {
  const mockOnRecipesFetched = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form correctly', () => {
    render(<SpecificSearch onRecipesFetched={mockOnRecipesFetched} />);
    
    expect(screen.getByPlaceholderText('Enter an ingredient...')).toBeInTheDocument();
    expect(screen.getByText('Cuisine')).toBeInTheDocument();
    expect(screen.getByText('Diet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search Recipes' })).toBeInTheDocument();
  });

  it('adds and removes ingredients', async () => {
    render(<SpecificSearch onRecipesFetched={mockOnRecipesFetched} />);
    
    const input = screen.getByPlaceholderText('Enter an ingredient...');
    const addButton = screen.getByRole('button', { name: '' }); // The Plus button

    fireEvent.change(input, { target: { value: 'tomato' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('tomato ×')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('tomato ×'));

    await waitFor(() => {
      expect(screen.queryByText('tomato ×')).not.toBeInTheDocument();
    });
  });

  it('shows error when submitting without ingredients', async () => {
    render(<SpecificSearch onRecipesFetched={mockOnRecipesFetched} />);
    
    const submitButton = screen.getByRole('button', { name: 'Search Recipes' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please add at least one ingredient.')).toBeInTheDocument();
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Please add at least one ingredient.",
      });
    });
  });

  it('submits the form and fetches recipes', async () => {
    const mockRecipes = [
      { id: 1, title: 'Recipe 1', image: 'image1.jpg' },
      { id: 2, title: 'Recipe 2', image: 'image2.jpg' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: mockRecipes }),
    });

    render(<SpecificSearch onRecipesFetched={mockOnRecipesFetched} />);
    
    const input = screen.getByPlaceholderText('Enter an ingredient...');
    const addButton = screen.getByRole('button', { name: '' }); // The Plus button
    const submitButton = screen.getByRole('button', { name: 'Search Recipes' });

    fireEvent.change(input, { target: { value: 'tomato' } });
    fireEvent.click(addButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('query=tomato'));
      expect(mockOnRecipesFetched).toHaveBeenCalledWith(mockRecipes);
    });
  });

  it('handles API error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    render(<SpecificSearch onRecipesFetched={mockOnRecipesFetched} />);
    
    const input = screen.getByPlaceholderText('Enter an ingredient...');
    const addButton = screen.getByRole('button', { name: '' }); // The Plus button
    const submitButton = screen.getByRole('button', { name: 'Search Recipes' });

    fireEvent.change(input, { target: { value: 'tomato' } });
    fireEvent.click(addButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith({
        title: "Error",
        description: "Failed to fetch recipes. Please try again later.",
      });
      expect(mockOnRecipesFetched).toHaveBeenCalledWith([]);
    });
  });
});

