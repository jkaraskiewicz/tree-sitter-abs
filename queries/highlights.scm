; Literals
(string) @string
(number) @number
(boolean) @boolean
(nil) @constant.builtin

[
  ";"
  ":"
  ","
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

(line_comment) @comment

(identifier) @variable
(annotation) @attribute
(quoted_system_command_call_expression) @string
(function_call_expression (identifier) @function.call)
(member_expression (_) (identifier) @function.call)

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
  "if"
  "else"
] @keyword.conditional

[
  "for"
  "while"
] @keyword.repeat

[
  "in"
  "return"
  "defer"
  "!in"
] @keyword

"f" @keyword.function

(function_call_expression
  (identifier) @function.builtin
  (#any-of? @function.builtin
    "arg" "args" "cd" "echo" "env" "eval" "exit" "flag" "len" "map"
    "pwd" "rand" "require" "sleep" "sort" "source" "stdin" "type" "unix_ms"))
