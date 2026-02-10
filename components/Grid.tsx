'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  photo_url: string | null;
}

interface Category {
  id: string;
  name: string;
  type: 'row' | 'column';
  position: number;
}

interface CellData {
  user: User | null;
  isCorrect: boolean | null;
}

export default function Grid() {
  const [rowCategories, setRowCategories] = useState<Category[]>([]);
  const [columnCategories, setColumnCategories] = useState<Category[]>([]);
  const [cells, setCells] = useState<CellData[][]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .order('position');

      if (error) throw error;

      const allCategories = (categories || []) as Category[];
      const rows = allCategories.filter(c => c.type === 'row').slice(0, 3);
      const cols = allCategories.filter(c => c.type === 'column').slice(0, 3);

      setRowCategories(rows);
      setColumnCategories(cols);

      // Initialize empty grid
      setCells(Array.from({ length: 3 }, () => 
        Array.from({ length: 3 }, () => ({ user: null, isCorrect: null }))
      ));
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      setSuggestions((data || []) as User[]);
    } catch (error) {
      console.error('Error searching users:', error);
      setSuggestions([]);
    }
  };

  const validateAnswer = async (userId: string, rowCategoryId: string, columnCategoryId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('user_categories')
        .select('category_id')
        .eq('user_id', userId);

      if (error) throw error;

      const userCategoryIds = (data || []).map((uc: { category_id: string }) => uc.category_id);
      return userCategoryIds.includes(rowCategoryId) && userCategoryIds.includes(columnCategoryId);
    } catch (error) {
      console.error('Error validating answer:', error);
      return false;
    }
  };

  const handleCellClick = (row: number, col: number) => {
    if (cells[row][col].user) return; // Don't allow changing already filled cells
    setActiveCell({ row, col });
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleUserSelect = async (user: User) => {
    if (!activeCell) return;

    const { row, col } = activeCell;
    const rowCategory = rowCategories[row];
    const columnCategory = columnCategories[col];

    const isCorrect = await validateAnswer(user.id, rowCategory.id, columnCategory.id);

    const newCells = [...cells];
    newCells[row][col] = { user, isCorrect };
    setCells(newCells);

    setActiveCell(null);
    setSearchQuery('');
    setSuggestions([]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Ładowanie...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center mb-8">KŻ GeoGrid</h1>
      
      <div className="flex justify-center">
        <div className="inline-block">
          {/* Column headers */}
          <div className="grid grid-cols-4 gap-2 mb-2">
            <div className="w-32 h-32"></div>
            {columnCategories.map((cat) => (
              <div key={cat.id} className="w-32 h-32 flex items-center justify-center bg-blue-500 text-white font-semibold rounded-lg p-2 text-center">
                {cat.name}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {rowCategories.map((rowCat, rowIndex) => (
            <div key={rowCat.id} className="grid grid-cols-4 gap-2 mb-2">
              <div className="w-32 h-32 flex items-center justify-center bg-green-500 text-white font-semibold rounded-lg p-2 text-center">
                {rowCat.name}
              </div>
              {columnCategories.map((colCat, colIndex) => {
                const cell = cells[rowIndex][colIndex];
                return (
                  <div
                    key={colCat.id}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-32 h-32 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors
                      ${cell.user 
                        ? cell.isCorrect 
                          ? 'bg-green-100 border-green-500' 
                          : 'bg-red-100 border-red-500'
                        : 'bg-white border-gray-300 hover:border-blue-400'
                      }
                      ${activeCell?.row === rowIndex && activeCell?.col === colIndex ? 'ring-4 ring-blue-400' : ''}
                    `}
                  >
                    {cell.user ? (
                      <div className="text-center p-2">
                        {cell.user.photo_url && (
                          <Image 
                            src={cell.user.photo_url} 
                            alt={`${cell.user.first_name} ${cell.user.last_name}`}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                          />
                        )}
                        <div className="text-xs font-medium">
                          {cell.user.first_name} {cell.user.last_name}
                        </div>
                        {cell.isCorrect !== null && (
                          <div className="text-xs mt-1">
                            {cell.isCorrect ? '✓ Poprawnie' : '✗ Źle'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">Kliknij</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Search modal */}
      {activeCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Wybierz użytkownika</h2>
              <button 
                onClick={() => {
                  setActiveCell(null);
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              placeholder="Wpisz imię lub nazwisko..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />

            <div className="space-y-2">
              {suggestions.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors flex items-center"
                >
                  {user.photo_url && (
                    <Image 
                      src={user.photo_url} 
                      alt={`${user.first_name} ${user.last_name}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                  )}
                  <div>
                    <div className="font-medium">{user.first_name} {user.last_name}</div>
                  </div>
                </div>
              ))}
              {searchQuery && suggestions.length === 0 && (
                <div className="text-gray-500 text-center py-4">Nie znaleziono użytkowników</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
