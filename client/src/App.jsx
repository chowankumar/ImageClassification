import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css'; // Tailwind-generated CSS

const App = () => {
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [classTable, setClassTable] = useState([]);
  const [guessedPlayerImage, setGuessedPlayerImage] = useState(null);

  const handleDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    const reader = new FileReader();
    reader.onload = async () => {
      const imageData = reader.result;

      const formData = new FormData();
      formData.append("image_data", imageData);

      try {
        const response = await axios.post('http://127.0.0.1:5000/classify_image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        const data = response.data;
        if (!data || data.length === 0) {
          setError("Can't classify image. Classifier was not able to detect face and two eyes properly.");
          setResult(null);
          setClassTable([]);
          setGuessedPlayerImage(null);
          return;
        }

        let bestMatch = data.reduce((prev, curr) => {
          const prevMax = Math.max(...prev.class_probability);
          const currMax = Math.max(...curr.class_probability);
          return currMax > prevMax ? curr : prev;
        });

        setError(null);
        setResult(bestMatch.class);

        // Set guessed player's image
        const guessedPlayerImagePath = `/images/${bestMatch.class.toUpperCase().replace(' ', '_')}.jpeg`;
        setGuessedPlayerImage(guessedPlayerImagePath);

        const updatedClassTable = Object.keys(bestMatch.class_dictionary).map((player) => {
          const index = bestMatch.class_dictionary[player];
          return {
            player,
            score: bestMatch.class_probability[index].toFixed(2),
          };
        });

        setClassTable(updatedClassTable);
      } catch (err) {
        setError('Error while processing the image. Please try again.');
        setResult(null);
        setClassTable([]);
        setGuessedPlayerImage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop, maxFiles: 1 });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-800 text-white p-4 text-center text-xl">
        Sports Person Classifier
      </nav>

      <div className="container mx-auto p-4">
        <div className="flex flex-wrap justify-center gap-4">
          {['Lionel_Messi', 'Maria_Sharapova', 'Roger_Federer', 'Serena_Williams', 'Virat_Kohli'].map((player) => (
            <div key={player} className="w-40">
              <div className="rounded-full overflow-hidden mx-auto w-24 h-24">
                <img
                  src={`/images/${player}.jpeg`}  // Dynamic image source
                  alt={player} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center mt-2 text-lg font-semibold">{player}</div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <div
            {...getRootProps({
              className: 'border-dashed border-4 border-gray-300 p-6 text-center cursor-pointer',
            })}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">Drop files here or click to upload</p>
          </div>

          {error && <div className="text-red-500 mt-4 text-center">{error}</div>}

          {result && (
            <div className="text-center mt-4 text-green-500">
              <p>Best Match: {result}</p>
              {guessedPlayerImage && (
                <div className="mt-4">
                  <img
                    src={guessedPlayerImage}
                    alt={result}
                    className="rounded-lg mx-auto w-32 h-32 object-cover"
                  />
                </div>
              )}
            </div>
          )}

          {classTable.length > 0 && (
            <table className="table-auto border-collapse border border-gray-500 w-full mt-4">
              <thead>
                <tr>
                  <th className="border border-gray-500 p-2">Player</th>
                  <th className="border border-gray-500 p-2">Probability Score</th>
                </tr>
              </thead>
              <tbody>
                {classTable.map((row) => (
                  <tr key={row.player}>
                    <td className="border border-gray-500 p-2">{row.player}</td>
                    <td className="border border-gray-500 p-2">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
