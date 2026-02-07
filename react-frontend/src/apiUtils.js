export const fetchSystemMessage = async (apiEndpoint) => {
	try {
	  const response = await fetch(`${apiEndpoint}/api/system-message`);
	  const data = await response.json();
	  return data.message;
	} catch (error) {
	  console.error(error);
	}
};

export const resetSession = async (apiEndpoint, setMessages) => {
	setMessages([]);
	await fetch(`${apiEndpoint}/api/messages/clear`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
	});
};

export const pollResult = async (apiEndpoint, result_id, messageID, pollingInterval, setMessages) => {
    try {
      const response = await fetch(`${apiEndpoint}/api/results/${result_id}`);
      const data = await response.json();

      addMessage(data.message, "ai", setMessages, messageID);
      if (!data.completed) {
        setTimeout(() => pollResult(apiEndpoint, result_id, messageID, pollingInterval, setMessages), pollingInterval);
      }
    } catch (error) {
      console.error(error);
    }
};

export const callGpt = async (apiEndpoint, content, pollingInterval, setMessage, setMessages) => {
    // Store the last message ID
    addMessage(content, "user", setMessages);
    setMessage("");

    try {
      const response = await fetch(`${apiEndpoint}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: encodeURIComponent(content),
          sender: "User",
        }),
      });

      const data = await response.json();
      const result_id = data.result_id;
      const messageID = addMessage("", "AI", setMessages);
	  console.log("messageId: " + messageID)
      setTimeout(() => pollResult(apiEndpoint, result_id, messageID, pollingInterval, setMessages));
    } catch (error) {
      console.error(error);
    }
};

export const addMessage = (content, sender, setMessages, message_id = null) => {
	console.log(message_id)
    const timestamp = new Date().toLocaleTimeString();
    if (message_id) {
      setMessages((prevMessages) =>
        prevMessages.map((message) => {
          if (message.id === message_id) {
            return { ...message, content, timestamp };
          }
          return message;
        })
      );
	  return message_id
    } else {
      const newMessage = { content, sender, timestamp, id: Date.now() };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      return newMessage.id;
    }
};

// Prompt versioning APIs
export const fetchPrompts = async (apiEndpoint) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/prompts`);
		const data = await response.json();
		return data.prompts;
	} catch (error) {
		console.error(error);
		return [];
	}
};

export const fetchActiveVersions = async (apiEndpoint) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/prompts/active`);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
		return { staging: null, prod: null };
	}
};

export const setActiveVersion = async (apiEndpoint, environment, version) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/prompts/active`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				environment,
				version,
			}),
		});
		const data = await response.json();
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

// Eval APIs
export const runEval = async (apiEndpoint, version) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/evals/run`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ version }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || data.error || 'Failed to run eval');
		}
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const fetchEvalScores = async (apiEndpoint) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/evals/scores`);
		const data = await response.json();
		return data.scores;
	} catch (error) {
		console.error(error);
		return {};
	}
};

// Publish API
export const publishPrompt = async (apiEndpoint, version) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/prompts/publish`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ version }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.message || data.error || 'Failed to publish');
		}
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const createPrompt = async (apiEndpoint, name, prompt, version = null) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/prompts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, prompt, version }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || 'Failed to create prompt');
		}
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

export const updatePrompt = async (apiEndpoint, version, name, prompt) => {
	try {
		const response = await fetch(`${apiEndpoint}/api/prompts/${version}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ name, prompt }),
		});
		const data = await response.json();
		if (!response.ok) {
			throw new Error(data.error || 'Failed to update prompt');
		}
		return data;
	} catch (error) {
		console.error(error);
		throw error;
	}
};

