import { useState, useCallback, useEffect, useMemo } from 'react';

interface SearchReplaceOptions {
  content: string;
  updateContent: (next: string) => void;
}

export function useSearchReplace({ content, updateContent }: SearchReplaceOptions) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showReplace, setShowReplace] = useState<boolean>(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [replaceText, setReplaceText] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [wholeWord, setWholeWord] = useState<boolean>(false);
  const [useRegex, setUseRegex] = useState<boolean>(false);

  const buildSearchRegex = useCallback((query: string): RegExp | null => {
    if (!query) return null;
    try {
      let pattern = query;
      if (!useRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (wholeWord && !useRegex) {
        pattern = `\\b${pattern}\\b`;
      }
      const flags = caseSensitive ? 'g' : 'gi';
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  }, [caseSensitive, wholeWord, useRegex]);

  const getMatches = useCallback((text: string) => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const regex = buildSearchRegex(searchQuery.trim());
    if (!regex) return [];
    const found: { index: number; length: number }[] = [];
    let match: RegExpExecArray | null;
    regex.lastIndex = 0;
    while ((match = regex.exec(text)) !== null) {
      found.push({ index: match.index, length: match[0].length });
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }
    return found;
  }, [searchQuery, buildSearchRegex]);

  const handleReplace = useCallback(() => {
    if (!searchQuery || !searchQuery.trim()) return;
    const matches = getMatches(content);
    if (matches.length === 0) return;
    const index = Math.min(Math.max(currentMatchIndex, 0), matches.length - 1);
    const match = matches[index];
    const next = `${content.slice(0, match.index)}${replaceText}${content.slice(match.index + match.length)}`;
    updateContent(next);
    const newMatches = getMatches(next);
    if (newMatches.length === 0) {
      setCurrentMatchIndex(0);
    } else {
      setCurrentMatchIndex(Math.min(index, newMatches.length - 1));
    }
  }, [searchQuery, replaceText, content, currentMatchIndex, getMatches, updateContent]);

  const handleReplaceAll = useCallback(() => {
    if (!searchQuery || !searchQuery.trim()) return;
    const regex = buildSearchRegex(searchQuery.trim());
    if (!regex) return;
    const next = content.replace(regex, replaceText);
    updateContent(next);
    setCurrentMatchIndex(0);
  }, [searchQuery, replaceText, content, buildSearchRegex, updateContent]);

  const closeSearch = useCallback(() => {
    setShowSearch(false);
    setShowReplace(false);
    setSearchQuery('');
    setReplaceText('');
    setCurrentMatchIndex(0);
  }, []);

  // Reset match index when search query changes
  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [searchQuery]);

  const matchCount = useMemo(() => getMatches(content).length, [content, getMatches]);

  return {
    searchQuery,
    setSearchQuery,
    showSearch,
    setShowSearch,
    showReplace,
    setShowReplace,
    currentMatchIndex,
    setCurrentMatchIndex,
    matchCount,
    replaceText,
    setReplaceText,
    caseSensitive,
    setCaseSensitive,
    wholeWord,
    setWholeWord,
    useRegex,
    setUseRegex,
    handleReplace,
    handleReplaceAll,
    closeSearch,
  };
}
