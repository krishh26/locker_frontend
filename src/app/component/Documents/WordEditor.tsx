import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Toolbar,
  IconButton,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Tooltip
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatListBulleted,
  FormatListNumbered,
  Undo,
  Redo,
  Save,
  CloudUpload
} from '@mui/icons-material';

interface WordEditorProps {
  documentTitle: string;
  setDocumentTitle: (title: string) => void;
  wordContent: string;
  setWordContent: (content: string) => void;
  onSaveUpload: () => void;
  loading: boolean;
  disabled: boolean;
}

const WordEditor: React.FC<WordEditorProps> = ({
  documentTitle,
  setDocumentTitle,
  wordContent,
  setWordContent,
  onSaveUpload,
  loading,
  disabled
}) => {
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [textAlign, setTextAlign] = useState('left');

  // Apply font changes to the editor
  const applyFontChanges = () => {
    if (editorRef.current) {
      editorRef.current.style.fontSize = `${fontSize}px`;
      editorRef.current.style.fontFamily = fontFamily;
    }
  };

  // Apply font changes when font settings change
  useEffect(() => {
    applyFontChanges();
  }, [fontSize, fontFamily]);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  // Function to execute formatting commands
  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    updateContent();
    updateFormatStates();
  };

  // Update content from contentEditable div
  const updateContent = () => {
    if (editorRef.current) {
      setWordContent(editorRef.current.innerHTML);
    }
  };

  // Update button states based on current selection
  const updateFormatStates = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
  };

  // Handle selection change to update button states
  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormatStates();
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, []);

  // Apply formatting functions
  const applyBold = () => executeCommand('bold');
  const applyItalic = () => executeCommand('italic');
  const applyUnderline = () => executeCommand('underline');
  const applyBulletList = () => executeCommand('insertUnorderedList');
  const applyNumberedList = () => executeCommand('insertOrderedList');
  const applyAlignment = (align: string) => {
    setTextAlign(align);
    executeCommand(`justify${align.charAt(0).toUpperCase() + align.slice(1)}`);
    // Also update the editor's text alignment
    if (editorRef.current) {
      editorRef.current.style.textAlign = align;
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Word-like Header */}
      <Paper elevation={1} sx={{ mb: 2, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Document Title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>

        {/* Word-like Toolbar */}
        <Toolbar sx={{ minHeight: '48px !important', backgroundColor: '#f1f3f4', gap: 1 }}>
          {/* Font Controls */}
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <Select
              value={fontFamily}
              onChange={(e) => {
                setFontFamily(e.target.value);
                // Apply immediately to editor
                if (editorRef.current) {
                  editorRef.current.style.fontFamily = e.target.value;
                }
              }}
              sx={{ height: 32 }}
            >
              <MenuItem value="Calibri">Calibri</MenuItem>
              <MenuItem value="Arial">Arial</MenuItem>
              <MenuItem value="Times New Roman">Times New Roman</MenuItem>
              <MenuItem value="Helvetica">Helvetica</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 60 }}>
            <Select
              value={fontSize}
              onChange={(e) => {
                setFontSize(e.target.value);
                // Apply immediately to editor
                if (editorRef.current) {
                  editorRef.current.style.fontSize = `${e.target.value}px`;
                }
              }}
              sx={{ height: 32 }}
            >
              <MenuItem value="8">8</MenuItem>
              <MenuItem value="9">9</MenuItem>
              <MenuItem value="10">10</MenuItem>
              <MenuItem value="11">11</MenuItem>
              <MenuItem value="12">12</MenuItem>
              <MenuItem value="14">14</MenuItem>
              <MenuItem value="16">16</MenuItem>
              <MenuItem value="18">18</MenuItem>
              <MenuItem value="20">20</MenuItem>
              <MenuItem value="24">24</MenuItem>
            </Select>
          </FormControl>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Format Controls */}
          <Tooltip title="Bold">
            <IconButton
              size="small"
              onClick={applyBold}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: isBold ? '#e3f2fd' : 'transparent'
              }}
            >
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton
              size="small"
              onClick={applyItalic}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: isItalic ? '#e3f2fd' : 'transparent'
              }}
            >
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline">
            <IconButton
              size="small"
              onClick={applyUnderline}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: isUnderline ? '#e3f2fd' : 'transparent'
              }}
            >
              <FormatUnderlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Alignment Controls */}
          <Tooltip title="Align Left">
            <IconButton
              size="small"
              onClick={() => applyAlignment('left')}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: textAlign === 'left' ? '#e3f2fd' : 'transparent'
              }}
            >
              <FormatAlignLeft fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton
              size="small"
              onClick={() => applyAlignment('center')}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: textAlign === 'center' ? '#e3f2fd' : 'transparent'
              }}
            >
              <FormatAlignCenter fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton
              size="small"
              onClick={() => applyAlignment('right')}
              sx={{
                border: '1px solid #e0e0e0',
                backgroundColor: textAlign === 'right' ? '#e3f2fd' : 'transparent'
              }}
            >
              <FormatAlignRight fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* List Controls */}
          <Tooltip title="Bullet List">
            <IconButton
              size="small"
              onClick={applyBulletList}
              sx={{ border: '1px solid #e0e0e0' }}
            >
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered List">
            <IconButton
              size="small"
              onClick={applyNumberedList}
              sx={{ border: '1px solid #e0e0e0' }}
            >
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Undo/Redo */}
          {/* <Tooltip title="Undo">
            <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
              <Undo fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Redo">
            <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
              <Redo fontSize="small" />
            </IconButton>
          </Tooltip> */}
        </Toolbar>
      </Paper>

      {/* Document Area */}
      <Paper 
        elevation={2} 
        sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
          p: 2
        }}
      >
        {/* Ruler */}
        <Box sx={{ 
          height: 20, 
          backgroundColor: 'white', 
          border: '1px solid #e0e0e0',
          mb: 1,
          position: 'relative',
          backgroundImage: 'repeating-linear-gradient(to right, #e0e0e0 0px, #e0e0e0 1px, transparent 1px, transparent 20px)',
        }}>
          <Typography variant="caption" sx={{ position: 'absolute', left: 4, top: 2, fontSize: '10px' }}>
            0"
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', left: 100, top: 2, fontSize: '10px' }}>
            1"
          </Typography>
          <Typography variant="caption" sx={{ position: 'absolute', left: 200, top: 2, fontSize: '10px' }}>
            2"
          </Typography>
        </Box>

        {/* Document Page */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            backgroundColor: 'white',
            p: 4,
            minHeight: 500,
            maxWidth: 800,
            margin: '0 auto',
            width: '100%',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            position: 'relative'
          }}
        >
          {/* Page Content */}
          <Box
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={updateContent}
            onMouseUp={updateFormatStates}
            onKeyUp={updateFormatStates}
            sx={{
              minHeight: 400,
              padding: 2,
              border: 'none',
              outline: 'none',
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              lineHeight: 1.6,
              backgroundColor: 'white',
              '&:focus': {
                outline: 'none'
              },
              '&:empty:before': {
                content: '"Start typing your evidence document here..."',
                color: '#999',
                fontStyle: 'italic'
              }
            }}
          />

          {/* Page Number */}
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 16, 
              right: 16, 
              color: '#666',
              fontSize: '10px'
            }}
          >
            Page 1 of 1
          </Typography>
        </Paper>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => {
            // Get plain text content for validation
            const plainTextContent = editorRef.current?.innerHTML || '';
            console.log('Word upload button clicked', {
              documentTitle,
              wordContent: plainTextContent,
              loading,
              disabled
            });
            onSaveUpload();
          }}
          disabled={loading || disabled || !documentTitle.trim() || !(editorRef.current?.innerText?.trim())}
          sx={{
            backgroundColor: '#0078d4',
            '&:hover': {
              backgroundColor: '#106ebe'
            }
          }}
        >
          {loading ? 'Creating & Uploading...' : 'Create & Upload as Evidence'}
        </Button>
      </Box>

      {/* Status Bar */}
      <Box sx={{ 
        mt: 1, 
        p: 1, 
        backgroundColor: '#f8f9fa', 
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="textSecondary">
          Words: {wordContent.split(/\s+/).filter(word => word.length > 0).length} | 
          Characters: {wordContent.length}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          100% | English (United States)
        </Typography>
      </Box>
    </Box>
  );
};

export default WordEditor;
