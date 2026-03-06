import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Search } from 'lucide-react';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  readTime: string;
  image: string;
}

export const HealthEducation: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All Topics', 'Preventive Care', 'Chronic Conditions', 'Mental Health', 'Nutrition', 'Fitness'];

  const articles: Article[] = [
    {
      id: '1',
      title: 'Understanding High Blood Pressure: Prevention and Management',
      category: 'Chronic Conditions',
      excerpt: 'Learn about hypertension, its risk factors, and effective strategies for maintaining healthy blood pressure levels.',
      readTime: '5 min read',
      image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: '2',
      title: 'The Importance of Annual Health Screenings',
      category: 'Preventive Care',
      excerpt: 'Discover why regular health check-ups are crucial for early detection and prevention of serious health conditions.',
      readTime: '4 min read',
      image: 'https://images.pexels.com/photos/7659573/pexels-photo-7659573.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: '3',
      title: 'Managing Stress and Anxiety in Daily Life',
      category: 'Mental Health',
      excerpt: 'Practical techniques and strategies for reducing stress and improving mental well-being in your everyday routine.',
      readTime: '6 min read',
      image: 'https://images.pexels.com/photos/4498151/pexels-photo-4498151.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: '4',
      title: 'Building a Balanced Diet: Essential Nutrients Guide',
      category: 'Nutrition',
      excerpt: 'A comprehensive guide to understanding macronutrients, micronutrients, and creating a well-balanced meal plan.',
      readTime: '7 min read',
      image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: '5',
      title: 'Effective Exercise Routines for Beginners',
      category: 'Fitness',
      excerpt: 'Start your fitness journey with these safe and effective workout routines designed for beginners.',
      readTime: '5 min read',
      image: 'https://images.pexels.com/photos/4162449/pexels-photo-4162449.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
    {
      id: '6',
      title: 'Diabetes: Understanding and Managing Blood Sugar',
      category: 'Chronic Conditions',
      excerpt: 'Essential information about diabetes management, blood sugar monitoring, and lifestyle modifications.',
      readTime: '6 min read',
      image: 'https://images.pexels.com/photos/7659567/pexels-photo-7659567.jpeg?auto=compress&cs=tinysrgb&w=800',
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' ||
      article.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 relative">
      <div className="absolute inset-0 z-0 opacity-10">
        <img
          src="https://images.pexels.com/photos/3401897/pexels-photo-3401897.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Health education"
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white"></div>
      </div>

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-300 text-blue-700 px-5 py-2.5 rounded-full mb-6">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm font-semibold">Expert Medical Content</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">Health Education Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">Expert articles and guides for your wellness journey, backed by medical professionals</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search articles
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for health topics..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Topics' ? 'all' : category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No articles found. Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer group"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {article.excerpt}
                  </p>
                  <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
                    <span>Read more</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-8 text-center text-white">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Want Personalized Health Insights?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Create a free account to get AI-powered health recommendations tailored to your needs
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl transition-colors shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
};
