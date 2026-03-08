import { useState } from 'react';

function SecretMessage() {
    const [secretInput, setSecretInput] = useState('');
    const [isSolved, setIsSolved] = useState(false);

    const handleCheck = () => {
        if (secretInput === 'hidden_in_front_side') {
            setIsSolved(true);
        } else {
            alert("Incorrect! Inspect the element above to find the clue.");
        }
    };

    return (
        <div className="w-full mt-6 border-t pt-4">
            <div className="secret-clue bg-gray-100 flex flex-col items-center justify-center p-4">
                Inspect this to find the password lol
            </div>
            {isSolved ? (
                <div className="mt-4 p-4 bg-green-100 text-green-700 font-bold rounded text-center">
                    🔓 Access Granted! Source Map Verified.
                </div>
            ) : (
                <div className="flex gap-2 mt-4">
                    <input
                        type="text"
                        className="border border-gray-300 rounded p-2 grow"
                        placeholder="Type the secret code..."
                        value={secretInput}
                        onChange={(e) => setSecretInput(e.target.value)}
                    />
                    <button
                        onClick={handleCheck}
                        className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 cursor-pointer"
                    >
                        Unlock
                    </button>
                </div>
            )}
        </div>
    )
}

export default SecretMessage;