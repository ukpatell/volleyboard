import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import '../css/App.css';
import '../css/Scoreboard.css';

function HomePage() {
  const navigate = useNavigate();

  const startNewGame = () => {
    navigate('/scoreboard');
  };

  return (
    <div className="landing-page">
      <div className="landing-content">
        <h1>VolleyBoard</h1>
        {/* <p className="tagline"> </p> */}

        <div className="features">
          <div className="feature">
            <h3>User Interface</h3>
            <p>Simple volleyball scoring application</p>
          </div>
        </div>

        <button className="primary-button" onClick={startNewGame}>
          Start Scoreboard
        </button>
      </div>
    </div>
  );
}

function Scoreboard() {
  const navigate = useNavigate();
  const [teamA, setTeamA] = useState('Team A');
  const [teamB, setTeamB] = useState('Team B');
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [serving, setServing] = useState('A'); // 'A' or 'B'
  const [timeoutsA, setTimeoutsA] = useState([false, false]);
  const [timeoutsB, setTimeoutsB] = useState([false, false]);
  const [timeoutCountdownA, setTimeoutCountdownA] = useState([null, null]);
  const [timeoutCountdownB, setTimeoutCountdownB] = useState([null, null]);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [pointsToWin, setPointsToWin] = useState(11);
  const [setHistory, setSetHistory] = useState([]);
  const [currentSet, setCurrentSet] = useState(1);
  const [setWinner, setSetWinner] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [showModal, setShowModal] = useState(false);
  const [pausedTime, setPausedTime] = useState(null);

  // Available point options
  const pointOptions = [11, 15, 21, 25];

  // Timer effect
  useEffect(() => {
    let interval;
    if (isRunning && !setWinner && !pausedTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, setWinner, startTime, pausedTime]);

  // Timeout countdown effect
  const isTimeoutActive = () => {
      return timeoutCountdownA.some(t => t !== null) || timeoutCountdownB.some(t => t !== null);
    };
  useEffect(() => {
    const intervals = [];

    

    // Handle Team A timeouts
    timeoutCountdownA.forEach((countdown, index) => {
      if (countdown !== null && countdown > 0) {
        const interval = setInterval(() => {
          setTimeoutCountdownA(prev => {
            const newCountdowns = [...prev];
            if (newCountdowns[index] > 1) {
              newCountdowns[index] = newCountdowns[index] - 1;
            } else {
              newCountdowns[index] = null;
              // Resume main timer if no other timeouts are active
              if (!newCountdowns.some(c => c !== null) &&
                !timeoutCountdownB.some(c => c !== null)) {
                setPausedTime(null);
              }
            }
            return newCountdowns;
          });
        }, 1000);
        intervals.push(interval);
      }
    });

    // Handle Team B timeouts
    timeoutCountdownB.forEach((countdown, index) => {
      if (countdown !== null && countdown > 0) {
        const interval = setInterval(() => {
          setTimeoutCountdownB(prev => {
            const newCountdowns = [...prev];
            if (newCountdowns[index] > 1) {
              newCountdowns[index] = newCountdowns[index] - 1;
            } else {
              newCountdowns[index] = null;
              // Resume main timer if no other timeouts are active
              if (!newCountdowns.some(c => c !== null) &&
                !timeoutCountdownA.some(c => c !== null)) {
                setPausedTime(null);
              }
            }
            return newCountdowns;
          });
        }, 1000);
        intervals.push(interval);
      }
    });

    return () => intervals.forEach(interval => clearInterval(interval));
  }, [timeoutCountdownA, timeoutCountdownB]);


  const resetGame = () => {
    setScoreA(0);
    setScoreB(0);
    setTimeoutsA([false, false]);
    setTimeoutsB([false, false]);
    setTimeoutCountdownA([null, null]);
    setTimeoutCountdownB([null, null]);
    setSetWinner(null);
    setStartTime(Date.now()); // Reset the start time to now
    setElapsedTime(0);
    setPausedTime(null);
  };

  const clearAllSets = () => {
    setSetHistory([]);
    setCurrentSet(1);
    resetGame();
    setShowModal(false);
  };

  const startNewSet = () => {
    // Save current set result
    if (setWinner) {
      const newSetHistory = [...setHistory, {
        set: currentSet,
        teamA: scoreA,
        teamB: scoreB,
        winner: setWinner,
        time: formatTime(elapsedTime)
      }];
      setSetHistory(newSetHistory);
      setCurrentSet(currentSet + 1);
      resetGame();
      setIsRunning(true); // Ensure timer is running for new set
    }
  };
  const addPoint = (team) => {
    if (setWinner || isTimeoutActive()) return; // Don't allow scoring during timeouts

    if (team === serving) {
      if (team === 'A') {
        const newScore = scoreA + 1;
        setScoreA(newScore);
        checkSetWin(newScore, scoreB);
      } else {
        const newScore = scoreB + 1;
        setScoreB(newScore);
        checkSetWin(scoreA, newScore);
      }
    } else {
      // Change server
      setServing(team);
    }
  };

  const checkSetWin = (scoreA, scoreB) => {
    // Check if either team has reached the points to win with a 2-point lead
    if ((scoreA >= pointsToWin && scoreA - scoreB >= 2) ||
      (scoreB >= pointsToWin && scoreB - scoreA >= 2)) {
      const winner = scoreA > scoreB ? 'A' : 'B';
      setSetWinner(winner);
      setIsRunning(false);
    }
  };

  const toggleTimeout = (team, index) => {
    if (team === 'A') {
      // If timeout is already active, do nothing
      if (timeoutCountdownA[index] !== null) return;

      const newTimeouts = [...timeoutsA];
      newTimeouts[index] = true;
      setTimeoutsA(newTimeouts);

      // Start 30 second countdown
      const newCountdowns = [...timeoutCountdownA];
      newCountdowns[index] = 30;
      setTimeoutCountdownA(newCountdowns);

      // Pause main timer
      setPausedTime(Date.now());
    } else {
      // If timeout is already active, do nothing
      if (timeoutCountdownB[index] !== null) return;

      const newTimeouts = [...timeoutsB];
      newTimeouts[index] = true;
      setTimeoutsB(newTimeouts);

      // Start 30 second countdown
      const newCountdowns = [...timeoutCountdownB];
      newCountdowns[index] = 30;
      setTimeoutCountdownB(newCountdowns);

      // Pause main timer
      setPausedTime(Date.now());
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="scoreboard-page">
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Set History</h2>
            {setHistory.length > 0 ? (
              <>
                <table className="set-history-table">
                  <thead>
                    <tr>
                      <th>Set</th>
                      <th>{teamA}</th>
                      <th>{teamB}</th>
                      <th>Winner</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {setHistory.map((set, index) => (
                      <tr key={index}>
                        <td>{set.set}</td>
                        <td>{set.teamA}</td>
                        <td>{set.teamB}</td>
                        <td>{set.winner === 'A' ? teamA : teamB}</td>
                        <td>{set.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="control-button" onClick={clearAllSets}>
                  Clear All Sets
                </button>
              </>
            ) : (
              <p>No set history yet</p>
            )}
            <button className="control-button" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="scoreboard-header">
        <div className="game-info">
          <div className="elapsed-time">{formatTime(elapsedTime)}</div>
          <div className="points-to-win">Set {currentSet} • First to {pointsToWin} (win by 2)</div>
        </div>
        <button className="control-button small" onClick={() => navigate('/')}>Exit</button>
      </div>

      <div className="scoreboard-container">
        <div className={`team-section ${serving === 'A' ? 'serving' : ''}`}>
          <div className="team-name">{teamA}</div>
          <div className="score">{scoreA}</div>
          <div className="controls">
            <button
              className={`control-button ${isTimeoutActive() ? 'disabled' : ''}`}
              onClick={() => addPoint('A')}
            >
              {serving === 'A' ? 'Score Point' : 'Side Out'}
            </button>
            <div className="timeouts">
              {timeoutsA.map((used, index) => (
                <div
                  key={index}
                  className={`timeout ${used ? 'used' : ''}`}
                  onClick={() => toggleTimeout('A', index)}
                >
                  {timeoutCountdownA[index] !== null ? timeoutCountdownA[index] : 'TO'}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="scoreboard-divider">
  <div className="game-controls">
    {!setWinner ? (
      <>
        <div className="control-row">
          <div className="point-options">
            {pointOptions.map(points => (
              <div 
                key={points}
                className={`point-option ${pointsToWin === points ? 'selected' : ''}`}
                onClick={() => setPointsToWin(points)}
              >
                {points}
              </div>
            ))}
          </div>
        </div>
        <div className="control-row">
          <button className="icon-button trash" onClick={resetGame}>
            <img src="https://img.icons8.com/ios-filled/50/ffffff/trash.png" alt="Reset" width="24" height="24" />
          </button>
          <button className="icon-button table" onClick={() => setShowModal(true)}>
            <img src="https://img.icons8.com/ios-filled/50/ffffff/table.png" alt="History" width="24" height="24" />
          </button>
        </div>
      </>
    ) : (
      <div className="set-result">
        <h3>{setWinner === 'A' ? teamA : teamB} wins the set!</h3>
        <p>Final Score: {scoreA} - {scoreB}</p>
        <button className="control-button" onClick={startNewSet}>Start New Set</button>
      </div>
    )}
  </div>
</div>


        <div className={`team-section ${serving === 'B' ? 'serving' : ''}`}>
          <div className="team-name">{teamB}</div>
          <div className="score">{scoreB}</div>
          <div className="controls">
            <button
              className={`control-button ${isTimeoutActive() ? 'disabled' : ''}`}
              onClick={() => addPoint('B')}
            >
              {serving === 'B' ? 'Score Point' : 'Side Out'}
            </button>
            <div className="timeouts">
              {timeoutsB.map((used, index) => (
                <div
                  key={index}
                  className={`timeout ${used ? 'used' : ''}`}
                  onClick={() => toggleTimeout('B', index)}
                >
                  {timeoutCountdownB[index] !== null ? timeoutCountdownB[index] : 'TO'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/scoreboard" element={<Scoreboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
