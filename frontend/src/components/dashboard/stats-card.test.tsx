import { describe, it, expect, vi } from 'vitest';
// use require to avoid missing type declaration errors for @testing-library/react in this environment
const { render, screen } = require('@testing-library/react');
import { StatsCard } from './stats-card';
import { FileText } from 'lucide-react';

describe('StatsCard Component', () => {
  it('renders the title and value correctly', () => {
    render(
      <StatsCard 
        title="Total Summaries" 
        value="150" 
        icon={FileText} 
        color="bg-blue-500" 
      />
    );

    expect(screen.getByText('Total Summaries')).toBeDefined();
    expect(screen.getByText('150')).toBeDefined();
  });

  it('displays the trend label when provided', () => {
    render(
      <StatsCard 
        title="Revenue" 
        value="$500" 
        icon={FileText} 
        color="bg-green-500" 
        trend="+5% inc"
      />
    );

    expect(screen.getByText('+5% inc')).toBeDefined();
  });
});