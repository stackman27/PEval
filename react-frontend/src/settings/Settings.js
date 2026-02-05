import React from "react";
import "./Settings.css";

function Settings({
  apiEndpoint,
  pollingInterval,
  setApiEndpoint,
  setPollingInterval,
  systemMessage,
  setSystemMessage,
}) {
  const handleApiEndpointChange = (e) => {
    setApiEndpoint(e.target.value);
  };

  const handlePollingIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setPollingInterval(value);
    } else {
      setPollingInterval(0);
    }
  };

  const handleSystemMessageChange = (e) => {
    setSystemMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
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
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">
            Configure your API connection and default system behavior.
          </p>
        </div>
      </div>

      <form className="settings-card" onSubmit={handleSubmit}>
        <div className="settings-section">
          <h2 className="settings-section-title">API configuration</h2>
          <p className="settings-section-description">
            Set the base URL for your backend and how often to poll for results.
          </p>

          <div className="settings-field">
            <label className="settings-label" htmlFor="api-endpoint">
              API endpoint
            </label>
            <input
              id="api-endpoint"
              type="text"
              className="settings-input"
              placeholder="http://localhost:5000"
              value={apiEndpoint}
              onChange={handleApiEndpointChange}
            />
            <p className="settings-help">
              This should point to the root of your Python server.
            </p>
          </div>

          <div className="settings-field-inline">
            <div className="settings-field">
              <label
                className="settings-label"
                htmlFor="polling-interval"
              >
                Polling interval
              </label>
              <div className="settings-input-with-suffix">
                <input
                  id="polling-interval"
                  type="number"
                  min="50"
                  step="50"
                  className="settings-input"
                  value={pollingInterval}
                  onChange={handlePollingIntervalChange}
                />
                <span className="settings-input-suffix">ms</span>
              </div>
              <p className="settings-help">
                How often to check for streaming results from the server.
              </p>
            </div>
          </div>
        </div>

        <div className="settings-divider" />

        <div className="settings-section">
          <h2 className="settings-section-title">System message</h2>
          <p className="settings-section-description">
            Define the default instructions the assistant will follow at the
            start of each session.
          </p>

          <div className="settings-field">
            <label className="settings-label" htmlFor="system-message">
              Default system message
            </label>
            <textarea
              id="system-message"
              className="settings-textarea"
              rows={6}
              placeholder="You are a helpful assistant..."
              value={systemMessage}
              onChange={handleSystemMessageChange}
            />
            <p className="settings-help">
              This will be sent as the initial system prompt to the model.
            </p>
          </div>
        </div>

        <div className="settings-footer">
          <button type="submit" className="settings-primary-button">
            Save changes
          </button>
        </div>
      </form>
    </div>
  );
}

export default Settings;
