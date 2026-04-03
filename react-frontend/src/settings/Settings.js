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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Badge,
  HStack,
  VStack,
  useToast,
  Divider,
  Avatar,
  Flex,
  Switch,
  Select,
} from "@chakra-ui/react";
import {
  FiUser,
  FiSettings,
  FiSave,
  FiKey,
  FiBell,
  FiGlobe,
  FiMail,
} from "react-icons/fi";

function Settings({
  apiEndpoint,
  pollingInterval,
  setApiEndpoint,
  setPollingInterval,
  systemMessage,
  setSystemMessage,
}) {
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "user@example.com",
    role: "Developer",
  });
  const [notifications, setNotifications] = useState({
    email: true,
    evalComplete: true,
    publishAlerts: false,
  });
  const [preferences, setPreferences] = useState({
    theme: "light",
    language: "en",
    timezone: "UTC",
  });
  const toast = useToast();

  useEffect(() => {
    // Load user settings from localStorage
    const savedProfile = localStorage.getItem("peval_user_profile");
    const savedNotifications = localStorage.getItem("peval_notifications");
    const savedPreferences = localStorage.getItem("peval_preferences");
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem("peval_user_profile", JSON.stringify(userProfile));
    toast({
      title: "Profile saved",
      description: "Your profile has been updated",
      status: "success",
      duration: 3000,
      position: "top-right",
    });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem("peval_notifications", JSON.stringify(notifications));
    toast({
      title: "Notifications saved",
      description: "Your notification preferences have been updated",
      status: "success",
      duration: 3000,
      position: "top-right",
    });
  };

  const handleSavePreferences = () => {
    localStorage.setItem("peval_preferences", JSON.stringify(preferences));
    toast({
      title: "Preferences saved",
      description: "Your preferences have been updated",
      status: "success",
      duration: 3000,
      position: "top-right",
    });
  };

  const handleSaveAppSettings = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${apiEndpoint}/api/system-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: systemMessage,
        }),
      });
      // Save to localStorage for this user
      localStorage.setItem(`peval_app_settings_${userProfile.email}`, JSON.stringify({
        apiEndpoint,
        pollingInterval,
        systemMessage,
      }));
      toast({
        title: "Settings saved",
        description: "Your application settings have been saved",
        status: "success",
        duration: 3000,
        position: "top-right",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        status: "error",
        duration: 3000,
        position: "top-right",
      });
    }
  };

  return (
    <Box minH="100vh" bg="#fafafa" pb={8}>
      <Container maxW="6xl" pt={8}>
        {/* Header */}
        <Card mb={6} bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5">
          <CardBody p={6}>
            <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={6}>
              <HStack spacing={4}>
                <Box bg="#1a1a1a" p={3} borderRadius="4px" color="white">
                  <FiSettings size={24} />
                </Box>
                <Box>
                  <Heading size="lg" color="#1a1a1a" fontWeight="600" letterSpacing="-0.02em">
                    Settings
                  </Heading>
                  <Text color="#666" fontSize="sm" fontWeight="400">
                    Manage your account and application preferences
                  </Text>
                </Box>
              </HStack>
              <HStack spacing={3}>
                <Avatar name={userProfile.name} bg="#1a1a1a" size="md" />
                <VStack align="start" spacing={0}>
                  <Text fontSize="sm" fontWeight="600" color="#1a1a1a">
                    {userProfile.name}
                  </Text>
                  <Text fontSize="xs" color="#666">
                    {userProfile.email}
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        {/* Settings Tabs */}
        <Card bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.1)" borderRadius="4px" border="1px solid #e5e5e5">
          <Tabs>
            <TabList px={6} pt={4} borderBottom="1px solid #e5e5e5">
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiUser />
                  <Text ml={2}>Profile</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiSettings />
                  <Text ml={2}>Application</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiBell />
                  <Text ml={2}>Notifications</Text>
                </HStack>
              </Tab>
              <Tab fontWeight="500" fontSize="sm" color="#666" _selected={{ color: "#1a1a1a", borderBottom: "2px solid #1a1a1a" }} borderRadius="0">
                <HStack>
                  <FiGlobe />
                  <Text ml={2}>Preferences</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Profile Tab */}
              <TabPanel>
                <Box p={6}>
                  <Card bg="white" border="1px solid #e5e5e5" borderRadius="4px" mb={6}>
                    <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
                      <Heading size="md" color="#1a1a1a" fontWeight="600">User Profile</Heading>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch" maxW="600px">
                        <HStack spacing={4}>
                          <Avatar name={userProfile.name} bg="#1a1a1a" size="xl" />
                          <VStack align="start" spacing={1} flex="1">
                            <Text fontSize="lg" fontWeight="600" color="#1a1a1a">
                              {userProfile.name}
                            </Text>
                            <Text fontSize="sm" color="#666">
                              {userProfile.email}
                            </Text>
                            <Badge bg="#f5f5f5" color="#666" fontSize="xs" px={2} py={0.5} fontWeight="500" borderRadius="2px" border="1px solid #e5e5e5">
                              {userProfile.role}
                            </Badge>
                          </VStack>
                        </HStack>
                        <Divider borderColor="#e5e5e5" />
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Full Name</FormLabel>
                          <Input
                            value={userProfile.name}
                            onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                            borderRadius="4px"
                            borderColor="#e5e5e5"
                            _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Email Address</FormLabel>
                          <Input
                            type="email"
                            value={userProfile.email}
                            onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                            borderRadius="4px"
                            borderColor="#e5e5e5"
                            _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                          />
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Role</FormLabel>
                          <Select
                            value={userProfile.role}
                            onChange={(e) => setUserProfile({ ...userProfile, role: e.target.value })}
                            borderRadius="4px"
                            borderColor="#e5e5e5"
                            _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                          >
                            <option value="Developer">Developer</option>
                            <option value="Product Manager">Product Manager</option>
                            <option value="Data Scientist">Data Scientist</option>
                            <option value="Researcher">Researcher</option>
                            <option value="Admin">Admin</option>
                          </Select>
                        </FormControl>
                        <Button
                          bg="#1a1a1a"
                          color="white"
                          _hover={{ bg: "#333" }}
                          leftIcon={<FiSave size={16} />}
                          onClick={handleSaveProfile}
                          borderRadius="4px"
                          fontWeight="500"
                          size="md"
                          fontSize="sm"
                          h="40px"
                          w="fit-content"
                        >
                          Save Profile
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Application Settings Tab */}
              <TabPanel>
                <Box p={6}>
                  <Card bg="white" border="1px solid #e5e5e5" borderRadius="4px">
                    <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
                      <Heading size="md" color="#1a1a1a" fontWeight="600">Application Settings</Heading>
                      <Text fontSize="sm" color="#666" mt={2} fontWeight="400">
                        Configure your API endpoint and system message preferences
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <form onSubmit={handleSaveAppSettings}>
                        <VStack spacing={6} align="stretch" maxW="800px">
                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">
                              API Endpoint
                            </FormLabel>
                            <Input
                              value={apiEndpoint}
                              onChange={(e) => setApiEndpoint(e.target.value)}
                              placeholder="http://localhost:5000"
                              borderRadius="4px"
                              borderColor="#e5e5e5"
                              _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                            />
                            <Text fontSize="xs" color="#999" mt={1}>
                              The backend API endpoint for PEval
                            </Text>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">
                              Polling Interval (ms)
                            </FormLabel>
                            <Input
                              type="number"
                              value={pollingInterval}
                              onChange={(e) => setPollingInterval(parseInt(e.target.value) || 200)}
                              borderRadius="4px"
                              borderColor="#e5e5e5"
                              _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                            />
                            <Text fontSize="xs" color="#999" mt={1}>
                              How often to poll for API responses (default: 200ms)
                            </Text>
                          </FormControl>

                          <FormControl>
                            <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">
                              Default System Message
                            </FormLabel>
                            <Textarea
                              value={systemMessage}
                              onChange={(e) => setSystemMessage(e.target.value)}
                              rows={8}
                              placeholder="Enter default system message..."
                              borderRadius="4px"
                              borderColor="#e5e5e5"
                              _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                              fontFamily="mono"
                              fontSize="sm"
                            />
                            <Text fontSize="xs" color="#999" mt={1}>
                              This will be used as the default system prompt for chat interactions
                            </Text>
                          </FormControl>

                          <HStack spacing={3} justify="flex-end" pt={4}>
                            <Button
                              variant="outline"
                              borderColor="#e5e5e5"
                              color="#1a1a1a"
                              _hover={{ bg: "#f5f5f5" }}
                              borderRadius="4px"
                              fontWeight="500"
                              onClick={() => {
                                setApiEndpoint("");
                                setPollingInterval(200);
                                setSystemMessage("");
                              }}
                            >
                              Reset
                            </Button>
                            <Button
                              type="submit"
                              bg="#1a1a1a"
                              color="white"
                              _hover={{ bg: "#333" }}
                              leftIcon={<FiSave size={16} />}
                              borderRadius="4px"
                              fontWeight="500"
                              size="md"
                              fontSize="sm"
                              h="40px"
                            >
                              Save Settings
                            </Button>
                          </HStack>
                        </VStack>
                      </form>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Notifications Tab */}
              <TabPanel>
                <Box p={6}>
                  <Card bg="white" border="1px solid #e5e5e5" borderRadius="4px">
                    <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
                      <Heading size="md" color="#1a1a1a" fontWeight="600">Notification Preferences</Heading>
                      <Text fontSize="sm" color="#666" mt={2} fontWeight="400">
                        Control how and when you receive notifications
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={4} align="stretch" maxW="600px">
                        <Flex justify="space-between" align="center" p={4} bg="#fafafa" borderRadius="4px" border="1px solid #e5e5e5">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color="#1a1a1a">
                              Email Notifications
                            </Text>
                            <Text fontSize="xs" color="#666">
                              Receive notifications via email
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={notifications.email}
                            onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                            colorScheme="black"
                          />
                        </Flex>

                        <Flex justify="space-between" align="center" p={4} bg="#fafafa" borderRadius="4px" border="1px solid #e5e5e5">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color="#1a1a1a">
                              Evaluation Complete
                            </Text>
                            <Text fontSize="xs" color="#666">
                              Get notified when evaluations finish
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={notifications.evalComplete}
                            onChange={(e) => setNotifications({ ...notifications, evalComplete: e.target.checked })}
                            colorScheme="black"
                          />
                        </Flex>

                        <Flex justify="space-between" align="center" p={4} bg="#fafafa" borderRadius="4px" border="1px solid #e5e5e5">
                          <VStack align="start" spacing={0}>
                            <Text fontSize="sm" fontWeight="600" color="#1a1a1a">
                              Publish Alerts
                            </Text>
                            <Text fontSize="xs" color="#666">
                              Alert when prompts are published to production
                            </Text>
                          </VStack>
                          <Switch
                            isChecked={notifications.publishAlerts}
                            onChange={(e) => setNotifications({ ...notifications, publishAlerts: e.target.checked })}
                            colorScheme="black"
                          />
                        </Flex>

                        <Button
                          bg="#1a1a1a"
                          color="white"
                          _hover={{ bg: "#333" }}
                          leftIcon={<FiSave size={16} />}
                          onClick={handleSaveNotifications}
                          borderRadius="4px"
                          fontWeight="500"
                          size="md"
                          fontSize="sm"
                          h="40px"
                          w="fit-content"
                          mt={4}
                        >
                          Save Notifications
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>

              {/* Preferences Tab */}
              <TabPanel>
                <Box p={6}>
                  <Card bg="white" border="1px solid #e5e5e5" borderRadius="4px">
                    <CardHeader borderBottom="1px solid #e5e5e5" pb={4}>
                      <Heading size="md" color="#1a1a1a" fontWeight="600">Preferences</Heading>
                      <Text fontSize="sm" color="#666" mt={2} fontWeight="400">
                        Customize your experience
                      </Text>
                    </CardHeader>
                    <CardBody>
                      <VStack spacing={6} align="stretch" maxW="600px">
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Theme</FormLabel>
                          <Select
                            value={preferences.theme}
                            onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                            borderRadius="4px"
                            borderColor="#e5e5e5"
                            _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="system">System</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Language</FormLabel>
                          <Select
                            value={preferences.language}
                            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                            borderRadius="4px"
                            borderColor="#e5e5e5"
                            _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                          >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="zh">Chinese</option>
                          </Select>
                        </FormControl>

                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="500" color="#1a1a1a">Timezone</FormLabel>
                          <Select
                            value={preferences.timezone}
                            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                            borderRadius="4px"
                            borderColor="#e5e5e5"
                            _focus={{ borderColor: "#1a1a1a", boxShadow: "0 0 0 1px #1a1a1a" }}
                          >
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time (ET)</option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">Mountain Time (MT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PT)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Europe/Paris">Paris (CET)</option>
                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                          </Select>
                        </FormControl>

                        <Button
                          bg="#1a1a1a"
                          color="white"
                          _hover={{ bg: "#333" }}
                          leftIcon={<FiSave size={16} />}
                          onClick={handleSavePreferences}
                          borderRadius="4px"
                          fontWeight="500"
                          size="md"
                          fontSize="sm"
                          h="40px"
                          w="fit-content"
                        >
                          Save Preferences
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Card>
      </Container>
    </Box>
  );
}

export default Settings;
