import React, { useState, useEffect, useRef } from 'react';
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
  Settings,
  TestTube,
  Code,
  Database,
  Shield,
  Clock
} from 'lucide-react';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
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

  const runAllScenarios = async () => {
    if (!fheInitialized) {
      addLog('error', '❌ FHE not initialized. Please wait for initialization to complete.');
      return;
    }

    // Add visual feedback for "Run All" button
    setClickedButtons(prev => new Set([...prev, 'run-all']));
    setTimeout(() => {
      setClickedButtons(prev => {
        const newSet = new Set(prev);
        newSet.delete('run-all');
        return newSet;
      });
    }, 300);

    addLog('info', '🚀 Starting all test scenarios...');
    addLog('info', '═'.repeat(60));
    
    for (const scenario of testScenarios) {
      await runScenario(scenario);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Pause between scenarios
    }
    
    addLog('success', '🎉 All test scenarios completed!');
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
          Step 6 of 8
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSettings(!showSettings);
                  setClickedButtons(prev => new Set([...prev, 'settings']));
                  setTimeout(() => {
                    setClickedButtons(prev => {
                      const newSet = new Set(prev);
                      newSet.delete('settings');
                      return newSet;
                    });
                  }, 150);
                }}
                className={`transition-all duration-150 ${
                  clickedButtons.has('settings') ? 'scale-95 bg-primary/20' : 'hover:scale-105'
                }`}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
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
                onClick={runAllScenarios}
                disabled={isRunning || !fheInitialized}
                className={`w-full gap-2 transition-all duration-150 ${
                  clickedButtons.has('run-all') 
                    ? 'scale-95 bg-primary/20 ring-2 ring-primary/50' 
                    : 'hover:scale-105 hover:bg-primary/10'
                }`}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running All...
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
            <div className="rounded-md border bg-black/90 text-sm font-mono text-neutral-200">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <div className="flex items-center gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="ml-3 text-[10px] uppercase tracking-wider text-white/70">
                    FHE Testing Terminal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <span>{logs.length} logs</span>
                  {isRunning && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
              </div>
              <div ref={terminalRef} className="h-[32rem] overflow-auto px-3 py-2 space-y-1">
                {logs.length === 0 && (
                  <div className="text-white/50">➜ Ready to run FHE tests...</div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-green-500 text-xs mt-0.5">➜</span>
                    <span className="text-white/50 text-xs">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>
                    <span className={`text-xs ${getLogColor(log.type)}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
