import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add,
  Delete,
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Image,
  VideoLibrary,
  CloudUpload,
  Save,
  PlayArrow,
  Slideshow
} from '@mui/icons-material';

interface Slide {
  id: string;
  title: string;
  content: string;
}

interface PowerPointEditorProps {
  presentationTitle: string;
  setPresentationTitle: (title: string) => void;
  slides: Slide[];
  setSlides: (slides: Slide[]) => void;
  onSaveUpload: () => void;
  loading: boolean;
  disabled: boolean;
}

const PowerPointEditor: React.FC<PowerPointEditorProps> = ({
  presentationTitle,
  setPresentationTitle,
  slides,
  setSlides,
  onSaveUpload,
  loading,
  disabled
}) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [textAlign, setTextAlign] = useState('left');
  const contentTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // Function to apply formatting to selected text in slide content
  const applySlideFormatting = (formatType: string) => {
    const textArea = contentTextAreaRef.current;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const currentSlide = slides[selectedSlideIndex];
    const selectedText = currentSlide.content.substring(start, end);

    if (selectedText.length === 0) return; // No text selected

    let formattedText = '';
    switch (formatType) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = currentSlide.content.substring(0, start) + formattedText + currentSlide.content.substring(end);
    updateSlide(selectedSlideIndex, 'content', newContent);

    // Restore cursor position
    setTimeout(() => {
      textArea.focus();
      textArea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Evidence Slide ${slides.length + 1}`,
      content: 'Enter your evidence content here...'
    };
    setSlides([...slides, newSlide]);
    setSelectedSlideIndex(slides.length);
  };

  const deleteSlide = (index: number) => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, i) => i !== index);
      setSlides(newSlides);
      setSelectedSlideIndex(Math.max(0, index - 1));
    }
  };

  const updateSlide = (index: number, field: 'title' | 'content', value: string) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setSlides(newSlides);
  };

  const currentSlide = slides[selectedSlideIndex];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* PowerPoint-like Header */}
      <Paper elevation={1} sx={{ mb: 2, backgroundColor: '#f8f9fa' }}>
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Presentation Title"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'white',
                fontSize: '18px',
                fontWeight: 'bold'
              }
            }}
          />
        </Box>

        {/* PowerPoint-like Toolbar */}
        <Toolbar sx={{ minHeight: '48px !important', backgroundColor: '#d83b01', color: 'white', gap: 1 }}>
          {/* File Operations */}
          <Tooltip title="Save">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Save fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Start Slideshow">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <PlayArrow fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* Slide Operations */}
          <Tooltip title="New Slide">
            <IconButton 
              size="small" 
              onClick={addSlide}
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Add fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Slide">
            <IconButton 
              size="small" 
              onClick={() => deleteSlide(selectedSlideIndex)}
              disabled={slides.length <= 1}
              sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* Format Controls */}
          <Tooltip title="Bold (Select text first)">
            <IconButton
              size="small"
              onClick={() => applySlideFormatting('bold')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic (Select text first)">
            <IconButton
              size="small"
              onClick={() => applySlideFormatting('italic')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Underline (Select text first)">
            <IconButton
              size="small"
              onClick={() => applySlideFormatting('underline')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)'
              }}
            >
              <FormatUnderlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* Alignment */}
          <Tooltip title="Align Left">
            <IconButton
              size="small"
              onClick={() => setTextAlign('left')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: textAlign === 'left' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <FormatAlignLeft fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Center">
            <IconButton
              size="small"
              onClick={() => setTextAlign('center')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: textAlign === 'center' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <FormatAlignCenter fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Align Right">
            <IconButton
              size="small"
              onClick={() => setTextAlign('right')}
              sx={{
                color: 'white',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: textAlign === 'right' ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              <FormatAlignRight fontSize="small" />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />

          {/* Media */}
          <Tooltip title="Insert Image">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <Image fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Insert Video">
            <IconButton size="small" sx={{ color: 'white', border: '1px solid rgba(255,255,255,0.3)' }}>
              <VideoLibrary fontSize="small" />
            </IconButton>
          </Tooltip>

          <Box sx={{ flexGrow: 1 }} />

          <Typography variant="body2" sx={{ color: 'white' }}>
            Slide {selectedSlideIndex + 1} of {slides.length}
          </Typography>
        </Toolbar>
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2 }}>
        {/* Slide Thumbnails Panel */}
        <Paper 
          elevation={2} 
          sx={{ 
            width: 250, 
            backgroundColor: '#f5f5f5',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#d83b01', color: 'white' }}>
            <Typography variant="h6" sx={{ fontSize: '14px', fontWeight: 'bold' }}>
              <Slideshow sx={{ mr: 1, fontSize: '16px' }} />
              Slides
            </Typography>
          </Box>
          <List sx={{ flex: 1, p: 1, overflow: 'auto' }}>
            {slides.map((slide, index) => (
              <ListItem key={slide.id} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  selected={selectedSlideIndex === index}
                  onClick={() => setSelectedSlideIndex(index)}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor: selectedSlideIndex === index ? '#fff3cd' : 'white',
                    '&:hover': {
                      backgroundColor: selectedSlideIndex === index ? '#fff3cd' : '#f8f9fa'
                    }
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {index + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSlide(index);
                        }}
                        disabled={slides.length <= 1}
                        sx={{ color: 'error.main' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <Card variant="outlined" sx={{ minHeight: 80, backgroundColor: '#f8f9fa' }}>
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block', mb: 0.5 }}>
                          {slide.title || 'Untitled Slide'}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                          {slide.content.substring(0, 50)}...
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Box sx={{ p: 1 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Add />}
              onClick={addSlide}
              size="small"
              sx={{ color: '#d83b01', borderColor: '#d83b01' }}
            >
              New Slide
            </Button>
          </Box>
        </Paper>

        {/* Slide Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Slide Canvas */}
          <Paper
            elevation={3}
            sx={{
              flex: 1,
              backgroundColor: 'white',
              p: 3,
              minHeight: 400,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            {/* Slide Title */}
            <TextField
              fullWidth
              variant="standard"
              placeholder="Click to add title"
              value={currentSlide?.title || ''}
              onChange={(e) => updateSlide(selectedSlideIndex, 'title', e.target.value)}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '32px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#d83b01',
                  mb: 3
                }
              }}
              sx={{ mb: 4 }}
            />

            {/* Slide Content */}
            <TextField
              fullWidth
              multiline
              variant="standard"
              placeholder="Click to add content (Select text and use toolbar to format)"
              value={currentSlide?.content || ''}
              onChange={(e) => updateSlide(selectedSlideIndex, 'content', e.target.value)}
              inputRef={contentTextAreaRef}
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '18px',
                  textAlign: textAlign,
                  lineHeight: 1.6,
                  '& textarea': {
                    resize: 'none',
                    textAlign: textAlign
                  }
                }
              }}
              sx={{
                flex: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start'
                }
              }}
            />

            {/* Slide Number */}
            <Typography 
              variant="caption" 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16, 
                color: '#666',
                fontSize: '12px'
              }}
            >
              {selectedSlideIndex + 1}
            </Typography>
          </Paper>

          {/* Notes Section */}
          <Paper elevation={1} sx={{ mt: 2, p: 2, backgroundColor: '#f8f9fa' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#d83b01', fontWeight: 'bold' }}>
              Speaker Notes
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Add notes for this slide..."
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white'
                }
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<Save />}
          disabled={loading || disabled}
          sx={{ color: '#d83b01', borderColor: '#d83b01' }}
        >
          Save Draft
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => {
            console.log('PowerPoint upload button clicked', {
              presentationTitle,
              slidesCount: slides.length,
              loading,
              disabled
            });
            onSaveUpload();
          }}
          disabled={loading || disabled || !presentationTitle.trim()}
          sx={{
            backgroundColor: '#d83b01',
            '&:hover': {
              backgroundColor: '#c73400'
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
          Slides: {slides.length} | Current: {selectedSlideIndex + 1}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          PowerPoint Evidence Presentation
        </Typography>
      </Box>
    </Box>
  );
};

export default PowerPointEditor;
