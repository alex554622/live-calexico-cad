
import { useState, useMemo } from 'react';
import { Officer } from '@/types';

export function useOfficerSelection(officers: Officer[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [selectedOfficers, setSelectedOfficers] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  const uniqueRanks = useMemo(() => {
    const ranks = officers.map(officer => officer.rank);
    return [...new Set(ranks)];
  }, [officers]);

  const filteredOfficers = useMemo(() => officers.filter(officer => {
    const matchesSearch = 
      officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      officer.badgeNumber.toString().includes(searchTerm) ||
      officer.rank.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || officer.status === statusFilter;
    const matchesRank = rankFilter === 'all' || officer.rank === rankFilter;
    
    return matchesSearch && matchesStatus && matchesRank;
  }), [officers, searchTerm, statusFilter, rankFilter]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedOfficers([]);
    }
  };

  const toggleOfficerSelection = (id: string, e: React.MouseEvent) => {
    if (!isSelectionMode) return;
    
    e.stopPropagation();
    setSelectedOfficers(prev => {
      if (prev.includes(id)) {
        return prev.filter(officerId => officerId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    rankFilter,
    setRankFilter,
    selectedOfficers,
    setSelectedOfficers,
    isSelectionMode,
    setIsSelectionMode,
    selectedOfficer,
    setSelectedOfficer,
    uniqueRanks,
    filteredOfficers,
    toggleSelectionMode,
    toggleOfficerSelection
  };
}
