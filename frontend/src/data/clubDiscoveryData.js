// Deduplicated club data structure for the Club Discovery Assistant
// Maintains backward compatibility while eliminating duplicates

// Unique club definitions with IDs
export const uniqueClubs = {
  // STEM Clubs
  'sci-olymp': {
    id: 'sci-olymp',
    name: 'Science Olympiad',
    description: 'Compete in science and engineering challenges at regional and state tournaments.',
    category: 'STEM',
    fit: 'Perfect for students who love science competitions and want to test their knowledge against other schools.'
  },
  'math-team': {
    id: 'math-team',
    name: 'Math Team',
    description: 'Solve complex mathematical problems and compete in math competitions.',
    category: 'STEM',
    fit: 'Ideal for students who excel in mathematics and enjoy competitive problem-solving.'
  },
  'robotics': {
    id: 'robotics',
    name: 'Robotics Club',
    description: 'Design, build, and program robots for competitions and challenges.',
    category: 'STEM',
    fit: 'Great for students interested in engineering, programming, and hands-on technical projects.'
  },
  'academic-team': {
    id: 'academic-team',
    name: 'Academic Team',
    description: 'Compete in quiz bowl-style competitions covering all academic subjects.',
    category: 'STEM',
    fit: 'Perfect for well-rounded students who enjoy trivia and academic competitions.'
  },
  'stem-leadership': {
    id: 'stem-leadership',
    name: 'STEM Leadership Club',
    description: 'Organize STEM events, mentor younger students, and promote science education.',
    category: 'STEM',
    fit: 'Best for students who want to lead STEM initiatives and inspire others in science and technology.'
  },
  'tech-club': {
    id: 'tech-club',
    name: 'Technology Club',
    description: 'Lead technology workshops and manage school\'s digital resources.',
    category: 'STEM',
    fit: 'Ideal for tech-savvy students who want to help others learn and use technology effectively.'
  },
  'cs-club': {
    id: 'cs-club',
    name: 'Computer Science Club',
    description: 'Learn programming languages and work on coding projects in a relaxed environment.',
    category: 'STEM',
    fit: 'Great for students who want to learn coding without the pressure of competitions.'
  },
  'coding-club': {
    id: 'coding-club',
    name: 'Coding Club',
    description: 'Practice programming skills and collaborate on software projects.',
    category: 'STEM',
    fit: 'Perfect for students who enjoy coding and want to work on projects with peers.'
  },
  'engineering-club': {
    id: 'engineering-club',
    name: 'Engineering Club',
    description: 'Explore engineering concepts through hands-on projects and experiments.',
    category: 'STEM',
    fit: 'Ideal for students curious about engineering who want to learn through experimentation.'
  },
  'digital-arts': {
    id: 'digital-arts',
    name: 'Digital Arts Club',
    description: 'Create digital artwork, animations, and multimedia projects using technology.',
    category: 'STEM',
    fit: 'Perfect for students who love art and want to explore digital creative tools.'
  },
  'innovation-club': {
    id: 'innovation-club',
    name: 'Innovation Club',
    description: 'Develop creative solutions to real-world problems using STEM principles.',
    category: 'STEM',
    fit: 'Great for students who want to apply their creativity to solve technical challenges.'
  },

  // Arts Clubs
  'drama-club': {
    id: 'drama-club',
    name: 'Drama Club',
    description: 'Perform in plays, compete in theater festivals, and develop acting skills.',
    category: 'Arts',
    fit: 'Perfect for students who love performing and want to compete in theater competitions.'
  },
  'art-competition': {
    id: 'art-competition',
    name: 'Art Competition Club',
    description: 'Create artwork for contests and exhibitions with competitive opportunities.',
    category: 'Arts',
    fit: 'Ideal for artists who want to showcase their work and compete with other student artists.'
  },
  'music-ensemble': {
    id: 'music-ensemble',
    name: 'Music Ensemble',
    description: 'Perform in competitive music festivals and showcase musical talent.',
    category: 'Arts',
    fit: 'Great for musicians who want to compete and perform at a high level.'
  },
  'art-council': {
    id: 'art-council',
    name: 'Art Council',
    description: 'Organize art exhibitions, coordinate creative events, and manage art programs.',
    category: 'Arts',
    fit: 'Best for students who want to lead artistic initiatives and manage creative projects.'
  },
  'creative-leadership': {
    id: 'creative-leadership',
    name: 'Creative Leadership Club',
    description: 'Lead creative workshops and organize school-wide artistic events.',
    category: 'Arts',
    fit: 'Perfect for students who want to inspire others through creative leadership.'
  },
  'art-club': {
    id: 'art-club',
    name: 'Art Club',
    description: 'Create artwork in a relaxed environment with fellow art enthusiasts.',
    category: 'Arts',
    fit: 'Great for students who enjoy making art without the pressure of competitions.'
  },
  'photography': {
    id: 'photography',
    name: 'Photography Club',
    description: 'Learn photography techniques and share photos with club members.',
    category: 'Arts',
    fit: 'Ideal for students who love taking pictures and want to improve their skills.'
  },
  'creative-writing': {
    id: 'creative-writing',
    name: 'Creative Writing Club',
    description: 'Write stories, poems, and creative pieces in a supportive environment.',
    category: 'Arts',
    fit: 'Perfect for students who love writing and want to share their work with others.'
  },
  'cultural-arts': {
    id: 'cultural-arts',
    name: 'Cultural Arts Club',
    description: 'Express cultural heritage through various art forms and creative projects.',
    category: 'Arts',
    fit: 'Great for students who want to creatively express their cultural identity.'
  },
  'international-film': {
    id: 'international-film',
    name: 'International Film Club',
    description: 'Watch and discuss films from around the world and different cultures.',
    category: 'Arts',
    fit: 'Perfect for students who want to explore cultures through creative media.'
  },
  'cultural-dance': {
    id: 'cultural-dance',
    name: 'Cultural Dance Club',
    description: 'Learn and perform traditional dances from various cultures.',
    category: 'Arts',
    fit: 'Ideal for students who want to express cultural heritage through dance.'
  },

  // Sports Clubs
  'soccer-team': {
    id: 'soccer-team',
    name: 'Soccer Team',
    description: 'Compete in varsity soccer matches and tournaments throughout the season.',
    category: 'Sports',
    fit: 'Perfect for students who love soccer and want to compete at a high level.'
  },
  'basketball-team': {
    id: 'basketball-team',
    name: 'Basketball Team',
    description: 'Play competitive basketball in school leagues and tournaments.',
    category: 'Sports',
    fit: 'Ideal for basketball players who want to represent their school in competition.'
  },
  'track-team': {
    id: 'track-team',
    name: 'Track Team',
    description: 'Compete in track and field events at meets and championships.',
    category: 'Sports',
    fit: 'Great for students who enjoy running and want to compete in athletic events.'
  },
  'swimming-team': {
    id: 'swimming-team',
    name: 'Swimming Team',
    description: 'Compete in swimming meets and develop competitive swimming skills.',
    category: 'Sports',
    fit: 'Perfect for swimmers who want to race and improve their competitive times.'
  },
  'athletic-leadership': {
    id: 'athletic-leadership',
    name: 'Athletic Leadership Club',
    description: 'Lead sports programs, mentor younger athletes, and organize athletic events.',
    category: 'Sports',
    fit: 'Best for student athletes who want to develop leadership skills in sports.'
  },
  'sports-management': {
    id: 'sports-management',
    name: 'Sports Management Club',
    description: 'Learn about sports administration and help manage athletic programs.',
    category: 'Sports',
    fit: 'Ideal for students interested in the business and management side of sports.'
  },
  'fitness-club': {
    id: 'fitness-club',
    name: 'Fitness Club',
    description: 'Stay active and healthy through various fitness activities and workouts.',
    category: 'Sports',
    fit: 'Great for students who want to stay fit without the pressure of competitive sports.'
  },
  'rec-sports': {
    id: 'rec-sports',
    name: 'Recreational Sports Club',
    description: 'Play sports for fun and exercise in a relaxed, non-competitive environment.',
    category: 'Sports',
    fit: 'Perfect for students who enjoy sports but prefer casual play over competition.'
  },
  'outdoor-club': {
    id: 'outdoor-club',
    name: 'Outdoor Club',
    description: 'Explore outdoor activities like hiking, camping, and adventure sports.',
    category: 'Sports',
    fit: 'Ideal for students who love nature and outdoor recreation.'
  },
  'dance-club': {
    id: 'dance-club',
    name: 'Dance Club',
    description: 'Express creativity through various dance styles and choreography.',
    category: 'Sports',
    fit: 'Perfect for students who want to express themselves through movement and dance.'
  },
  'color-guard': {
    id: 'color-guard',
    name: 'Color Guard',
    description: 'Combine athleticism with artistic expression through flag and equipment routines.',
    category: 'Sports',
    fit: 'Great for students who want to blend sports with creative performance.'
  },
  'cheerleading': {
    id: 'cheerleading',
    name: 'Cheerleading',
    description: 'Perform creative routines and support school spirit through athletic performance.',
    category: 'Sports',
    fit: 'Ideal for students who want to combine athleticism with creative expression.'
  },

  // Business Clubs
  'fbla': {
    id: 'fbla',
    name: 'FBLA',
    description: 'Compete in business competitions and develop professional skills.',
    category: 'Business',
    fit: 'Perfect for students interested in business who want to compete in professional events.'
  },
  'deca': {
    id: 'deca',
    name: 'DECA',
    description: 'Participate in marketing and business management competitions.',
    category: 'Business',
    fit: 'Ideal for students who want to compete in business and marketing challenges.'
  },
  'business-competition': {
    id: 'business-competition',
    name: 'Business Competition Club',
    description: 'Compete in various business challenges and entrepreneurial competitions.',
    category: 'Business',
    fit: 'Great for students who want to test their business skills in competitive settings.'
  },
  'student-council': {
    id: 'student-council',
    name: 'Student Council',
    description: 'Lead student government initiatives and represent student interests.',
    category: 'Business',
    fit: 'Best for students who want to develop leadership skills and represent their peers.'
  },
  'business-club': {
    id: 'business-club',
    name: 'Business Club',
    description: 'Learn about business concepts and develop entrepreneurial skills.',
    category: 'Business',
    fit: 'Ideal for students interested in business who want to learn and lead projects.'
  },
  'leadership-club': {
    id: 'leadership-club',
    name: 'Leadership Club',
    description: 'Develop leadership skills through various projects and initiatives.',
    category: 'Business',
    fit: 'Perfect for students who want to become effective leaders in their community.'
  },
  'entrepreneurship': {
    id: 'entrepreneurship',
    name: 'Entrepreneurship Club',
    description: 'Learn about starting businesses and develop entrepreneurial thinking.',
    category: 'Business',
    fit: 'Great for students interested in business who want to learn in a relaxed environment.'
  },
  'social-entrepreneurship': {
    id: 'social-entrepreneurship',
    name: 'Social Entrepreneurship Club',
    description: 'Learn how to create businesses that solve social problems.',
    category: 'Business',
    fit: 'Perfect for students who want to combine business skills with social impact.'
  },
  'marketing-club': {
    id: 'marketing-club',
    name: 'Marketing Club',
    description: 'Learn creative marketing strategies and develop promotional campaigns.',
    category: 'Business',
    fit: 'Ideal for students who want to apply creativity to business and marketing.'
  },
  'business-innovation': {
    id: 'business-innovation',
    name: 'Business Innovation Club',
    description: 'Develop creative solutions to business challenges and problems.',
    category: 'Business',
    fit: 'Great for students who want to think creatively about business opportunities.'
  },
  'design-thinking': {
    id: 'design-thinking',
    name: 'Design Thinking Club',
    description: 'Learn creative problem-solving methods for business and innovation.',
    category: 'Business',
    fit: 'Perfect for students who want to apply creative thinking to business challenges.'
  },

  // Service Clubs
  'service-competition': {
    id: 'service-competition',
    name: 'Service Competition Club',
    description: 'Compete in community service challenges and volunteer competitions.',
    category: 'Service',
    fit: 'Perfect for students who want to compete while making a positive impact.'
  },
  'volunteer-leadership': {
    id: 'volunteer-leadership',
    name: 'Volunteer Leadership Club',
    description: 'Lead volunteer initiatives and compete in service leadership programs.',
    category: 'Service',
    fit: 'Ideal for students who want to lead service projects and compete for recognition.'
  },
  'key-club': {
    id: 'key-club',
    name: 'Key Club',
    description: 'Lead community service projects and develop leadership skills through service.',
    category: 'Service',
    fit: 'Best for students who want to lead service initiatives and develop leadership abilities.'
  },
  'interact-club': {
    id: 'interact-club',
    name: 'Interact Club',
    description: 'Organize international service projects and develop global leadership skills.',
    category: 'Service',
    fit: 'Perfect for students interested in international service and leadership.'
  },
  'community-service': {
    id: 'community-service',
    name: 'Community Service Club',
    description: 'Lead various community service projects and volunteer initiatives.',
    category: 'Service',
    fit: 'Great for students who want to organize and lead service activities.'
  },
  'volunteer-club': {
    id: 'volunteer-club',
    name: 'Volunteer Club',
    description: 'Participate in community service activities in a relaxed environment.',
    category: 'Service',
    fit: 'Ideal for students who want to help others without the pressure of leadership roles.'
  },
  'charity-club': {
    id: 'charity-club',
    name: 'Charity Club',
    description: 'Support charitable causes through fundraising and volunteer work.',
    category: 'Service',
    fit: 'Perfect for students who want to make a difference through charitable activities.'
  },
  'environmental-club': {
    id: 'environmental-club',
    name: 'Environmental Club',
    description: 'Use creative approaches to promote environmental awareness and conservation.',
    category: 'Service',
    fit: 'Great for students who want to creatively address environmental challenges.'
  },
  'social-justice': {
    id: 'social-justice',
    name: 'Social Justice Club',
    description: 'Address social issues through creative advocacy and awareness campaigns.',
    category: 'Service',
    fit: 'Ideal for students who want to creatively promote social justice causes.'
  },
  'community-arts': {
    id: 'community-arts',
    name: 'Community Arts Club',
    description: 'Use art and creativity to serve the community and promote positive change.',
    category: 'Service',
    fit: 'Perfect for students who want to combine artistic expression with community service.'
  },

  // Academic Clubs
  'debate-team': {
    id: 'debate-team',
    name: 'Debate Team',
    description: 'Compete in debate tournaments and develop argumentation skills.',
    category: 'Academic',
    fit: 'Perfect for students who love intellectual competition and public speaking.'
  },
  'quiz-bowl': {
    id: 'quiz-bowl',
    name: 'Quiz Bowl',
    description: 'Test knowledge across various subjects in competitive quiz formats.',
    category: 'Academic',
    fit: 'Great for students with broad knowledge who enjoy competitive trivia.'
  },
  'mock-trial': {
    id: 'mock-trial',
    name: 'Mock Trial',
    description: 'Compete in simulated court trials and develop legal reasoning skills.',
    category: 'Academic',
    fit: 'Perfect for students interested in law who want to compete in legal simulations.'
  },
  'nhs': {
    id: 'nhs',
    name: 'National Honor Society',
    description: 'Lead academic initiatives and maintain high academic standards.',
    category: 'Academic',
    fit: 'Best for high-achieving students who want to lead academic programs.'
  },
  'beta-club': {
    id: 'beta-club',
    name: 'Beta Club',
    description: 'Promote academic excellence and leadership through service projects.',
    category: 'Academic',
    fit: 'Ideal for students who want to combine academic achievement with leadership.'
  },
  'academic-leadership': {
    id: 'academic-leadership',
    name: 'Academic Leadership Club',
    description: 'Lead academic programs and mentor other students in their studies.',
    category: 'Academic',
    fit: 'Perfect for students who want to help others succeed academically.'
  },
  'book-club': {
    id: 'book-club',
    name: 'Book Club',
    description: 'Read and discuss books in a relaxed, intellectual environment.',
    category: 'Academic',
    fit: 'Great for students who love reading and want to discuss literature with peers.'
  },
  'study-group': {
    id: 'study-group',
    name: 'Study Group Club',
    description: 'Study together and help each other with academic subjects.',
    category: 'Academic',
    fit: 'Ideal for students who want to improve their grades through collaborative study.'
  },
  'academic-support': {
    id: 'academic-support',
    name: 'Academic Support Club',
    description: 'Help other students with their studies and academic challenges.',
    category: 'Academic',
    fit: 'Perfect for students who want to help others succeed in their academic pursuits.'
  },
  'literary-magazine': {
    id: 'literary-magazine',
    name: 'Literary Magazine',
    description: 'Create and publish creative writing and literary content.',
    category: 'Academic',
    fit: 'Great for students who want to express themselves through creative writing.'
  },
  'poetry-club': {
    id: 'poetry-club',
    name: 'Poetry Club',
    description: 'Write, share, and appreciate poetry in a creative community.',
    category: 'Academic',
    fit: 'Perfect for students who want to express themselves through poetry.'
  },

  // Cultural Clubs
  'model-un': {
    id: 'model-un',
    name: 'Model UN',
    description: 'Compete in Model United Nations conferences and develop diplomatic skills.',
    category: 'Cultural',
    fit: 'Perfect for students interested in international relations and diplomacy.'
  },
  'cultural-competition': {
    id: 'cultural-competition',
    name: 'Cultural Competition Club',
    description: 'Compete in cultural knowledge competitions and heritage events.',
    category: 'Cultural',
    fit: 'Ideal for students who want to compete while celebrating cultural diversity.'
  },
  'language-olympiad': {
    id: 'language-olympiad',
    name: 'Language Olympiad',
    description: 'Compete in language competitions and showcase linguistic skills.',
    category: 'Cultural',
    fit: 'Great for students who excel in foreign languages and want to compete.'
  },
  'international-club': {
    id: 'international-club',
    name: 'International Club',
    description: 'Lead cultural exchange programs and international initiatives.',
    category: 'Cultural',
    fit: 'Best for students who want to promote international understanding and cultural exchange.'
  },
  'cultural-leadership': {
    id: 'cultural-leadership',
    name: 'Cultural Leadership Club',
    description: 'Lead cultural awareness programs and diversity initiatives.',
    category: 'Cultural',
    fit: 'Perfect for students who want to lead efforts to promote cultural understanding.'
  },
  'diversity-club': {
    id: 'diversity-club',
    name: 'Diversity Club',
    description: 'Promote diversity and inclusion through leadership and education.',
    category: 'Cultural',
    fit: 'Ideal for students who want to lead efforts to create an inclusive school community.'
  },
  'cultural-club': {
    id: 'cultural-club',
    name: 'Cultural Club',
    description: 'Celebrate and learn about different cultures in a relaxed environment.',
    category: 'Cultural',
    fit: 'Great for students who want to learn about different cultures without pressure.'
  },
  'language-clubs': {
    id: 'language-clubs',
    name: 'Language Clubs',
    description: 'Practice foreign languages and learn about different cultures.',
    category: 'Cultural',
    fit: 'Perfect for students who want to improve their language skills and cultural knowledge.'
  },

  // Recreational Clubs
  'chess-club': {
    id: 'chess-club',
    name: 'Chess Club',
    description: 'Compete in chess tournaments and develop strategic thinking skills.',
    category: 'Recreational',
    fit: 'Perfect for students who love chess and want to compete against other players.'
  },
  'gaming-club': {
    id: 'gaming-club',
    name: 'Gaming Club',
    description: 'Compete in video game tournaments and esports competitions.',
    category: 'Recreational',
    fit: 'Ideal for students who enjoy gaming and want to compete in organized tournaments.'
  },
  'esports': {
    id: 'esports',
    name: 'ESports',
    description: 'Compete in organized esports leagues and tournaments.',
    category: 'Recreational',
    fit: 'Great for students who want to compete professionally in video games.'
  },
  'rec-leadership': {
    id: 'rec-leadership',
    name: 'Recreational Leadership Club',
    description: 'Lead recreational activities and organize fun events for the school.',
    category: 'Recreational',
    fit: 'Best for students who want to lead fun activities and create enjoyable experiences.'
  },
  'hobby-club': {
    id: 'hobby-club',
    name: 'Hobby Club',
    description: 'Share hobbies and interests with like-minded students.',
    category: 'Recreational',
    fit: 'Great for students who want to connect with others who share their interests.'
  },
  'creative-gaming': {
    id: 'creative-gaming',
    name: 'Creative Gaming Club',
    description: 'Create and design games, mods, and gaming content.',
    category: 'Recreational',
    fit: 'Perfect for students who want to express creativity through game design.'
  },
  'art-craft': {
    id: 'art-craft',
    name: 'Art & Craft Club',
    description: 'Create various art projects and crafts in a creative environment.',
    category: 'Recreational',
    fit: 'Ideal for students who want to express themselves through hands-on creative projects.'
  },
  'diy-club': {
    id: 'diy-club',
    name: 'DIY Club',
    description: 'Create and build various projects using creative problem-solving.',
    category: 'Recreational',
    fit: 'Great for students who want to express creativity through building and making.'
  }
};

// Interest area descriptions with consistent icons
export const interestAreas = {
  "STEM": { icon: "🔬", description: "Science, Technology, Engineering, and Mathematics" },
  "Arts": { icon: "🎨", description: "Creative expression and artistic activities" },
  "Sports": { icon: "⚽", description: "Athletic activities and physical fitness" },
  "Business": { icon: "💼", description: "Business, entrepreneurship, and leadership" },
  "Service": { icon: "🤝", description: "Community service and volunteer work" },
  "Academic": { icon: "📚", description: "Academic excellence and scholarly pursuits" },
  "Cultural": { icon: "🌍", description: "Cultural diversity and international interests" },
  "Recreational": { icon: "🎮", description: "Fun activities and hobbies" }
};

// Experience type descriptions with consistent icons
export const experienceTypes = {
  "Competitive": { icon: "⚡", description: "Clubs with tournaments, competitions, and performance opportunities" },
  "Leadership": { icon: "👔", description: "Clubs focused on developing leadership skills and taking initiative" },
  "Casual": { icon: "🎉", description: "Relaxed clubs for socializing and pursuing interests without pressure" },
  "Creative": { icon: "🎨", description: "Clubs for artistic expression and creative projects" }
};

// Category mappings using club IDs (deduplicated)
export const clubCategories = {
  "STEM": {
    "Competitive": ["sci-olymp", "math-team", "robotics", "academic-team"],
    "Leadership": ["stem-leadership", "tech-club"],
    "Casual": ["cs-club", "coding-club", "engineering-club"],
    "Creative": ["digital-arts", "innovation-club"]
  },
  "Arts": {
    "Competitive": ["drama-club", "art-competition", "music-ensemble"],
    "Leadership": ["art-council", "creative-leadership"],
    "Casual": ["art-club", "photography", "creative-writing"],
    "Creative": ["drama-club", "creative-writing", "photography", "cultural-arts", "international-film", "cultural-dance"]
  },
  "Sports": {
    "Competitive": ["soccer-team", "basketball-team", "track-team", "swimming-team"],
    "Leadership": ["athletic-leadership", "sports-management"],
    "Casual": ["fitness-club", "rec-sports", "outdoor-club"],
    "Creative": ["dance-club", "color-guard", "cheerleading"]
  },
  "Business": {
    "Competitive": ["fbla", "deca", "business-competition"],
    "Leadership": ["student-council", "business-club", "leadership-club"],
    "Casual": ["entrepreneurship", "social-entrepreneurship"],
    "Creative": ["marketing-club", "business-innovation", "design-thinking"]
  },
  "Service": {
    "Competitive": ["service-competition", "volunteer-leadership"],
    "Leadership": ["key-club", "interact-club", "community-service"],
    "Casual": ["volunteer-club", "charity-club"],
    "Creative": ["environmental-club", "social-justice", "community-arts"]
  },
  "Academic": {
    "Competitive": ["debate-team", "academic-team", "quiz-bowl", "mock-trial"],
    "Leadership": ["nhs", "beta-club", "academic-leadership"],
    "Casual": ["book-club", "study-group", "academic-support"],
    "Creative": ["literary-magazine", "creative-writing", "poetry-club"]
  },
  "Cultural": {
    "Competitive": ["model-un", "cultural-competition", "language-olympiad"],
    "Leadership": ["international-club", "cultural-leadership", "diversity-club"],
    "Casual": ["cultural-club", "language-clubs", "international-club"],
    "Creative": ["cultural-arts", "international-film", "cultural-dance"]
  },
  "Recreational": {
    "Competitive": ["chess-club", "gaming-club", "esports"],
    "Leadership": ["rec-leadership", "hobby-club"],
    "Casual": ["chess-club", "gaming-club", "book-club", "hobby-club"],
    "Creative": ["creative-gaming", "art-craft", "diy-club"]
  }
};

// Helper function to get clubs by category and experience type
export const getClubsByCategory = (interest, experienceType) => {
  const clubIds = clubCategories[interest]?.[experienceType] || [];
  return clubIds.map(id => uniqueClubs[id]).filter(Boolean);
};

// Helper function to get club by ID (for backward compatibility)
export const getClubById = (id) => uniqueClubs[id];

// Helper function to get club by name (for backward compatibility)
export const getClubByName = (name) => {
  return Object.values(uniqueClubs).find(club => 
    club.name.toLowerCase() === name.toLowerCase()
  );
};
