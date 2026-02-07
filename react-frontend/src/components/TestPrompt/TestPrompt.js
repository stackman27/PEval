import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  Button,
  Select,
  FormControl,
  Textarea,
  Badge,
  useToast,
  Divider,
  Flex,
  IconButton,
  useColorModeValue,
  Avatar,
  Spinner,
  Grid,
} from "@chakra-ui/react";
import { FiSend, FiRefreshCw, FiMessageSquare } from "react-icons/fi";
import { fetchPrompts, fetchActiveVersions, callGpt, resetSession } from "../../apiUtils";

function TestPrompt({ apiEndpoint }) {
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptVersion, setSelectedPromptVersion] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pollingInterval] = useState(200);
  const chatEndRef = useRef(null);
  const toast = useToast();

  // Crisp white/gray theme

  useEffect(() => {
    if (apiEndpoint) {
      loadPrompts();
      loadActiveVersions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiEndpoint]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadPrompts = async () => {
    try {
      const promptsList = await fetchPrompts(apiEndpoint);
      // Deduplicate prompts by version to prevent duplicate keys
      const uniquePrompts = [];
      const seenVersions = new Set();
      for (const prompt of promptsList || []) {
        if (prompt && prompt.version && !seenVersions.has(prompt.version)) {
          uniquePrompts.push(prompt);
          seenVersions.add(prompt.version);
        }
      }
      setPrompts(uniquePrompts);
      if (uniquePrompts.length > 0 && !selectedPromptVersion) {
        // Auto-select staging version if available
        const versions = await fetchActiveVersions(apiEndpoint);
        if (versions.staging) {
          setSelectedPromptVersion(versions.staging);
          const prompt = uniquePrompts.find((p) => p.version === versions.staging);
          if (prompt) setSelectedPrompt(prompt);
        } else if (uniquePrompts.length > 0) {
          setSelectedPromptVersion(uniquePrompts[0].version);
          setSelectedPrompt(uniquePrompts[0]);
        }
      }
    } catch (error) {
      console.error("Failed to load prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        status: "error",
        duration: 3000,
      });
    }
  };

  const loadActiveVersions = async () => {
    try {
      const versions = await fetchActiveVersions(apiEndpoint);
      // Update selected prompt if staging version changes
      if (versions.staging && versions.staging !== selectedPromptVersion) {
        const prompt = prompts.find((p) => p.version === versions.staging);
        if (prompt) {
          setSelectedPromptVersion(versions.staging);
          setSelectedPrompt(prompt);
        }
      }
    } catch (error) {
      console.error("Failed to load active versions:", error);
    }
  };

  const handlePromptChange = (e) => {
    const version = e.target.value;
    setSelectedPromptVersion(version);
    const prompt = prompts.find((p) => p.version === version);
    setSelectedPrompt(prompt);
    // Reset chat when switching prompts
    handleReset();
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !selectedPromptVersion) {
      toast({
        title: "Warning",
        description: "Please select a prompt version and enter a message",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Set the active version temporarily for this test
      await fetch(`${apiEndpoint}/api/prompts/active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          environment: "staging",
          version: selectedPromptVersion,
        }),
      });

      // Call GPT with the selected prompt
      // Note: callGpt adds the user message and manages AI responses via setMessages
      await callGpt(apiEndpoint, inputMessage, pollingInterval, setInputMessage, setMessages, setIsLoading);
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to send message",
        status: "error",
        duration: 3000,
      });
    }
  };

  const handleReset = async () => {
    try {
      await resetSession(apiEndpoint, setMessages);
      toast({
        title: "Success",
        description: "Chat session reset",
        status: "success",
        duration: 2000,
      });
    } catch (error) {
      console.error("Failed to reset session:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box minH="100vh" bg="#fafafa" pb={8}>
      <Container maxW="6xl" pt={8}>
        {/* Header */}
        <Card mb={6} bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5">
          <CardBody p={6}>
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
              <HStack spacing={4}>
                <Box
                  bg="#1a1a1a"
                  p={3}
                  borderRadius="4px"
                  color="white"
                >
                  <FiMessageSquare size={20} />
                </Box>
                <Box>
                  <Heading size="lg" color="#1a1a1a" fontWeight="600" letterSpacing="-0.02em">
                    Test Your Prompt
                  </Heading>
                  <Text color="#666" fontSize="sm" fontWeight="400">
                    Test how your prompts perform with real conversations
                  </Text>
                </Box>
              </HStack>
              <HStack spacing={3}>
                <FormControl w="300px">
                  <Select
                    value={selectedPromptVersion}
                    onChange={handlePromptChange}
                    placeholder="Select prompt version..."
                    size="md"
                  >
                    {prompts.map((prompt) => (
                      <option key={prompt.version} value={prompt.version}>
                        {prompt.name} ({prompt.version})
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <IconButton
                  icon={<FiRefreshCw />}
                  onClick={handleReset}
                  aria-label="Reset chat"
                  variant="outline"
                />
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={6}>
          {/* Prompt Preview Sidebar */}
          <Card bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5" h="fit-content" position="sticky" top={4}>
            <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
              <Heading size="sm" color="#1a1a1a" fontWeight="600">Current Prompt</Heading>
            </CardHeader>
            <CardBody>
              {selectedPrompt ? (
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={1}>
                      Version
                    </Text>
                    <Badge colorScheme="purple" fontSize="sm" px={2} py={1}>
                      {selectedPrompt.version}
                    </Badge>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" mb={2}>
                      Prompt Content
                    </Text>
                    <Box
                      bg="gray.50"
                      p={4}
                      borderRadius="md"
                      border="1px solid"
                      borderColor="gray.200"
                      maxH="400px"
                      overflowY="auto"
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap" fontFamily="mono">
                        {selectedPrompt.prompt}
                      </Text>
                    </Box>
                  </Box>
                </VStack>
              ) : (
                <Text color="gray.500" textAlign="center" py={8}>
                  Select a prompt version to view
                </Text>
              )}
            </CardBody>
          </Card>

          {/* Chat Area */}
          <Card bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5" display="flex" flexDirection="column" h="calc(100vh - 200px)">
            <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
              <HStack justify="space-between">
                <Heading size="sm" color="#1a1a1a" fontWeight="600">Conversation</Heading>
                {selectedPrompt && (
                  <Badge bg="#e8f5e9" color="#2e7d32" fontSize="xs" px={2} py={1} fontWeight="600" borderRadius="2px">
                    Testing: {selectedPrompt.name}
                  </Badge>
                )}
              </HStack>
            </CardHeader>
            <CardBody flex="1" display="flex" flexDirection="column" overflow="hidden" p={0}>
              {/* Messages */}
              <Box flex="1" overflowY="auto" p={6} bg="gray.50">
                {messages.length === 0 ? (
                  <VStack spacing={4} py={12} color="gray.500">
                    <FiMessageSquare size={48} />
                    <Text fontSize="lg" fontWeight="medium">
                      Start a conversation
                    </Text>
                    <Text fontSize="sm" textAlign="center">
                      Select a prompt version and send a message to test it
                    </Text>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {messages.map((message) => (
                      <Flex
                        key={message.id}
                        justify={message.sender === "user" ? "flex-end" : "flex-start"}
                        align="flex-start"
                        gap={3}
                      >
                        {message.sender === "ai" && (
                          <Avatar size="sm" bg="purple.500" name="AI" />
                        )}
                        <Box
                          maxW="70%"
                          bg={message.sender === "user" ? "#1a1a1a" : "#f5f5f5"}
                          color={message.sender === "user" ? "white" : "#1a1a1a"}
                          p={4}
                          borderRadius="4px"
                          border={message.sender === "user" ? "none" : "1px solid #e5e5e5"}
                        >
                          <Text fontSize="sm" whiteSpace="pre-wrap">
                            {message.content}
                          </Text>
                          <Text fontSize="xs" color={message.sender === "user" ? "whiteAlpha.700" : "gray.500"} mt={2}>
                            {message.timestamp}
                          </Text>
                        </Box>
                        {message.sender === "user" && (
                          <Avatar size="sm" bg="blue.500" name="You" />
                        )}
                      </Flex>
                    ))}
                    {isLoading && (
                      <Flex justify="flex-start" align="flex-start" gap={3}>
                        <Avatar size="sm" bg="purple.500" name="AI" />
                        <Box bg="white" p={4} borderRadius="xl" boxShadow="sm">
                          <Spinner size="sm" color="purple.500" />
                        </Box>
                      </Flex>
                    )}
                    <div ref={chatEndRef} />
                  </VStack>
                )}
              </Box>

              {/* Input Area */}
              <Divider />
              <Box p={4} bg="white">
                <HStack spacing={3}>
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    rows={2}
                    resize="none"
                    isDisabled={!selectedPromptVersion || isLoading}
                  />
                  <Button
                    bg="#1a1a1a"
                    color="white"
                    _hover={{ bg: "#333" }}
                    leftIcon={<FiSend size={16} />}
                    onClick={handleSendMessage}
                    isLoading={isLoading}
                    isDisabled={!inputMessage.trim() || !selectedPromptVersion}
                    size="md"
                    borderRadius="4px"
                    fontWeight="500"
                    fontSize="sm"
                    h="40px"
                  >
                    Send
                  </Button>
                </HStack>
              </Box>
            </CardBody>
          </Card>
        </Grid>
      </Container>
    </Box>
  );
}

export default TestPrompt;
