import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaRedo, FaCog, FaCheck, FaHistory, FaChartBar, FaTrash, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import * as studyTaskService from '../../services/studyTaskService';

const StudyTimer = () => {
  const { currentUser } = useAuth();
  const [timerMode, setTimerMode] = useState(() => {
    // Initialize from localStorage or default to 'pomodoro'
    return localStorage.getItem('timerMode') || 'pomodoro';
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    // Initialize from localStorage or default based on mode
    const savedTime = localStorage.getItem('timeLeft');
    if (savedTime) {
      return parseInt(savedTime, 10);
    }
    // Default to 25 minutes
    return 25 * 60;
  });
  
  const [isActive, setIsActive] = useState(() => {
    // Initialize from localStorage or default to false
    return localStorage.getItem('isActive') === 'true';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [cycles, setCycles] = useState(() => {
    // Initialize from localStorage or default to 0
    return parseInt(localStorage.getItem('cycles') || '0', 10);
  });
  
  const [sessionHistory, setSessionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskStats, setTaskStats] = useState(null);
  
  // Timer settings
  const [settings, setSettings] = useState(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem('timerSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    // Default settings
    return {
      pomodoro: 25,
      shortBreak: 5,
      longBreak: 15,
      autoStartBreaks: true,
      autoStartPomodoros: false,
      longBreakInterval: 4,
      dailyGoal: 8
    };
  });
  
  // Current task
  const [currentTask, setCurrentTask] = useState(() => {
    // Initialize from localStorage or default to empty string
    return localStorage.getItem('currentTask') || '';
  });
  
  const [taskList, setTaskList] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  // Flag to track if a task was already completed for current timer
  const taskCompletedRef = useRef(false);
  
  // Create a ref to track if this is the initial mount
  const isInitialMount = useRef(true);
  
  // Add a ref to track the start time of the current session
  const sessionStartTimeRef = useRef(null);
  
  // Add state for tracking total focus time today
  const [todayFocusTime, setTodayFocusTime] = useState(() => {
    // Try to load today's focus time from localStorage
    const savedFocusTime = localStorage.getItem('todayFocusTime');
    const savedFocusDate = localStorage.getItem('focusTimeDate');
    const today = new Date().toDateString();
    
    // If we have saved focus time and it's from today, use it
    if (savedFocusTime && savedFocusDate === today) {
      return parseInt(savedFocusTime, 10);
    }
    
    // Otherwise reset to 0 for a new day
    return 0;
  });
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    fetchTaskStats();
    
    // Set document title on initial mount
    document.title = `StudyConnect - ${formatTime(timeLeft)}`;
    
    // Check if we need to reset the focus time for a new day
    const today = new Date().toDateString();
    const savedFocusDate = localStorage.getItem('focusTimeDate');
    
    if (savedFocusDate !== today) {
      // It's a new day, reset focus time
      setTodayFocusTime(0);
      localStorage.setItem('focusTimeDate', today);
      localStorage.setItem('todayFocusTime', '0');
    }
    
    // If timer was active before refresh, restart it
    if (localStorage.getItem('isActive') === 'true') {
      // If it was a pomodoro session, track the time
      if (localStorage.getItem('timerMode') === 'pomodoro') {
        sessionStartTimeRef.current = Date.now();
      }
      
      // Small delay to ensure everything is initialized
      setTimeout(() => {
        setIsActive(true);
      }, 300);
    }
  }, []);
  
  // Persist timer state and focus time to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timerMode', timerMode);
    localStorage.setItem('timeLeft', timeLeft.toString());
    localStorage.setItem('isActive', isActive.toString());
    localStorage.setItem('cycles', cycles.toString());
    localStorage.setItem('currentTask', currentTask);
    localStorage.setItem('todayFocusTime', todayFocusTime.toString());
    localStorage.setItem('focusTimeDate', new Date().toDateString());
  }, [timerMode, timeLeft, isActive, cycles, currentTask, todayFocusTime]);
  
  // Track focus time when timer is active
  useEffect(() => {
    // If starting a pomodoro session, record the start time
    if (isActive && timerMode === 'pomodoro') {
      sessionStartTimeRef.current = Date.now();
    } 
    // If stopping a pomodoro session, calculate and add the focus time
    else if (!isActive && sessionStartTimeRef.current && timerMode === 'pomodoro') {
      const focusTimeToAdd = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000 / 60);
      if (focusTimeToAdd > 0) {
        setTodayFocusTime(prev => prev + focusTimeToAdd);
      }
      sessionStartTimeRef.current = null;
    }
  }, [isActive, timerMode]);
  
  // Persist settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('timerSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Fetch tasks from the API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await studyTaskService.getUserTasks();
      if (response.success) {
        setTaskList(response.data.map(task => ({
          id: task.id,
          text: task.title,
          description: task.description,
          completed: task.completed,
          dueDate: task.dueDate,
          priority: task.priority,
          estimatedTime: task.estimatedTime,
          actualTime: task.actualTime
        })));
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch task statistics
  const fetchTaskStats = async () => {
    try {
      const response = await studyTaskService.getTaskStats();
      if (response.success) {
        setTaskStats(response.data);
        // Update cycles based on completed tasks
        setCycles(response.data.completedTasks);
      }
    } catch (error) {
      console.error('Failed to fetch task statistics:', error);
    }
  };
  
  // Set timer based on mode - but only when mode changes, not on initial render
  useEffect(() => {
    // Skip timer reset on the first render to preserve localStorage state
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    // After initial mount, when timer mode changes, reset the timer
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
    
    // Reset timeLeft when mode changes (but not on initial mount)
    setTimeLeft(time);
    
    // Update document title
    document.title = `StudyConnect - ${formatTime(time)}`;
    
    // Reset task completed flag when changing to pomodoro mode
    if (timerMode === 'pomodoro') {
      taskCompletedRef.current = false;
    }
    
    return () => {
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
    // If we're pausing a pomodoro, track the focus time
    if (isActive && timerMode === 'pomodoro' && sessionStartTimeRef.current) {
      const focusTimeToAdd = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000 / 60);
      if (focusTimeToAdd > 0) {
        setTodayFocusTime(prev => prev + focusTimeToAdd);
      }
      sessionStartTimeRef.current = null;
    }
    // If we're starting a pomodoro, set the start time
    else if (!isActive && timerMode === 'pomodoro') {
      sessionStartTimeRef.current = Date.now();
    }
    
    setIsActive(!isActive);
    
    // If starting timer and there's no current task, create a default one
    if (!isActive && !currentTask && timerMode === 'pomodoro') {
      setCurrentTask('Study Session');
    }
  };
  
  const handleReset = () => {
    // If we're resetting an active pomodoro, track the focus time
    if (isActive && timerMode === 'pomodoro' && sessionStartTimeRef.current) {
      const focusTimeToAdd = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000 / 60);
      if (focusTimeToAdd > 0) {
        setTodayFocusTime(prev => prev + focusTimeToAdd);
      }
      sessionStartTimeRef.current = null;
    }
    
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
    
    // Reset task completed flag when manually resetting timer
    if (timerMode === 'pomodoro') {
      taskCompletedRef.current = false;
    }
  };
  
  const handleTimerComplete = async () => {
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
      
      // Add completed focus time - but only if we're not already tracking it via sessionStartTimeRef
      // This prevents double counting when the timer completes naturally
      if (!sessionStartTimeRef.current) {
        setTodayFocusTime(prev => prev + settings.pomodoro);
      } else {
        // If we were tracking time with sessionStartTimeRef, just reset it
        sessionStartTimeRef.current = null;
      }
      
      // Add task to completed list if it exists and hasn't been completed yet
      if (currentTask && !taskCompletedRef.current) {
        try {
          // Set flag to prevent duplicate task creation
          taskCompletedRef.current = true;
          
          // Create a new task in the database
          const response = await studyTaskService.createTask({
            title: currentTask,
            completed: true,
            actualTime: settings.pomodoro
          });
          
          if (response.success) {
            setTaskList(prev => [...prev, {
              id: response.data.id,
              text: currentTask,
              completed: true,
              actualTime: settings.pomodoro
            }]);
            setCurrentTask('');
            
            // Refresh task stats
            fetchTaskStats();
          }
        } catch (error) {
          console.error('Failed to save completed task:', error);
          toast.error('Failed to save task');
          
          // Still add to local list even if API fails
          setTaskList(prev => [...prev, { id: Date.now(), text: currentTask, completed: true }]);
          setCurrentTask('');
        }
      }
      
      // Reset session start time since we're stopping the timer
      sessionStartTimeRef.current = null;
      
      // First stop the current timer
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Determine next break type and switch to it
      if (newCycles % settings.longBreakInterval === 0) {
        setTimerMode('longBreak');
        // Only start the break timer after a short delay to ensure the mode change is processed
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsActive(true), 300);
        }
      } else {
        setTimerMode('shortBreak');
        // Only start the break timer after a short delay to ensure the mode change is processed
        if (settings.autoStartBreaks) {
          setTimeout(() => setIsActive(true), 300);
        }
      }
    } else {
      // Break is over
      // First stop the current timer
      setIsActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      // Switch back to pomodoro mode
      setTimerMode('pomodoro');
      
      // Reset task completed flag for the new pomodoro session
      taskCompletedRef.current = false;
      
      // Only start the pomodoro timer after a short delay to ensure the mode change is processed
      if (settings.autoStartPomodoros) {
        setTimeout(() => {
          setIsActive(true);
          // Start tracking focus time for the new pomodoro
          sessionStartTimeRef.current = Date.now();
        }, 300);
      }
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
  
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!currentTask.trim()) return;
    
    try {
      if (editingTaskId) {
        // Update existing task
        const response = await studyTaskService.updateTask(editingTaskId, {
          title: currentTask
        });
        
        if (response.success) {
          setTaskList(prev => prev.map(task => 
            task.id === editingTaskId ? { ...task, text: currentTask } : task
          ));
          toast.success('Task updated successfully');
        }
        
        setEditingTaskId(null);
      } else {
        // Create new task
        const response = await studyTaskService.createTask({
          title: currentTask,
          completed: false
        });
        
        if (response.success) {
          setTaskList(prev => [...prev, {
            id: response.data.id,
            text: currentTask,
            completed: false
          }]);
          toast.success('Task created successfully');
        }
      }
      
      setCurrentTask('');
      fetchTaskStats();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error('Failed to save task');
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await studyTaskService.deleteTask(taskId);
      
      if (response.success) {
        setTaskList(prev => prev.filter(task => task.id !== taskId));
        toast.success('Task deleted successfully');
        fetchTaskStats();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };
  
  const handleEditTask = (task) => {
    setCurrentTask(task.text);
    setEditingTaskId(task.id);
  };
  
  const handleToggleTaskCompletion = async (taskId, currentStatus) => {
    try {
      const response = await studyTaskService.updateTask(taskId, {
        completed: !currentStatus
      });
      
      if (response.success) {
        setTaskList(prev => prev.map(task => 
          task.id === taskId ? { ...task, completed: !task.completed } : task
        ));
        fetchTaskStats();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
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
                  onClick={() => {
                    // Stop any running timer before switching modes
                    if (isActive) {
                      // If we're switching from an active pomodoro, track the focus time
                      if (timerMode !== 'pomodoro' && sessionStartTimeRef.current) {
                        const focusTimeToAdd = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000 / 60);
                        if (focusTimeToAdd > 0) {
                          setTodayFocusTime(prev => prev + focusTimeToAdd);
                        }
                        sessionStartTimeRef.current = null;
                      }
                      
                      setIsActive(false);
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                      }
                    }
                    setTimerMode('pomodoro');
                  }}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    timerMode === 'pomodoro' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-secondary-700 hover:bg-secondary-50'
                  } border border-secondary-300`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => {
                    // Stop any running timer before switching modes
                    if (isActive) {
                      // If we're switching from an active pomodoro, track the focus time
                      if (timerMode === 'pomodoro' && sessionStartTimeRef.current) {
                        const focusTimeToAdd = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000 / 60);
                        if (focusTimeToAdd > 0) {
                          setTodayFocusTime(prev => prev + focusTimeToAdd);
                        }
                        sessionStartTimeRef.current = null;
                      }
                      
                      setIsActive(false);
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                      }
                    }
                    setTimerMode('shortBreak');
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    timerMode === 'shortBreak' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-secondary-700 hover:bg-secondary-50'
                  } border-t border-b border-secondary-300`}
                >
                  Short Break
                </button>
                <button
                  onClick={() => {
                    // Stop any running timer before switching modes
                    if (isActive) {
                      // If we're switching from an active pomodoro, track the focus time
                      if (timerMode === 'pomodoro' && sessionStartTimeRef.current) {
                        const focusTimeToAdd = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000 / 60);
                        if (focusTimeToAdd > 0) {
                          setTodayFocusTime(prev => prev + focusTimeToAdd);
                        }
                        sessionStartTimeRef.current = null;
                      }
                      
                      setIsActive(false);
                      if (timerRef.current) {
                        clearInterval(timerRef.current);
                      }
                    }
                    setTimerMode('longBreak');
                  }}
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
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                {editingTaskId ? 'Edit Task' : 'Current Task'}
              </h3>
              <form onSubmit={handleTaskSubmit} className="flex">
                <input
                  type="text"
                  value={currentTask}
                  onChange={(e) => setCurrentTask(e.target.value)}
                  placeholder="What are you working on?"
                  className="flex-grow px-4 py-2 border border-secondary-300 rounded-l-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={isActive && timerMode === 'pomodoro' && !editingTaskId}
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-r-md hover:bg-primary-700 transition-colors"
                  disabled={isActive && timerMode === 'pomodoro' && !editingTaskId}
                >
                  <FaCheck />
                </button>
              </form>
              {editingTaskId && (
                <button 
                  onClick={() => {
                    setEditingTaskId(null);
                    setCurrentTask('');
                  }}
                  className="text-secondary-600 hover:text-secondary-800 text-sm mt-2"
                >
                  Cancel editing
                </button>
              )}
            </div>
            
            {/* Task List */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">Tasks</h3>
              {loading ? (
                <p className="text-secondary-500">Loading tasks...</p>
              ) : taskList.length > 0 ? (
                <ul className="space-y-2">
                  {taskList.map(task => (
                    <li key={task.id} className="flex items-center justify-between p-3 border border-secondary-200 rounded-lg">
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleToggleTaskCompletion(task.id, task.completed)}
                          className={`mr-3 w-5 h-5 rounded border flex items-center justify-center ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-secondary-300'
                          }`}
                        >
                          {task.completed && <FaCheck size={12} />}
                        </button>
                        <span className={`${task.completed ? 'line-through text-secondary-500' : 'text-secondary-900'}`}>
                          {task.text}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditTask(task)}
                          className="text-secondary-600 hover:text-secondary-800"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-secondary-500">No tasks yet. Add one above!</p>
              )}
            </div>
            
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
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-1">
                      Daily Goal (hours)
                    </label>
                    <input
                      type="number"
                      name="dailyGoal"
                      min="1"
                      max="24"
                      value={settings.dailyGoal}
                      onChange={handleSettingChange}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-md"
                    />
                  </div>
                  <div className="md:col-span-2 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center h-10 mt-1">
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
                      <div className="flex items-center h-10 mt-1">
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
                <span className="text-sm text-secondary-700">Completed Tasks</span>
                <span className="text-sm font-medium text-secondary-900">
                  {taskStats ? taskStats.completedTasks : 0} / {taskStats ? taskStats.totalTasks : 0}
                </span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2.5">
                <div 
                  className="bg-primary-600 h-2.5 rounded-full" 
                  style={{ width: `${taskStats && taskStats.totalTasks > 0 ? (taskStats.completedTasks / taskStats.totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-secondary-700">Focus Time</span>
                <span className="text-sm font-medium text-secondary-900">
                  {Math.floor(todayFocusTime / 60)}h {todayFocusTime % 60}m
                </span>
              </div>
              <div className="w-full bg-secondary-200 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${Math.min((todayFocusTime / (settings.dailyGoal * 60)) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-secondary-500">Goal: {settings.dailyGoal}h</span>
              </div>
            </div>
            
            {/* Completed Tasks */}
            <div>
              <h3 className="text-md font-medium text-secondary-900 mb-2">Recent Completed Tasks</h3>
              {loading ? (
                <p className="text-secondary-500 text-sm">Loading...</p>
              ) : taskList.filter(task => task.completed).length > 0 ? (
                <ul className="space-y-2">
                  {taskList
                    .filter(task => task.completed)
                    .slice(0, 5)
                    .map(task => (
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