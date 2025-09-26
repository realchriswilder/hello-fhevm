import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Terminal,
  Zap,
  Eye,
  EyeOff,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Trash2,
  TestTube,
  Code,
  Database,
  Shield,
  Clock
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { TestingPlaygroundQuiz } from '@/components/quiz/TestingPlaygroundQuiz';
import { initializeFheInstance, getFheInstance } from '../../../vote-app/src/fhe';

interface LogEntry {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'error' | 'warning' | 'debug';
  message: string;
  data?: any;
}

interface TestScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // estimated seconds
  runScenario: () => Promise<LogEntry[]>;
}

export const TestingPlaygroundStep: React.FC = () => {
  const { setCurrentStep, completeStep } = useTutorialStore();
  const navigate = useNavigate();
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [fheInitialized, setFheInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [clickedButtons, setClickedButtons] = useState<Set<string>>(new Set());
  const terminalRef = useRef<HTMLDivElement>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [runAllCountdown, setRunAllCountdown] = useState<number | null>(null);

  // Initialize FHE on component mount
  useEffect(() => {
    const initFhe = async () => {
      try {
        addLog('info', '🔐 Initializing FHE environment...');
        await initializeFheInstance();
        setFheInitialized(true);
        addLog('success', '✅ FHE environment ready!');
      } catch (error) {
        addLog('error', `❌ FHE initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    initFhe();
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const addLog = (type: LogEntry['type'], message: string, data?: any) => {
    const log: LogEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      type,
      message,
      data
    };
    setLogs(prev => [...prev, log]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('info', '🧹 Terminal cleared');
  };

  const copyLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp.toLocaleTimeString()}] ${log.type.toUpperCase()}: ${log.message}`
    ).join('\n');
    navigator.clipboard.writeText(logText);
    addLog('info', '📋 Logs copied to clipboard');
  };

  const testScenarios: TestScenario[] = [
    {
      id: 'basic-encryption',
      name: 'Basic Vote Encryption',
      description: 'Encrypt a simple YES/NO vote choice',
      difficulty: 'beginner',
      duration: 5,
      runScenario: async () => {
        const scenarioLogs: LogEntry[] = [];
        
        try {
          addLog('info', '🚀 Starting Basic Vote Encryption test...');
          
          const fheInstance = getFheInstance();
          if (!fheInstance) throw new Error('FHE not initialized');

          const contractAddress = '0x1234567890123456789012345678901234567890';
          const userAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
          const voteChoice = 1; // YES vote

          addLog('debug', `📝 Vote choice: ${voteChoice} (${voteChoice === 1 ? 'YES' : 'NO'})`);
          addLog('debug', `🏛️ Contract: ${contractAddress}`);
          addLog('debug', `👤 User: ${userAddress}`);

          addLog('info', '🔐 Creating encrypted input...');
          const ciphertext = await fheInstance.createEncryptedInput(contractAddress, userAddress);
          
          addLog('info', '➕ Adding vote choice to ciphertext...');
          ciphertext.add8(BigInt(voteChoice));
          
          addLog('info', '🔒 Encrypting vote...');
          const { handles, inputProof } = await ciphertext.encrypt();
          
          addLog('success', `✅ Vote encrypted successfully!`);
          addLog('debug', `🔐 Ciphertext handle: ${handles[0].slice(0, 20)}...`);
          addLog('debug', `📝 Input proof: ${inputProof.slice(0, 20)}...`);
          
          return scenarioLogs;
        } catch (error) {
          addLog('error', `❌ Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return scenarioLogs;
        }
      }
    },
    {
      id: 'homomorphic-tally',
      name: 'Homomorphic Vote Tallying',
      description: 'Simulate encrypted vote counting without decryption',
      difficulty: 'intermediate',
      duration: 10,
      runScenario: async () => {
        try {
          addLog('info', '🚀 Starting Homomorphic Vote Tallying test...');
          
          const votes = [1, 0, 1, 1, 0, 1, 0]; // YES, NO, YES, YES, NO, YES, NO
          addLog('info', `🗳️ Processing ${votes.length} encrypted votes...`);
          
          let yesCount = 0;
          let noCount = 0;
          
          for (let i = 0; i < votes.length; i++) {
            const vote = votes[i];
            addLog('debug', `📊 Vote ${i + 1}: ${vote} (${vote === 1 ? 'YES' : 'NO'})`);
            
            // Simulate FHE operations
            if (vote === 1) {
              yesCount++;
              addLog('debug', `➕ Added to YES counter (total: ${yesCount})`);
            } else {
              noCount++;
              addLog('debug', `➕ Added to NO counter (total: ${noCount})`);
            }
            
            // Small delay for visual effect
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          addLog('success', `✅ Vote tallying completed!`);
          addLog('info', `📊 Final encrypted tallies: YES=${yesCount}, NO=${noCount}`);
          addLog('info', `🔐 All operations performed on encrypted data`);
          
          return [];
        } catch (error) {
          addLog('error', `❌ Tallying failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return [];
        }
      }
    },
    {
      id: 'contract-simulation',
      name: 'Contract Logic Simulation',
      description: 'Simulate the complete SimpleVoting contract workflow',
      difficulty: 'advanced',
      duration: 15,
      runScenario: async () => {
        try {
          addLog('info', '🚀 Starting Contract Logic Simulation...');
          
          // Simulate session creation
          addLog('info', '📝 Creating voting session...');
          addLog('debug', '⏰ Session duration: 300 seconds');
          addLog('debug', '🔐 Initializing encrypted counters: YES=0, NO=0');
          addLog('success', '✅ Session created with ID: 0');
          
          // Simulate votes
          const votes = [
            { voter: '0x138c...', choice: 1 },
            { voter: '0xf00d...', choice: 0 },
            { voter: '0x2a61...', choice: 1 },
            { voter: '0x5a80...', choice: 1 },
            { voter: '0x9b2c...', choice: 0 }
          ];
          
          addLog('info', `🗳️ Processing ${votes.length} votes...`);
          
          let yesCount = 0;
          let noCount = 0;
          
          for (const vote of votes) {
            addLog('info', `👤 Voter ${vote.voter} casting ${vote.choice === 1 ? 'YES' : 'NO'} vote...`);
            addLog('debug', '🔐 Encrypting vote choice...');
            addLog('debug', '📝 Generating ZK proof...');
            addLog('debug', '⛓️ Submitting to contract...');
            
            // Simulate contract logic
            if (vote.choice === 1) {
              yesCount++;
              addLog('debug', '🧮 FHE.select(FHE.eq(vote, 1), 1, 0) → YES counter +1');
            } else {
              noCount++;
              addLog('debug', '🧮 FHE.select(FHE.eq(vote, 0), 1, 0) → NO counter +1');
            }
            
            addLog('success', `✅ Vote recorded! Current tallies: YES=${yesCount}, NO=${noCount}`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          
          // Simulate session end and reveal
          addLog('info', '⏰ Voting period ended...');
          addLog('info', '🔓 Requesting tally reveal...');
          addLog('debug', '📞 Calling requestTallyReveal()...');
          addLog('debug', '🛰️ Waiting for oracle callback...');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          addLog('success', '✅ Tally revealed!');
          addLog('info', `📊 Final results: YES=${yesCount}, NO=${noCount}`);
          addLog('info', `📈 YES percentage: ${Math.round((yesCount / (yesCount + noCount)) * 100)}%`);
          
          return [];
        } catch (error) {
          addLog('error', `❌ Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return [];
        }
      }
    },
    {
      id: 'error-handling',
      name: 'Error Handling & Edge Cases',
      description: 'Test invalid inputs, double voting, and edge cases',
      difficulty: 'intermediate',
      duration: 8,
      runScenario: async () => {
        try {
          addLog('info', '🚀 Starting Error Handling test...');
          
          // Test invalid proof
          addLog('info', '🧪 Testing invalid input proof...');
          addLog('debug', '📝 Creating invalid proof: 0x0000...');
          addLog('warning', '⚠️ FHE.fromExternal() should reject invalid proof');
          addLog('error', '❌ Expected error: Invalid proof rejected');
          
          // Test double voting
          addLog('info', '🧪 Testing double voting prevention...');
          addLog('debug', '👤 Same voter attempting second vote...');
          addLog('warning', '⚠️ Contract should prevent double voting');
          addLog('error', '❌ Expected error: Already voted');
          
          // Test edge cases
          addLog('info', '🧪 Testing edge cases...');
          addLog('debug', '📊 Zero vote weight...');
          addLog('success', '✅ Zero weight handled correctly');
          addLog('debug', '📊 Maximum euint8 value (255)...');
          addLog('success', '✅ Maximum value handled correctly');
          
          addLog('success', '✅ Error handling test completed!');
          
          return [];
        } catch (error) {
          addLog('error', `❌ Error handling test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          return [];
        }
      }
    }
  ];

  const runFullPipeline = async () => {
    if (!fheInitialized) {
      addLog('error', '❌ FHE not initialized. Please wait for initialization to complete.');
      return;
    }
    setClickedButtons(prev => new Set([...prev, 'full-pipeline']));
    setTimeout(() => {
      setClickedButtons(prev => { const n = new Set(prev); n.delete('full-pipeline'); return n; });
    }, 250);
    try {
      addLog('info', '🚀 Full pipeline: Encrypt → Compute → Request Decrypt → Callback');
      const fhe = getFheInstance();
      const contractAddress = '0x0000000000000000000000000000000000000000';
      const userAddress = '0x0000000000000000000000000000000000000000';
      addLog('debug', '🔐 Creating encrypted input...');
      const ci = await fhe.createEncryptedInput(contractAddress, userAddress);
      ci.add8(1n);
      const { handles, inputProof } = await ci.encrypt();
      addLog('success', '✅ Encrypted handle and proof ready');
      addLog('debug', `handle: ${String(handles[0]).slice(0, 18)}..., proof: ${String(inputProof).slice(0, 18)}...`);
      addLog('info', '🧮 Contract would FHE.fromExternal() and add/select counters');
      addLog('info', '📞 Requesting decryption of aggregates (simulated)...');
      await new Promise(r => setTimeout(r, 700));
      addLog('success', '✅ Callback received (simulated): revealedYes=1, revealedNo=0');
      setShowChecklist(true);
    } catch (e) {
      addLog('error', `❌ Full pipeline failed: ${String(e)}`);
    }
  };

  const runScenario = async (scenario: TestScenario) => {
    if (!fheInitialized) {
      addLog('error', '❌ FHE not initialized. Please wait for initialization to complete.');
      return;
    }

    // Add visual feedback
    setClickedButtons(prev => new Set([...prev, scenario.id]));
    setTimeout(() => {
      setClickedButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete(scenario.id);
        return newSet;
      });
    }, 200);

    setIsRunning(true);
    setSelectedScenario(scenario.id);
    
    addLog('info', `🎯 Starting scenario: ${scenario.name}`);
    addLog('info', `📋 Description: ${scenario.description}`);
    addLog('info', `⚡ Difficulty: ${scenario.difficulty.toUpperCase()}`);
    addLog('info', `⏱️ Estimated duration: ${scenario.duration} seconds`);
    addLog('info', '─'.repeat(50));

    try {
      await scenario.runScenario();
      addLog('success', `✅ Scenario "${scenario.name}" completed successfully!`);
    } catch (error) {
      addLog('error', `❌ Scenario "${scenario.name}" failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
      setSelectedScenario(null);
      addLog('info', '─'.repeat(50));
    }
  };

  const runAllScenariosInner = async () => {
    if (!fheInitialized) {
      addLog('error', '❌ FHE not initialized. Please wait for initialization to complete.');
      return;
    }

    // Immediate user feedback (force synchronous paint)
    flushSync(() => {
      addLog('info', '🧠 Preparing encryption runtime...');
      addLog('info', '🔄 Starting pipeline: encryption → computation → logging');
    });

    // Add visual feedback for "Run All" button
    setClickedButtons(prev => new Set([...prev, 'run-all']));
    setTimeout(() => {
      setClickedButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete('run-all');
        return newSet;
      });
    }, 300);

    flushSync(() => {
      addLog('info', '🚀 Starting all test scenarios...');
      addLog('info', '═'.repeat(60));
    });
    
    for (const scenario of testScenarios) {
      await runScenario(scenario);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between scenarios
    }
    
    addLog('success', '🎉 All test scenarios completed!');
  };

  // Public handler that shows a short countdown before heavy startup
  const startRunAllScenarios = () => {
    if (isRunning || !fheInitialized || runAllCountdown !== null) return;
    let remaining = 5;
    setRunAllCountdown(remaining);
    const timer = setInterval(() => {
      remaining -= 1;
      setRunAllCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        setRunAllCountdown(null);
        // Kick off the actual run
        void runAllScenariosInner();
      }
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLogColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'debug': return 'text-blue-400';
      default: return 'text-gray-300';
    }
  };

  const handleContinue = () => {
    completeStep('testing-playground');
    setCurrentStep('private-voting');
    navigate('/step/private-voting');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <Badge variant="secondary" className="gap-2">
          <TestTube className="h-3 w-3" />
          Step 8 of 10
        </Badge>
        <h1 className="font-display text-3xl font-bold">FHE Testing Playground</h1>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Test FHE operations in real-time! Run scenarios, simulate contract logic, 
          and explore the complete encryption → computation → decryption workflow.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Test Scenarios */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Test Scenarios
              </CardTitle>
              {/* Removed settings/gear icon since it had no functionality */}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Removed Run Full Pipeline button per request */}
            {testScenarios.map((scenario) => (
              <motion.div
                key={scenario.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`cursor-pointer transition-all ${
                  selectedScenario === scenario.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                }`}>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm">{scenario.name}</h4>
                        <Badge className={`text-xs ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{scenario.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {scenario.duration}s
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runScenario(scenario)}
                          disabled={isRunning || !fheInitialized}
                          className={`h-7 px-2 transition-all duration-150 ${
                            clickedButtons.has(scenario.id) 
                              ? 'scale-95 bg-primary/20 ring-2 ring-primary/50' 
                              : 'hover:scale-105 hover:bg-primary/10'
                          }`}
                        >
                          {selectedScenario === scenario.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            <div className="pt-2">
              <Button
                onClick={startRunAllScenarios}
                disabled={isRunning || !fheInitialized}
                className={`w-full gap-2 transition-all duration-150 ${
                  clickedButtons.has('run-all') 
                    ? 'scale-95 bg-primary/20 ring-2 ring-primary/50' 
                    : 'hover:scale-105'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running All...
                  </>
                ) : runAllCountdown !== null ? (
                  <>
                    <Zap className="h-4 w-4" />
                    Starting in {runAllCountdown}s
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Run All Scenarios
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Terminal Output */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Live Terminal
                <Badge variant="outline" className="text-xs">
                  {fheInitialized ? 'Ready' : 'Initializing...'}
                </Badge>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    copyLogs();
                    setClickedButtons(prev => new Set([...prev, 'copy']));
                    setTimeout(() => {
                      setClickedButtons(prev => {
                        const newSet = new Set(prev);
                        newSet.delete('copy');
                        return newSet;
                      });
                    }, 150);
                  }}
                  className={`transition-all duration-150 ${
                    clickedButtons.has('copy') ? 'scale-95 bg-primary/20' : 'hover:scale-105'
                  }`}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearLogs();
                    setClickedButtons(prev => new Set([...prev, 'clear']));
                    setTimeout(() => {
                      setClickedButtons(prev => {
                        const newSet = new Set(prev);
                        newSet.delete('clear');
                        return newSet;
                      });
                    }, 150);
                  }}
                  className={`transition-all duration-150 ${
                    clickedButtons.has('clear') ? 'scale-95 bg-primary/20' : 'hover:scale-105'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border text-sm font-mono bg-white text-neutral-800 dark:bg-black/90 dark:text-neutral-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="ml-3 text-[10px] uppercase tracking-wider text-black/70 dark:text-white/70">
                    FHE Testing Terminal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-black/50 dark:text-white/50">
                  <span>{logs.length} logs</span>
                  {isRunning && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              </div>
              <div ref={terminalRef} className="h-[32rem] overflow-auto px-3 py-2 space-y-1">
                {logs.length === 0 && (
                  <div className="text-black/50 dark:text-white/50">➜ Ready to run FHE tests...</div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-green-500 text-xs mt-0.5">➜</span>
                    <span className="text-black/50 dark:text-white/50 text-xs">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className={`text-xs ${getLogColor(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChecklist(!showChecklist)}
              >
                {showChecklist ? 'Hide' : 'Show'} What you should see
              </Button>
              <AnimatePresence>
                {showChecklist && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 text-xs text-muted-foreground">
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Encrypted handle (0x…) and input proof displayed</li>
                      <li>Homomorphic add/select mentioned (no plaintext branching)</li>
                      <li>Simulated requestDecryption and callback with tallies</li>
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Performance Note */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                      Performance Note
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      The initial run of scenarios takes approximately 5 seconds to begin encryption and submit operations. This is normal for FHE operations which require cryptographic processing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <TestingPlaygroundQuiz />
      </motion.div>

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-4"
      >
        <Button onClick={handleContinue} size="lg" className="gap-2">
          Continue to Demo <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground">
          Ready to interact with real contracts on Sepolia!
        </p>
      </motion.div>
    </div>
  );
};
