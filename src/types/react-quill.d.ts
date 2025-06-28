declare module 'react-quill' {
  import { Component } from 'react';

  export interface ReactQuillProps {
    value?: string;
    defaultValue?: string;
    placeholder?: string;
    readOnly?: boolean;
    theme?: string;
    modules?: any;
    formats?: string[];
    style?: React.CSSProperties;
    className?: string;
    onChange?: (content: string, delta: any, source: string, editor: any) => void;
    onChangeSelection?: (selection: any, source: string, editor: any) => void;
    onFocus?: (selection: any, source: string, editor: any) => void;
    onBlur?: (previousSelection: any, source: string, editor: any) => void;
    onKeyPress?: (event: React.KeyboardEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    onKeyUp?: (event: React.KeyboardEvent) => void;
    bounds?: string | HTMLElement;
    children?: React.ReactElement;
    tabIndex?: number;
    preserveWhitespace?: boolean;
  }

  export default class ReactQuill extends Component<ReactQuillProps> {}
}

declare module 'xlsx' {
  export interface WorkSheet {
    [key: string]: any;
  }

  export interface WorkBook {
    SheetNames: string[];
    Sheets: { [key: string]: WorkSheet };
  }

  export const utils: {
    json_to_sheet: (data: any[]) => WorkSheet;
    book_new: () => WorkBook;
    book_append_sheet: (workbook: WorkBook, worksheet: WorkSheet, name: string) => void;
  };

  export function write(workbook: WorkBook, options: { bookType: string; type: string }): ArrayBuffer;
}

declare module 'docx' {
  export class Document {
    constructor(options: any);
  }

  export class Packer {
    static toBlob(document: Document): Promise<Blob>;
  }

  export class Paragraph {
    constructor(options: any);
  }

  export class TextRun {
    constructor(options: any);
  }
}

declare module 'pptxgenjs' {
  export default class PptxGenJS {
    title: string;
    author: string;
    company: string;

    addSlide(): {
      addText: (text: string, options: any) => void;
    };

    writeFile(): Promise<Blob>;
  }
}
