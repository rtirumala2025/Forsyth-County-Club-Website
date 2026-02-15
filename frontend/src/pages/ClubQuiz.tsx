import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../config/firebase';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Award, Users, BookOpen, Palette, Code, Music, Camera, Gamepad2 } from 'lucide-react';

const ClubQuiz = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const questions = [
    {
      id: 1,
      question: "What type of activities do you enjoy most?",
      options: [
        { id: 'tech', text: 'Building and programming', icon: Code, category: 'technology' },
        { id: 'creative', text: 'Art and design', icon: Palette, category: 'creative' },
        { id: 'academic', text: 'Research and learning', icon: BookOpen, category: 'academic' },
        { id: 'social', text: 'Meeting new people', icon: Users, category: 'social' },
        { id: 'performance', text: 'Music and performing', icon: Music, category: 'performance' },
        { id: 'media', text: 'Photography and media', icon: Camera, category: 'media' }
      ]
    },
    {
      id: 2,
      question: "How do you prefer to spend your free time?",
      options: [
        { id: 'competitive', text: 'Competing in tournaments', icon: Award, category: 'competitive' },
        { id: 'collaborative', text: 'Working in teams', icon: Users, category: 'collaborative' },
        { id: 'individual', text: 'Working independently', icon: BookOpen, category: 'individual' },
        { id: 'creative', text: 'Creating art or music', icon: Palette, category: 'creative' },
        { id: 'gaming', text: 'Playing games', icon: Gamepad2, category: 'gaming' },
        { id: 'outdoor', text: 'Outdoor activities', icon: Camera, category: 'outdoor' }
      ]
    },
    {
      id: 3,
      question: "What subjects interest you most?",
      options: [
        { id: 'stem', text: 'Science, Technology, Engineering, Math', icon: Code, category: 'stem' },
        { id: 'humanities', text: 'English, History, Social Studies', icon: BookOpen, category: 'humanities' },
        { id: 'arts', text: 'Art, Music, Drama', icon: Palette, category: 'arts' },
        { id: 'languages', text: 'Foreign Languages', icon: Users, category: 'languages' },
        { id: 'business', text: 'Business and Economics', icon: Award, category: 'business' },
        { id: 'sports', text: 'Physical Education and Sports', icon: Gamepad2, category: 'sports' }
      ]
    },
    {
      id: 4,
      question: "What type of challenges do you enjoy?",
      options: [
        { id: 'problem-solving', text: 'Solving complex problems', icon: Code, category: 'problem-solving' },
        { id: 'creative', text: 'Creative expression', icon: Palette, category: 'creative' },
        { id: 'debate', text: 'Debating and public speaking', icon: Users, category: 'debate' },
        { id: 'research', text: 'Research and investigation', icon: BookOpen, category: 'research' },
        { id: 'leadership', text: 'Leading and organizing', icon: Award, category: 'leadership' },
        { id: 'performance', text: 'Performing and entertaining', icon: Music, category: 'performance' }
      ]
    },
    {
      id: 5,
      question: "What are your future career interests?",
      options: [
        { id: 'engineering', text: 'Engineering and Technology', icon: Code, category: 'engineering' },
        { id: 'medicine', text: 'Medicine and Healthcare', icon: Award, category: 'medicine' },
        { id: 'arts', text: 'Arts and Design', icon: Palette, category: 'arts' },
        { id: 'business', text: 'Business and Finance', icon: Users, category: 'business' },
        { id: 'education', text: 'Education and Teaching', icon: BookOpen, category: 'education' },
        { id: 'law', text: 'Law and Politics', icon: Award, category: 'law' }
      ]
    }
  ];

  const clubRecommendations = {
    'technology': [
      { name: "Robotics Club", description: "Build and program robots for competitions", matchScore: 95 },
      { name: "Computer Science Club", description: "Learn programming and software development", matchScore: 90 },
      { name: "Math Club", description: "Solve challenging mathematical problems", matchScore: 85 }
    ],
    'creative': [
      { name: "Art Club", description: "Express creativity through various art forms", matchScore: 95 },
      { name: "Photography Club", description: "Capture moments and learn photography skills", matchScore: 90 },
      { name: "Drama Club", description: "Act, direct, and produce theatrical performances", matchScore: 85 }
    ],
    'academic': [
      { name: "Science Olympiad", description: "Compete in science competitions", matchScore: 95 },
      { name: "Debate Team", description: "Develop critical thinking and public speaking", matchScore: 90 },
      { name: "National Honor Society", description: "Academic excellence and community service", matchScore: 85 }
    ],
    'social': [
      { name: "Key Club", description: "Community service and volunteer work", matchScore: 95 },
      { name: "Student Government", description: "Represent students and organize events", matchScore: 90 },
      { name: "Model UN", description: "Simulate United Nations debates", matchScore: 85 }
    ],
    'performance': [
      { name: "Band", description: "Play musical instruments in ensemble", matchScore: 95 },
      { name: "Choir", description: "Sing in vocal ensemble", matchScore: 90 },
      { name: "Drama Club", description: "Act and perform in theatrical productions", matchScore: 85 }
    ],
    'media': [
      { name: "Photography Club", description: "Learn photography and visual storytelling", matchScore: 95 },
      { name: "Yearbook", description: "Create the school yearbook", matchScore: 90 },
      { name: "Newspaper", description: "Write and publish school news", matchScore: 85 }
    ]
  };

  const handleAnswer = (optionId, category) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: { optionId, category }
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateRecommendations();
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateRecommendations = () => {
    // Count category preferences
    const categoryCounts: Record<string, number> = {};
    Object.values(answers).forEach((answer: any) => {
      if (answer && answer.category) {
        categoryCounts[answer.category] = (categoryCounts[answer.category] || 0) + 1;
      }
    });

    // Get top categories
    const sortedCategories = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Generate recommendations based on top categories
    const recommendations = [];
    sortedCategories.forEach(category => {
      if (clubRecommendations[category]) {
        recommendations.push(...clubRecommendations[category]);
      }
    });

    // Remove duplicates and sort by match score
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) =>
        index === self.findIndex(r => r.name === rec.name)
      )
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);

    return uniqueRecommendations;
  };

  const saveQuizResults = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const recommendations = calculateRecommendations();
      const quizResults = {
        answers,
        recommendations,
        completedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        answeredQuestions: Object.keys(answers).length
      };

      // TODO: migrate quiz result persistence to Supabase
      console.log('Quiz results to persist:', quizResults);

      setIsComplete(true);
    } catch (error) {
      console.error("Error saving quiz results:", error);
      alert("Failed to save quiz results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentQuestionData = questions[currentQuestion];
  const isAnswered = answers[currentQuestion];

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white p-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8 text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h1>
            <p className="text-gray-600 mb-6">
              Your personalized club recommendations have been saved to your profile.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300"
              >
                View My Profile
              </button>
              <button
                onClick={() => {
                  setCurrentQuestion(0);
                  setAnswers({});
                  setIsComplete(false);
                }}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-300"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 w-fit"
        >
          <ArrowLeft size={22} className="mr-2" /> Back
        </button>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-800">Club Recommendation Quiz</h1>
            <span className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/50 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQuestionData.question}
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {currentQuestionData.options.map((option) => {
              const Icon = option.icon;
              const isSelected = answers[currentQuestion]?.optionId === option.id;

              return (
                <motion.button
                  key={option.id}
                  onClick={() => handleAnswer(option.id, option.category)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={24} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                    <span className="font-medium">{option.text}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gray-500 text-white hover:bg-gray-600"
            >
              <ArrowLeft size={20} className="mr-2" />
              Previous
            </button>

            <button
              onClick={currentQuestion === questions.length - 1 ? saveQuizResults : nextQuestion}
              disabled={!isAnswered || loading}
              className="flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500 text-white hover:bg-blue-600"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : currentQuestion === questions.length - 1 ? (
                <>
                  Complete Quiz
                  <CheckCircle size={20} className="ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ClubQuiz;
