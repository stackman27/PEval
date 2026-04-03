import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  HStack,
  Text,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Badge,
  Avatar,
  VStack,
} from "@chakra-ui/react";
import { FiMenu, FiSettings, FiMessageSquare, FiBarChart2, FiUser } from "react-icons/fi";
import PromptModal from '../Modals/PromptModal.jsx';
import "./Navbar.css";

function Navbar({ onResetSession }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "user@example.com",
    role: "Developer",
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/initial-prompts');
        const data = await response.json();
        setPrompts(data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPrompts();
  }, []);

  useEffect(() => {
    // Load user profile from localStorage so it persists across pages
    const savedProfile = localStorage.getItem("peval_user_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setUserProfile((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (e) {
        console.error("Failed to parse peval_user_profile from localStorage", e);
      }
    }
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSelectPrompt = (prompt) => {
    sendSystemMessage(prompt.prompt, "system");
    handleCloseModal();
  };

  const sendSystemMessage = async (prompt, role) => {
    try {
      const response = await fetch('http://localhost:5000/api/system-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, role }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        console.log('System message set successfully');
      } else {
        console.error('Error setting system message:', data);
      }
    } catch (error) {
      console.error('Error setting system message:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  const handleGoToSettings = () => {
    navigate("/settings");
  };

  const handleSwitchUser = () => {
    // Simple implementation: clear stored profile so user can reconfigure in Settings
    localStorage.removeItem("peval_user_profile");
    setUserProfile({
      name: "User",
      email: "user@example.com",
      role: "Developer",
    });
    navigate("/settings");
  };

  return (
    <>
      <Box
        as="nav"
        bg="white"
        borderBottom="1px solid #e5e5e5"
        px={6}
        py={4}
        position="sticky"
        top={0}
        zIndex={1000}
        boxShadow="0 1px 3px rgba(0,0,0,0.05)"
      >
        <HStack justify="space-between" align="center" maxW="7xl" mx="auto">
          {/* Logo/Brand */}
          <HStack spacing={4}>
            <Text
              fontSize="xl"
              fontWeight="700"
              color="#1a1a1a"
              letterSpacing="-0.03em"
              fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            >
              PEval
            </Text>
            <Badge
              bg="#f5f5f5"
              color="#666"
              fontSize="xs"
              px={2}
              py={0.5}
              fontWeight="500"
              borderRadius="2px"
              border="1px solid #e5e5e5"
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              Beta
            </Badge>
          </HStack>

          {/* Navigation Links */}
          <HStack spacing={1}>
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                fontWeight="500"
                fontSize="sm"
                color={isActive("/") ? "#1a1a1a" : "#666"}
                bg={isActive("/") ? "#f5f5f5" : "transparent"}
                _hover={{
                  bg: "#f5f5f5",
                  color: "#1a1a1a",
                }}
                borderRadius="4px"
                px={4}
                py={2}
                leftIcon={<FiBarChart2 size={16} />}
              >
                Studio
              </Button>
            </Link>
            <Link to="/chat">
              <Button
                variant="ghost"
                size="sm"
                fontWeight="500"
                fontSize="sm"
                color={isActive("/chat") ? "#1a1a1a" : "#666"}
                bg={isActive("/chat") ? "#f5f5f5" : "transparent"}
                _hover={{
                  bg: "#f5f5f5",
                  color: "#1a1a1a",
                }}
                borderRadius="4px"
                px={4}
                py={2}
                leftIcon={<FiMessageSquare size={16} />}
              >
                Test
              </Button>
            </Link>
            <Link to="/settings">
              <Button
                variant="ghost"
                size="sm"
                fontWeight="500"
                fontSize="sm"
                color={isActive("/settings") ? "#1a1a1a" : "#666"}
                bg={isActive("/settings") ? "#f5f5f5" : "transparent"}
                _hover={{
                  bg: "#f5f5f5",
                  color: "#1a1a1a",
                }}
                borderRadius="4px"
                px={4}
                py={2}
                leftIcon={<FiSettings size={16} />}
              >
                Settings
              </Button>
            </Link>
          </HStack>

          {/* Right side: User toggle + Actions Menu */}
          <HStack spacing={3}>
            {/* Top-bar User Toggle (persistent) */}
            <Button
              variant="ghost"
              size="sm"
              borderRadius="999px"
              px={3}
              py={2}
              onClick={handleGoToSettings}
              _hover={{ bg: "#f5f5f5" }}
              leftIcon={
                <Avatar
                  name={userProfile.name}
                  size="xs"
                  bg="#1a1a1a"
                  color="white"
                />
              }
            >
              <VStack align="flex-start" spacing={0} maxW="140px">
                <Text
                  fontSize="xs"
                  fontWeight="600"
                  color="#1a1a1a"
                  noOfLines={1}
                >
                  {userProfile.name}
                </Text>
                <Text
                  fontSize="xs"
                  color="#666"
                  noOfLines={1}
                >
                  {userProfile.role}
                </Text>
              </VStack>
            </Button>

            {/* Actions Menu (hamburger) */}
            <Menu>
              <MenuButton
                as={IconButton}
                icon={<FiMenu />}
                variant="ghost"
                size="sm"
                color="#666"
                _hover={{
                  bg: "#f5f5f5",
                  color: "#1a1a1a",
                }}
                borderRadius="4px"
              />
              <MenuList
                bg="white"
                border="1px solid #e5e5e5"
                borderRadius="4px"
                boxShadow="0 4px 12px rgba(0,0,0,0.1)"
                py={2}
                minW="220px"
              >
                {/* User section in hamburger menu */}
                <Box px={3} pb={2}>
                  <HStack spacing={2}>
                    <Avatar
                      name={userProfile.name}
                      size="sm"
                      bg="#1a1a1a"
                      color="white"
                    />
                    <VStack align="flex-start" spacing={0}>
                      <Text fontSize="sm" fontWeight="600" color="#1a1a1a">
                        {userProfile.name}
                      </Text>
                      <Text fontSize="xs" color="#666">
                        {userProfile.email}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
                <Divider my={2} borderColor="#e5e5e5" />

                <MenuItem
                  onClick={handleGoToSettings}
                  fontSize="sm"
                  fontWeight="500"
                  color="#1a1a1a"
                  _hover={{
                    bg: "#f5f5f5",
                  }}
                  py={2}
                  icon={<FiUser size={16} />}
                >
                  {/* Use a string literal to avoid any parsing issues */}
                  {"Profile & Settings"}
                </MenuItem>
                <MenuItem
                  onClick={handleSwitchUser}
                  fontSize="sm"
                  fontWeight="500"
                  color="#1a1a1a"
                  _hover={{
                    bg: "#f5f5f5",
                  }}
                  py={2}
                >
                  Switch User
                </MenuItem>

                <Divider my={2} borderColor="#e5e5e5" />

                <MenuItem
                  onClick={() => onResetSession()()}
                  fontSize="sm"
                  fontWeight="500"
                  color="#1a1a1a"
                  _hover={{
                    bg: "#f5f5f5",
                  }}
                  py={2}
                >
                  Reset Session
                </MenuItem>
                <MenuItem
                  onClick={handleOpenModal}
                  fontSize="sm"
                  fontWeight="500"
                  color="#1a1a1a"
                  _hover={{
                    bg: "#f5f5f5",
                  }}
                  py={2}
                >
                  Select Prompt
                </MenuItem>
                <Divider my={2} borderColor="#e5e5e5" />
                <MenuItem
                  fontSize="xs"
                  color="#999"
                  fontWeight="400"
                  py={2}
                  isDisabled
                >
                  Version 1.0.0
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
      </Box>
      <PromptModal
        isOpen={isModalOpen}
        prompts={prompts}
        onSelectPrompt={handleSelectPrompt}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default Navbar;
