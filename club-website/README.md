# WFHS Clubs Website

A modern, responsive website showcasing clubs and organizations at West Forsyth High School. Built with React and Tailwind CSS for a seamless user experience across all devices.

## 🌟 Features

- **Modern Design**: Clean, professional interface with smooth animations
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Advanced Search**: Filter clubs by name, description, or sponsor
- **Category Organization**: Clubs grouped by type (Academic, Arts, Sports, etc.)
- **Detailed Club Pages**: Complete information for each club including sponsors and descriptions
- **Accessibility**: Built with web accessibility standards in mind
- **Performance Optimized**: Fast loading with efficient React hooks and memoization

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/wfhs/clubs-website.git
cd wfhs-clubs-website
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
wfhs-clubs-website/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   │   ├── club/            # Club-specific components
│   │   └── common/          # Reusable UI components
│   ├── data/
│   │   └── clubsData.js     # Club information database
│   ├── utils/
│   │   └── constants.js     # App constants and configurations
│   ├── hooks/
│   │   └── useClubFilter.js # Custom hooks for filtering
│   ├── App.jsx              # Main application component
│   ├── App.css              # Global styles and animations
│   └── index.js             # Application entry point
├── package.json
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md
```

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run deploy` - Deploy to GitHub Pages

## 🎨 Customization

### Adding New Clubs

Edit `src/data/clubsData.js` to add or modify club information:

```javascript
{
  id: 'unique-club-id',
  name: 'Club Name',
  description: 'Club description...',
  sponsor: 'Sponsor Name',
  category: 'Category Name'
}
```

### Styling

- **Global Styles**: Modify `src/App.css`
- **Tailwind Config**: Update `tailwind.config.js` for custom colors, fonts, etc.
- **Component Styles**: Use Tailwind utility classes directly in components

### Categories

Add new categories in `src/utils/constants.js`:

```javascript
export const CategoryColors = {
  'New Category': 'bg-color-100 text-color-800',
  // ... existing categories
};
```

## 📱 Responsive Design

The website is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## ♿ Accessibility Features

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion preferences

## 🚀 Deployment

### GitHub Pages

1. Update `homepage` in `package.json`
2. Run deployment script:
```bash
npm run deploy
```

### Other Platforms

The built files in the `build/` directory can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests and linting: `npm test && npm run lint`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📝 Code Style

This project uses:
- **ESLint** for code quality
- **Prettier** for code formatting
- **Conventional Commits** for commit messages

## 🐛 Bug Reports

Please report bugs using the [GitHub Issues](https://github.com/wfhs/clubs-website/issues) page with:
- Description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser and device information

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- West Forsyth High School administration and staff
- Club sponsors and student leaders
- React and Tailwind CSS communities
- Lucide React for icons

## 📞 Support

For questions or support:
- Create an issue on GitHub
- Contact the development team
- Check the documentation

---

**Made with ❤️ for West Forsyth High School**