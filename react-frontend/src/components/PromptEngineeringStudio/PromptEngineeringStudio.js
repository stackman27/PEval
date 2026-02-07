import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  Select,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Badge,
  HStack,
  VStack,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  CircularProgress,
  CircularProgressLabel,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  IconButton,
  Tooltip,
  Flex,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import {
  FiPlay,
  FiSettings,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiGitBranch,
  FiRefreshCw,
  FiSend,
  FiEdit,
  FiCopy,
  FiDownload,
  FiFilter,
  FiSearch,
} from "react-icons/fi";
import {
  fetchPrompts,
  fetchActiveVersions,
  setActiveVersion,
  runEval,
  fetchEvalScores,
  publishPrompt,
  createPrompt,
  updatePrompt,
} from "../../apiUtils";
import { motion } from "framer-motion";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

function PromptEngineeringStudio({ apiEndpoint, setApiEndpoint }) {
  const [prompts, setPrompts] = useState([]);
  const [activeVersions, setActiveVersions] = useState({ staging: null, prod: null });
  const [selectedStaging, setSelectedStaging] = useState("");
  const [selectedProd, setSelectedProd] = useState("");
  const [evalScores, setEvalScores] = useState({});
  const [evalResult, setEvalResult] = useState(null);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [evalVersion, setEvalVersion] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [promptEditor, setPromptEditor] = useState("");
  const [editingPrompt, setEditingPrompt] = useState(null);
  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [comparisonVersions, setComparisonVersions] = useState([]);

  const promptTemplates = [
    {
      id: "helpful-assistant",
      name: "Helpful Assistant",
      description: "General purpose assistant for everyday questions",
      prompt: "You are a helpful, friendly, and knowledgeable assistant. Provide clear, concise, and accurate responses. Be conversational but professional."
    },
    {
      id: "technical-expert",
      name: "Technical Expert",
      description: "Deep technical knowledge with code examples",
      prompt: "You are a technical expert with deep knowledge in software engineering, programming, and system design. Provide detailed, technical explanations with code examples when relevant. Be precise and thorough."
    },
    {
      id: "creative-writer",
      name: "Creative Writer",
      description: "Assist with creative writing and storytelling",
      prompt: "You are a creative writing assistant. Help users craft engaging stories, develop characters, and refine their writing style. Be imaginative, supportive, and provide constructive feedback."
    },
    {
      id: "customer-support",
      name: "Customer Support",
      description: "Empathetic customer service representative",
      prompt: "You are a customer support representative. Be empathetic, patient, and solution-oriented. Help customers resolve their issues efficiently while maintaining a friendly and professional tone."
    },
    {
      id: "code-reviewer",
      name: "Code Reviewer",
      description: "Expert code analysis and feedback",
      prompt: "You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide specific, actionable feedback with examples of improvements."
    },
    {
      id: "business-consultant",
      name: "Business Consultant",
      description: "Strategic business advice and analysis",
      prompt: "You are a business consultant with expertise in strategy, operations, and growth. Provide actionable insights, analyze business problems, and suggest practical solutions. Be professional and data-driven."
    },
    {
      id: "data-analyst",
      name: "Data Analyst",
      description: "Data analysis and insights expert",
      prompt: "You are a data analyst expert. Help users understand data, create insights, and make data-driven decisions. Explain statistical concepts clearly and provide practical analysis guidance."
    },
    {
      id: "product-manager",
      name: "Product Manager",
      description: "Product strategy and roadmap planning",
      prompt: "You are a product management expert. Help with product strategy, feature prioritization, user research, and roadmap planning. Think strategically and consider user needs and business goals."
    },
    {
      id: "blank",
      name: "Blank Template",
      description: "Start from scratch",
      prompt: ""
    }
  ];
  const toast = useToast();
  const { isOpen: isPromptModalOpen, onOpen: onPromptModalOpen, onClose: onPromptModalClose } = useDisclosure();
  const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
  const { isOpen: isEvalModalOpen, onOpen: onEvalModalOpen, onClose: onEvalModalClose } = useDisclosure();

  // Crisp white/gray theme - no gradients

  useEffect(() => {
    if (apiEndpoint) {
      loadPrompts();
      loadActiveVersions();
      loadEvalScores();
    } else {
      // Reset state when endpoint is cleared
      setPrompts([]);
      setActiveVersions({ staging: null, prod: null });
      setEvalScores({});
      setSelectedStaging("");
      setSelectedProd("");
    }
  }, [apiEndpoint]);

  const showToast = (title, description, status = "success") => {
    toast({
      title,
      description,
      status,
      duration: 5000,
      isClosable: true,
      position: "top-right",
    });
  };

  const loadPrompts = async () => {
    try {
      const promptsList = await fetchPrompts(apiEndpoint);
      setPrompts(promptsList || []);
    } catch (error) {
      console.error("Failed to load prompts:", error);
      setPrompts([]);
    }
  };

  const loadActiveVersions = async () => {
    try {
      const versions = await fetchActiveVersions(apiEndpoint);
      setActiveVersions(versions || { staging: null, prod: null });
      setSelectedStaging(versions?.staging || "");
      setSelectedProd(versions?.prod || "");
    } catch (error) {
      console.error("Failed to load active versions:", error);
      setActiveVersions({ staging: null, prod: null });
      setSelectedStaging("");
      setSelectedProd("");
    }
  };

  const loadEvalScores = async () => {
    try {
      const scores = await fetchEvalScores(apiEndpoint);
      setEvalScores(scores || {});
    } catch (error) {
      console.error("Failed to load eval scores:", error);
      setEvalScores({});
    }
  };

  const handleStagingChange = async (e) => {
    const version = e.target.value;
    setSelectedStaging(version);
    try {
      await setActiveVersion(apiEndpoint, "staging", version);
      await loadActiveVersions();
      showToast("Success", `Staging version set to ${version}`, "success");
    } catch (error) {
      console.error("Failed to set staging version:", error);
      showToast("Error", "Failed to set staging version", "error");
    }
  };

  const handleRunEval = async () => {
    if (!evalVersion) {
      showToast("Warning", "Please select a version to evaluate", "warning");
      return;
    }

    setIsRunningEval(true);
    setEvalResult(null);
    try {
      const result = await runEval(apiEndpoint, evalVersion);
      setEvalResult(result);
      await loadEvalScores();
      showToast("Success", `Evaluation completed for ${evalVersion}`, "success");
      setActiveTab(2); // Switch to Results tab
      onEvalModalOpen();
    } catch (error) {
      console.error("Failed to run eval:", error);
      showToast("Error", `Failed to run eval: ${error.message || error}`, "error");
    } finally {
      setIsRunningEval(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedStaging) {
      showToast("Warning", "Please select a staging version to publish", "warning");
      return;
    }

    if (!window.confirm(`Publish ${selectedStaging} to production?`)) {
      return;
    }

    setIsPublishing(true);
    try {
      const result = await publishPrompt(apiEndpoint, selectedStaging);
      if (result.error) {
        showToast("Error", result.message || result.error, "error");
      } else {
        showToast("Success", `Successfully published ${selectedStaging} to production!`, "success");
        await loadActiveVersions();
        await loadEvalScores();
      }
    } catch (error) {
      showToast("Error", `Failed to publish: ${error.message || error}`, "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCreatePrompt = () => {
    setNewPromptName("");
    setNewPromptContent("");
    setSelectedTemplate(null);
    setEditingPrompt(null);
    onPromptModalOpen();
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template.id);
    setNewPromptName(template.name);
    setNewPromptContent(template.prompt);
  };

  const handleEditPrompt = (prompt) => {
    setEditingPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.prompt);
    onEditModalOpen();
  };

  const handleSavePrompt = async () => {
    if (!newPromptName.trim() || !newPromptContent.trim()) {
      showToast("Warning", "Please fill in both name and prompt content", "warning");
      return;
    }

    if (!apiEndpoint) {
      showToast("Error", "Please set API endpoint in Settings", "error");
      return;
    }

    try {
      if (editingPrompt) {
        // Update existing prompt
        await updatePrompt(apiEndpoint, editingPrompt.version, newPromptName.trim(), newPromptContent.trim());
        showToast("Success", "Prompt updated successfully!", "success");
      } else {
        // Create new prompt
        await createPrompt(apiEndpoint, newPromptName.trim(), newPromptContent.trim());
        showToast("Success", "Prompt created successfully! You can now use it in Test Your Prompt.", "success");
      }
      
      // Close modals and reset form
      onPromptModalClose();
      onEditModalClose();
      setEditingPrompt(null);
      setSelectedTemplate(null);
      setNewPromptName("");
      setNewPromptContent("");
      
      // Reload prompts to show the new one
      await loadPrompts();
    } catch (error) {
      console.error("Failed to save prompt:", error);
      showToast("Error", error.message || "Failed to save prompt", "error");
    }
  };

  const handleCopyReport = () => {
    if (evalResult && evalResult.markdown) {
      navigator.clipboard.writeText(evalResult.markdown);
      showToast("Success", "Report copied to clipboard", "success");
    } else {
      showToast("Warning", "No report available to copy", "warning");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "green";
    if (score >= 60) return "yellow";
    return "red";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };

  const stagingScore = selectedStaging && evalScores ? evalScores[selectedStaging] : null;
  const prodScore = selectedProd && evalScores ? evalScores[selectedProd] : null;
  const scoreImprovement = stagingScore != null && prodScore != null ? stagingScore - prodScore : null;

  return (
    <Box minH="100vh" bg="#fafafa" pb={8}>
      <Container maxW="7xl" pt={8}>
        {/* Header */}
        <Card mb={6} bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5">
          <CardBody p={8}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={6}>
              <Box>
                <Heading
                  size="2xl"
                  color="#1a1a1a"
                  mb={2}
                  fontWeight="600"
                  letterSpacing="-0.02em"
                >
                  PEval Studio
                </Heading>
                <Text color="#666" fontSize="md" fontWeight="400">
                  Version, test, and deploy prompts with confidence
                </Text>
              </Box>
              <HStack spacing={4}>
                <Stat bg="#f5f5f5" p={4} borderRadius="4px" border="1px solid #e5e5e5" minW="140px">
                  <StatLabel color="#666" fontSize="xs" fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                    Active Versions
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="#1a1a1a" fontWeight="600">{prompts.length}</StatNumber>
                </Stat>
                <Stat bg="#f5f5f5" p={4} borderRadius="4px" border="1px solid #e5e5e5" minW="140px">
                  <StatLabel color="#666" fontSize="xs" fontWeight="500" textTransform="uppercase" letterSpacing="0.05em">
                    Evaluations
                  </StatLabel>
                  <StatNumber fontSize="2xl" color="#1a1a1a" fontWeight="600">{evalScores ? Object.keys(evalScores).length : 0}</StatNumber>
                </Stat>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Tabs */}
        <Card mb={6} bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5">
          <Tabs index={activeTab} onChange={setActiveTab}>
            <TabList px={6} pt={4} borderBottom="1px solid" borderColor="#e5e5e5">
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiBarChart2 />
                  <Text ml={2}>Dashboard</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiEdit />
                  <Text ml={2}>Prompts</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiGitBranch />
                  <Text ml={2}>Versions</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiPlay />
                  <Text ml={2}>Evaluation</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiBarChart2 />
                  <Text ml={2}>Results & Reports</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiSettings />
                  <Text ml={2}>Settings</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard Tab */}
              <TabPanel>
                <Box p={6}>
                  <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
                    {/* Environment Status */}
                    <Card>
                      <CardHeader>
                        <Heading size="lg">Environment Status</Heading>
                      </CardHeader>
                      <CardBody>
                        <HStack spacing={8} justify="center" align="center" flexWrap="wrap">
                          <VStack spacing={4}>
                            <Badge colorScheme="yellow" fontSize="md" px={3} py={1}>
                              STAGING
                            </Badge>
                            {activeVersions.staging && (
                              <Badge variant="outline" fontSize="sm">
                                {activeVersions.staging}
                              </Badge>
                            )}
                            {stagingScore !== null && (
                              <>
                                <CircularProgress
                                  value={stagingScore}
                                  color={getScoreColor(stagingScore)}
                                  size="120px"
                                  thickness="8px"
                                >
                                  <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                                    {stagingScore != null ? stagingScore.toFixed(1) : "N/A"}
                                  </CircularProgressLabel>
                                </CircularProgress>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                                  {getScoreLabel(stagingScore)}
                                </Text>
                              </>
                            )}
                          </VStack>
                          <Text fontSize="4xl" color="gray.400">
                            →
                          </Text>
                          <VStack spacing={4}>
                            <Badge colorScheme="green" fontSize="md" px={3} py={1}>
                              PRODUCTION
                            </Badge>
                            {activeVersions.prod && (
                              <Badge variant="outline" fontSize="sm">
                                {activeVersions.prod}
                              </Badge>
                            )}
                            {prodScore !== null && (
                              <>
                                <CircularProgress
                                  value={prodScore}
                                  color={getScoreColor(prodScore)}
                                  size="120px"
                                  thickness="8px"
                                >
                                  <CircularProgressLabel fontSize="2xl" fontWeight="bold">
                                    {prodScore != null ? prodScore.toFixed(1) : "N/A"}
                                  </CircularProgressLabel>
                                </CircularProgress>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase">
                                  {getScoreLabel(prodScore)}
                                </Text>
                              </>
                            )}
                          </VStack>
                        </HStack>
                        {scoreImprovement !== null && (
                          <Box mt={6} textAlign="center">
                            <Badge
                              colorScheme={scoreImprovement > 0 ? "green" : "red"}
                              fontSize="md"
                              px={4}
                              py={2}
                            >
                              <HStack>
                                {scoreImprovement > 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                                <Text>
                                  {scoreImprovement > 0 ? "+" : ""}
                                  {scoreImprovement != null ? scoreImprovement.toFixed(1) : "0"} point improvement
                                </Text>
                              </HStack>
                            </Badge>
                          </Box>
                        )}
                      </CardBody>
                    </Card>

                    {/* Quick Actions */}
                    <Card>
                      <CardHeader>
                        <Heading size="md">Quick Actions</Heading>
                      </CardHeader>
                      <CardBody>
                        <VStack spacing={3}>
                          <Button
                            colorScheme="purple"
                            leftIcon={<FiPlay />}
                            size="lg"
                            w="100%"
                            onClick={() => setActiveTab(2)}
                          >
                            Run Evaluation
                          </Button>
                          <Button
                            variant="outline"
                            colorScheme="purple"
                            leftIcon={<FiGitBranch />}
                            size="lg"
                            w="100%"
                            onClick={() => setActiveTab(1)}
                          >
                            Manage Versions
                          </Button>
                          {selectedStaging && stagingScore !== null && (
                            <Button
                              colorScheme="green"
                              leftIcon={<FiSend />}
                              size="lg"
                              w="100%"
                              onClick={handlePublish}
                              isLoading={isPublishing}
                              loadingText="Publishing..."
                            >
                              Publish to Prod
                            </Button>
                          )}
                        </VStack>
                      </CardBody>
                    </Card>
                  </Grid>

                  {/* Version Scores Grid */}
                  <Card bg="white" border="1px solid #e5e5e5" borderRadius="4px">
                    <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color="#1a1a1a" fontWeight="600">Version Performance</Heading>
                        <HStack>
                          <IconButton icon={<FiRefreshCw />} onClick={loadEvalScores} size="sm" variant="ghost" color="#666" />
                          <IconButton icon={<FiFilter />} size="sm" variant="ghost" color="#666" />
                        </HStack>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {prompts.map((prompt) => {
                          const score = evalScores[prompt.version];
                          const scoreColor = score !== undefined ? getScoreColor(score) : "gray";
                          return (
                            <Card key={prompt.version} bg="#fafafa" border="1px solid #e5e5e5" borderRadius="4px" _hover={{ borderColor: "#999" }} transition="all 0.2s">
                              <CardBody p={4}>
                                <Flex justify="space-between" align="center" mb={3}>
                                  <VStack align="start" spacing={0}>
                                    <Text fontWeight="600" color="#1a1a1a" fontSize="sm">{prompt.name}</Text>
                                    <Text fontSize="xs" color="#666" fontWeight="400">
                                      {prompt.version}
                                    </Text>
                                  </VStack>
                                  {score !== undefined ? (
                                    <Badge 
                                      bg={scoreColor === "green" ? "#e8f5e9" : scoreColor === "yellow" ? "#fff9e6" : "#ffebee"}
                                      color={scoreColor === "green" ? "#2e7d32" : scoreColor === "yellow" ? "#f57c00" : "#c62828"}
                                      fontSize="xs" 
                                      px={2} 
                                      py={1}
                                      fontWeight="600"
                                      borderRadius="2px"
                                    >
                                      {score != null ? score.toFixed(1) : "N/A"}
                                    </Badge>
                                  ) : (
                                    <Badge bg="#f5f5f5" color="#999" fontSize="xs" px={2} py={1} fontWeight="500" borderRadius="2px" border="1px solid #e5e5e5">
                                      Not evaluated
                                    </Badge>
                                  )}
                                </Flex>
                                {score !== undefined && (
                                  <Progress
                                    value={score}
                                    bg="#e5e5e5"
                                    sx={{
                                      "& > div": {
                                        bg: scoreColor === "green" ? "#4caf50" : scoreColor === "yellow" ? "#ff9800" : "#f44336",
                                      },
                                    }}
                                    size="sm"
                                    mt={2}
                                    borderRadius="2px"
                                  />
                                )}
                              </CardBody>
                            </Card>
                          );
                        })}
                      </Grid>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Prompts Tab */}
              <TabPanel>
                <Box p={6}>
                  {/* Welcome Section */}
                  {prompts.length > 0 && (
                    <Card mb={6} bg="#f5f5f5" border="1px solid #e5e5e5" borderRadius="4px">
                      <CardBody p={4}>
                        <HStack spacing={3}>
                          <Box bg="#1a1a1a" p={2} borderRadius="4px" color="white">
                            <FiInfo size={20} />
                          </Box>
                          <Box flex="1">
                            <Text fontSize="sm" fontWeight="600" color="#1a1a1a" mb={1}>
                              Getting Started
                            </Text>
                            <Text fontSize="xs" color="#666">
                              You have {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} available. Select one to test, or create a new custom prompt.
                            </Text>
                          </Box>
                        </HStack>
                      </CardBody>
                    </Card>
                  )}
                  
                  <Card mb={6} bg="white" border="1px solid #e5e5e5" borderRadius="4px">
                    <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
                      <Flex justify="space-between" align="center">
                        <Heading size="md" color="#1a1a1a" fontWeight="600">Manage Prompts</Heading>
                        <Button
                          bg="#1a1a1a"
                          color="white"
                          _hover={{ bg: "#333" }}
                          leftIcon={<FiEdit size={14} />}
                          onClick={handleCreatePrompt}
                          borderRadius="4px"
                          fontWeight="500"
                          size="sm"
                          fontSize="xs"
                          h="32px"
                        >
                          Create New
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={4}>
                        {prompts.map((prompt) => {
                          const score = evalScores[prompt.version];
                          const isStaging = activeVersions.staging === prompt.version;
                          const isProd = activeVersions.prod === prompt.version;
                          const scoreColor = score !== undefined ? getScoreColor(score) : "gray";
                          
                          return (
                            <Card
                              key={prompt.version}
                              bg="white"
                              border="1px solid #e5e5e5"
                              borderRadius="4px"
                              _hover={{ borderColor: "#999", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                              transition="all 0.2s"
                            >
                              <CardHeader pb={3} borderBottom="1px solid #f5f5f5">
                                <Flex justify="space-between" align="start">
                                  <VStack align="start" spacing={1} flex="1">
                                    <Heading size="sm" color="#1a1a1a" fontWeight="600">{prompt.name}</Heading>
                                    <Badge bg="#f5f5f5" color="#666" fontSize="xs" px={2} py={0.5} fontWeight="500" borderRadius="2px" border="1px solid #e5e5e5">
                                      {prompt.version}
                                    </Badge>
                                  </VStack>
                                  <HStack spacing={1}>
                                    {isStaging && (
                                      <Badge bg="#fff9e6" color="#f57c00" fontSize="xs" px={2} py={0.5} fontWeight="600" borderRadius="2px" border="1px solid #ffc800">
                                        STAGING
                                      </Badge>
                                    )}
                                    {isProd && (
                                      <Badge bg="#e8f5e9" color="#2e7d32" fontSize="xs" px={2} py={0.5} fontWeight="600" borderRadius="2px" border="1px solid #58cc02">
                                        PROD
                                      </Badge>
                                    )}
                                  </HStack>
                                </Flex>
                              </CardHeader>
                              <CardBody pt={3}>
                                <Box
                                  bg="#fafafa"
                                  p={3}
                                  borderRadius="4px"
                                  mb={3}
                                  maxH="120px"
                                  overflowY="auto"
                                  border="1px solid #e5e5e5"
                                >
                                  <Text fontSize="xs" color="#666" noOfLines={4} whiteSpace="pre-wrap" lineHeight="1.6">
                                    {prompt.prompt}
                                  </Text>
                                </Box>
                                <VStack spacing={2} align="stretch">
                                  {score !== undefined ? (
                                    <HStack justify="space-between">
                                      <Text fontSize="xs" color="#666" fontWeight="500">
                                        Eval Score:
                                      </Text>
                                      <Badge
                                        bg={scoreColor === "green" ? "#e8f5e9" : scoreColor === "yellow" ? "#fff9e6" : "#ffebee"}
                                        color={scoreColor === "green" ? "#2e7d32" : scoreColor === "yellow" ? "#f57c00" : "#c62828"}
                                        fontSize="xs"
                                        px={2}
                                        py={0.5}
                                        fontWeight="600"
                                        borderRadius="2px"
                                      >
                                        {score != null ? score.toFixed(1) : "N/A"}/100
                                      </Badge>
                                    </HStack>
                                  ) : (
                                    <Text fontSize="xs" color="#999" fontWeight="400">
                                      Not evaluated
                                    </Text>
                                  )}
                                  <HStack spacing={2}>
                                    <Button
                                      size="sm"
                                      leftIcon={<FiEdit size={12} />}
                                      variant="outline"
                                      flex="1"
                                      onClick={() => handleEditPrompt(prompt)}
                                      borderColor="#e5e5e5"
                                      color="#1a1a1a"
                                      _hover={{ bg: "#f5f5f5", borderColor: "#999" }}
                                      borderRadius="4px"
                                      fontWeight="500"
                                      fontSize="xs"
                                      h="28px"
                                    >
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      leftIcon={<FiCopy size={12} />}
                                      variant="outline"
                                      flex="1"
                                      onClick={() => {
                                        navigator.clipboard.writeText(prompt.prompt);
                                        showToast("Copied", "Prompt copied to clipboard", "success");
                                      }}
                                      borderColor="#e5e5e5"
                                      color="#1a1a1a"
                                      _hover={{ bg: "#f5f5f5", borderColor: "#999" }}
                                      borderRadius="4px"
                                      fontWeight="500"
                                      fontSize="xs"
                                      h="28px"
                                    >
                                      Copy
                                    </Button>
                                  </HStack>
                                </VStack>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </Grid>
                      {prompts.length === 0 && (
                        <Box textAlign="center" py={12}>
                          <Text color="gray.500" fontSize="lg" mb={4}>
                            No prompts found
                          </Text>
                          <Button
                            bg="#1a1a1a"
                            color="white"
                            _hover={{ bg: "#333" }}
                            leftIcon={<FiEdit />}
                            onClick={handleCreatePrompt}
                            borderRadius="4px"
                            fontWeight="500"
                          >
                            Create Your First Prompt
                          </Button>
                        </Box>
                      )}
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Versions Tab */}
              <TabPanel>
                <Box p={6}>
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
                    {/* Staging */}
                    <Card>
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Staging Environment</Heading>
                          <Badge colorScheme="yellow" fontSize="sm">
                            STAGING
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <FormControl mb={4}>
                          <FormLabel>Active Version</FormLabel>
                          <Select value={selectedStaging} onChange={handleStagingChange} placeholder="Select version...">
                            {prompts.map((prompt) => (
                              <option key={prompt.version} value={prompt.version}>
                                {prompt.name} ({prompt.version})
                                {evalScores && evalScores[prompt.version] != null && ` - ${evalScores[prompt.version].toFixed(1)}/100`}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        {selectedStaging && (
                          <VStack spacing={3} align="stretch">
                            {stagingScore !== null && (
                              <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                                  Eval Score
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(stagingScore)}.500`}>
                                  {stagingScore != null ? stagingScore.toFixed(1) : "N/A"}/100
                                </Text>
                              </Box>
                            )}
                            <Badge
                              colorScheme={activeVersions.staging === selectedStaging ? "green" : "gray"}
                              fontSize="sm"
                              px={3}
                              py={1}
                              w="fit-content"
                            >
                              <HStack>
                                {activeVersions.staging === selectedStaging ? (
                                  <FiCheckCircle />
                                ) : (
                                  <FiXCircle />
                                )}
                                <Text>
                                  {activeVersions.staging === selectedStaging ? "Active" : "Not Active"}
                                </Text>
                              </HStack>
                            </Badge>
                          </VStack>
                        )}
                      </CardBody>
                    </Card>

                    {/* Production */}
                    <Card>
                      <CardHeader>
                        <Flex justify="space-between" align="center">
                          <Heading size="md">Production Environment</Heading>
                          <Badge colorScheme="green" fontSize="sm">
                            PRODUCTION
                          </Badge>
                        </Flex>
                      </CardHeader>
                      <CardBody>
                        <FormControl mb={4} isDisabled>
                          <FormLabel>Active Version</FormLabel>
                          <Select value={selectedProd} placeholder="Select version..." isDisabled>
                            {prompts.map((prompt) => (
                              <option key={prompt.version} value={prompt.version}>
                                {prompt.name} ({prompt.version})
                                {evalScores && evalScores[prompt.version] != null && ` - ${evalScores[prompt.version].toFixed(1)}/100`}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        {selectedProd && (
                          <VStack spacing={3} align="stretch">
                            {prodScore !== null && (
                              <Box>
                                <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                                  Eval Score
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(prodScore)}.500`}>
                                  {prodScore.toFixed(1)}/100
                                </Text>
                              </Box>
                            )}
                            <Badge
                              colorScheme={activeVersions.prod === selectedProd ? "green" : "gray"}
                              fontSize="sm"
                              px={3}
                              py={1}
                              w="fit-content"
                            >
                              <HStack>
                                {activeVersions.prod === selectedProd ? <FiCheckCircle /> : <FiXCircle />}
                                <Text>{activeVersions.prod === selectedProd ? "Active" : "Not Active"}</Text>
                              </HStack>
                            </Badge>
                          </VStack>
                        )}
                        <Alert status="info" mt={4} borderRadius="md">
                          <AlertIcon />
                          <Text fontSize="sm">Production can only be changed via Publish</Text>
                        </Alert>
                      </CardBody>
                    </Card>
                  </Grid>

                  {/* Publish Card */}
                  <Card>
                    <CardHeader>
                      <Heading size="lg">Publish to Production</Heading>
                    </CardHeader>
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                        <Box>
                          <Heading size="sm" mb={4}>
                            Publish Requirements
                          </Heading>
                          <VStack spacing={3} align="stretch">
                            <HStack>
                              {selectedStaging ? (
                                <FiCheckCircle color="green" />
                              ) : (
                                <FiXCircle color="red" />
                              )}
                              <Text>Staging version selected</Text>
                            </HStack>
                            <HStack>
                              {stagingScore !== null ? (
                                <FiCheckCircle color="green" />
                              ) : (
                                <FiXCircle color="red" />
                              )}
                              <Text>Evaluation completed</Text>
                            </HStack>
                            <HStack>
                              {scoreImprovement > 0 ? (
                                <FiCheckCircle color="green" />
                              ) : (
                                <FiXCircle color="red" />
                              )}
                              <Text>Score improvement verified</Text>
                            </HStack>
                          </VStack>
                        </Box>
                        <Box>
                          {selectedStaging && stagingScore !== null && (
                            <HStack
                              justify="center"
                              spacing={4}
                              p={4}
                              bg="gray.50"
                              borderRadius="lg"
                              mb={4}
                            >
                              <VStack>
                                <Text fontSize="xs" color="gray.500">
                                  Staging
                                </Text>
                                <Text fontSize="2xl" fontWeight="bold" color={`${getScoreColor(stagingScore)}.500`}>
                                  {stagingScore != null ? stagingScore.toFixed(1) : "N/A"}
                                </Text>
                              </VStack>
                              <Text fontSize="2xl" color="gray.400">
                                →
                              </Text>
                              <VStack>
                                <Text fontSize="xs" color="gray.500">
                                  Production
                                </Text>
                                <Text
                                  fontSize="2xl"
                                  fontWeight="bold"
                                  color={prodScore ? `${getScoreColor(prodScore)}.500` : "gray.400"}
                                >
                                  {prodScore ? prodScore.toFixed(1) : "N/A"}
                                </Text>
                              </VStack>
                            </HStack>
                          )}
                          <Button
                            bg="#1a1a1a"
                            color="white"
                            _hover={{ bg: "#333" }}
                            size="md"
                            w="100%"
                            leftIcon={<FiSend size={16} />}
                            onClick={handlePublish}
                            isLoading={isPublishing}
                            loadingText="Publishing..."
                            isDisabled={!selectedStaging || stagingScore === null || scoreImprovement <= 0}
                            borderRadius="4px"
                            fontWeight="500"
                            fontSize="sm"
                            h="40px"
                          >
                            Publish {selectedStaging || ""} to Production
                          </Button>
                        </Box>
                      </Grid>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Evaluation Tab */}
              <TabPanel>
                <Box p={6}>
                  <Card maxW="800px" mx="auto">
                    <CardHeader>
                      <Heading size="lg">Run Evaluation</Heading>
                      <Text color="gray.600" mt={2}>
                        Test your prompt against a suite of fixtures to measure performance
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <FormControl mb={6}>
                        <FormLabel>Select Version to Evaluate</FormLabel>
                        <Select
                          value={evalVersion}
                          onChange={(e) => setEvalVersion(e.target.value)}
                          placeholder="Choose a version..."
                        >
                          {prompts.map((prompt) => (
                            <option key={prompt.version} value={prompt.version}>
                              {prompt.name} ({prompt.version})
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      <Button
                        bg="#1a1a1a"
                        color="white"
                        _hover={{ bg: "#333" }}
                        size="md"
                        w="100%"
                        leftIcon={isRunningEval ? <CircularProgress size="16px" isIndeterminate color="white" /> : <FiPlay size={16} />}
                        onClick={handleRunEval}
                        isLoading={isRunningEval}
                        loadingText="Running Evaluation..."
                        borderRadius="4px"
                        fontWeight="500"
                        fontSize="sm"
                        h="40px"
                      >
                        Run Evaluation
                      </Button>
                      {isRunningEval && (
                        <Progress mt={4} isIndeterminate colorScheme="purple" size="sm" />
                      )}
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Results & Reports Tab */}
              <TabPanel>
                <Box p={6}>
                  {evalResult ? (
                    <VStack spacing={6} align="stretch">
                      {/* Summary Card */}
                      <Card>
                        <CardHeader>
                          <Flex justify="space-between" align="flex-start">
                            <Box>
                              <Heading size="lg" mb={2}>
                                Evaluation Results
                              </Heading>
                              <Text color="gray.600">
                                {evalResult?.summary?.prompt_name || "N/A"} ({evalResult?.summary?.prompt_version || "N/A"})
                              </Text>
                              <Text fontSize="sm" color="gray.500" mt={1}>
                                {evalResult?.summary?.timestamp || ""}
                              </Text>
                            </Box>
                            <VStack align="center" spacing={2}>
                              <Box
                                bg={`${getScoreColor(evalResult?.summary?.average_score || 0)}.100`}
                                p={4}
                                borderRadius="xl"
                                border="3px solid"
                                borderColor={`${getScoreColor(evalResult?.summary?.average_score || 0)}.400`}
                              >
                                <Text
                                  fontSize="5xl"
                                  fontWeight="extrabold"
                                  color={`${getScoreColor(evalResult?.summary?.average_score || 0)}.600`}
                                  lineHeight="1"
                                >
                                  {evalResult?.summary?.average_score != null ? evalResult.summary.average_score.toFixed(1) : "N/A"}
                                </Text>
                              </Box>
                              <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">
                                Average Score
                              </Text>
                            </VStack>
                          </Flex>
                        </CardHeader>
                        <CardBody>
                          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
                            <Card variant="outline" bg="blue.50">
                              <CardBody textAlign="center">
                                <Text fontSize="4xl" fontWeight="bold" color="blue.600">
                                  {evalResult?.summary?.total_fixtures || 0}
                                </Text>
                                <Text fontSize="sm" color="gray.600" textTransform="uppercase" mt={2}>
                                  Total Fixtures
                                </Text>
                              </CardBody>
                            </Card>
                            <Card variant="outline" bg="green.50">
                              <CardBody textAlign="center">
                                <Text
                                  fontSize="4xl"
                                  fontWeight="bold"
                                  color={`${getScoreColor(evalResult?.summary?.average_score || 0)}.600`}
                                >
                                  {evalResult?.summary?.average_score != null ? evalResult.summary.average_score.toFixed(1) : "N/A"}%
                                </Text>
                                <Text fontSize="sm" color="gray.600" textTransform="uppercase" mt={2}>
                                  Success Rate
                                </Text>
                              </CardBody>
                            </Card>
                            <Card variant="outline" bg="purple.50">
                              <CardBody textAlign="center">
                                <Text fontSize="4xl" fontWeight="bold" color="purple.600">
                                  {evalResult?.summary?.results?.filter((r) => r.score >= 80).length || 0}
                                </Text>
                                <Text fontSize="sm" color="gray.600" textTransform="uppercase" mt={2}>
                                  Excellent (≥80)
                                </Text>
                              </CardBody>
                            </Card>
                            <Card variant="outline" bg="orange.50">
                              <CardBody textAlign="center">
                                <Text fontSize="4xl" fontWeight="bold" color="orange.600">
                                  {evalResult?.summary?.results?.filter((r) => r.score < 60).length || 0}
                                </Text>
                                <Text fontSize="sm" color="gray.600" textTransform="uppercase" mt={2}>
                                  Needs Work (&lt;60)
                                </Text>
                              </CardBody>
                            </Card>
                          </Grid>

                          {/* Score Distribution */}
                          <Card variant="outline" mb={6}>
                            <CardHeader>
                              <Heading size="sm">Score Distribution</Heading>
                            </CardHeader>
                            <CardBody>
                              <VStack spacing={3} align="stretch">
                                {[
                                  { label: "Excellent (80-100)", min: 80, max: 100, color: "green" },
                                  { label: "Good (60-79)", min: 60, max: 79, color: "yellow" },
                                  { label: "Fair (40-59)", min: 40, max: 59, color: "orange" },
                                  { label: "Poor (0-39)", min: 0, max: 39, color: "red" },
                                ].map((range) => {
                                  const count = evalResult?.summary?.results?.filter(
                                    (r) => r.score >= range.min && r.score <= range.max
                                  ).length || 0;
                                  const percentage = evalResult?.summary?.total_fixtures ? (count / evalResult.summary.total_fixtures) * 100 : 0;
                                  return (
                                    <Box key={range.label}>
                                      <Flex justify="space-between" mb={1}>
                                        <Text fontSize="sm" fontWeight="medium">
                                          {range.label}
                                        </Text>
                                        <Text fontSize="sm" fontWeight="bold">
                                          {count} ({percentage != null ? percentage.toFixed(1) : "0"}%)
                                        </Text>
                                      </Flex>
                                      <Progress
                                        value={percentage}
                                        colorScheme={range.color}
                                        size="lg"
                                        borderRadius="full"
                                      />
                                    </Box>
                                  );
                                })}
                              </VStack>
                            </CardBody>
                          </Card>

                          {/* Detailed Results Table */}
                          <Divider my={6} />

                          <Flex justify="space-between" align="center" mb={4}>
                            <Heading size="md">Detailed Results</Heading>
                            <HStack>
                              <Button size="sm" leftIcon={<FiDownload />} variant="outline">
                                Export CSV
                              </Button>
                              <Button
                                size="sm"
                                leftIcon={<FiCopy />}
                                variant="outline"
                                onClick={handleCopyReport}
                                borderColor="#e5e5e5"
                                color="#1a1a1a"
                                _hover={{ bg: "#f5f5f5" }}
                                borderRadius="4px"
                              >
                                Copy Report
                              </Button>
                            </HStack>
                          </Flex>
                          <TableContainer>
                            <Table variant="simple" size="md">
                              <Thead bg="gray.50">
                                <Tr>
                                  <Th>ID</Th>
                                  <Th>Input</Th>
                                  <Th>Category</Th>
                                  <Th>Score</Th>
                                  <Th>Keywords Found</Th>
                                  <Th>Status</Th>
                                  <Th>Actions</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {evalResult?.summary?.results?.map((result) => (
                                  <Tr
                                    key={result.fixture_id}
                                    _hover={{ bg: "gray.50" }}
                                    cursor="pointer"
                                    onClick={() => {
                                      // Could open detailed view
                                    }}
                                  >
                                    <Td fontWeight="bold">{result.fixture_id}</Td>
                                    <Td maxW="300px">
                                      <Tooltip label={result.input}>
                                        <Text isTruncated>{result.input}</Text>
                                      </Tooltip>
                                    </Td>
                                    <Td>
                                      <Badge colorScheme="blue">{result.category}</Badge>
                                    </Td>
                                    <Td>
                                      <Badge
                                        colorScheme={getScoreColor(result.score)}
                                        fontSize="md"
                                        px={3}
                                        py={1}
                                      >
                                        {result.score != null ? result.score.toFixed(1) : "N/A"}
                                      </Badge>
                                    </Td>
                                    <Td>
                                      <Text fontSize="sm">
                                        {result.keywords_found || 0}/{result.keywords_total || 0}
                                      </Text>
                                    </Td>
                                    <Td>
                                      {result.score >= 80 ? (
                                        <FiCheckCircle color="green" size={20} />
                                      ) : (
                                        <FiXCircle color="red" size={20} />
                                      )}
                                    </Td>
                                    <Td>
                                      <IconButton
                                        icon={<FiInfo />}
                                        size="sm"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          // Show details
                                        }}
                                      />
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>
                          </TableContainer>

                          {/* Report Viewer */}
                          <Divider my={6} />

                          <Accordion allowToggle>
                            <AccordionItem>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <Heading size="sm">View Full HTML Report</Heading>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel pb={4}>
                                <Box
                                  border="1px solid"
                                  borderColor="gray.200"
                                  borderRadius="md"
                                  h="700px"
                                  overflow="hidden"
                                  boxShadow="md"
                                >
                                  <iframe
                                    srcDoc={evalResult.html}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      border: "none",
                                    }}
                                    title="Eval Report"
                                  />
                                </Box>
                              </AccordionPanel>
                            </AccordionItem>
                            <AccordionItem>
                              <AccordionButton>
                                <Box flex="1" textAlign="left">
                                  <Heading size="sm">View Markdown Report</Heading>
                                </Box>
                                <AccordionIcon />
                              </AccordionButton>
                              <AccordionPanel pb={4}>
                                <Box
                                  bg="gray.50"
                                  p={4}
                                  borderRadius="md"
                                  maxH="400px"
                                  overflow="auto"
                                  fontFamily="mono"
                                >
                                  <Code whiteSpace="pre-wrap" fontSize="sm">
                                    {evalResult.markdown}
                                  </Code>
                                </Box>
                              </AccordionPanel>
                            </AccordionItem>
                          </Accordion>
                        </CardBody>
                      </Card>
                    </VStack>
                  ) : (
                    <Card>
                      <CardBody textAlign="center" py={16}>
                        <VStack spacing={4}>
                          <FiBarChart2 size={48} color="#999" />
                          <Text fontSize="xl" color="gray.500" fontWeight="medium">
                            No evaluation results yet
                          </Text>
                          <Text color="gray.400">
                            Run an evaluation from the Evaluation tab to see detailed results here
                          </Text>
                          <Button
                            bg="#1a1a1a"
                            color="white"
                            _hover={{ bg: "#333" }}
                            leftIcon={<FiPlay size={16} />}
                            onClick={() => setActiveTab(2)}
                            mt={4}
                            borderRadius="4px"
                            fontWeight="500"
                            size="md"
                            fontSize="sm"
                            h="40px"
                          >
                            Run Evaluation
                          </Button>
                        </VStack>
                      </CardBody>
                    </Card>
                  )}
                </Box>
              </TabPanel>

              {/* Settings Tab */}
              <TabPanel>
                <Box p={6}>
                  <Card maxW="800px" mx="auto">
                    <CardHeader>
                      <Heading size="lg">Application Settings</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4}>
                        <FormControl>
                          <FormLabel>API Endpoint</FormLabel>
                          <Input
                            value={apiEndpoint}
                            onChange={(e) => setApiEndpoint(e.target.value)}
                            placeholder="http://localhost:5000"
                          />
                        </FormControl>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>

        {/* Create/Edit Prompt Modal */}
        <Modal isOpen={isPromptModalOpen || isEditModalOpen} onClose={() => { onPromptModalClose(); onEditModalClose(); setEditingPrompt(null); setSelectedTemplate(null); }} size="4xl">
          <ModalOverlay />
          <ModalContent bg="white" borderRadius="4px" border="1px solid #e5e5e5" maxH="90vh" overflowY="auto">
            <ModalHeader borderBottom="1px solid #e5e5e5" pb={4}>
              <Heading size="md" color="#1a1a1a" fontWeight="600">
                {editingPrompt ? "Edit Prompt" : "Create New Prompt"}
              </Heading>
            </ModalHeader>
            <ModalCloseButton color="#666" />
            <ModalBody pb={6} pt={6}>
              {!editingPrompt && (
                <>
                  <Box mb={6}>
                    <Text fontSize="sm" fontWeight="600" color="#1a1a1a" mb={3}>
                      Start from a template
                    </Text>
                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={3}>
                      {promptTemplates.map((template) => (
                        <Card
                          key={template.id}
                          bg={selectedTemplate === template.id ? "#f5f5f5" : "white"}
                          border="1px solid"
                          borderColor={selectedTemplate === template.id ? "#1a1a1a" : "#e5e5e5"}
                          borderRadius="4px"
                          cursor="pointer"
                          _hover={{ borderColor: "#999", bg: "#fafafa" }}
                          onClick={() => handleSelectTemplate(template)}
                          transition="all 0.2s"
                        >
                          <CardBody p={4}>
                            <VStack align="start" spacing={2}>
                              <Heading size="sm" color="#1a1a1a" fontWeight="600">
                                {template.name}
                              </Heading>
                              <Text fontSize="xs" color="#666" noOfLines={2}>
                                {template.description}
                              </Text>
                              {selectedTemplate === template.id && (
                                <Badge bg="#1a1a1a" color="white" fontSize="xs" px={2} py={0.5} borderRadius="2px" fontWeight="600">
                                  Selected
                                </Badge>
                              )}
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}
                    </Grid>
                  </Box>
                  <Divider borderColor="#e5e5e5" mb={6} />
                </>
              )}
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Prompt Name</FormLabel>
                  <Input
                    value={newPromptName}
                    onChange={(e) => setNewPromptName(e.target.value)}
                    placeholder="e.g., Customer Support Assistant"
                    borderRadius="4px"
                    borderColor="#e5e5e5"
                    _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Prompt Content</FormLabel>
                  <Textarea
                    value={newPromptContent}
                    onChange={(e) => setNewPromptContent(e.target.value)}
                    placeholder="Enter your prompt here or select a template above..."
                    rows={12}
                    borderRadius="4px"
                    borderColor="#e5e5e5"
                    _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                    fontFamily="mono"
                    fontSize="sm"
                  />
                  {selectedTemplate && selectedTemplate !== "blank" && (
                    <Text fontSize="xs" color="#666" mt={2}>
                      Template selected: {promptTemplates.find(t => t.id === selectedTemplate)?.name}. You can customize it above.
                    </Text>
                  )}
                </FormControl>
                <HStack spacing={3} justify="flex-end" pt={4}>
                  <Button
                    variant="outline"
                    onClick={() => { onPromptModalClose(); onEditModalClose(); setEditingPrompt(null); setSelectedTemplate(null); }}
                    borderColor="#e5e5e5"
                    color="#1a1a1a"
                    _hover={{ bg: "#f5f5f5" }}
                    borderRadius="4px"
                    fontWeight="500"
                    size="md"
                    fontSize="sm"
                    h="40px"
                  >
                    Cancel
                  </Button>
                  <Button
                    bg="#1a1a1a"
                    color="white"
                    _hover={{ bg: "#333" }}
                    onClick={handleSavePrompt}
                    borderRadius="4px"
                    fontWeight="500"
                    size="md"
                    fontSize="sm"
                    h="40px"
                  >
                    {editingPrompt ? "Update" : "Create"}
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Evaluation Results Modal */}
        <Modal isOpen={isEvalModalOpen} onClose={onEvalModalClose} size="6xl">
          <ModalOverlay />
          <ModalContent bg="white" borderRadius="4px" border="1px solid #e5e5e5">
            <ModalHeader borderBottom="1px solid #e5e5e5" pb={4}>
              <Heading size="md" color="#1a1a1a" fontWeight="600">Evaluation Complete</Heading>
            </ModalHeader>
            <ModalCloseButton color="#666" />
            <ModalBody pb={6}>
              {evalResult && (
                <VStack spacing={4} align="stretch">
                  <Box textAlign="center" p={6} bg="#f5f5f5" borderRadius="4px" border="1px solid #e5e5e5">
                    <Text fontSize="4xl" fontWeight="bold" color={`${getScoreColor(evalResult?.summary?.average_score || 0)}.600`}>
                      {evalResult?.summary?.average_score != null ? evalResult.summary.average_score.toFixed(1) : "N/A"}/100
                    </Text>
                    <Text color="#666" fontSize="sm" fontWeight="500">Average Score</Text>
                  </Box>
                  <Box h="600px" overflow="auto" border="1px solid #e5e5e5" borderRadius="4px">
                    <iframe
                      srcDoc={evalResult.html}
                      style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      title="Eval Report"
                    />
                  </Box>
                </VStack>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
}

export default PromptEngineeringStudio;
