import { useState } from 'react';
import DemoCard from './components/DemoCard';
import SourceMapVisualizer from './components/SourceMapVisualizer';

function App() {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        const nextIsDark = !isDark;
        setIsDark(nextIsDark);
        document.documentElement.setAttribute('data-theme', nextIsDark ? 'dark' : 'light');
    };

    return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 transition-colors duration-500">
            <DemoCard isDark={isDark} onToggleTheme={toggleTheme} />
            <SourceMapVisualizer />

        </div>
    );
}

export default App;
