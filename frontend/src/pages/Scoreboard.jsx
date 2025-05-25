import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/App.css';

function Scoreboard() {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState('Team A');
  const [teamB, setTeamB] = useState('Team B');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [serving, setServing] = useState('A'); // 'A' or 'B'
  const [timeoutsA, setTimeoutsA] = useState([false, false]);
  const [timeoutsB, setTimeoutsB] = useState([false, false]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [pointsToWin, setPointsToWin] = useState(11);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const resetGame = () => {
    setScoreA(0);
    setScoreB(0);
    setTimeoutsA([false, false]);
    setTimeoutsB([false, false]);
    setElapsedTime(0);
  };

  const addPoint = (team) => {
    if (team === serving) {
      if (team === 'A') {
        setScoreA(scoreA + 1);
      } else {
        setScoreB(scoreB + 1);
      }
    } else {
      // Change server
      setServing(team);
    }
  };

  const toggleTimeout = (team, index) => {
    if (team === 'A') {
      const newTimeouts = [...timeoutsA];
      newTimeouts[index] = !newTimeouts[index];
      setTimeoutsA(newTimeouts);
    } else {
      const newTimeouts = [...timeoutsB];
      newTimeouts[index] = !newTimeouts[index];
      setTimeoutsB(newTimeouts);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="scoreboard-page">
      <div className="scoreboard-header">
        <div className="game-info">
          <div className="elapsed-time">{formatTime(elapsedTime)}</div>
          <div className="points-to-win">First to {pointsToWin} (win by 2)</div>
        </div>
        <button className="control-button small" onClick={() => navigate('/')}>Exit</button>
      </div>
      
      <div className="scoreboard-container">
        <div className={`team-section ${serving === 'A' ? 'serving' : ''}`}>
          <div className="team-name">{teamA}</div>
          <div className="score">{scoreA}</div>
          <div className="controls">
            <button className="control-button" onClick={() => addPoint('A')}>
              {serving === 'A' ? 'Score Point' : 'Side Out'}
            </button>
            <div className="timeouts">
              {timeoutsA.map((used, index) => (
                <div 
                  key={index} 
                  className={`timeout ${used ? 'used' : ''}`}
                  onClick={() => toggleTimeout('A', index)}
                >
                  TO
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="scoreboard-divider">
          <div className="game-controls">
            <button className="control-button small" onClick={resetGame}>Reset</button>
          </div>
        </div>
        
        <div className={`team-section ${serving === 'B' ? 'serving' : ''}`}>
          <div className="team-name">{teamB}</div>
          <div className="score">{scoreB}</div>
          <div className="controls">
            <button className="control-button" onClick={() => addPoint('B')}>
              {serving === 'B' ? 'Score Point' : 'Side Out'}
            </button>
            <div className="timeouts">
              {timeoutsB.map((used, index) => (
                <div 
                  key={index} 
                  className={`timeout ${used ? 'used' : ''}`}
                  onClick={() => toggleTimeout('B', index)}
                >
                  TO
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scoreboard;
