const darkColors = [
  '#4169E1',   // RoyalBlue
  '#8B4513',   // SaddleBrown
  '#8B0000',   // DarkRed
  '#8B008B',   // DarkMagenta
  '#2F4F4F',   // DarkSlateGray
  '#556B2F',   // DarkOliveGreen
  '#A52A2A',   // Brown
  '#483D8B',   // DarkSlateBlue
  '#006400',   // DarkGreen
  '#8B4513',   // SaddleBrown
  '#FF8C00',   // DarkOrange
  '#8B0000',   // DarkRed
  '#2F4F4F',   // DarkSlateGray
  '#556B2F',   // DarkOliveGreen
  '#A52A2A',   // Brown
  '#483D8B',   // DarkSlateBlue
  '#00008B',   // DarkBlue
  '#8B008B',   // DarkMagenta
  '#DAA520',   // GoldenRod
  '#FF6347',   // Tomato
  '#8B4513',   // SaddleBrown
  '#FF8C00',   // DarkOrange
  '#8B0000',   // DarkRed
  '#2F4F4F',   // DarkSlateGray
  '#556B2F',   // DarkOliveGreen
]

const lightColors = [
  '#A9A9A9',  // Dark Gray
  '#34495E',  // Dark Blue Gray
  '#2C3E50',  // Dark Blue
  '#1F618D',  // Navy Blue
  '#27AE60',  // Dark Green
  '#8E44AD',  // Dark Purple
  '#D35400',  // Dark Orange
  '#C0392B',  // Dark Red
  '#2D3436',  // Charcoal Black
  '#5D6D7E',  // Steel Blue
  '#283747',  // Midnight Blue
  '#641E16',  // Deep Red
  '#512E5F',  // Plum Purple
  '#154360',  // Deep Navy
  '#145A32',  // Forest Green
  '#4A235A',  // Grape Purple
  '#78281F',  // Dark Terracotta
  '#1B4F72',  // Deep Blue
  '#7B241C',  // Dark Crimson
  '#1C2833',  // Dark Charcoal
  '#4D5656',  // Slate Gray
  '#76448A',  // Violet
  '#5B2C6F',  // Dark Lavender
  '#1C1C1C',  // Jet Black
  '#6E2C00',  // Burnt Orange
  '#0E6251',  // Dark Teal
];

const atoz = "abcdefghijklmnopqrstuvwxyz";

export const IconsData = [
  { name: 'Nvq', color: '#717F84' },
  { name: 'Functional skills', color: '#904887' },
  // { name: 'Err', color: '#1D9EB4' },
  // { name: 'Technical Certificate', color: '#2FA286' },
  // { name: 'Plts', color: '#D06984' },
  { name: 'Svq', color: '#C5975B' },
  { name: 'Vcq', color: '#D0AB3F' },
  { name: 'Vrq', color: '#816855' },
  { name: 'Core Skill', color: '#34D55B' },
  { name: 'Btec National', color: '#5787E0' },
  { name: 'Key Skill', color: '#DA8530' },
  { name: 'Gateway', color: '#335F33' }
];

export const getRandomColor = (latter) => {
  const color = darkColors[atoz.indexOf(latter)]
  return color;
};

export const getLightRandomColor = (latter) => {
  const lightColor = lightColors[atoz.indexOf(latter)]
  return lightColor;
};

export const SocketDomain = {
  Notification: "notification",
  Message: "message",
  CourseAllocation: "Course Allocation",
  MessageSend: "Message Send",
  MessageUpdate: "Message Update",
  MessageDelete: "Message Delete",
  InnovationChat: "Innovation Chat"
}

export const RoleShortForm = {
  Learner: 'Learner',
  Trainer: "AS",
  Employer: "EM",
  IQA: 'IQA',
  LIQA: 'LIQA',
  EQA: 'EQA',
  Admin: 'MA'
}