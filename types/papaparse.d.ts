declare module "papaparse" {
  type ParseErrorType = "Quotes" | "Delimiter" | "FieldMismatch";

  interface ParseError {
    type: ParseErrorType;
    code: string;
    message: string;
    row: number;
  }

  interface ParseMeta {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  }

  interface ParseResult<T> {
    data: T[];
    errors: ParseError[];
    meta: ParseMeta;
  }

  interface ParseConfig<T = unknown> {
    header?: boolean;
    dynamicTyping?: boolean;
    skipEmptyLines?: boolean;
    complete?: (results: ParseResult<T>) => void;
    error?: (error: Error) => void;
  }

  export function parse<T>(
    input: string,
    config?: ParseConfig<T>
  ): ParseResult<T>;

  const Papa: {
    parse: typeof parse;
  };

  export default Papa;
}
