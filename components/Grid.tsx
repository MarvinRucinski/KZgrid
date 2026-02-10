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
  rarity?: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';
}

interface AnswerStatistic {
  id: string;
  user_id: string;
  row_category_id: string;
  column_category_id: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Type-safe wrapper for answer_statistics queries
const statsClient = supabase as unknown as {
  from: (table: 'answer_statistics') => {
    select: (query: string) => {
      eq: (col: string, val: string) => {
        eq: (col: string, val: string) => {
          eq: (col: string, val: string) => {
            maybeSingle: () => Promise<{ data: AnswerStatistic | null; error: unknown }>;
          };
          order: (col: string, opts: { ascending: boolean }) => Promise<{ data: AnswerStatistic[] | null; error: unknown }>;
        };
        maybeSingle: () => Promise<{ data: AnswerStatistic | null; error: unknown }>;
      };
    };
    update: (data: Partial<AnswerStatistic>) => {
      eq: (col: string, val: string) => Promise<{ error: unknown }>;
    };
    insert: (data: Omit<AnswerStatistic, 'id' | 'created_at' | 'updated_at'> & { usage_count?: number }) => Promise<{ error: unknown }>;
  };
};

export default function Grid() {
  const [rowCategories, setRowCategories] = useState<Category[]>([]);
  const [columnCategories, setColumnCategories] = useState<Category[]>([]);
  const [cells, setCells] = useState<CellData[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        .select('*');

      if (error) throw error;

      const allCategories = (categories || []) as Category[];
      
      // Ensure we have at least 6 categories
      if (allCategories.length < 6) {
        console.error('Not enough categories: need at least 6, found', allCategories.length);
        setError(`Niewystarczająca liczba kategorii. Potrzeba co najmniej 6, znaleziono ${allCategories.length}.`);
        setLoading(false);
        return;
      }
      
      // Fisher-Yates shuffle algorithm for unbiased randomization
      const shuffled = [...allCategories];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      
      // Take first 3 for rows and next 3 for columns
      const rows = shuffled.slice(0, 3);
      const cols = shuffled.slice(3, 6);

      setRowCategories(rows);
      setColumnCategories(cols);

      // Initialize empty grid
      setCells(Array.from({ length: 3 }, () => 
        Array.from({ length: 3 }, () => ({ user: null, isCorrect: null }))
      ));
      setLoading(false);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Błąd podczas ładowania kategorii. Spróbuj odświeżyć stronę.');
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

  const getRarityInfo = (rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common') => {
    const rarityMap = {
      legendary: { label: 'Legendarny', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⭐' },
      epic: { label: 'Epicki', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '💎' },
      rare: { label: 'Rzadka', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '💠' },
      uncommon: { label: 'Nieczęsta', color: 'text-green-600', bgColor: 'bg-green-100', icon: '✨' },
      common: { label: 'Powszechna', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '⚪' },
    };
    return rarityMap[rarity];
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

  const trackAnswer = async (userId: string, rowCategoryId: string, columnCategoryId: string) => {
    try {
      // Check if this answer combination exists
      const { data: existing, error: selectError } = await statsClient
        .from('answer_statistics')
        .select('*')
        .eq('user_id', userId)
        .eq('row_category_id', rowCategoryId)
        .eq('column_category_id', columnCategoryId)
        .maybeSingle();

      // PGRST116 is Supabase's error code for "no rows returned", which is expected when checking for existence
      if (selectError && (selectError as { code?: string }).code !== 'PGRST116') {
        console.error('Error checking existing answer:', selectError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await statsClient
          .from('answer_statistics')
          .update({ 
            usage_count: existing.usage_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        
        if (updateError) {
          console.error('Error updating answer stats:', updateError);
        }
      } else {
        // Insert new record
        const { error: insertError } = await statsClient
          .from('answer_statistics')
          .insert({
            user_id: userId,
            row_category_id: rowCategoryId,
            column_category_id: columnCategoryId,
            usage_count: 1
          });
        
        if (insertError) {
          console.error('Error inserting answer stats:', insertError);
        }
      }
    } catch (error) {
      console.error('Error tracking answer:', error);
    }
  };

  const calculateRarity = async (userId: string, rowCategoryId: string, columnCategoryId: string): Promise<'legendary' | 'epic' | 'rare' | 'uncommon' | 'common'> => {
    try {
      // Get the usage count for this specific answer
      const { data: answerStats } = await statsClient
        .from('answer_statistics')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('row_category_id', rowCategoryId)
        .eq('column_category_id', columnCategoryId)
        .maybeSingle();

      const usageCount = answerStats?.usage_count || 1;

      // Get all usage counts for this category combination to calculate percentile
      const { data: allStats } = await statsClient
        .from('answer_statistics')
        .select('usage_count')
        .eq('row_category_id', rowCategoryId)
        .eq('column_category_id', columnCategoryId)
        .order('usage_count', { ascending: false });

      if (!allStats || allStats.length === 0) {
        return 'legendary'; // First answer is legendary
      }

      // Calculate percentile based on usage count
      // Count how many answers are MORE popular (higher usage_count)
      const totalAnswers = allStats.length;
      const morePopularCount = allStats.filter((stat: AnswerStatistic) => stat.usage_count > usageCount).length;
      const percentile = (morePopularCount / totalAnswers) * 100;

      // Assign rarity based on percentile (lower percentile = more popular = more common)
      // Higher percentile = less popular = rarer
      if (percentile >= 98) return 'legendary';  // Less popular than 98% of answers
      if (percentile >= 90) return 'epic';       // Less popular than 90% of answers
      if (percentile >= 70) return 'rare';       // Less popular than 70% of answers
      if (percentile >= 40) return 'uncommon';   // Less popular than 40% of answers
      return 'common';                           // More popular than 60% of answers
    } catch (error) {
      console.error('Error calculating rarity:', error);
      return 'common';
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const cell = cells[row][col];
    // Allow clicking on empty cells or cells with incorrect answers
    if (cell.user && cell.isCorrect === true) return; // Don't allow changing correct answers
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

    let rarity: 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common' | undefined = undefined;
    
    if (isCorrect) {
      // Track the answer and calculate rarity
      await trackAnswer(user.id, rowCategory.id, columnCategory.id);
      rarity = await calculateRarity(user.id, rowCategory.id, columnCategory.id);
    }

    const newCells = [...cells];
    newCells[row][col] = { user, isCorrect, rarity };
    setCells(newCells);

    setActiveCell(null);
    setSearchQuery('');
    setSuggestions([]);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Ładowanie...</div>;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-red-100 rounded-lg">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Błąd</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
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
                    className={`w-32 h-32 border-2 rounded-lg flex items-center justify-center transition-colors
                      ${cell.user 
                        ? cell.isCorrect 
                          ? 'bg-green-100 border-green-500 cursor-not-allowed' 
                          : 'bg-red-100 border-red-500 cursor-pointer hover:border-red-600'
                        : 'bg-white border-gray-300 hover:border-blue-400 cursor-pointer'
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
                        {cell.isCorrect && cell.rarity && (
                          <div className={`text-xs mt-1 px-2 py-1 rounded ${getRarityInfo(cell.rarity).bgColor} ${getRarityInfo(cell.rarity).color} font-semibold`}>
                            {getRarityInfo(cell.rarity).icon} {getRarityInfo(cell.rarity).label}
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
