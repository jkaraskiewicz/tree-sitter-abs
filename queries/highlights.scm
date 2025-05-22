; Literals
(string) @string
(number) @number
[
  "true"
  "false"
] @boolean

(line_comment) @comment

(identifier) @variable
(annotation) @attribute
(quoted_system_command_call_expression) @string

; Operators
[
  "="
  "=="
  "!="
  "+"
  "+="
  "-"
  "-="
  "*"
  "*="
  "/"
  "/="
  "**"
  "**="
  "%"
  "%="
  ">"
  ">="
  "<"
  "<="
  "<=>"
  "&&"
  "||"
  "."
  "?."
  ".."
  "!"
  "!!"
  "&"
  "|"
  "^"
  ">>"
  "<<"
] @operator

; Keywords
[
  "in"
  "return"
  "if"
  "else"
  "for"
  "while"
  "defer"
  "f"
  "!in"
] @keyword
