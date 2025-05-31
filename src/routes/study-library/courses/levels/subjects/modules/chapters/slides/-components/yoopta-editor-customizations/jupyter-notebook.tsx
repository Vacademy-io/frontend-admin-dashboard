import { useState, useEffect } from "react";
import { YooptaPlugin } from "@yoopta/editor";

interface JupyterNotebookProps {
  element: any;
  attributes: any;
  children: React.ReactNode;
  updateElementProps?: (props: any) => void;
}

export function JupyterNotebook({
  element,
  attributes,
  children,
  updateElementProps,
}: JupyterNotebookProps) {
  const [projectName, setProjectName] = useState(element?.props?.projectName || "");
  const [contentUrl, setContentUrl] = useState(element?.props?.contentUrl || "");
  const [contentBranch, setContentBranch] = useState(element?.props?.contentBranch || "main");
  const [notebookLocation, setNotebookLocation] = useState(element?.props?.notebookLocation || "root");
  const [isDeploying, setIsDeploying] = useState(false);

  // Sync with Yoopta block state
  useEffect(() => {
    if (updateElementProps) {
      updateElementProps({ projectName, contentUrl, contentBranch, notebookLocation });
    }
  }, [projectName, contentUrl, contentBranch, notebookLocation, updateElementProps]);

  const handleDeploy = () => {
    if (!projectName || !contentUrl) {
      alert("Please fill in Project Name and Content URL");
      return;
    }

    setIsDeploying(true);
    // Simulate deployment process
    setTimeout(() => {
      setIsDeploying(false);
      alert("Notebook deployed successfully!");
    }, 3000);
  };

  // Handle backspace prevention for input fields
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLInputElement;

    // Only handle input elements (not select)
    if (!(target instanceof HTMLInputElement)) return;

    if (e.key === 'Backspace') {
      if (target.value.length > 0 || target.selectionStart !== 0) {
        return; // Allow normal Backspace behavior
      }

      // Prevent block deletion when empty and at start
      e.stopPropagation();
    }
  };



  return (
    <div {...attributes} style={{
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      padding: "20px",
      margin: "16px 0",
      backgroundColor: "#fafafa"
    }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: "600", color: "#333" }}>
          📓 Jupyter Notebook Configuration
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Project Name */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#555"
          }}>
            Project Name
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="pythoncourse"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "white"
            }}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        {/* Content URL */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#555"
          }}>
            Content URL (Link to a Github repo that contains the notebook)
          </label>
          <input
            type="url"
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            placeholder="https://github.com/amirtds/jupyter-notebooks"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "white"
            }}
            onKeyDown={handleInputKeyDown}
          />
        </div>

        {/* Content Branch */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#555"
          }}>
            Content Branch
          </label>
          <select
            value={contentBranch}
            onChange={(e) => setContentBranch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "white"
            }}
            onKeyDown={handleInputKeyDown}
          >
            <option value="main">main</option>
            <option value="master">master</option>
            <option value="develop">develop</option>
            <option value="staging">staging</option>
          </select>
        </div>

        {/* Notebook Location */}
        <div>
          <label style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#555"
          }}>
            Notebook Location
          </label>
          <select
            value={notebookLocation}
            onChange={(e) => setNotebookLocation(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
              backgroundColor: "white"
            }}
            onKeyDown={handleInputKeyDown}
          >
            <option value="root">root</option>
            <option value="notebooks">notebooks</option>
            <option value="src">src</option>
            <option value="examples">examples</option>
          </select>
        </div>
      </div>

      {/* Deploy Button */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        backgroundColor: "#f5f5f5",
        borderRadius: "6px",
        border: "1px solid #e0e0e0"
      }}>
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !projectName || !contentUrl}
          style={{
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "500",
            borderRadius: "6px",
            border: "none",
            backgroundColor: isDeploying ? "#f0f0f0" : "#007acc",
            color: isDeploying ? "#666" : "white",
            cursor: isDeploying || !projectName || !contentUrl ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "background-color 0.2s ease"
          }}
        >
          {isDeploying ? (
            <>
              <div style={{
                width: "16px",
                height: "16px",
                border: "2px solid #666",
                borderTop: "2px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Deploying notebook...
            </>
          ) : (
            <>
              🚀 Deploy Notebook
            </>
          )}
        </button>
      </div>

      {/* Status Display */}
      {(projectName && contentUrl) && (
        <div style={{
          marginTop: "16px",
          padding: "12px",
          backgroundColor: "#e8f5e8",
          borderRadius: "4px",
          fontSize: "14px",
          color: "#2d5a2d"
        }}>
          <strong>Ready to deploy:</strong> {projectName} from {contentUrl} ({contentBranch} branch, {notebookLocation} location)
        </div>
      )}

      {children}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Jupyter Notebook Icon
const JupyterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 4.3l7.5 3.75L12 11.8 4.5 8.05 12 4.3zM4 9.5l7 3.5v7.5l-7-3.5V9.5zm16 0v7.5l-7 3.5V13l7-3.5z" fill="currentColor"/>
  </svg>
);

// Yoopta Plugin Definition
export const JupyterNotebookPlugin = new YooptaPlugin<{ jupyterNotebook: any }>({
  type: "jupyterNotebook",
  elements: {
    jupyterNotebook: {
      render: JupyterNotebook,
    },
  },
  options: {
    display: {
      title: "Jupyter Notebook",
      description: "Interactive Jupyter notebook configuration",
      icon: <JupyterIcon />,
    },
    shortcuts: ["jupyter", "notebook", "ipynb"],
  },
});
