import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Rocket, 
  BookOpen, 
  Users, 
  Code, 
  Shield, 
  Zap,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Star,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTutorialStore } from '@/state/tutorialStore';
import { useNavigate } from 'react-router-dom';
import { FhevmQuiz } from '../quiz/FhevmQuiz';

const ReviewStep: React.FC = () => {
  const { completeStep, showCelebration, getStepNumber } = useTutorialStore();
  const navigate = useNavigate();
  const achievements = [
    {
      icon: Shield,
      title: "Client-Side Encryption",
      description: "Mastered encrypting data in the browser using FHEVM SDK",
      color: "text-blue-600"
    },
    {
      icon: Code,
      title: "Smart Contract Development",
      description: "Built confidential contracts with homomorphic operations",
      color: "text-green-600"
    },
    {
      icon: Zap,
      title: "Decryption Control",
      description: "Implemented controlled decryption with oracle callbacks",
      color: "text-purple-600"
    },
    {
      icon: Users,
      title: "Privacy-Preserving Apps",
      description: "Created applications that protect user data",
      color: "text-orange-600"
    }
  ];

  const nextSteps = [
    {
      title: "Deploy to Production",
      description: "Use Hardhat to deploy your contracts to Zama Testnet",
      icon: Rocket,
      action: "Deploy Now",
      href: "https://github.com/zama-ai/fhevm-hardhat-template"
    },
    {
      title: "Join the Community",
      description: "Connect with other FHEVM developers and get support",
      icon: Users,
      action: "Join Discord",
      href: "https://discord.gg/zama"
    },
    {
      title: "Explore Templates",
      description: "Use React, Next.js, or Vue.js templates for rapid development",
      icon: Code,
      action: "Browse Templates",
      href: "https://github.com/zama-ai/fhevm-hardhat-template"
    },
    {
      title: "Participate in Bounties",
      description: "Earn rewards by building innovative FHEVM solutions",
      icon: Trophy,
      action: "View Bounties",
      href: "https://www.zama.ai/programs/developer-program"
    }
  ];

  const advancedTopics = [
    {
      title: "Access Control Lists",
      description: "Implement sophisticated permission systems for decryption",
      difficulty: "Intermediate",
      time: "2-3 hours"
    },
    {
      title: "Threshold Decryption",
      description: "Build systems where multiple parties must agree to reveal data",
      difficulty: "Advanced",
      time: "4-6 hours"
    },
    {
      title: "Circuit Optimization",
      description: "Minimize gas costs and improve FHE operation performance",
      difficulty: "Expert",
      time: "6-8 hours"
    },
    {
      title: "DeFi Integration",
      description: "Connect FHEVM with existing DeFi protocols and infrastructure",
      difficulty: "Advanced",
      time: "8-12 hours"
    }
  ];

  const resources = [
    {
      title: "Zama Whitepaper",
      description: "Deep dive into cryptographic foundations and mathematical principles",
      type: "Research",
      href: "https://docs.zama.ai/protocol/zama-protocol-litepaper"
    },
    {
      title: "FHEVM Contracts Library",
      description: "Access pre-built confidential contracts and base templates",
      type: "Code",
      href: "https://github.com/zama-ai/fhevm-hardhat-template"
    },
    {
      title: "Zama Protocol GPT",
      description: "Official AI assistant for building FHEVM contracts and webapps using Zama's Relayer SDK",
      type: "Tool",
      href: "https://chatgpt.com/g/g-687548533b7c819185a5f992b7f48e72-zama-protocol-gpt"
    },
    {
      title: "Community Forum",
      description: "Ask questions and share knowledge with the FHEVM community",
      type: "Community",
      href: "https://forum.zama.ai"
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-orange-100 text-orange-800';
      case 'Expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Research': return 'bg-blue-100 text-blue-800';
      case 'Code': return 'bg-green-100 text-green-800';
      case 'Tool': return 'bg-purple-100 text-purple-800';
      case 'Community': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Congratulations Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4 max-w-4xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Congratulations! 🎉</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          You've successfully built your first privacy-preserving application! 
          You now understand how to encrypt data, perform computations on encrypted data, 
          and decrypt results when needed.
        </p>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              What You've Accomplished
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg border bg-card"
                >
                  <achievement.icon className={`h-6 w-6 ${achievement.color}`} />
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Your Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nextSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <step.icon className="h-6 w-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                      <Button asChild size="sm" variant="outline">
                        <a href={step.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {step.action}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Advanced Topics to Explore
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {advancedTopics.map((topic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{topic.title}</h3>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(topic.difficulty)}>
                        {topic.difficulty}
                      </Badge>
                      <Badge variant="outline">{topic.time}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Essential Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + index * 0.1 }}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{resource.title}</h3>
                    <Badge className={getTypeColor(resource.type)}>
                      {resource.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{resource.description}</p>
                  <Button asChild size="sm" variant="outline">
                    <a href={resource.href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Learn More
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Knowledge Check Quiz */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Test Your Knowledge
            </CardTitle>
            <p className="text-muted-foreground">
              Complete this quiz to verify your understanding of FHEVM concepts and identify areas for further study.
            </p>
          </CardHeader>
          <CardContent className="max-w-3xl mx-auto">
            <FhevmQuiz />
          </CardContent>
        </Card>
      </motion.div>

      {/* Mark tutorial complete */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05 }}
        className="text-center"
      >
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            completeStep('review');
            const stepNum = getStepNumber('review');
            showCelebration('review', stepNum);
            navigate('/step/review');
          }}
        >
          Complete Tutorial 100%
          <CheckCircle2 className="h-4 w-4" />
        </Button>
      </motion.div>

      {/* Final Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="text-center space-y-4 p-8 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border"
      >
        <h2 className="text-2xl font-bold">Ready to Build the Future? 🚀</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          You now have the knowledge and tools to create privacy-preserving applications that can transform industries. 
          The future of blockchain is not just transparent—it's selectively transparent, revealing only what needs to be public.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <span>Built with</span>
          <span className="text-primary font-semibold">privacy</span>
          <span>by</span>
          <a
            href="https://x.com/realchriswilder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold underline"
          >
            ChrisWilder
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default ReviewStep;
