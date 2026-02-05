import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Navbar from "./components/Navbar/Navbar";
import Settings from "./settings/Settings";
import PromptEngineeringStudio from "./components/PromptEngineeringStudio/PromptEngineeringStudio";
import TestPrompt from "./components/TestPrompt/TestPrompt";
import "./App.css";
import { resetSession } from "./apiUtils";

const theme = extendTheme({
  fonts: {
    heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  styles: {
    global: {
      body: {
        bg: "#fafafa",
        color: "#1a1a1a",
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          borderRadius: "4px",
          border: "1px solid #e5e5e5",
        },
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "4px",
        fontWeight: "500",
        fontSize: "sm",
        letterSpacing: "-0.01em",
      },
      sizes: {
        sm: {
          fontSize: "xs",
          px: 3,
          py: 2,
          h: "32px",
        },
        md: {
          fontSize: "sm",
          px: 4,
          py: 2.5,
          h: "40px",
        },
        lg: {
          fontSize: "sm",
          px: 6,
          py: 3,
          h: "48px",
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: "4px",
        },
      },
    },
    Textarea: {
      baseStyle: {
        borderRadius: "4px",
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: "4px",
        },
      },
    },
  },
});

function App() {
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [pollingInterval, setPollingInterval] = useState(200);
  const [systemMessage, setSystemMessage] = useState("");

  return (
    <ChakraProvider theme={theme}>
      <Router>
        <div className="App">
          <Navbar onResetSession={() => () => resetSession(apiEndpoint, () => {})} />
          <Routes>
            <Route
              path="/settings"
              element={
                <Settings
                  apiEndpoint={apiEndpoint}
                  pollingInterval={pollingInterval}
                  setApiEndpoint={setApiEndpoint}
                  setPollingInterval={setPollingInterval}
                  systemMessage={systemMessage}
                  setSystemMessage={setSystemMessage}
                />
              }
            />
            <Route
              path="/chat"
              element={<TestPrompt apiEndpoint={apiEndpoint} />}
            />
            <Route
              path="/"
              element={
                <PromptEngineeringStudio
                  apiEndpoint={apiEndpoint}
                  setApiEndpoint={setApiEndpoint}
                />
              }
            />
          </Routes>
        </div>
      </Router>
    </ChakraProvider>
  );
}

export default App;
