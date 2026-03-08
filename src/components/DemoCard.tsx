import { useState } from 'react';
import SecretMessage from './SecretMessage';

interface DemoCardProps {
    isDark: boolean;
    onToggleTheme: () => void;
}

export default function DemoCard({ isDark, onToggleTheme }: DemoCardProps) {
    const [count, setCount] = useState(0);

    return (
        <div className="bg-card p-8 rounded-xl shadow-lg max-w-md text-center transition-colors duration-500">
            <h1 className="text-3xl font-bold text-text mb-4">
                CSS Transformation Demo
            </h1>
            <p className="text-text mb-6 opacity-80">
                Thanks to source maps, you will see the styles originate from <code>src/index.css</code>, even though the browser is reading a massive compiled stylesheet!
            </p>
            <div className="flex gap-4 justify-center mb-6">
                <button
                    className="btn-primary"
                    onClick={() => setCount((c) => c + 1)}
                >
                    Click Me {count > 0 && `(${count})`}
                </button>

                <button
                    onClick={onToggleTheme}
                    className="px-4 py-2 border-2 border-yellow-400 rounded-lg hover:bg-yellow-300 cursor-pointer text-gray-700 font-semibold"
                >
                    {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>

            <SecretMessage />

            <details className="mt-6 text-left text-sm text-text opacity-80">
                <summary className="cursor-pointer font-semibold">
                    💡 How does CSS transformation work?
                </summary>
                <div className="mt-3 space-y-2">
                    <p>
                        The CSS you write in <code className="bg-gray-200 px-1 rounded text-xs">src/index.css</code> uses
                        Tailwind's <code className="bg-gray-200 px-1 rounded text-xs">@apply</code> directives
                        and <code className="bg-gray-200 px-1 rounded text-xs">@theme</code> tokens — syntax the browser
                        can't understand natively.
                    </p>
                    <p>
                        During dev/build, <strong>Vite</strong> and the <strong>Tailwind CSS v4</strong> plugin
                        transform these into standard CSS: <code className="bg-gray-200 px-1 rounded text-xs">@apply px-4 py-2</code> becomes
                        real <code className="bg-gray-200 px-1 rounded text-xs">padding</code> declarations, utility
                        classes like <code className="bg-gray-200 px-1 rounded text-xs">bg-bg</code> generate
                        corresponding rules, and unused classes are removed entirely.
                    </p>
                    <p>
                        <strong>Source maps</strong> are generated alongside the output, mapping every line of generated
                        CSS back to its original location. Open DevTools → Styles pane and click any rule to see it
                        point to <code className="bg-gray-200 px-1 rounded text-xs">index.css</code> instead of a
                        generated file.
                    </p>
                </div>
            </details>
        </div>
    );
}

