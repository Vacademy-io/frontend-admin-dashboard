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
  const [activeTab, setActiveTab] = useState<"preview" | "settings">(element?.props?.activeTab || "settings");

  // Sync with Yoopta block state - save complete editor state
  useEffect(() => {
    if (updateElementProps) {
      updateElementProps({
        projectName,
        contentUrl,
        contentBranch,
        notebookLocation,
        activeTab,
        // Add metadata to identify this as a full jupyter editor
        editorType: "jupyterEditor",
        timestamp: Date.now()
      });
    }
  }, [projectName, contentUrl, contentBranch, notebookLocation, activeTab, updateElementProps]);

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
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ margin: "0", fontSize: "18px", fontWeight: "600", color: "#333" }}>
            📓 Jupyter Notebook Configuration
          </h3>

          {/* Tab Navigation */}
          <div style={{ display: "flex", border: "1px solid #ddd", borderRadius: "6px", overflow: "hidden" }}>
            <button
              onClick={() => setActiveTab("preview")}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                border: "none",
                backgroundColor: activeTab === "preview" ? "#007acc" : "white",
                color: activeTab === "preview" ? "white" : "#666",
                cursor: "pointer"
              }}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              style={{
                padding: "6px 16px",
                fontSize: "14px",
                border: "none",
                backgroundColor: activeTab === "settings" ? "#007acc" : "white",
                color: activeTab === "settings" ? "white" : "#666",
                cursor: "pointer"
              }}
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {activeTab === "settings" ? (
        <>
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
        </>
      ) : (
        /* Preview Mode */
        <div style={{ minHeight: "400px" }}>
          {projectName && contentUrl ? (
            <div style={{
              width: "100%",
              height: "500px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              overflow: "hidden"
            }}>
              <iframe
                src={`https://mybinder.org/v2/gh/${contentUrl.replace('https://github.com/', '')}/${contentBranch}?labpath=${notebookLocation}`}
                width="100%"
                height="100%"
                style={{ border: "none" }}
                title="Jupyter Notebook Preview"
              />
            </div>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "400px",
              color: "#666",
              backgroundColor: "#f9f9f9",
              borderRadius: "6px",
              border: "1px solid #ddd"
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📓</div>
              <p style={{ fontSize: "16px", marginBottom: "8px" }}>No notebook configured</p>
              <p style={{ fontSize: "14px", color: "#999" }}>Switch to Settings tab to configure your Jupyter notebook</p>
            </div>
          )}
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
  parsers: {
    html: {
      deserialize: {
        nodeNames: ['JUPYTER_NOTEBOOK'],
      },
      serialize: (element, children) => {
        const props = element.props || {};
        const projectName = props.projectName || '';
        const contentUrl = props.contentUrl || '';
        const contentBranch = props.contentBranch || 'main';
        const notebookLocation = props.notebookLocation || 'root';
        const activeTab = props.activeTab || 'settings';

        if (!projectName || !contentUrl) {
          return `<div
            data-yoopta-type="jupyterNotebook"
            data-editor-type="jupyterEditor"
            data-project-name="${projectName}"
            data-content-url="${contentUrl}"
            data-content-branch="${contentBranch}"
            data-notebook-location="${notebookLocation}"
            data-active-tab="${activeTab}"
            style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0; background-color: #fafafa;"
          >
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">📓 Jupyter Notebook Configuration</h3>
              <div style="padding: 4px 8px; background: #007acc; color: white; border-radius: 4px; font-size: 12px; font-weight: bold;">
                ${activeTab.toUpperCase()} MODE
              </div>
            </div>
            <div style="display: flex; align-items: center; color: #666;">
              <span style="font-size: 48px; margin-right: 16px;">📓</span>
              <div>
                <p style="font-size: 16px; margin: 0 0 8px 0;">No notebook configured</p>
                <p style="font-size: 14px; color: #999; margin: 0;">Project name and content URL needed to display Jupyter notebook</p>
              </div>
            </div>
          </div>`;
        }

        const binderUrl = `https://mybinder.org/v2/gh/${contentUrl.replace('https://github.com/', '')}/${contentBranch}?labpath=${notebookLocation}`;

        return `<div
          data-yoopta-type="jupyterNotebook"
          data-editor-type="jupyterEditor"
          data-project-name="${projectName}"
          data-content-url="${contentUrl}"
          data-content-branch="${contentBranch}"
          data-notebook-location="${notebookLocation}"
          data-active-tab="${activeTab}"
          style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 16px 0; background-color: #fafafa;"
        >
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #333;">📓 Jupyter Notebook: ${projectName}</h3>
            <div style="display: flex; gap: 8px; align-items: center;">
              <div style="padding: 4px 8px; background: #007acc; color: white; border-radius: 4px; font-size: 12px; font-weight: bold;">
                JUPYTER EDITOR
              </div>
              <div style="padding: 4px 8px; background: ${activeTab === 'preview' ? '#28a745' : '#6c757d'}; color: white; border-radius: 4px; font-size: 12px;">
                ${activeTab.toUpperCase()} MODE
              </div>
            </div>
          </div>
          <div style="margin-bottom: 16px; padding: 12px; background: #e8f5e8; border-radius: 4px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; color: #2d5a2d;">
              <div><strong>Repository:</strong> ${contentUrl}</div>
              <div><strong>Branch:</strong> ${contentBranch}</div>
              <div><strong>Location:</strong> ${notebookLocation}</div>
              <div><strong>Status:</strong> Ready to deploy</div>
            </div>
          </div>
          ${activeTab === 'preview' ?
            `<div style="width: 100%; height: 500px; border: 1px solid #ddd; border-radius: 6px; overflow: hidden;">
              <iframe src="${binderUrl}" width="100%" height="100%" style="border: none;" title="Jupyter Notebook Preview"></iframe>
            </div>` :
            `<div style="padding: 16px; background: #f9f9f9; border-radius: 6px; border: 1px solid #ddd; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 8px;">⚙️</div>
              <p style="margin: 0; color: #666;">Settings mode - Configure Jupyter notebook</p>
            </div>`
          }
        </div>`;
      },
    },
  },
});
