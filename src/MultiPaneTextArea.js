// MultiPaneTextArea.jsx - Clean Rewrite with Integration Support
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView } from '@codemirror/view';

import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { json } from '@codemirror/lang-json';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { StreamLanguage } from '@codemirror/language';

import { eclipse } from '@uiw/codemirror-theme-eclipse';

import {standaloneStyles, integratedStyles, commonStyles} from "./styles/MultiPaneTextAreaStyles"
const MultiPaneTextArea = forwardRef(({ 
  panes, 
  setPanes, 
  isDisplayed, 
  activePane: propActivePane, 
  integrated = false 
}, ref) => {
  const [activePane, setActivePane] = useState(0);
  const editorRefs = useRef({});
  const contentUpdateTimeoutsRef = useRef({});
  const editorViewsRef = useRef({});

  // Process and sort panes
  const getSortedPanes = () => {
    if (!panes || !Array.isArray(panes)) return [];
    
    let zeroOrderIndex = 10000;
    return [...panes]
      .map((pane, index) => {
        if (pane.order === 0) {
          return { ...pane, order: zeroOrderIndex + index };
        }
        return pane;
      })
      .sort((a, b) => a.order - b.order)
      .filter(pane => pane.order !== -1);
  };

  const sortedPanes = getSortedPanes();

  // Update activePane when controlled by parent (integrated mode)
  useEffect(() => {
    if (propActivePane !== undefined && propActivePane !== activePane) {
      setActivePane(propActivePane);
    }
  }, [propActivePane, activePane]);

  // Ensure activePane is within bounds
  useEffect(() => {
    if (activePane >= sortedPanes.length && sortedPanes.length > 0) {
      setActivePane(0);
    }
  }, [activePane, sortedPanes.length]);

  // Expose interface for form data collection
  useImperativeHandle(ref, () => ({
    getPaneRefs: () => {
      return sortedPanes.map((pane) => {
        return {
          current: {
            getAttribute: (attr) => {
              if (attr === "name") return pane.name;
              if (attr === "id") return pane.name;
              return null;
            },
            value: pane.content || ''
          }
        };
      });
    }
  }));

  // Get appropriate language extension for syntax highlighting
  const getLanguageExtension = (name) => {
    if (!name) return [StreamLanguage.define(shell)];

    const lowerName = name.toLowerCase();

    if (lowerName.endsWith('.py') || lowerName.includes('python')) {
      return [python()];
    } else if (lowerName.endsWith('.md') || lowerName.endsWith('.markdown')) {
      return [markdown()];
    } else if (lowerName.endsWith('.json')) {
      return [json()];
    } else {
      return [StreamLanguage.define(shell)];
    }
  };

  // Handle content changes with debouncing
  const handleContentChange = (index, newContent) => {
    if (contentUpdateTimeoutsRef.current[index]) {
      clearTimeout(contentUpdateTimeoutsRef.current[index]);
    }

    contentUpdateTimeoutsRef.current[index] = setTimeout(() => {
      setPanes(currentPanes => {
        const updatedPanes = [...currentPanes];
        const originalIndex = updatedPanes.findIndex(p =>
          p.name === sortedPanes[index].name
        );
        
        if (originalIndex !== -1) {
          updatedPanes[originalIndex] = {
            ...updatedPanes[originalIndex],
            content: newContent
          };
        }
        
        return updatedPanes;
      });

      // Trigger onChange callback if present
      if (sortedPanes[index].onChange) {
        sortedPanes[index].onChange({
          target: { value: newContent }
        });
      }

      delete contentUpdateTimeoutsRef.current[index];
    }, 300);
  };

  const handlePaneChange = (index) => {
    setActivePane(index);
  };

  // Handle empty state
  if (sortedPanes.length === 0) {
    return (
      <div style={integrated ? integratedStyles.emptyContainer : standaloneStyles.emptyContainer}>
        <div style={commonStyles.emptyMessage}>
          No configuration files available
        </div>
      </div>
    );
  }

  return (
    <div style={integrated ? integratedStyles.container : standaloneStyles.container}>
      {/* Only show tabs in standalone mode */}
      {!integrated && (
        <div style={standaloneStyles.tabContainer}>
          {sortedPanes.map((pane, index) => (
            <button
              key={index}
              onClick={() => handlePaneChange(index)}
              style={activePane === index ? standaloneStyles.activeTab : standaloneStyles.tab}
              onMouseOver={(e) => {
                if (activePane !== index) {
                  e.target.style.backgroundColor = '#e9ecef';
                  e.target.style.borderColor = '#ced4da';
                }
              }}
              onMouseOut={(e) => {
                if (activePane !== index) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.borderColor = 'transparent';
                }
              }}
            >
              {pane.preview_name}
            </button>
          ))}
        </div>
      )}

      {/* Editor content area */}
      <div style={integrated ? integratedStyles.editorContainer : standaloneStyles.editorContainer}>
        {sortedPanes.map((pane, index) => {
          const isActive = activePane === index;
          
          return (
            <div
              key={index}
              style={{
                ...commonStyles.paneContent,
                display: isActive ? 'block' : 'none',
                height: integrated ? '100%' : 'auto',
              }}
            >
              {isActive && (
                <div style={integrated ? integratedStyles.editorWrapper : standaloneStyles.editorWrapper}>
                  <CodeMirror
                    ref={editorRef => {
                      if (editorRef) {
                        editorRefs.current[`editor-${index}`] = editorRef;
                        editorViewsRef.current[`editor-${index}`] = {
                          pane: pane,
                          index: index,
                          content: pane.content || ''
                        };
                      }
                    }}
                    value={pane.content || ''}
                    height={integrated ? "100%" : "350px"}
                    theme={eclipse}
                    extensions={[
                      ...getLanguageExtension(pane.preview_name),
                      EditorView.theme({
                        "&": { 
                          caretColor: "#500000"
                        },
                        ".cm-cursor": { 
                          borderLeftColor: "#500000 !important", 
                          borderLeftWidth: "2px" 
                        },
                        ".cm-focused": {
                          outline: "2px solid rgba(80, 0, 0, 0.2)"
                        },
                        ".cm-activeLineGutter": {
                          backgroundColor: "rgba(80, 0, 0, 0.08)"
                        },
                        ".cm-activeLine": {
                          backgroundColor: "rgba(80, 0, 0, 0.03)"
                        },
                        ".cm-editor": {
                          fontSize: "13px"
                        },
                        ".cm-gutters": {
                          backgroundColor: "#f8f9fa",
                          borderRight: "1px solid #dee2e6"
                        }
                      }),
                      EditorView.lineWrapping
                    ]}
                    onChange={(value) => {
                      handleContentChange(index, value);
                      if (editorViewsRef.current[`editor-${index}`]) {
                        editorViewsRef.current[`editor-${index}`].content = value;
                      }
                    }}
                    basicSetup={{
                      lineNumbers: true,
                      highlightActiveLine: false,
                      foldGutter: true,
                      indentOnInput: true,
                      tabSize: 2,
                      searchKeymap: true,
                      autocompletion: true,
                      bracketMatching: true,
                      syntaxHighlighting: true,
                    }}
                    id={pane.name}
                    name={pane.name}
                    data-language={pane.preview_name}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default MultiPaneTextArea;
