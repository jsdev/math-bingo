import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const operations = ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION'];
const columns = ['B', 'I', 'N', 'G', 'O'];

const generateUniqueBingoCard = (usedNumbers) => {
  const card = Array(5).fill().map(() => Array(5).fill(0));
  for (let col = 0; col < 5; col++) {
    const availableNumbers = Array.from({ length: 21 }, (_, i) => i).filter(num => !usedNumbers[columns[col]].has(num));
    for (let row = 0; row < 5; row++) {
      if (row === 2 && col === 2) {
        card[row][col] = 'FREE';
      } else {
        const randomIndex = Math.floor(Math.random() * availableNumbers.length);
        card[row][col] = availableNumbers[randomIndex];
        availableNumbers.splice(randomIndex, 1);
        usedNumbers[columns[col]].add(card[row][col]);
      }
    }
  }
  return card;
};

const symbols = {
  ADDITION: '+',
  SUBTRACTION: '-',
  MULTIPLICATION: '×',
  DIVISION: '÷'
}

const generateEquation = (operation, usedNumbers, remainingColumns) => {
  let a, b, result, column;
  do {
    if (remainingColumns.length === 0) {
      // No available columns, reset and regenerate
      remainingColumns = columns.slice();
    }
    column = remainingColumns[Math.floor(Math.random() * remainingColumns.length)];
    remainingColumns = remainingColumns.filter(col => col !== column);

    switch (operation) {
      case 'ADDITION':
        a = Math.floor(Math.random() * 10) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        result = a + b;
        break;
      case 'SUBTRACTION':
        a = Math.floor(Math.random() * 20) + 1;
        b = Math.floor(Math.random() * a) + 1;
        result = a - b;
        break;
      case 'MULTIPLICATION':
        a = Math.floor(Math.random() * 7) + 1;
        b = Math.floor(Math.random() * 7) + 1;
        result = a * b;
        break;
      case 'DIVISION':
        b = Math.floor(Math.random() * 10) + 1;
        result = Math.floor(Math.random() * 10) + 1;
        a = b * result;
        break;
    }
  } while (usedNumbers[column].has(result));

  usedNumbers[column].add(result);
  return { equation: `${a} ${symbols[operation]} ${b} = ?`, result, column };
};

const checkBingo = (card, markedSquares) => {
  // Check rows, columns, and diagonals
  for (let i = 0; i < 5; i++) {
    if (markedSquares.filter(square => parseInt(square.split('-')[0]) === i).length === 5) return true;
    if (markedSquares.filter(square => parseInt(square.split('-')[1]) === i).length === 5) return true;
  }
  
  const diagonal1 = ['0-0', '1-1', '2-2', '3-3', '4-4'];
  const diagonal2 = ['0-4', '1-3', '2-2', '3-1', '4-0'];
  
  if (diagonal1.every(square => square === '2-2' || markedSquares.includes(square))) return true;
  if (diagonal2.every(square => square === '2-2' || markedSquares.includes(square))) return true;
  
  return false;
};

const BingoCard = ({ bingoCard, markedSquares, onToggleSquare, onCheckBingo }) => {
  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-2">
        <div className="grid grid-cols-5 gap-1 mb-2">
          {columns.map((col) => (
            <div key={col} className="text-center font-bold text-xs">{col}</div>
          ))}
          {bingoCard.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => onToggleSquare(rowIndex, colIndex)}
                className={`w-full h-8 text-xs ${markedSquares.includes(`${rowIndex}-${colIndex}`) ? 'bg-red-500' : 'bg-blue-500'}`}
              >
                {cell}
              </Button>
            ))
          )}
        </div>
        <Button onClick={onCheckBingo} className="w-full text-xs">Check Bingo</Button>
      </CardContent>
    </Card>
  );
};

const EquationComponent = ({ currentEquation, timer }) => (
  <Card className="w-full max-w-xs">
    <CardContent className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-2xl font-bold mb-4">Time: {timer}s</div>
      {currentEquation && (
        <>
          <div className="font-bold mb-2">{currentEquation.column}</div>
          <div className="text-xl">{currentEquation.equation}</div>
          {timer <= 2 && <div className="text-lg mt-2">Answer: {currentEquation.result}</div>}
        </>
      )}
    </CardContent>
  </Card>
);

const WinPercentageTracker = ({ bingoCards, markedSquares }) => {
  const calculateWinPercentage = (cardIndex) => {
    const totalWinningCombos = 12; // 5 rows + 5 columns + 2 diagonals
    let correctMarks = 0;

    // Check rows and columns
    for (let i = 0; i < 5; i++) {
      const rowMarks = markedSquares[cardIndex].filter(square => parseInt(square.split('-')[0]) === i).length;
      const colMarks = markedSquares[cardIndex].filter(square => parseInt(square.split('-')[1]) === i).length;
      correctMarks += (rowMarks === 5 ? 1 : 0) + (colMarks === 5 ? 1 : 0);
    }

    // Check diagonals
    const diagonal1 = ['0-0', '1-1', '2-2', '3-3', '4-4'];
    const diagonal2 = ['0-4', '1-3', '2-2', '3-1', '4-0'];
    correctMarks += (diagonal1.every(square => square === '2-2' || markedSquares[cardIndex].includes(square)) ? 1 : 0);
    correctMarks += (diagonal2.every(square => square === '2-2' || markedSquares[cardIndex].includes(square)) ? 1 : 0);

    return (correctMarks / totalWinningCombos) * 100;
  };

  return (
    <Card className="w-full max-w-xs">
      <CardContent className="p-4">
        <h2 className="text-lg font-bold mb-2">Win Percentages</h2>
        {bingoCards.map((_, index) => (
          <div key={index} className="mb-2">
            <span className="font-semibold">Card {index + 1}:</span> {calculateWinPercentage(index).toFixed(2)}%
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const MathBingo = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [operation, setOperation] = useState('');
  const [bingoCards, setBingoCards] = useState([]);
  const [markedSquares, setMarkedSquares] = useState([[], [], [], []]);
  const [currentEquation, setCurrentEquation] = useState(null);
  const [timer, setTimer] = useState(30);
  const [usedNumbers, setUsedNumbers] = useState({});
  const [orientation, setOrientation] = useState(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');

  useEffect(() => {
    const handleResize = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer === 1) {
            const newEquation = generateEquation(operation, usedNumbers);
            setCurrentEquation(newEquation);
            setUsedNumbers(prev => ({
              ...prev,
              [newEquation.column]: new Set([...prev[newEquation.column], newEquation.result])
            }));
            return 30;
          }
          return prevTimer - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [gameStarted, operation, usedNumbers]);

  const startGame = (op) => {
    const initialUsedNumbers = columns.reduce((acc, col) => ({ ...acc, [col]: new Set() }), {});
    setOperation(op);
    setGameStarted(true);
    setMarkedSquares([[], [], [], []]);
    setBingoCards([
      generateUniqueBingoCard(initialUsedNumbers),
      generateUniqueBingoCard(initialUsedNumbers),
      generateUniqueBingoCard(initialUsedNumbers),
      generateUniqueBingoCard(initialUsedNumbers)
    ]);
    setUsedNumbers(initialUsedNumbers);
    const newEquation = generateEquation(op, initialUsedNumbers);
    setCurrentEquation(newEquation);
    setUsedNumbers(prev => ({
      ...prev,
      [newEquation.column]: new Set([...prev[newEquation.column], newEquation.result])
    }));
  };

  const toggleSquare = (cardIndex, row, col) => {
    setMarkedSquares(prev => {
      const newMarkedSquares = [...prev];
      const squareKey = `${row}-${col}`;
      if (newMarkedSquares[cardIndex].includes(squareKey)) {
        newMarkedSquares[cardIndex] = newMarkedSquares[cardIndex].filter(s => s !== squareKey);
      } else {
        newMarkedSquares[cardIndex] = [...newMarkedSquares[cardIndex], squareKey];
      }
      return newMarkedSquares;
    });
  };

  const handleCheckBingo = (cardIndex) => {
    if (checkBingo(bingoCards[cardIndex], markedSquares[cardIndex])) {
      alert(`BINGO! Card ${cardIndex + 1} wins!`);
    } else {
      alert(`No bingo on card ${cardIndex + 1}. Keep playing!`);
    }
  };

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl font-bold mb-4">MATH BINGO</h1>
        <div className="grid grid-cols-2 gap-4">
          {operations.map((op) => (
            <Button key={op} onClick={() => startGame(op)} className="p-4">{op}</Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${orientation === 'portrait' ? 'flex-col' : 'flex-row'} items-start justify-center min-h-screen p-4 gap-4`}>
      <div className={`grid ${orientation === 'portrait' ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2'} gap-4`}>
        {bingoCards.map((card, index) => (
          <BingoCard 
            key={index}
            bingoCard={card}
            markedSquares={markedSquares[index]}
            onToggleSquare={(row, col) => toggleSquare(index, row, col)}
            onCheckBingo={() => handleCheckBingo(index)}
          />
        ))}
      </div>
      <div className={`flex ${orientation === 'portrait' ? 'flex-row' : 'flex-col'} gap-4`}>
        <EquationComponent currentEquation={currentEquation} timer={timer} />
        <WinPercentageTracker bingoCards={bingoCards} markedSquares={markedSquares} />
      </div>
    </div>
  );
};

export default MathBingo;
