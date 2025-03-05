import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaCog, FaCheck, FaHistory, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const StudyTimer = () => {
  const { currentUser } = useAuth();
  const [timerMode, setTimerMode] = useState('pomodoro'); // pomodoro, shortBreak, longBreak
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  // Timer settings
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    dailyGoal: 8
  });
  
  // Current task
  const [currentTask, setCurrentTask] = useState('');
  const [taskList, setTaskList] = useState([]);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  
  // Set timer based on mode
  useEffect(() => {
    let time;
    switch(timerMode) {
      case 'shortBreak':
        time = settings.shortBreak * 60;
        break;
      case 'longBreak':
        time = settings.longBreak * 60;
        break;
      default:
        time = settings.pomodoro * 60;
    }
    setTimeLeft(time);
    setIsActive(false);
    
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    document.title = `StudyConnect - ${formatTime(time)}`;
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      document.title = 'StudyConnect';
    };
  }, [timerMode, settings]);
  
  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            playAlarm();
            handleTimerComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive]);
  
  // Update document title with timer
  useEffect(() => {
    if (isActive) {
      document.title = `${formatTime(timeLeft)} - StudyConnect`;
    }
  }, [timeLeft, isActive]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleStartPause = () => {
    setIsActive(!isActive);
    
    // If starting timer and there's no current task, create a default one
    if (!isActive && !currentTask && timerMode === 'pomodoro') {
      setCurrentTask('Study Session');
    }
  };
  
  const handleReset = () => {
    let time;
    switch(timerMode) {
      case 'shortBreak':
        time = settings.shortBreak * 60;
        break;
      case 'longBreak':
        time = settings.longBreak * 60;
        break;
      default:
        time = settings.pomodoro * 60;
    }
    setTimeLeft(time);
    setIsActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
  
  const handleTimerComplete = () => {
    // Record completed pomodoro
    if (timerMode === 'pomodoro') {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      
      // Add to session history
      const newSession = {
        id: Date.now(),
        task: currentTask || 'Study Session',
        duration: settings.pomodoro,
        timestamp: new Date().toISOString()
      };
      setSessionHistory(prev => [...prev, newSession]);
      
      // Add task to completed list if it exists
      if (currentTask) {
        setTaskList(prev => [...prev, { id: Date.now(), text: currentTask, completed: true }]);
        setCurrentTask('');
      }
      
      // Determine next break type
      if (newCycles % settings.longBreakInterval === 0) {
        setTimerMode('longBreak');
        if (settings.autoStartBreaks) setIsActive(true);
      } else {
        setTimerMode('shortBreak');
        if (settings.autoStartBreaks) setIsActive(true);
      }
    } else {
      // Break is over, back to pomodoro
      setTimerMode('pomodoro');
      if (settings.autoStartPomodoros) setIsActive(true);
    }
  };
  
  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };
  
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseInt(value, 10)
    }));
  };
  
  const handleTaskSubmit = (e) => {
    e.preventDefault();
    if (!currentTask.trim()) return;
    
    // Only add to task list if timer is not active
    if (!isActive && timerMode === 'pomodoro') {
      setTaskList(prev => [...prev, { id: Date.now(), text: currentTask, completed: false }]);
      setCurrentTask('');
    }
  };
  
  // Calculate progress for circular timer
  const calculateProgress = () => {
    let totalTime;
    switch(timerMode) {
      case 'shortBreak':
        totalTime = settings.shortBreak * 60;
        break;
      case 'longBreak':
        totalTime = settings.longBreak * 60;
        break;
      default:
        totalTime = settings.pomodoro * 60;
    }
    
    return ((totalTime - timeLeft) / totalTime) * 100;
  };
  
  // Get color based on timer mode
  const getTimerColor = () => {
    switch(timerMode) {
      case 'shortBreak':
        return 'text-green-500 border-green-500';
      case 'longBreak':
        return 'text-blue-500 border-blue-500';
      default:
        return 'text-primary-600 border-primary-600';
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary-900">Study Timer</h1>
        <p className="text-secondary-600 mt-1">
          Use the Pomodoro Technique to boost your productivity
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            {/* Timer Mode Tabs */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setTimerMode('pomodoro')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    timerMode === 'pomodoro' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-secondary-700 hover:bg-secondary-50'
                  } border border-secondary-300`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => setTimerMode('shortBreak')}
                  className={`px-4 py-2 text-sm font-medium ${
                    timerMode === 'shortBreak' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-secondary-700 hover:bg-secondary-50'
                  } border-t border-b border-secondary-300`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => setTimerMode('longBreak')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    timerMode === 'longBreak' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-secondary-700 hover:bg-secondary-50'
                  } border border-secondary-300`}
                >
                  Long Break
                </button>
              </div>
            </div>
            
            {/* Timer Display */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className={`w-64 h-64 rounded-full flex items-center justify-center border-8 ${getTimerColor()}`}>
                  <span className="text-5xl font-bold">{formatTime(timeLeft)}</span>
                </div>
                <svg className="absolute top-0 left-0 w-64 h-64" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="46" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    strokeDasharray="289.02652413026095" 
                    strokeDashoffset={289.02652413026095 - (289.02652413026095 * calculateProgress() / 100)}
                    className={timerMode === 'pomodoro' ? 'text-primary-600' : timerMode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
              </div>
            </div>
            
            {/* Timer Controls */}
            <div className="flex justify-center space-x-4 mb-8">
              <button
                onClick={handleStartPause}
                className={`px-6 py-3 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } transition-colors`}
              >
                {isActive ? <><FaPause className="mr-2" /> Pause</> : <><FaPlay className="mr-2" /> Start</>}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-full bg-secondary-100 text-secondary-800 hover:bg-secondary-200 flex items-center justify-center transition-colors"
              >
                <FaRedo className="mr-2" /> Reset
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-3 rounded-full bg-secondary-100 text-secondary-800 hover:bg-secondary-200 flex items-center justify-center transition-colors"
              >
                <FaCog />
              </button>
            </div>
            
            {/* Current Task */}
            {timerMode === 'pomodoro' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-secondary-900 mb-2">Current Task</h3>
                <form onSubmit={handleTaskSubmit} className="flex">
                  <input
                    type="text"
                    value={currentTask}
                    onChange={(e) => setCurrentTask(e.target.value)}
                    placeholder="What are you working on?"
                    className="flex-grow px-4 py-2 border border-secondary-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={isActive && timerMode === 'pomodoro'}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                    disabled={isActive && timerMode === 'pomodoro'}
                  >
                    <FaCheck />
                  </button>
                </form>
              </div>
            )}
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="mt-8 p-4 border border-secondary-200 rounded-lg">
                <h3 className="text-lg font-medium text-secondary-900 mb-4">Timer Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Pomodoro Length (minutes)
                    </label>
                    <input
                      type="number"
                      name="pomodoro"
                      min="1"
                      max="60"
                      value={settings.pomodoro}
                      onChange={handleSettingChange}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Short Break Length (minutes)
                    </label>
                    <input
                      type="number"
                      name="shortBreak"
                      min="1"
                      max="30"
                      value={settings.shortBreak}
                      onChange={handleSettingChange}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Long Break Length (minutes)
                    </label>
                    <input
                      type="number"
                      name="longBreak"
                      min="1"
                      max="60"
                      value={settings.longBreak}
                      onChange={handleSettingChange}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Long Break Interval
                    </label>
                    <input
                      type="number"
                      name="longBreakInterval"
                      min="1"
                      max="10"
                      value={settings.longBreakInterval}
                      onChange={handleSettingChange}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoStartBreaks"
                      name="autoStartBreaks"
                      checked={settings.autoStartBreaks}
                      onChange={handleSettingChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="autoStartBreaks" className="ml-2 block text-sm text-secondary-700">
                      Auto-start Breaks
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoStartPomodoros"
                      name="autoStartPomodoros"
                      checked={settings.autoStartPomodoros}
                      onChange={handleSettingChange}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                    />
                    <label htmlFor="autoStartPomodoros" className="ml-2 block text-sm text-secondary-700">
                      Auto-start Pomodoros
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {/* Stats Panel */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-secondary-900">Today's Progress</h3>
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="text-primary-600 hover:text-primary-800"
              >
                <FaHistory />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-secondary-700">Completed Pomodoros</span>
                <span className="text-sm font-medium text-secondary-900">{cycles} / {settings.dailyGoal}</span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${Math.min(100, (cycles / settings.dailyGoal) * 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-secondary-700">Focus Time</span>
                <span className="text-sm font-medium text-secondary-900">
                  {Math.floor(cycles * settings.pomodoro / 60)}h {(cycles * settings.pomodoro) % 60}m
                </span>
              </div>
            </div>
            
            {/* Task List */}
            <div>
              <h3 className="text-md font-medium text-secondary-900 mb-2">Completed Tasks</h3>
              {taskList.length > 0 ? (
                <ul className="space-y-2">
                  {taskList.map(task => (
                    <li key={task.id} className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <span className="text-secondary-700">{task.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary-500 text-sm">No completed tasks yet</p>
              )}
            </div>
          </div>
          
          {/* Session History */}
          {showHistory && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Session History</h3>
              {sessionHistory.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {sessionHistory.map(session => (
                    <div key={session.id} className="p-3 border border-secondary-200 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-secondary-900">{session.task}</span>
                        <span className="text-sm text-secondary-500">
                          {new Date(session.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="text-sm text-secondary-700 mt-1">
                        {session.duration} minutes
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-secondary-500 text-sm">No sessions recorded yet</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Audio for timer completion */}
      <audio ref={audioRef} src="/sounds/timer-complete.mp3" />
    </div>
  );
};

export default StudyTimer; 