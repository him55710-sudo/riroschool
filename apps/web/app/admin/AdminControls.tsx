"use client";

import { useRouter } from "next/navigation";

export function AdminControls({ currentVersion }: { currentVersion: string }) {
    const router = useRouter();

    const setVersion = async (v: string) => {
        await fetch('/api/admin/config', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activePromptVersion: v })
        });
        router.refresh();
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-xl font-semibold mb-4">Prompt Version Control</h2>
            <div className="flex items-center space-x-4 mb-4">
                <p>Current Active System Prompt:</p>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded font-bold">
                    {currentVersion}
                </span>
            </div>
            <div className="flex space-x-2">
                <button
                    onClick={() => setVersion('v1')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Set Prompt V1
                </button>
                <button
                    onClick={() => setVersion('v2')}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                    Set Prompt V2 (Strict)
                </button>
            </div>
        </div>
    );
}
