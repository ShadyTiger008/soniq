"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Image, Loader2, Check } from "lucide-react";
import { apiClient } from "@frontend/lib/api-client";
import { useDebounce } from "@frontend/hooks/use-debounce"; // Assuming this hook exists or I'll implement a simple one

// Simple debounce hook implementation if not available
function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
  user: {
    name: string;
    username: string;
  };
}

interface UnsplashPickerProps {
  onSelect: (url: string) => void;
  initialQuery?: string;
  className?: string;
}

export function UnsplashImagePicker({
  onSelect,
  initialQuery = "",
  className,
}: UnsplashPickerProps) {
  const [query, setQuery] = useState(initialQuery);
  // @ts-ignore
  const debouncedQuery = useDebounceValue(query, 500); 
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedQuery) {
      searchImages(debouncedQuery, 1);
    } else {
        // Initial random/curated load could go here, but for now just clear
        setImages([]);
    }
  }, [debouncedQuery]);

  const searchImages = async (searchQuery: string, pageNum: number) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.searchPhotos(searchQuery, pageNum, 12);
      if (response.success && response.data) {
        if (pageNum === 1) {
          setImages(response.data);
        } else {
          setImages((prev) => [...prev, ...response.data!]);
        }
        // @ts-ignore
        setTotalPages(response.meta?.totalPages || 0);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Failed to search Unsplash", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages && !isLoading) {
      searchImages(debouncedQuery, page + 1);
    }
  };

  const handleSelect = (image: UnsplashImage) => {
    setSelectedId(image.id);
    onSelect(image.urls.regular);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search Unsplash photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl bg-muted/50 border border-border p-2 pl-9 outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[400px] overflow-y-auto pr-1">
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => handleSelect(image)}
            className={`group relative aspect-square cursor-pointer rounded-lg overflow-hidden bg-muted transition-all ${
              selectedId === image.id ? "ring-4 ring-primary" : "hover:opacity-90"
            }`}
          >
            <img
              src={image.urls.small}
              alt={image.alt_description || "Unsplash photo"}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                 <span className="text-[10px] text-white truncate w-full">by {image.user.name}</span>
            </div>
             {selectedId === image.id && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                    </div>
                </div>
            )}
          </div>
        ))}
        
        {images.length === 0 && !isLoading && debouncedQuery && (
             <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
                 No results found
             </div>
        )}
        
        {images.length === 0 && !debouncedQuery && (
             <div className="col-span-full py-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
                 <Image className="h-8 w-8 opacity-50" />
                 <span>Type to search stock photos</span>
             </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
      
      {!isLoading && images.length > 0 && page < totalPages && (
          <button 
            onClick={handleLoadMore}
            className="w-full py-2 text-sm text-center text-primary hover:bg-muted/50 rounded-lg transition-colors"
          >
              Load More
          </button>
      )}
    </div>
  );
}
