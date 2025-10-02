'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Eye, Heart, Share2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FetvaCardProps {
  id: string;
  question: string;
  answer: string;
  category: string;
  source: string;
  date: string;
  views: number;
  likes: number;
}

export function FetvaCard({ id, question, answer, category, source, date, views, likes }: FetvaCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const truncatedAnswer = answer.length > 200 ? answer.substring(0, 200) + '...' : answer;

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 hover:border-islamic-green-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <Badge variant="secondary" className="bg-islamic-green-100 text-islamic-green-800 hover:bg-islamic-green-200">
            <Tag className="w-3 h-3 mr-1" />
            {category}
          </Badge>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        <Link href={`/fetva/${id}`} className="block">
          <h3 className="text-lg font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-islamic-green-700 transition-colors">
            {question}
          </h3>
        </Link>

        <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
          {truncatedAnswer}
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{source}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{views}</span>
            </div>
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likeCount}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}