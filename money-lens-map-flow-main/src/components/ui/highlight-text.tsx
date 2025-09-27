import React from 'react';

interface HighlightTextProps {
  text: string;
  searchTerms: string[];
  className?: string;
  highlightClassName?: string;
  caseSensitive?: boolean;
}

export function HighlightText({ 
  text, 
  searchTerms, 
  className = '', 
  highlightClassName = 'bg-yellow-200 text-yellow-900 font-medium px-0.5 rounded',
  caseSensitive = false
}: HighlightTextProps) {
  if (!searchTerms || searchTerms.length === 0 || !text) {
    return <span className={className}>{text}</span>;
  }

  // Filter out empty terms and create a regex pattern
  const validTerms = searchTerms.filter(term => term.trim().length > 0);
  if (validTerms.length === 0) {
    return <span className={className}>{text}</span>;
  }

  // Create a regex pattern that matches any of the search terms
  const pattern = validTerms
    .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special regex characters
    .join('|');

  if (!pattern) {
    return <span className={className}>{text}</span>;
  }

  const flags = caseSensitive ? 'g' : 'gi';
  const regex = new RegExp(`(${pattern})`, flags);
  
  // Split text by the regex while preserving the matched parts
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Check if this part matches any of our search terms
        const isMatch = validTerms.some(term => {
          const termRegex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
          return termRegex.test(part);
        });
        
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
}

// Helper function to extract search terms from a query string
export function extractSearchTerms(query: string): string[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const terms: string[] = [];
  
  // Split by spaces but preserve quoted strings
  const tokens = query.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  
  for (const token of tokens) {
    const trimmedToken = token.trim();
    
    // Skip field-specific filters (merchant:, amount>, etc.)
    if (trimmedToken.includes(':') || trimmedToken.includes('amount')) {
      continue;
    }
    
    // Add general search terms
    const cleanTerm = trimmedToken.replace(/^["']|["']$/g, ''); // Remove quotes
    if (cleanTerm.length > 0) {
      terms.push(cleanTerm);
    }
  }
  
  return terms;
}
