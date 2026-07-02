import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { taskService } from '../services/api';

const Dashboard = () => {
  const { logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'ai-blueprint'

  // Manual Creation Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // Bulk AI Blueprint Form State
  const [rawPlanText, setRawPlanText] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [blueprintLoading, setBlueprintLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger inline single-task AI breakdowns
  const handleGetAISuggestions = async () => {
    if (!newTitle.trim()) return;
    setSuggestLoading(true);
    try {
      const data = await taskService.getAISuggestions(newTitle);
      setAiSuggestions(data.suggestions || []);
    } catch (err) {
      console.error("Failed getting subtasks", err);
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const createdTask = await taskService.createTask({
        title: newTitle,
        description: newDesc,
      });
      setTasks([...tasks, createdTask]);
      setNewTitle('');
      setNewDesc('');
      setAiSuggestions([]);
    } catch (err) {
      console.error("Failed to create task", err);
    }
  };

  // Trigger Master Syllabus Compilation
  const handleGenerateBlueprint = async (e) => {
    e.preventDefault();
    if (!rawPlanText.trim()) return;
    setBlueprintLoading(true);
    try {
      const generatedSchedule = await taskService.generateAISchedule(rawPlanText, startDate);
      
      // Save each generated block sequentially to backend
      const savedTasks = [];
      for (const item of generatedSchedule) {
        const saved = await taskService.createTask({
          title: item.title,
          description: item.description,
          // note: backend defaults scheduled_date if your schema doesn't capture dates yet
        });
        savedTasks.push(saved);
      }
      setTasks([...tasks, ...savedTasks]);
      setRawPlanText('');
      alert("AI has parsed your blueprint and mapped out your new tasks successfully!");
    } catch (err) {
      console.error("Failed building structured planner schedule", err);
    } finally {
      setBlueprintLoading(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updated = await taskService.updateTask(task.id, {
        is_completed: !task.is_completed,
      });
      setTasks(tasks.map(t => t.id === task.id ? updated : t));
    } catch (err) {
      console.error("Failed updating task status", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed removing task block", err);
    }
  };

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <h2>🧠 AI Study Architect Workspace</h2>
        <button onClick={logout} style={styles.logoutBtn}>Log Out</button>
      </header>

      <div style={styles.contentLayout}>
        {/* Workspace Operations Controller */}
        <section style={styles.formSection}>
          <div style={styles.tabHeaderContainer}>
            <button 
              onClick={() => setActiveTab('manual')} 
              style={{...styles.tabBtn, borderBottom: activeTab === 'manual' ? '3px solid #4f46e5' : 'none', fontWeight: activeTab === 'manual' ? 'bold' : 'normal'}}
            >
              ✍️ Task Input
            </button>
            <button 
              onClick={() => setActiveTab('ai-blueprint')} 
              style={{...styles.tabBtn, borderBottom: activeTab === 'ai-blueprint' ? '3px solid #4f46e5' : 'none', fontWeight: activeTab === 'ai-blueprint' ? 'bold' : 'normal'}}
            >
              🤖 AI Syllabus Planner
            </button>
          </div>

          {activeTab === 'manual' ? (
            <form onSubmit={handleCreateTask} style={styles.form}>
              <h3>Manual Target Settings</h3>
              <div style={styles.inputWithAction}>
                <input
                  type="text"
                  placeholder="Task Name (e.g. Study Link Mutations)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  style={styles.input}
                  required
                />
                <button 
                  type="button" 
                  onClick={handleGetAISuggestions} 
                  style={styles.inlineAiBtn}
                  disabled={!newTitle.trim() || suggestLoading}
                >
                  {suggestLoading ? 'Thinking...' : '✨ AI Suggest'}
                </button>
              </div>

              {aiSuggestions.length > 0 && (
                <div style={styles.aiBox}>
                  <h5>💡 AI Recommended Strategy (Click to apply as Note):</h5>
                  {aiSuggestions.map((suggestion, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setNewDesc(suggestion)} 
                      style={styles.suggestionLine}
                    >
                      • {suggestion}
                    </div>
                  ))}
                </div>
              )}

              <textarea
                placeholder="Description, subtasks or targeted metrics details..."
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={styles.textarea}
              />
              <button type="submit" style={styles.addBtn}>Add Custom Task Block</button>
            </form>
          ) : (
            <form onSubmit={handleGenerateBlueprint} style={styles.form}>
              <h3>Automated Syllabus Blueprinting</h3>
              <p style={styles.subtitle}>Drop messy course expectations, notes, or timelines. AI transforms it into clean individual blocks.</p>
              <textarea
                placeholder="Paste plan instructions. Ex: 'I have an economics final in three days covering Supply Curves, Market Equilibrium structures, and Elasticity calculations.'"
                value={rawPlanText}
                onChange={(e) => setRawPlanText(e.target.value)}
                style={{...styles.textarea, minHeight: '140px'}}
                required
              />
              <div style={styles.formGroup}>
                <label style={styles.label}>Schedule Start Horizon:</label>
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  style={styles.input}
                />
              </div>
              <button type="submit" style={{...styles.addBtn, backgroundColor: '#10b981'}} disabled={blueprintLoading}>
                {blueprintLoading ? 'Structuring Matrix Blocks...' : '🚀 Generate Deep AI Planner'}
              </button>
            </form>
          )}
        </section>

        {/* Real-time Dynamic Activity Log Display */}
        <section style={styles.listSection}>
          <h3>Active Master Schedule</h3>
          {loading ? (
            <p>Scanning active system records...</p>
          ) : tasks.length === 0 ? (
            <p style={styles.emptyText}>Your active queue is clear! Use an input workspace to schedule milestones.</p>
          ) : (
            <div style={styles.taskList}>
              {tasks.map((task) => (
                <div 
                  key={task.id} 
                  style={{
                    ...styles.taskCard,
                    borderLeft: task.is_completed ? '6px solid #10b981' : '6px solid #4f46e5'
                  }}
                >
                  <div style={styles.taskInfo}>
                    <h4 style={{ 
                      textDecoration: task.is_completed ? 'line-through' : 'none',
                      color: task.is_completed ? '#94a3b8' : '#0f172a'
                    }}>
                      {task.title}
                    </h4>
                    {task.description && <p style={styles.taskDesc}>{task.description}</p>}
                  </div>
                  
                  <div style={styles.actions}>
                    <button 
                      onClick={() => handleToggleComplete(task)} 
                      style={{
                        ...styles.actionBtn, 
                        backgroundColor: task.is_completed ? '#f1f5f9' : '#dcfce7',
                        color: task.is_completed ? '#64748b' : '#16a34a'
                      }}
                    >
                      {task.is_completed ? 'Undo' : 'Complete'}
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task.id)} 
                      style={{...styles.actionBtn, backgroundColor: '#fee2e2', color: '#dc2626'}}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '4rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  logoutBtn: { padding: '0.5rem 1rem', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff', cursor: 'pointer', fontWeight: '500' },
  contentLayout: { display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2rem', maxWidth: '1300px', margin: '2rem auto', padding: '0 1rem' },
  formSection: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', height: 'fit-content' },
  tabHeaderContainer: { display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' },
  tabBtn: { padding: '0.5rem 1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.95rem', color: '#475569' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  subtitle: { color: '#64748b', fontSize: '0.85rem', margin: '-0.5rem 0 0.5rem 0' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { fontSize: '0.87rem', fontWeight: '500', color: '#334155' },
  inputWithAction: { display: 'flex', gap: '0.5rem' },
  input: { flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem' },
  inlineAiBtn: { padding: '0 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', border: '1px solid #bee3f8', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  aiBox: { backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.75rem', borderRadius: '6px' },
  suggestionLine: { fontSize: '0.87rem', color: '#1e293b', cursor: 'pointer', padding: '0.25rem', borderRadius: '4px', transition: 'background 0.2s' },
  textarea: { padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '90px', fontSize: '0.95rem', fontFamily: 'inherit' },
  addBtn: { padding: '0.75rem', border: 'none', borderRadius: '6px', backgroundColor: '#4f46e5', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' },
  listSection: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  emptyText: { color: '#64748b', marginTop: '1rem', fontStyle: 'italic' },
  taskList: { display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0' },
  taskInfo: { flex: 1, paddingRight: '1rem' },
  taskDesc: { color: '#627d98', fontSize: '0.87rem', marginTop: '0.35rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  actionBtn: { padding: '0.4rem 0.8rem', border: 'none', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }
};

export default Dashboard;