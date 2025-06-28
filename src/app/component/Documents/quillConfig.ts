// Quill editor configuration for the Word document editor

export const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'script': 'sub' }, { 'script': 'super' }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'align': [] }],
    ['link', 'image', 'video'],
    ['blockquote', 'code-block'],
    ['clean']
  ],
  clipboard: {
    // Toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  }
};

export const quillFormats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet', 'indent',
  'link', 'image', 'video',
  'color', 'background',
  'align', 'direction',
  'script', 'code-block'
];

// Custom styles for the Quill editor
export const quillStyles = {
  height: '300px',
  marginBottom: '50px',
  '& .ql-editor': {
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
  '& .ql-toolbar': {
    borderTop: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    borderBottom: 'none',
  },
  '& .ql-container': {
    borderBottom: '1px solid #ccc',
    borderLeft: '1px solid #ccc',
    borderRight: '1px solid #ccc',
    borderTop: 'none',
  }
};
