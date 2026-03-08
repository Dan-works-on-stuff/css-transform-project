import { useEffect, useState } from 'react';
import { SourceMapConsumer } from 'source-map-js';

interface MapInfo {
    file: string;
    sources: string[];
    sourcesContent: (string | null)[];
    mappingsCount: number;
    sampleMappings: Array<{
        generatedLine: number;
        generatedColumn: number;
        originalSource: string | null;
        originalLine: number | null;
        originalColumn: number | null;
        name: string | null;
    }>;
}

export default function SourceMapVisualizer() {
    const [mapInfo, setMapInfo] = useState<MapInfo | null>(null);
    const [generatedCSS, setGeneratedCSS] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [selectedSource, setSelectedSource] = useState<string | null>(null);

    useEffect(() => {
        async function loadSourceMap() {
            try {
                let cssText = '';
                let rawMap = null;

                const styleTags = Array.from(document.querySelectorAll('style[data-vite-dev-id]'));

                if (styleTags.length > 0) {
                    const allCSS: string[] = [];
                    for (const tag of styleTags) {
                        allCSS.push(`/* Source: ${tag.getAttribute('data-vite-dev-id')} */\n${tag.textContent}`);
                    }
                    cssText = allCSS.join('\n\n');

                    for (const tag of styleTags) {
                        const content = tag.textContent || '';
                        const inlineMatch = content.match(
                            /\/\*#\s*sourceMappingURL=data:application\/json;base64,(.+?)\s*\*\//
                        );
                        if (inlineMatch) {
                            const decoded = atob(inlineMatch[1]);
                            rawMap = JSON.parse(decoded);
                            break;
                        }
                    }
                }

                if (!rawMap) {
                    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                    const cssLink = stylesheets.find(link =>
                        link.getAttribute('href')?.includes('/assets/')
                    );

                    if (cssLink) {
                        const cssUrl = cssLink.getAttribute('href')!;
                        const cssResponse = await fetch(cssUrl);
                        cssText = await cssResponse.text();

                        const sourceMapMatch = cssText.match(/\/\*#\s*sourceMappingURL=(.+?)\s*\*\//);
                        if (sourceMapMatch) {
                            const mapUrl = new URL(sourceMapMatch[1], new URL(cssUrl, window.location.href)).href;
                            const mapResponse = await fetch(mapUrl);
                            if (mapResponse.ok) rawMap = await mapResponse.json();
                        }

                        if (!rawMap) {
                            const mapResponse = await fetch(cssUrl + '.map');
                            if (mapResponse.ok) rawMap = await mapResponse.json();
                        }
                    }
                }

                if (!rawMap && styleTags.length > 0) {
                    setGeneratedCSS(cssText);
                    setMapInfo({
                        file: 'dev-styles (injected by Vite)',
                        sources: styleTags.map(t => t.getAttribute('data-vite-dev-id') || 'unknown'),
                        sourcesContent: styleTags.map(t => t.textContent || ''),
                        mappingsCount: 0,
                        sampleMappings: [],
                    });
                    return;
                }

                if (!rawMap) {
                    setError(
                        'No source map found. In dev mode, ensure css.devSourcemap is true in vite.config.ts. ' +
                        'In prod, Tailwind CSS v4 may not emit CSS source maps.'
                    );
                    return;
                }

                setGeneratedCSS(cssText);

                const consumer = new SourceMapConsumer(rawMap);
                const sampleMappings: MapInfo['sampleMappings'] = [];
                consumer.eachMapping((mapping) => {
                    if (sampleMappings.length < 50) {
                        sampleMappings.push({
                            generatedLine: mapping.generatedLine,
                            generatedColumn: mapping.generatedColumn,
                            originalSource: mapping.source,
                            originalLine: mapping.originalLine,
                            originalColumn: mapping.originalColumn,
                            name: mapping.name,
                        });
                    }
                });

                setMapInfo({
                    file: rawMap.file || 'generated CSS',
                    sources: rawMap.sources || [],
                    sourcesContent: rawMap.sourcesContent || [],
                    mappingsCount: sampleMappings.length,
                    sampleMappings,
                });
            } catch (e) {
                setError(`Failed to load source map: ${e instanceof Error ? e.message : String(e)}`);
            }
        }

        loadSourceMap();
    }, []);

    if (error) {
        return (
            <div className="w-full mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-lg font-bold text-red-700">Source Map Visualizer</h2>
                <p className="text-red-600 mt-2">{error}</p>
                <p className="text-sm text-red-500 mt-1">
                    Run: <code className="bg-red-100 px-1 rounded">npm run dev</code> and ensure <code className="bg-red-100 px-1 rounded">css.devSourcemap: true</code> is set in vite.config.ts.
                </p>
            </div>
        );
    }

    if (!mapInfo) {
        return (
            <div className="w-full mt-8 p-4 bg-gray-50 border rounded-lg">
                <p className="text-gray-500">Loading source map...</p>
            </div>
        );
    }

    return (
        <div className="w-full mt-8 p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4">🗺️ Source Map Visualizer</h2>

            {/* Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Generated File</p>
                    <p className="text-lg font-mono truncate">{mapInfo.file}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Original Sources</p>
                    <p className="text-lg font-bold">{mapInfo.sources.length} files</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Mappings</p>
                    <p className="text-lg font-bold">{mapInfo.mappingsCount} entries</p>
                </div>
            </div>

            {/* Source files list */}
            <div className="mb-6">
                <h3 className="font-semibold mb-2">Original Source Files:</h3>
                <div className="flex flex-wrap gap-2">
                    {mapInfo.sources.map((source, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedSource(selectedSource === source ? null : source)}
                            className={`px-3 py-1 rounded-full text-sm font-mono cursor-pointer transition-colors ${
                                selectedSource === source
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {source}
                        </button>
                    ))}
                </div>
            </div>

            {/* Show original source content if selected */}
            {selectedSource && mapInfo.sourcesContent && (
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">
                        Original content of <code className="bg-gray-100 px-1 rounded">{selectedSource}</code>:
                    </h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm max-h-64 overflow-y-auto">
                        {mapInfo.sourcesContent[mapInfo.sources.indexOf(selectedSource)] ?? 'Content not embedded in source map'}
                    </pre>
                </div>
            )}

            {/* Mapping table */}
            <div>
                <h3 className="font-semibold mb-2">Sample Mappings (generated → original):</h3>
                <div className="overflow-x-auto max-h-64 overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="sticky top-0">
                        <tr className="bg-gray-100">
                            <th className="text-left p-2 border">Generated Line:Col</th>
                            <th className="text-left p-2 border">→</th>
                            <th className="text-left p-2 border">Original Source</th>
                            <th className="text-left p-2 border">Original Line:Col</th>
                        </tr>
                        </thead>
                        <tbody>
                        {mapInfo.sampleMappings.map((m, i) => (
                            <tr key={i} className="hover:bg-yellow-50">
                                <td className="p-2 border font-mono">
                                    {m.generatedLine}:{m.generatedColumn}
                                </td>
                                <td className="p-2 border text-gray-400">→</td>
                                <td className="p-2 border font-mono text-blue-600 truncate max-w-48">
                                    {m.originalSource ?? '—'}
                                </td>
                                <td className="p-2 border font-mono">
                                    {m.originalLine}:{m.originalColumn}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generated CSS preview */}
            <div className="mt-6">
                <h3 className="font-semibold mb-2">Generated CSS (first 2000 chars):</h3>
                <pre className="bg-gray-900 text-gray-300 p-4 rounded-lg overflow-x-auto text-xs max-h-48 overflow-y-auto">
                    {generatedCSS.slice(0, 2000)}
                    {generatedCSS.length > 2000 && '\n\n... truncated ...'}
                </pre>
            </div>
        </div>
    );
}
